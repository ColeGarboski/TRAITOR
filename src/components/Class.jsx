import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import useRoleRedirect from "../hooks/useRoleRedirect";
import "/src/ClassTeacherPage.css";

function Class() {
  useRoleRedirect("teacher");

  const [classes, setClasses] = useState([]);
  const [showCreateAssignmentModal, setShowCreateAssignmentModal] =
    useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);

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
    const fetchStudents = async () => {
      const usersRef = collection(db, "Users");
      const q = query(usersRef, where("role", "==", "student"));
      const querySnapshot = await getDocs(q);
      const fetchedStudents = [];
      querySnapshot.forEach((doc) => {
        fetchedStudents.push(doc.data().username); // Make sure the field name matches your Firestore schema
      });
      // Filter students based on the search input
      const filtered = fetchedStudents.filter((student) =>
        student.toLowerCase().includes(searchInput.toLowerCase())
      );
      setFilteredStudents(filtered);
    };

    if (searchInput !== "" && showAddStudentModal) {
      fetchStudents();
    } else {
      setFilteredStudents([]);
    }
  }, [searchInput, showAddStudentModal, db]);

  useEffect(() => {
    fetchData();
  }, [teacherId, db]); // Dependency array ensures fetchData is called when these values change

  const closeModal = () => {
    setShowCreateAssignmentModal(false);
    setShowAddStudentModal(false);
  };

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
  };

  // FIX ME OLD CODE
  const createAssignment = async (classId, assignmentData) => {
    try {
      const assignmentRef = doc(
        collection(db, `Users/${teacherId}/Classes/${classId}/Assignments`)
      );
      await setDoc(assignmentRef, assignmentData);
      console.log("Assignment created with ID: ", assignmentRef.id);
      closeModal();
    } catch (error) {
      console.error("Error creating assignment: ", error);
    }
  };

  // FIX ME OLD CODE
  const addStudentToClass = async (classId, studentId) => {
    try {
      const studentRef = doc(
        db,
        `Users/${teacherId}/Classes/${classId}/Students/${studentId}`
      );
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
                <div className="logo">
                  <img src="src/assets/logo.png" />
                </div>
              </a>
              <nav className="nav-menu-wrapper">
                <ul className="nav-menu-two">
                  <li>
                    <a href="/teacher" className="nav-link">
                      Class List
                    </a>
                  </li>
                  <li>
                    <a href="#" className="nav-link">
                      Assignments
                    </a>
                  </li>
                  <li>
                    <div className="nav-divider"></div>
                  </li>
                  <li className="mobile-margin-top-10">
                    <button
                      onClick={() => setShowCreateAssignmentModal(true)}
                      className="button-primary"
                    >
                      Create Assignment
                    </button>
                  </li>
                  <li className="mobile-margin-top-10">
                    <button
                      onClick={() => setShowAddStudentModal(true)}
                      className="button-primary"
                    >
                      Add Student
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {showCreateAssignmentModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const assignmentData = {
                  classId: formData.get("classDropdown"), // Assuming you need classId for something specific in your data structure
                  assignmentName: formData.get("assignmentName"),
                  endTime: formData.get("endTime"),
                };
                createAssignment(formData.get("classDropdown"), assignmentData);
              }}
            >
              <div className="form-group">
                <label htmlFor="classDropdown">Select a Class</label>
                <select
                  id="classDropdown"
                  name="classDropdown"
                  value={selectedClass}
                  onChange={handleClassChange}
                >
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
                <input
                  type="text"
                  id="assignmentName"
                  name="assignmentName"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="endDateTime">End Date and Time</label>
                <input
                  type="datetime-local"
                  id="endDateTime"
                  name="endDateTime"
                  required
                />
              </div>
              <button type="submit" className="button-primary">
                Create Assignment
              </button>
            </form>
          </div>
        </div>
      )}

      {showAddStudentModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const studentId = formData.get("studentName"); // Assuming studentName is the ID; adjust based on your actual data structure
                const classId = formData.get("classDropdownStudent");
                addStudentToClass(classId, { studentId }); // Adjust the second parameter based on how you're structuring student data in Firestore
              }}
            >
              <div className="form-group">
                <label htmlFor="classDropdownStudent">Select a Class</label>
                <select
                  id="classDropdownStudent"
                  name="classDropdownStudent"
                  value={selectedClass}
                  onChange={handleClassChange}
                >
                  <option value="">Select...</option>
                  {classes.map((classItem) => (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.classCode}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="studentSearch">Search for a Student</label>
                <input
                  type="text"
                  id="studentSearch"
                  name="studentSearch"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Type a student's name..."
                />
                {filteredStudents.length > 0 && (
                  <ul>
                    {filteredStudents.map((student, index) => (
                      <li key={index}>{student}</li>
                    ))}
                  </ul>
                )}
              </div>
              <button type="submit" className="button-primary">
                Add Student
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Class;
