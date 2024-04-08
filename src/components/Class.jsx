import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import axios from "axios";
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
import { ref, uploadBytes } from "firebase/storage";
import { storage } from "/src/firebase";
import "/src/teacherDash.css";

function Class() {
  const location = useLocation();
  const { classData } = location.state;

  const [showCreateAssignmentModal, setShowCreateAssignmentModal] =
    useState(false);
  const [showSubmitAssignmentModal, setShowSubmitAssignmentModal] =
    useState(false);
  const [selectedClass, setSelectedClass] = useState(classData.id);
  const [selectedFile, setSelectedFile] = useState(null);
  const [assignmentID, setAssignmentID] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [assignmentResults, setAssignmentResults] = useState([]);
  const [joinCode, setJoinCode] = useState("");

  const userRole = useSelector((state) => state.auth.role);
  const userId = useSelector((state) => state.auth.userId);
  const db = getFirestore();

  useEffect(() => {
    setJoinCode(classData.joinCode);

    fetchUpcomingAssignments().then(() => {
      // Only fetch assignment results if there are upcoming assignments
      if (upcomingAssignments.length > 0) {
        fetchAssignmentResults(upcomingAssignments[0].id);
      }
    });

  }, [db, classData]);

  const uploadToFirebase = async (file) => {
    if (!file) {
      console.error("No file selected for upload");
      return;
    }
    if (!assignmentID) {
      console.error("No assignment selected");
      return;
    }

    // Construct the file path in Firebase storage
    const filePath = `files/${selectedClass}/${assignmentID}/${userId}/${file.name}`;
    const fileRef = ref(storage, filePath);

    try {
      await uploadBytes(fileRef, file);
      console.log("File uploaded successfully");
      notifyBackend(filePath, file.name); // Pass the file path and name to notifyBackend function
    } catch (error) {
      console.error("Error uploading file to Firebase:", error);
    }
  };

  const notifyBackend = async (filePath, fileName) => {
    // Define the API endpoint. Adjust the URL to your computer
    const apiUrl = "http://127.0.0.1:5000/analyze-assignment";

    // Prepare the data to send
    const postData = {
      file_path: filePath,
      file_name: fileName,
      classID: selectedClass,
      studentID: userId,
      assignmentID: assignmentID,
    };

    try {
      const response = await axios.post(apiUrl, postData);
      console.log("Backend notified successfully:", response.data);
    } catch (error) {
      console.error("Error notifying backend:", error);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith(".docx")) {
      setSelectedFile(file);
    } else {
      alert("Please select a .docx file.");
    }
  };

  const handleFileDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.name.endsWith(".docx")) {
      setSelectedFile(file);
    } else {
      alert("Please drop a .docx file.");
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const closeModal = () => {
    setShowCreateAssignmentModal(false);
  };

  const fetchAssignmentResults = async (assignmentId) => {
    const submissionsRef = collection(
      db,
      `Classes/${selectedClass}/Assignments/${assignmentId}/Submissions`
    );
    const submissionsSnapshot = await getDocs(submissionsRef);
    console.log("Submissions: ", submissionsSnapshot.docs)

    const resultsPromises = submissionsSnapshot.docs.map(
      async (submissionDoc) => {
        const submissionId = submissionDoc.id;
        const resultsRef = collection(
          db,
          `Classes/${selectedClass}/Assignments/${assignmentId}/Submissions/${submissionId}/Results`
        );
        const resultsSnapshot = await getDocs(resultsRef);

        // Since there's only one result per submission, take the first doc
        const resultDoc = resultsSnapshot.docs[0];
        if (!resultDoc) {
          console.error("No result found for submission:", submissionId);
          return null;
        }

        return {
          submissionId,
          ...resultDoc.data(), // Spread the result data directly into the result object
        };
      }
    );

    const results = await Promise.all(resultsPromises);

    // Filter out any nulls that might have been added due to missing results
    const filteredResults = results.filter((result) => result !== null);

    setAssignmentResults(filteredResults);
    console.log("Fetched Results: ", filteredResults);
  };

  const createAssignment = async (assignmentData) => {
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
      <div className="navbar-logo-left">
        <div className="navbar-logo-left-container shadow-three">
          <div className="container">
            <div className="navbar-wrapper">
              <a href="#" className="navbar-brand w-nav-brand">
                <div className="text-block">
                  TR<em>AI</em>TOR
                </div>
              </a>
              <nav role="navigation" className="nav-menu-wrapper w-nav-menu">
                <ul role="list" className="nav-menu-two w-list-unstyled">
                  <li>
                    <a href="#" className="nav-link">
                      Classes
                    </a>
                  </li>
                  <li>
                    <a href="#" className="nav-link">
                      Upcoming Assignments
                    </a>
                  </li>
                  <li>
                    <a href="#" className="nav-link">
                      Previous Scores
                    </a>
                  </li>
                  <li>
                    <div className="nav-divider"></div>
                  </li>
                  <li className="mobile-margin-top-10">
                    <button
                      onClick={() => setShowCreateAssignmentModal(true)}
                      className="button-primary w-button"
                    >
                      Create Assignment
                    </button>
                    <button
                      onClick={() => setShowSubmitAssignmentModal(true)}
                      className="button-primary w-button"
                    >
                      Submit Assignment
                    </button>
                  </li>
                </ul>
              </nav>
              <div className="menu-button w-nav-button">
                <div className="w-icon-nav-menu"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid-container">
        <div className="w-layout-grid grid-3">
          {/* Assignments */}
          <div className="div-block-7">
            <div className="div-block-8">
              <div className="text-block-13">Assignments</div>
            </div>
            <div className="div-block-13">
              {upcomingAssignments.map((assignment, index) => (
                <div key={index} className="div-block-14">
                  <div className="text-block-14">
                    {assignment.assignmentName}
                    <br />
                    Due: {assignment.dueDate}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Recent Submissions */}
          {/* Placeholder for dynamic recent submissions, similar structure as assignments */}
          <div className="div-block-9">
            <div className="div-block-10">
              <div className="text-block-13">Recent Submissions</div>
              <div class="div-block-15">
                <div class="w-layout-grid grid-4">
                  <div
                    id="w-node-_63283496-afac-d614-b3e0-93d3f3f3ebc8-86864658"
                    class="div-block-16"
                  >
                    <div class="text-block-16">
                      Samuel Tyler
                      <br />
                      SETA Showcase
                    </div>
                  </div>
                  <div
                    id="w-node-_1948e13b-a63a-7610-4248-4837464ed72a-86864658"
                    class="div-block-16"
                  >
                    <div class="text-block-16">
                      Samuel Tyler
                      <br />
                      SETA Showcase
                    </div>
                  </div>
                  <div
                    id="w-node-_1c2af66f-f038-d641-b575-c78615ccbec1-86864658"
                    class="div-block-16"
                  >
                    <div class="text-block-16">
                      Samuel Tyler
                      <br />
                      SETA Showcase
                    </div>
                  </div>
                  <div
                    id="w-node-_03eccc87-085b-27df-c00e-2e7ccdb0cb2a-86864658"
                    class="div-block-16"
                  >
                    <div class="text-block-16">
                      Samuel Tyler
                      <br />
                      SETA Showcase
                    </div>
                  </div>
                </div>
              </div>
              <div className="div-block-9">
                <div className="div-block-10">
                  <div className="text-block-13">Announcements</div>
                  <div class="text-block-18">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    sed est rhoncus, tincidunt risus in, commodo odio. Phasellus
                    quam ante, rhoncus id consectetur ut, tristique eu nibh.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Announcements */}
      </div>
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
                createAssignment(assignmentData);
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
                <select
                  id="assignmentSelect"
                  name="assignmentSelect"
                  onChange={(e) => setAssignmentID(e.target.value)}
                >
                  {upcomingAssignments.map((assignment) => (
                    <option key={assignment.id} value={assignment.id}>
                      {assignment.assignmentName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Upload your assignment:</label>
                <input type="file" accept=".docx" onChange={handleFileSelect} />
                <div
                  className="file-upload"
                  onDrop={handleFileDrop}
                  onDragOver={handleDragOver}
                  style={{
                    border: "2px dashed #000",
                    padding: "20px",
                    cursor: "pointer",
                  }}
                >
                  Drag and drop a .docx file here or click to select a file.
                </div>
              </div>
              <button
                type="button"
                className="button-primary"
                onClick={() => selectedFile && uploadToFirebase(selectedFile)}
              >
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
