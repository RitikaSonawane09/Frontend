import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import '@fortawesome/fontawesome-free/css/all.min.css';

Modal.setAppElement('#root');

function CourseInstanceTabContent({
    showInstancesTable,
    setShowInstancesTable,
    
}) {
    const [courses, setCourses] = useState([]);
    const [instances, setInstances] = useState([]);
    const [filteredInstances, setFilteredInstances] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [formYear, setFormYear] = useState('');
    const [formSemester, setFormSemester] = useState('');
    const [filterYear, setFilterYear] = useState('');
    const [filterSemester, setFilterSemester] = useState('');
    const [availableYears, setAvailableYears] = useState([]);
    const [availableSemesters, setAvailableSemesters] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [loadingInstances, setLoadingInstances] = useState(false);
    const [error, setError] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedInstance, setSelectedInstance] = useState(null);

    useEffect(() => {
        fetchCourses();
        fetchInstances();
    }, []);

    useEffect(() => {
        if (showInstancesTable) {
            filterInstances(); // Apply filters when they change
        }
    }, [filterYear, filterSemester, instances, showInstancesTable]);

    const fetchCourses = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/courses/');
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
            const response = await axios.get('http://127.0.0.1:8000/api/instances/');
            const instancesData = response.data;
            setInstances(instancesData);

            // Extract years and semesters for the dropdowns
            const years = [...new Set(instancesData.map(instance => instance.year))];
            const semesters = [...new Set(instancesData.map(instance => instance.semester))];

            setAvailableYears(years);
            setAvailableSemesters(semesters);
        } catch (error) {
            setError(error);
        } finally {
            setLoadingInstances(false);
        }
    };

    const filterInstances = () => {
        let filtered = [...instances];
    
        if (filterYear) {
            filtered = filtered.filter(instance => instance.year === Number(filterYear));
        }
    
        if (filterSemester) {
            filtered = filtered.filter(instance => instance.semester === Number(filterSemester));
        }
    
        setFilteredInstances(filtered);
    };
    
    const handleSubmit = async (event) => {
        event.preventDefault();

        const instanceData = {
            course: selectedCourseId,
            year: formYear.trim(),
            semester: formSemester.trim(),
        };

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/instances/', instanceData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 201) {
                alert('Course instance added successfully.');
                setSelectedCourseId('');
                setFormYear('');
                setFormSemester('');
                fetchInstances(); 
                
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                alert('Course instance already exists.');
            } else {
                alert('An error occurred.');
            }
        }
    };

    const handleDelete = async (instanceId) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/api/instances/${instanceId}/`);
            alert('Course instance deleted successfully.');
            fetchInstances(); // Refresh instances after deleting
        } catch (error) {
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

    const handleFilter = () => {
        filterInstances(); // Apply filters when button is clicked
        setShowInstancesTable(true); // Ensure table is shown after filtering
    };

    if (loadingInstances) return <p>Loading instances...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div className='course-instance-tab-content'>
            <form onSubmit={handleSubmit}>
                <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} required>
                    <option value="">Select Course</option>
                    {courses.map(course => (
                        <option key={course.id} value={course.id}>
                            {course.course_name}
                        </option>
                    ))}
                </select>
                <input
                    type='number'
                    placeholder='Year'
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    required
                />
                <input
                    type='text'
                    placeholder='Semester'
                    value={formSemester}
                    onChange={(e) => setFormSemester(e.target.value)}
                    required
                />
                <button type='submit'>Add Instance</button>
            </form>
    
            {/* Filter section */}
            <div className='filter-container'>
                <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                    <option value="">Select Year</option>
                    {availableYears.map(year => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>
    
                <select value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)}>
                    <option value="">Select Semester</option>
                    {availableSemesters.map(semester => (
                        <option key={semester} value={semester}>
                            {semester}
                        </option>
                    ))}
                </select>
                <button
    onClick={handleFilter}
    style={{
        backgroundColor: '#007bff', 
        color: 'white', 
        border: 'none',
        borderRadius: '5px', 
        padding: '10px 20px',
        cursor: 'pointer', 
        fontSize: '16px', 
        transition: 'background-color 0.3s ease', 
        margin: '0 10px', 
    }}
    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'} 
    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'} 
>
    Filter
</button>

            </div>
    
            {/* Show filtered instances in a table */}
            {showInstancesTable && filteredInstances.length > 0 && (
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
                        {filteredInstances.map(instance => {
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
    
            {/* Message for no instances */}
            {showInstancesTable && filteredInstances.length === 0 && <p>No instances available.</p>}
    
            {/* Modal for viewing instance details */}
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
                        <button onClick={closeModal}>Close</button>
                    </div>
                ) : (
                    <p>No instance selected.</p>
                )}
            </Modal>
        </div>
    );
}

export default CourseInstanceTabContent;
