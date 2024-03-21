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

  const addStudentToClass = async (classId, selectedStudent) => {
    try {
      if (!classId || !selectedStudent.userId)
        throw new Error("Missing classId or student userId");

      // Add student to class
      const studentClassRef = doc(
        db,
        `Users/${teacherId}/Classes/${classId}/Students/${selectedStudent.userId}`
      );
      await setDoc(studentClassRef, { username: selectedStudent.username });

      // Fetch class information
      const classRef = doc(db, `Users/${teacherId}/Classes/${classId}`);
      const classSnap = await getDoc(classRef);
      if (!classSnap.exists()) {
        console.log("No such class!");
        return;
      }
      const classData = classSnap.data();

      // Add class to student
      const studentClassesRef = doc(
        db,
        `Users/${selectedStudent.userId}/Classes/${classId}`
      );
      await setDoc(studentClassesRef, {
        classCode: classData.classCode,
        className: classData.className,
        startTime: classData.startTime,
        endTime: classData.endTime,
        days: classData.days,
        teacherId: teacherId,
      });

      console.log(
        `Class ${classId} added to student ${selectedStudent.username} (${selectedStudent.userId})`
      );
      closeModal();
    } catch (error) {
      console.error(
        "Error adding student to class or class to student: ",
        error
      );
    }
  };

  const handleSubmitAddStudentForm = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const classId = formData.get("classDropdownStudent");
    await addStudentToClass(classId, selectedStudent);
    // Reset state as necessary
    setSelectedStudent("");
    setSearchInput("");
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
            <span className="close" onClick={closeModal}>&times;</span>
            <h2>Add Student</h2>
            <form onSubmit={handleSubmitAddStudentForm}>
              <div className="form-group">
                <label htmlFor="classDropdownStudent">Select a Class</label>
                <select id="classDropdownStudent" name="classDropdownStudent" required>
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
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Type a student's name..."
                />
                <ul id="searchResults">
                  {filteredStudents.length > 0 &&
                    filteredStudents.map((student, index) => (
                      <li key={index} onClick={() => setSelectedStudent({ userId: student.userId, username: student.username })}>
                        {student.username}
                      </li>
                    ))}
                </ul>
              </div>
              {/* The student ID input field has been removed. Selection is handled via search results. */}
              <button type="submit" className="button-primary">Add Student</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Class;
