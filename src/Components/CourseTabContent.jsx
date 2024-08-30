import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import '@fortawesome/fontawesome-free/css/all.min.css'; 

Modal.setAppElement('#root');

function CourseTabContent({ showCoursesTable }) {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [courseAdded, setCourseAdded] = useState(false);
    const [viewCourse, setViewCourse] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);



    useEffect(() => {
        if (showCoursesTable) {
            fetchCourses();
        }
    }, [showCoursesTable, courseAdded]);

    const fetchCourses = () => {
        setLoading(true);
        axios.get('http://127.0.0.1:8000/api/courses/')
            .then(response => {
                setCourses(response.data);
                setLoading(false);
            })
            .catch(error => {
                setError(error);
                setLoading(false);
            });
    };

    const handleAddCourse = async (event) => {
        event.preventDefault();
        const form = event.target;
        const courseData = {
            course_name: form.course_name?.value.trim(),
            course_code: form.course_code?.value.trim(),
            course_description: form.course_description?.value.trim(),
        };

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/courses/', courseData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 201) {
                alert(response.data.message || 'Course added successfully.');
                form.reset();
                setCourseAdded(prev => !prev);
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                alert(error.response.data.message || 'Course already exists.');
            } else {
                alert('An error occurred.');
            }
        }
    };

    const handleViewCourse = (course) => {
        setViewCourse(course);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setViewCourse(null);
    };

    const handleDeleteCourse = (courseCode) => {
        axios.delete(`http://127.0.0.1:8000/api/courses/code/${encodeURIComponent(courseCode)}/`)
            .then(response => {
                alert('Course deleted successfully.');
                setCourseAdded(prev => !prev);
            })
            .catch(error => {
                console.error('Error deleting course:', error);
                alert('An error occurred while deleting the course.');
            });
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div className='course-tab-content'>
            <form onSubmit={handleAddCourse}>
                <input type="text" name="course_name" placeholder='Course Title' required />
                <input type="text" name="course_code" placeholder='Course Code' required />
                <textarea name="course_description" placeholder='Course Description' required />
                <button type='Submit'>Add Course</button>
            </form>

            {showCoursesTable && (
                <>
                    <table>
                        <thead>
                            <tr>
                                <th>Course Title</th>
                                <th>Code</th>
                                <th>Description</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.length > 0 ? (
                                courses.map(course => (
                                    <tr key={course.course_code}>
                                        <td>{course.course_name}</td>
                                        <td>{course.course_code}</td>
                                        <td>{course.course_description}</td>
                                        <td>
                                            <i 
                                                className="fas fa-search" 
                                                onClick={() => handleViewCourse(course)}
                                                title="View Course"
                                                style={{ marginRight: '10px' }}
                                                
                                            ></i>
                                            <i 
                                                className="fas fa-trash-alt" 
                                                onClick={() => handleDeleteCourse(course.course_code)}
                                                title="Delete Course"
                                            ></i>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4">No courses available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <Modal
                        isOpen={modalIsOpen}
                        onRequestClose={closeModal}
                        contentLabel="Course Details"
                        className="modal"
                        overlayClassName="overlay"
                    >
                        <h2>Course Details</h2>
                        {viewCourse && (
                            <>
                                <p><strong>Title:</strong> {viewCourse.course_name}</p>
                                <p><strong>Code:</strong> {viewCourse.course_code}</p>
                                <p><strong>Description:</strong> {viewCourse.course_description}</p>
                                <button onClick={closeModal}>Close</button>
                            </>
                        )}
                    </Modal>
                </>
            )}
        </div>
    );
}

export default CourseTabContent;