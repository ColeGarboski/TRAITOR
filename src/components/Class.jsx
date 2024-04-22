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
  getDoc,
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
    fetchUpcomingAssignments();
    fetchAndStoreAssignmentResults();
  }, [db, classData, userRole, userId]);

  const fetchAndStoreAssignmentResults = async () => {
    const fetchedAssignments = await fetchUpcomingAssignments();
    const results = [];
    for (const assignment of fetchedAssignments) {
      const assignmentResult = await fetchAssignmentResults(assignment.id);
      results.push(...assignmentResult);
    }
    setAssignmentResults(results);
  };

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
    // First, get the assignment name from the assignment document
    const assignmentRef = doc(
      db,
      `Classes/${selectedClass}/Assignments/${assignmentId}`
    );
    const assignmentSnapshot = await getDoc(assignmentRef);
    const assignmentName = assignmentSnapshot.exists()
      ? assignmentSnapshot.data().assignmentName
      : "Unknown Assignment";

    const submissionsRef = collection(
      db,
      `Classes/${selectedClass}/Assignments/${assignmentId}/Submissions`
    );
    let q;

    if (userRole === "teacher") {
      q = query(submissionsRef); // Fetch all submissions for teachers
    } else if (userRole === "student") {
      q = doc(submissionsRef, userId); // Directly access the student's submission using the document ID
    }

    let submissionsSnapshot;
    if (userRole === "teacher") {
      submissionsSnapshot = await getDocs(q);
    } else {
      const singleDoc = await getDoc(q);
      submissionsSnapshot = singleDoc.exists()
        ? { docs: [singleDoc] }
        : { docs: [] }; // Mimic the structure returned by getDocs for uniform processing below
    }

    const resultsPromises = submissionsSnapshot.docs.map(
      async (submissionDoc) => {
        const studentId = submissionDoc.id;
        const studentRef = doc(db, `Students/${studentId}`);
        const studentSnapshot = await getDoc(studentRef);
        const studentUsername = studentSnapshot.exists()
          ? studentSnapshot.data().username
          : "Unknown Student";

        const resultsRef = collection(
          db,
          `Classes/${selectedClass}/Assignments/${assignmentId}/Submissions/${studentId}/Results`
        );
        const resultsSnapshot = await getDocs(resultsRef);
        const resultDoc = resultsSnapshot.docs[0];

        if (!resultDoc) {
          console.error("No result found for submission:", studentId);
          return null;
        }

        return {
          studentName: studentUsername,
          assignmentName: assignmentName, // Use the fetched assignment name
          ...resultDoc.data(),
        };
      }
    );

    const results = await Promise.all(resultsPromises);
    return results.filter((result) => result !== null);
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
    const assignmentsRef = collection(
      db,
      `Classes/${selectedClass}/Assignments`
    );
    const q = query(assignmentsRef, orderBy("endTime"));
    const querySnapshot = await getDocs(q);

    const assignments = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setUpcomingAssignments(assignments);
    return assignments;
  };

  const handlePreviousScoresClick = () => {
    navigate("/submissions", { state: { submissions: assignmentResults } });
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
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-5 py-3 text-white transition hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring"
                type="button"
                onClick={handlePreviousScoresClick}
              >
                <span className="text-sm font-medium">Grades</span>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </button>
              <button
                onClick={() => setShowCreateAssignmentModal(true)} // FIX ME
                className="block rounded-lg px-5 py-3 w-44 bg-black text-white hover:bg-orange-500 hover:text-white transition duration-300"
                type="button"
              >
                Create Assignment
              </button>
              <button
                onClick={() => navigate(-1)}
                className="block rounded-lg px-5 py-3  bg-black text-white hover:bg-orange-500 hover:text-white transition duration-300"
                type="button"
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      </header>
      <h1 className="text-white text-lg  text-center justify-center">
        Class Code: {joinCode}
      </h1>
      <div class="grid grid-cols-2 grid-rows-2 gap-2">
        <div class="w-full h-full hover:animate-background rounded-xl bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 p-0.5 shadow-xl transition hover:bg-[length:400%_400%] hover:shadow-sm hover:[animation-duration:_4s] row-span-2">
          <div className="rounded-[10px] bg-white p-4 sm:p-6 flex flex-col h-full">
            <h3 className="text-2xl font-medium mb-2 text-gray-900">
              Upcoming Assignments
            </h3>
            {upcomingAssignments.map((assignment) => (
              <div key={assignment.id}>
                <h2 className="text-lg">{assignment.assignmentName}</h2>
                <p className="mt-[-6px] mb-2">
                  {new Date(
                    assignment.endTime.seconds * 1000
                  ).toLocaleDateString()}
                </p>
                <hr />
              </div>
            ))}
          </div>
        </div>

        <div class="h-full w-full hover:animate-background rounded-xl bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 p-0.5 shadow-xl transition hover:bg-[length:400%_400%] hover:shadow-sm hover:[animation-duration:_4s]">
          <div className="rounded-[10px] bg-white p-4 sm:p-6 h-full flex flex-col">
            <h1 className="text-2xl font-medium text-gray-900 pb-2">
              Recent Submissions
            </h1>
            {assignmentResults.map((result, index) => (
              <div key={index}>
                <h2 className="text-lg">{result.assignmentName}</h2>
                <p className="mt-[-6px] mb-2">{result.studentName}</p>
                <hr></hr>
              </div>
            ))}
          </div>
        </div>

        <div class="h-full w-full hover:animate-background rounded-xl bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 p-0.5 shadow-xl transition hover:bg-[length:400%_400%] hover:shadow-sm hover:[animation-duration:_4s]">
          <div class="rounded-[10px] bg-white p-4 sm:p-6 h-full flex flex-col">
            <h1 class="text-2xl font-medium text-gray-900">Announcement</h1>
            <div>
              <h2 className="text-lg">SETA SHOWCASE 2024 WOOOOOOOOOO!</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements */}
      {showCreateAssignmentModal && (
        <div className="modal">
          <div className="modal-content">
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
                <label className="text-left" htmlFor="assignmentName">
                  Assignment Name
                </label>
                <input
                  type="text"
                  id="assignmentName"
                  name="assignmentName"
                  required
                />
              </div>
              <div className="form-group">
                <label className="text-left" htmlFor="endDateTime">
                  End Date and Time
                </label>
                <input
                  type="datetime-local"
                  id="endDateTime"
                  name="endDateTime"
                  required
                />
              </div>
              <button
                onClick={() => setShowCreateAssignmentModal(false)}
                className="rounded-lg mr-2 px-5 py-3  bg-black text-white hover:bg-orange-500 hover:text-white transition duration-300"
              >
                Close
              </button>
              <button
                type="submit"
                className="rounded-lg px-5 py-3 ml-2   bg-black text-white hover:bg-orange-500 hover:text-white transition duration-300"
              >
                Create
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
