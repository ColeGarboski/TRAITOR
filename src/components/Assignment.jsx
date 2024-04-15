import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { storage } from "/src/firebase";
import { ref, uploadBytes } from "firebase/storage";
import axios from "axios";

function Assignment() {
  const [username, setUsername] = useState("");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();
  const { state } = useLocation();
  const assignment = state?.assignment;
  const [teacherName, setTeacherName] = useState("");

  const userId = useSelector((state) => state.auth.userId);
  const userRole = useSelector((state) => state.auth.role);
  const db = getFirestore();

  useEffect(() => {
    const fetchUserData = async () => {
      const userRef = doc(db, `${userRole === "teacher" ? "Teachers" : "Students"}/${userId}`);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        setUsername(docSnap.data().username);
      } else {
        console.error("No such document!");
      }
    };

    const fetchTeacherName = async () => {
      if (assignment) {
        const classRef = doc(db, `Classes/${assignment.classId}`);
        const classSnap = await getDoc(classRef);
        if (classSnap.exists() && classSnap.data().teacherId) {
          const teacherRef = doc(db, `Teachers/${classSnap.data().teacherId}`);
          const teacherSnap = await getDoc(teacherRef);
          if (teacherSnap.exists()) {
            setTeacherName(teacherSnap.data().username);
          } else {
            console.error("Teacher not found");
          }
        } else {
          console.error("Class not found or teacher ID missing");
        }
      }
    };

    fetchUserData();
    fetchTeacherName();
  }, [db, userId, userRole, assignment]);

  if (!assignment) {
    return <div>Loading or no assignment data...</div>;
  }

  const uploadToFirebase = async (file) => {
    if (!file) {
      console.error("No file selected for upload");
      return;
    }
    if (!assignment.id) {
      console.error("No assignment selected");
      return;
    }

    // Construct the file path in Firebase storage
    const filePath = `files/${assignment.classId}/${assignment.id}/${userId}/${file.name}`;
    const fileRef = ref(storage, filePath);

    try {
      await uploadBytes(fileRef, file);
      console.log("File uploaded successfully");
      notifyBackend(filePath, file.name);
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
      classID: assignment.classId,
      studentID: userId,
      assignmentID: assignment.id,
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

  return (
    <div className="App">
      <header>
        <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 h-32">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                Welcome back, {username}!
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
      <main style={{ display: "flex", justifyContent: "center" }}>
        <div className="h-96 w-1/2 relative block overflow-hidden rounded-lg border bg-white border-gray-100 p-4 sm:p-6 lg:p-8">
          <span className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-green-300 via-blue-500 to-purple-600"></span>
          <div className="sm:flex sm:justify-between sm:gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 sm:text-xl">
                {assignment.assignmentName}
              </h3>
              <p className="mt-1 text-xs font-medium text-gray-600">
                {teacherName}
              </p>
            </div>
          </div>
          <p
            className="text-pretty text-sm text-gray-500"
            style={{ maxHeight: "100px", overflowY: "auto" }}
          >
            Detailed information about the assignment can go here.
          </p>
          <div className="mt-4 flex flex-col gap-4 justify-center algsm:mt-0 sm:flex-row sm:items-center pt-14">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="relative flex h-[50px] w-40 items-center rounded-lg justify-center overflow-hidden bg-gray-800 text-white shadow-2xl transition-all before:absolute before:h-0 before:w-0 before:rounded-full before:bg-purple-600 before:duration-500 before:ease-out hover:before:h-56 hover:before:w-56"
            >
              <span className="relative z-10">Submit</span>
            </button>
          </div>
          <dl className="mt-6 flex gap-4 justify-center sm:gap-6">
            <div className="flex flex-col-reverse">
              <dt className="text-sm font-medium text-gray-600">
                {new Date(
                  assignment.endTime.seconds * 1000
                ).toLocaleDateString()}
              </dt>
              <dd className="text-xs text-gray-500">Due</dd>
            </div>
          </dl>
        </div>
      </main>
      {showSubmitModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowSubmitModal(false)}>
              &times;
            </span>
            <h2>Submit Assignment: {assignment.assignmentName}</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label>Upload your assignment (.docx):</label>
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

export default Assignment;
