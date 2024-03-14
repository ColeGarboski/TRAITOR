import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import useRoleRedirect from '../hooks/useRoleRedirect';
import '/src/ClassTeacherPage.css';
function TeacherPage() {
    useRoleRedirect('teacher'); // Redirect if not a teacher

    const [classes, setClasses] = useState([]); // Updated state to store classes

    const teacherId = useSelector((state) => state.auth.userId);
    const db = getFirestore();

    useEffect(() => {
        const fetchData = async () => {
            const classesRef = collection(db, `Users/${teacherId}/Classes`);
            const querySnapshot = await getDocs(classesRef);
            const fetchedClasses = [];
            querySnapshot.forEach((doc) => {
                // Adding doc.id to the object to keep track of the class ID
                fetchedClasses.push({ id: doc.id, ...doc.data() });
            });
            setClasses(fetchedClasses);
        };

        fetchData();
    }, [teacherId, db]);

    const createClass = async (classData) => {
        try {
            const classRef = doc(collection(db, `Users/${teacherId}/Classes`));
            await setDoc(classRef, classData);
            console.log("Class created with ID: ", classRef.id);
        } catch (error) {
            console.error("Error creating class: ", error);
        }
    };

    const handleCreateClassClick = () => { // Change to user input data
        createClass({
            classCode: "CS-303",
            startTime: "09:00",
            endTime: "10:30",
            days: ["Mon", "Wed", "Thurs"],
            className: "Introduction to Testing"
        });
    };

    const createAssignment = async (classId, assignmentData) => {
        try {
            const assignmentRef = doc(collection(db, `Users/${teacherId}/Classes/${classId}/Assignments`));
            await setDoc(assignmentRef, assignmentData);
            console.log("Assignment created with ID: ", assignmentRef.id);
        } catch (error) {
            console.error("Error creating assignment: ", error);
        }
    };

    const handleCreateAssignmentClick = () => { // Change to user input data
        const classId = "aWK55iupHKclrlQSNqn8"; // Replace this with teacher's selected class later
        createAssignment(classId, {
            title: "Sprint Review 2",
            dueDate: new Date() // Change to date selected by teacher
        });
    };

    const addStudentToClass = async (classId, studentId) => {
        try {
            const studentRef = doc(db, `Users/${teacherId}/Classes/${classId}/Students/${studentId}`);
            await setDoc(studentRef, { added: true }); // 'added: true' is just a placeholder, can store more info
            console.log(`Student ${studentId} added to class ${classId}`);
        } catch (error) {
            console.error("Error adding student to class: ", error);
        }
    };

    const handleAddStudentClick = () => {
        const classId = "aWK55iupHKclrlQSNqn8"; // Replace this with teacher's selected class later
        const studentId = "studentIdHere"; // Replace this with an actual student ID
        addStudentToClass(classId, studentId);
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
                                    <li>
                                        <a href="#" className="nav-link">Classes</a>
                                    </li>
                                    <li>
                                        <a href="#" className="nav-link">Upcoming Assignments</a>
                                    </li>
                                    <li>
                                        <a href="#" className="nav-link">Previous Scores</a>
                                    </li>
                                    <li>
                                        <div className="nav-divider"></div>
                                    </li>
                                    <li className="mobile-margin-top-10">
                                    <button onClick={handleCreateClassClick} className="button-primary">Create class</button>
                                    </li>
                                </ul>
                            </nav>
                            <div className="menu-button">
                                <div className="w-icon-nav-menu"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main>
                <div className="grid">
                    {classes.map((classItem) => (
                        <div key={classItem.id} className="div-block">
                            <div className="div-block-2">
                                <img src="/src/assets/classy.jpg" loading="lazy" alt="" className="image"/>
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

            {/* Scripts */}
            <script src="https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=65e0ee506245ceae86864652" type="text/javascript" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossOrigin="anonymous"></script>
            <script src="js/webflow.js" type="text/javascript"></script>
        </div>
    );
}

export default TeacherPage;
