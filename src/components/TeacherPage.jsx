import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import useRoleRedirect from '../hooks/useRoleRedirect';

function TeacherPage() {
    useRoleRedirect('teacher'); // Redirect if not a teacher

    const [data, setData] = useState([]);

    const teacherId = useSelector((state) => state.auth.userId);
    const db = getFirestore();

    useEffect(() => {
        const fetchData = async () => {
            const db = getFirestore();
            // Example: fetching some data from Firestore
            const q = query(collection(db, "someCollection"), where("role", "==", "teacher"));
            const querySnapshot = await getDocs(q);
            const items = [];
            querySnapshot.forEach((doc) => {
                items.push(doc.data());
            });
            setData(items);
        };

        fetchData();
    }, []);

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
        <div>
            <h1>Teacher Page</h1>

            <button onClick={handleCreateClassClick}>Create Test Class</button>
            <button onClick={handleCreateAssignmentClick}>Create Test Assignment</button>
        </div>
    );
}

export default TeacherPage;
