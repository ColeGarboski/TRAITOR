import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import "/src/ClassTeacherPage.css";

function Class() {
  const location = useLocation();
  const { classData } = location.state;

  const [showCreateAssignmentModal, setShowCreateAssignmentModal] =
    useState(false);
  const [selectedClass, setSelectedClass] = useState(classData.id);
  const [searchInput, setSearchInput] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);

  const userRole = useSelector((state) => state.auth.role);
  const userId = useSelector((state) => state.auth.userId);
  const db = getFirestore();

  const closeModal = () => {
    setShowCreateAssignmentModal(false);
  };

  const createAssignment = async (classId, assignmentData) => {
    try {
      const assignmentsRef = collection(db, `Classes/${selectedClass}/Assignments`);
      const assignmentRef = doc(assignmentsRef);
      await setDoc(assignmentRef, assignmentData);
  
      console.log("Assignment created with ID: ", assignmentRef.id);
      closeModal();
    } catch (error) {
      console.error("Error creating assignment: ", error);
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
                  assignmentName: formData.get("assignmentName"),
                  endTime: formData.get("endTime"),
                };
                createAssignment(formData.get("classDropdown"), assignmentData);
              }}
            >
              <div className="form-group">
                <label>Class:</label>
                <p>
                  {classData.className} (Code: {classData.classCode})
                </p>
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
    </div>
  );
}

export default Class;
