import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getFirestore, collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import useRoleRedirect from '../hooks/useRoleRedirect';
import '/src/ClassTeacherPage.css';

function TeacherPage() {
    useRoleRedirect('teacher');

    const [classes, setClasses] = useState([]); // Updated state to store classes
    const [showCreateClassModal, setShowCreateClassModal] = useState(false);
    const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false);
    const [showAddStudentModal, setShowAddStudentModal] = useState(false);
    const [selectedDays, setSelectedDays] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');


    const teacherId = useSelector((state) => state.auth.userId);
    const db = getFirestore();

    const fetchData = async () => {
        const classesRef = collection(db, `Users/${teacherId}/Classes`);
        const querySnapshot = await getDocs(classesRef);
        const fetchedClasses = [];
        querySnapshot.forEach((doc) => {
            fetchedClasses.push({ id: doc.id, ...doc.data() });
        });
        setClasses(fetchedClasses);
    };

    useEffect(() => {
        fetchData();
    }, [teacherId, db]); // Dependency array ensures fetchData is called when these values change

    const closeModal = () => {
        setShowCreateClassModal(false);
        setShowCreateAssignmentModal(false);
        setShowAddStudentModal(false);
        setSelectedDays([]);
    };

    const handleClassChange = (e) => {
        setSelectedClass(e.target.value);
    };


    const createClass = async (classData) => {
        try {
            const classRef = doc(collection(db, `Users/${teacherId}/Classes`));
            await setDoc(classRef, classData);
            console.log("Class created with ID: ", classRef.id);
            closeModal();
            await fetchData();
        } catch (error) {
            console.error("Error creating class: ", error);
        }
    };

    const handleCreateClassFormSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const classData = {
            classCode: formData.get('classCode'),
            className: formData.get('className'),
            startTime: formData.get('startTime'),
            endTime: formData.get('endTime'),
            days: selectedDays,
        };
        createClass(classData);
    };

    const handleDayChange = (day) => {
        setSelectedDays(prev => {
            if (prev.includes(day)) {
                // If the day is already selected, remove it
                return prev.filter(d => d !== day);
            } else {
                // Otherwise, add the day to the selected days
                return [...prev, day];
            }
        });
    };

    const createAssignment = async (classId, assignmentData) => {
        try {
            const assignmentRef = doc(collection(db, `Users/${teacherId}/Classes/${classId}/Assignments`));
            await setDoc(assignmentRef, assignmentData);
            console.log("Assignment created with ID: ", assignmentRef.id);
            closeModal();
        } catch (error) {
            console.error("Error creating assignment: ", error);
        }
    };

    const addStudentToClass = async (classId, studentId) => {
        try {
            const studentRef = doc(db, `Users/${teacherId}/Classes/${classId}/Students/${studentId}`);
            await setDoc(studentRef, { added: true });
            console.log(`Student ${studentId} added to class ${classId}`);
            closeModal();
        } catch (error) {
            console.error("Error adding student to class: ", error);
        }
    };

    return (
        <div className="App">
            <header className="navbar-logo-left">
                <div className="navbar-logo-left-container shadow-three">
                    <div className="container">
                        <div className="navbar-wrapper">
                            <a href="#" className="navbar-brand">
                                <div className="text-block">TR<em>AI</em>TOR</div>
                            </a>
                            <nav className="nav-menu-wrapper">
                                <ul className="nav-menu-two">
                                    <li><a href="#" className="nav-link">Classes</a></li>
                                    <li><a href="#" className="nav-link">Upcoming Assignments</a></li>
                                    <li><a href="#" className="nav-link">Previous Scores</a></li>
                                    <li><div className="nav-divider"></div></li>
                                    <li className="mobile-margin-top-10">
                                        <button onClick={() => setShowCreateClassModal(true)} className="button-primary">Create class</button>
                                    </li>
                                    <li className="mobile-margin-top-10">
                                        <button onClick={() => setShowCreateAssignmentModal(true)} className="button-primary">Create assignment</button>
                                    </li>
                                    <li className="mobile-margin-top-10">
                                        <button onClick={() => setShowAddStudentModal(true)} className="button-primary">Add student</button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </header>

            <main>
                <div className="grid">
                    {classes.map((classItem) => (
                        <div key={classItem.id} className="div-block">
                            <div className="div-block-2">
                                <img src={classItem.imageURL || '/src/assets/classy.jpg'} loading="lazy" alt="" className="image" />
                            </div>
                            <div className="text-block-4">{classItem.classCode}</div>
                            <div className="div-block-3">
                                <div className="text-block-5">{classItem.days.join('-')}</div>
                                <div className="text-block-6">{classItem.startTime}-{classItem.endTime}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {showCreateClassModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeModal}>&times;</span>
                        <h2>Create Class Form</h2>
                        <form onSubmit={handleCreateClassFormSubmit}>
                            <div className="form-group">
                                <label htmlFor="classCode">Class Code</label>
                                <input type="text" id="classCode" name="classCode" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="className">Class Name</label>
                                <input type="text" id="className" name="className" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="startTime">Start Time</label>
                                <input type="time" id="startTime" name="startTime" required />
                            </div>
                            <div className="form-group">
                                <label>Days of the Week</label>
                                <div>
                                    {["Mon", "Tues", "Wed", "Thurs", "Fri"].map((day) => (
                                        <div key={day}>
                                            <input
                                                type="checkbox"
                                                id={day}
                                                name="classDays"
                                                value={day}
                                                checked={selectedDays.includes(day)}
                                                onChange={() => handleDayChange(day)}
                                            />
                                            <label htmlFor={day}>{day}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="endTime">End Time</label>
                                <input type="time" id="endTime" name="endTime" required />
                            </div>
                            <button type="submit" className="submit-button">Create Class</button>
                        </form>
                    </div>
                </div>
            )}

            {showCreateAssignmentModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeModal}>&times;</span>
                        <h2>Create Assignment Form</h2>
                        <form onSubmit={e => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const assignmentData = {
                                classId: formData.get('classDropdown'), // Assuming you need classId for something specific in your data structure
                                assignmentName: formData.get('assignmentName'),
                                endTime: formData.get('endTime'),
                            };
                            createAssignment(formData.get('classDropdown'), assignmentData);
                        }}>
                            <div className="form-group">
                                <label htmlFor="classDropdown">Select a Class</label>
                                <select id="classDropdown" name="classDropdown" value={selectedClass} onChange={handleClassChange}>
                                    <option value="">Select...</option>
                                    {classes.map((classItem) => (
                                        <option key={classItem.id} value={classItem.id}>
                                            {classItem.classCode}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="assignmentName">Assignment Name</label>
                                <input type="text" id="assignmentName" name="assignmentName" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="endTime">End Time</label>
                                <input type="time" id="endTime" name="endTime" required />
                            </div>
                            <button type="submit" className="submit-button">Create Assignment</button>
                        </form>
                    </div>
                </div>
            )}


            {showAddStudentModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeModal}>&times;</span>
                        <h2>Add Student</h2>
                        <form onSubmit={e => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const studentId = formData.get('studentName'); // Assuming studentName is the ID; adjust based on your actual data structure
                            const classId = formData.get('classDropdownStudent');
                            addStudentToClass(classId, { studentId }); // Adjust the second parameter based on how you're structuring student data in Firestore
                        }}>
                            <div className="form-group">
                                <label htmlFor="classDropdownStudent">Select a Class</label>
                                <select id="classDropdownStudent" name="classDropdownStudent" value={selectedClass} onChange={handleClassChange}>
                                    <option value="">Select...</option>
                                    {classes.map((classItem) => (
                                        <option key={classItem.id} value={classItem.id}>
                                            {classItem.classCode}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="studentName">Student Name</label>
                                <input type="text" id="studentName" name="studentName" required />
                            </div>
                            <button type="submit" className="submit-button">Add Student</button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

export default TeacherPage;
