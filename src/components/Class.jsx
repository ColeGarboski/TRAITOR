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
  Timestamp,
  orderBy,
} from "firebase/firestore";
import "/src/ClassTeacherPage.css";

function Class() {
  const location = useLocation();
  const { classData } = location.state;

  const [showCreateAssignmentModal, setShowCreateAssignmentModal] =
    useState(false);
  const [showSubmitAssignmentModal, setShowSubmitAssignmentModal] =
    useState(false);
  const [selectedClass, setSelectedClass] = useState(classData.id);
  const [searchInput, setSearchInput] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);

  const userRole = useSelector((state) => state.auth.role);
  const userId = useSelector((state) => state.auth.userId);
  const db = getFirestore();

  useEffect(() => {
    fetchUpcomingAssignments();
  }, []);

  const closeModal = () => {
    setShowCreateAssignmentModal(false);
  };

  const createAssignment = async (classId, assignmentData) => {
    try {
      const endTime = assignmentData.endTime;
      // Convert endTime to a Firestore Timestamp
      const formattedEndTime = Timestamp.fromDate(new Date(endTime));

      const assignmentsRef = collection(
        db,
        `Classes/${selectedClass}/Assignments`
      );
      const assignmentRef = doc(assignmentsRef);
      await setDoc(assignmentRef, {
        ...assignmentData,
        endTime: formattedEndTime, // Store the converted Timestamp
      });

      console.log("Assignment created with ID: ", assignmentRef.id);
      closeModal();
    } catch (error) {
      console.error("Error creating assignment: ", error);
    }
  };

  const fetchUpcomingAssignments = async () => {
    try {
      const assignmentsRef = collection(
        db,
        `Classes/${selectedClass}/Assignments`
      );
      const q = query(assignmentsRef, orderBy("endTime"));
      const querySnapshot = await getDocs(q);

      const assignments = [];
      querySnapshot.forEach((doc) => {
        assignments.push({ id: doc.id, ...doc.data() });
      });

      setUpcomingAssignments(assignments);

      console.log("Fetched Assignments: ", assignments);
    } catch (error) {
      console.error("Error fetching assignments: ", error);
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
                    <button
                      className="nav-link"
                      onClick={fetchUpcomingAssignments}
                    >
                      Assignments
                    </button>
                  </li>
                  <li>
                    <div className="nav-divider"></div>
                  </li>
                  {userRole === "teacher" ? (
                    <li className="mobile-margin-top-10">
                      <button
                        onClick={() => setShowCreateAssignmentModal(true)}
                        className="button-primary"
                      >
                        Create Assignment
                      </button>
                    </li>
                  ) : (
                    <li className="mobile-margin-top-10">
                      {/* This button could potentially show a modal for submitting an assignment */}
                      <button
                        onClick={() => setShowSubmitAssignmentModal(true)}
                        className="button-primary"
                      >
                        Submit Assignment
                      </button>
                    </li>
                  )}
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
                  endTime: formData.get("endDateTime"),
                };
                createAssignment(selectedClass, assignmentData);
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

      {userRole === "student" && showSubmitAssignmentModal && (
        <div className="modal">
          <div className="modal-content">
            <span
              className="close"
              onClick={() => setShowSubmitAssignmentModal(false)}
            >
              &times;
            </span>
            <h2>Submit Assignment</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label htmlFor="assignmentSelect">Choose an assignment:</label>
                <select id="assignmentSelect" name="assignmentSelect">
                  {upcomingAssignments.map((assignment) => (
                    <option key={assignment.id} value={assignment.id}>
                      {assignment.assignmentName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Upload your assignment:</label>
                <div className="file-upload">
                  <input type="file" />
                  {/* Placeholder for a more complex drag-and-drop implementation */}
                </div>
              </div>
              <button type="button" className="button-primary">
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Class;
