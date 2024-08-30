import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import '@fortawesome/fontawesome-free/css/all.min.css'; 

Modal.setAppElement('#root');

function CourseInstanceTabContent({ showInstancesTable }) {
    const [courses, setCourses] = useState([]);
    const [instances, setInstances] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [year, setYear] = useState('');
    const [semester, setSemester] = useState('');
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingInstances, setLoadingInstances] = useState(true);
    const [error, setError] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedInstance, setSelectedInstance] = useState(null);

    useEffect(() => {
        fetchCourses();
        fetchInstances();
    }, [year, semester]);

    const fetchCourses = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/courses/');
            console.log('Courses data:', response.data);
            setCourses(response.data);
        } catch (error) {
            setError(error);
        } finally {
            setLoadingCourses(false);
        }
    };

    const fetchInstances = async () => {
        setLoadingInstances(true);
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/instances/?year=${year}&semester=${semester}`);
            console.log('Instances data:', response.data);
            setInstances(response.data);
        } catch (error) {
            setError(error);
        } finally {
            setLoadingInstances(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const instanceData = {
            course: selectedCourseId,
            year: year.trim(),
            semester: semester.trim(),
        };
        console.log('Instance Data:', instanceData);

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/instances/', instanceData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 201) {
                alert('Course instance added successfully.');
                setSelectedCourseId('');
                setYear('');
                setSemester('');
                fetchInstances();
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                alert('Course instance already exists.');
            } else {
                console.error('Error:', error);
                alert('An error occurred.');
            }
        }
    };

    const handleDelete = async (instanceId) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/api/instances/${instanceId}/`);
            alert('Course instance deleted successfully.');
            fetchInstances();
        } catch (error) {
            console.error('Error deleting instance:', error);
            alert('An error occurred while deleting the instance.');
        }
    };

    const handleView = (instance) => {
        setSelectedInstance(instance);  
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedInstance(null);
    };

    if (loadingCourses) return <p>Loading courses...</p>;
    if (loadingInstances) return <p>Loading instances...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div className='course-instance-tab-content'>
            <form onSubmit={handleSubmit}>
                <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} required>
                    <option value="">Select Course</option>
                    {courses.length > 0 ? (
                        courses.map(course => (
                            <option key={course.id} value={course.id}>
                                {course.course_name}
                            </option>
                        ))
                    ) : (
                        <option value="">No courses available</option>
                    )}
                </select>
                <input type='number' placeholder='Year' value={year} onChange={(e) => setYear(e.target.value)} required />
                <input type='text' placeholder='Semester' value={semester} onChange={(e) => setSemester(e.target.value)} required />
                <button type='submit'>Add Instance</button>
            </form>

            {showInstancesTable && instances.length > 0 && (
                <table>
                    <thead>
                        <tr>
                            <th>Course Name</th>
                            <th>Year-Sem</th>
                            <th>Course Code</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {instances.map(instance => {
                            const course = courses.find(c => c.id === instance.course);  
                            return (
                                <tr key={instance.id}>
                                    <td>{course ? course.course_name : 'Unknown'}</td>
                                    <td>{instance.year}-{instance.semester}</td>
                                    <td>{course ? course.course_code : 'Unknown'}</td>
                                    <td>
                                        <i 
                                            className="fas fa-search" 
                                            onClick={() => handleView(instance)}  
                                            title="View Course instance"
                                            style={{ marginRight: '10px' }}
                                        ></i>
                                        <i 
                                            className="fas fa-trash-alt" 
                                            onClick={() => handleDelete(instance.id)}
                                            title="Delete Course instance"
                                        ></i>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}

            {showInstancesTable && instances.length === 0 && <p>No instances available.</p>}

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Instance Details"
                className="modal"
                overlayClassName="overlay"
            >
                <h2>Instance Details</h2>
                {selectedInstance ? (
                    <div>
                        {selectedInstance.course && typeof selectedInstance.course === 'object' ? (
                            <>
                                <p><strong>Course Name:</strong> {selectedInstance.course.course_name}</p>
                                <p><strong>Course Code:</strong> {selectedInstance.course.course_code}</p>
                            </>
                        ) : (
                            <>
                                <p><strong>Course Name:</strong> {courses.find(c => c.id === selectedInstance.course)?.course_name || 'N/A'}</p>
                                <p><strong>Course Code:</strong> {courses.find(c => c.id === selectedInstance.course)?.course_code || 'N/A'}</p>
                            </>
                        )}
                        <p><strong>Year:</strong> {selectedInstance.year || 'N/A'}</p>
                        <p><strong>Semester:</strong> {selectedInstance.semester || 'N/A'}</p>
                    </div>
                ) : (
                    <p>No details available.</p>
                )}
                <button onClick={closeModal}>Close</button>
            </Modal>
        </div>
    );
}

export default CourseInstanceTabContent;
