import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

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
    console.log("Submissions: ", submissionsSnapshot.docs);

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
        classId: selectedClass,
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
      <header>
        <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 h-32">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                TRAITOR
              </h1>
            </div>

            <div className="mt-4 flex flex-col gap-4 sm:mt-0 sm:flex-row sm:items-center">
              <button
                onClick={() => navigate(-1)}
                className="block rounded-lg px-5 py-3 w-full bg-black text-white hover:bg-white/30 hover:text-white transition duration-300"
                type="button"
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      </header>
      <div class="grid grid-cols-2 grid-rows-2 gap-2">
        <div class="w-full h-full hover:animate-background rounded-xl bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 p-0.5 shadow-xl transition hover:bg-[length:400%_400%] hover:shadow-sm hover:[animation-duration:_4s] row-span-2">
          <div class="rounded-[10px] bg-white p-4 sm:p-6 flex flex-col h-full">
            <h3 class="text-lg font-medium text-gray-900">
              Upcoming Assignments
            </h3>
            {/* <main style={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                <fieldset className="space-y-4 w-full max-w-md">
                    <legend className="sr-only">Assignments</legend>
                    {assignments.map((assignment, index) => (
                        <div key={index} className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-gray-100 bg-white p-4 text-sm font-medium shadow-sm hover:border-gray-200"
                             onClick={() => handleAssignmentClick(assignment)}>
                            <p className="text-gray-700">{assignment.assignmentName}</p>
                            <p className="text-gray-900">{convertFirestoreTimestampToDate(assignment.endTime).toLocaleDateString()}</p>
                        </div>
                    ))}
                </fieldset>
            </main> */}
            {/* </div> */}
          </div>
        </div>

        <div class="h-full w-full hover:animate-background rounded-xl bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 p-0.5 shadow-xl transition hover:bg-[length:400%_400%] hover:shadow-sm hover:[animation-duration:_4s]">
          <div class="rounded-[10px] bg-white p-4 sm:p-6 h-full flex flex-col">
            <h3 class="text-lg font-medium text-gray-900">
              Recent Submissions
            </h3>
          </div>
        </div>

        <div class="h-full w-full hover:animate-background rounded-xl bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 p-0.5 shadow-xl transition hover:bg-[length:400%_400%] hover:shadow-sm hover:[animation-duration:_4s]">
          <div class="rounded-[10px] bg-white p-4 sm:p-6 h-full flex flex-col">
            <h3 class="text-lg font-medium text-gray-900">Announcement</h3>
          </div>
        </div>
      </div>

      {/* Announcements */}
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
