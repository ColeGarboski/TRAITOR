import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import useRoleRedirect from "../hooks/useRoleRedirect";
import "/src/ClassTeacherPage.css";

function TeacherPage() {
  useRoleRedirect("teacher");

  const [classes, setClasses] = useState([]);
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [showCreateAssignmentModal, setShowCreateAssignmentModal] =
    useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);

  const navigate = useNavigate();
  const teacherId = useSelector((state) => state.auth.userId);
  const db = getFirestore();

  const fetchData = async () => {
    const teacherClassesRef = collection(db, `Teachers/${teacherId}/Classes`);
    const querySnapshot = await getDocs(teacherClassesRef);
    const classIds = querySnapshot.docs.map((doc) => doc.id);

    const fetchedClasses = [];
    for (const classId of classIds) {
      const classRef = doc(db, "Classes", classId);
      const classSnap = await getDoc(classRef);
      if (classSnap.exists()) {
        fetchedClasses.push({ id: classSnap.id, ...classSnap.data() });
      }
    }

    setClasses(fetchedClasses);
  };

  useEffect(() => {
    const fetchStudents = async () => {
      if (searchInput === "" || !showAddStudentModal) {
        setFilteredStudents([]);
        return;
      }

      const usersRef = collection(db, "Users");
      const q = query(usersRef, where("role", "==", "student"));
      const querySnapshot = await getDocs(q);
      const studentsData = [];
      querySnapshot.forEach((doc) => {
        // Push both username and userId (UID) to studentsData
        studentsData.push({ username: doc.data().username, userId: doc.id });
      });

      // Filter based on username match with searchInput
      const filtered = studentsData.filter((student) =>
        student.username.toLowerCase().includes(searchInput.toLowerCase())
      );

      setFilteredStudents(filtered);
    };

    fetchStudents();
  }, [searchInput, showAddStudentModal, db]);

  useEffect(() => {
    fetchData();
  }, [teacherId, db]); // Dependency array ensures fetchData is called when these values change

  const closeModal = () => {
    setShowCreateClassModal(false);
    setShowCreateAssignmentModal(false);
    setShowAddStudentModal(false);
    setSelectedDays([]);
  };

  const fetchExistingJoinCodes = async () => {
    const classesRef = collection(db, "Classes");
    const querySnapshot = await getDocs(classesRef);

    const joinCodes = new Set();

    querySnapshot.forEach((doc) => {
      if (doc.exists() && doc.data().joinCode) {
        joinCodes.add(doc.data().joinCode);
      }
    });

    return joinCodes;
  };

  const generateJoinCode = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < 15; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  const generateUniqueJoinCode = async () => {
    const existingCodes = await fetchExistingJoinCodes();
    let newCode;
    do {
      newCode = generateJoinCode();
    } while (existingCodes.has(newCode));
    return newCode;
  };

  const createClass = async (classData) => {
    try {
      const joinCode = await generateUniqueJoinCode();
      const newClassData = {
        ...classData,
        joinCode,
        teacherId,
      };

      // Add the new class to the 'Classes' collection
      const classRef = doc(collection(db, "Classes"));
      await setDoc(classRef, newClassData);

      // Update the teacher's 'Classes' subcollection with the new class ID
      const teacherClassesRef = doc(
        db,
        `Teachers/${teacherId}/Classes`,
        classRef.id
      );
      await setDoc(teacherClassesRef, { classId: classRef.id });

      console.log(
        "Class created with ID: ",
        classRef.id,
        " and Join Code: ",
        joinCode
      );
      closeModal();
      await fetchData();
    } catch (error) {
      console.error("Error creating class: ", error);
    }
  };

  const handleCreateClassFormSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const classData = {
      classCode: formData.get("classCode"),
      className: formData.get("className"),
      startTime: formData.get("startTime"),
      endTime: formData.get("endTime"),
      days: selectedDays,
    };
    createClass(classData);
  };

  const handleDayChange = (day) => {
    setSelectedDays((prev) => {
      if (prev.includes(day)) {
        // If the day is already selected, remove it
        return prev.filter((d) => d !== day);
      } else {
        // Otherwise, add the day to the selected days
        return [...prev, day];
      }
    });
  };

  const handleClassCardClick = (classData) => {
    navigate("/class", { state: { classData } });
  };

  return (
    <div className="App">
      <header>
        <div class="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 h-32">
          <div class="sm:flex sm:items-center sm:justify-between">
            <div class="text-center sm:text-left">
              <h1 class="text-2xl font-bold text-white sm:text-3xl">
                Welcome Back, Jim!
              </h1>

              <p class="mt-1.5 text-sm text-gray-500">
                Let's write a new blog post! 🎉
              </p>
            </div>

            <div class="mt-4 flex flex-col gap-4 sm:mt-0 sm:flex-row sm:items-center">
              <button
                class="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-5 py-3 text-white transition hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring"
                type="button"
              >
                <span class="text-sm font-medium"> View Website </span>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </button>

              <button
                class="block rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring"
                type="button"
              >
                Create Post
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div>
          <div class="wave"></div>
          <div class="wave"></div>
          <div class="wave"></div>
        </div>
        <div className="grid">
          <article class="hover:animate-background rounded-xl bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 p-0.5 shadow-xl transition hover:bg-[length:400%_400%] hover:shadow-sm hover:[animation-duration:_4s]">
            <div class="rounded-[10px] bg-white p-4 !pt-20 sm:p-6">
              <time datetime="2022-10-10" class="block text-xs text-gray-500">
                {" "}
                10th Oct 2022{" "}
              </time>

              <a href="#">
                <h3 class="mt-0.5 text-lg font-medium text-gray-900">
                  How to center an element using JavaScript and jQuery
                </h3>
              </a>

              <div class="mt-4 flex flex-wrap gap-1">
                <span class="whitespace-nowrap rounded-full bg-purple-100 px-2.5 py-0.5 text-xs text-purple-600">
                  Snippet
                </span>

                <span class="whitespace-nowrap rounded-full bg-purple-100 px-2.5 py-0.5 text-xs text-purple-600">
                  JavaScript
                </span>
              </div>
            </div>
          </article>
          <article class="hover:animate-background rounded-xl bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 p-0.5 shadow-xl transition hover:bg-[length:400%_400%] hover:shadow-sm hover:[animation-duration:_4s]">
            <div class="rounded-[10px] bg-white p-4 !pt-20 sm:p-6">
              <time datetime="2022-10-10" class="block text-xs text-gray-500">
                {" "}
                10th Oct 2022{" "}
              </time>

              <a href="#">
                <h3 class="mt-0.5 text-lg font-medium text-gray-900">
                  How to center an element using JavaScript and jQuery
                </h3>
              </a>

              <div class="mt-4 flex flex-wrap gap-1">
                <span class="whitespace-nowrap rounded-full bg-purple-100 px-2.5 py-0.5 text-xs text-purple-600">
                  Snippet
                </span>

                <span class="whitespace-nowrap rounded-full bg-purple-100 px-2.5 py-0.5 text-xs text-purple-600">
                  JavaScript
                </span>
              </div>
            </div>
          </article>
          <article class="hover:animate-background rounded-xl bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 p-0.5 shadow-xl transition hover:bg-[length:400%_400%] hover:shadow-sm hover:[animation-duration:_4s]">
            <div class="rounded-[10px] bg-white p-4 !pt-20 sm:p-6">
              <time datetime="2022-10-10" class="block text-xs text-gray-500">
                {" "}
                10th Oct 2022{" "}
              </time>

              <a href="#">
                <h3 class="mt-0.5 text-lg font-medium text-gray-900">
                  How to center an element using JavaScript and jQuery
                </h3>
              </a>

              <div class="mt-4 flex flex-wrap gap-1">
                <span class="whitespace-nowrap rounded-full bg-purple-100 px-2.5 py-0.5 text-xs text-purple-600">
                  Snippet
                </span>

                <span class="whitespace-nowrap rounded-full bg-purple-100 px-2.5 py-0.5 text-xs text-purple-600">
                  JavaScript
                </span>
              </div>
            </div>
          </article>
          <article class="hover:animate-background rounded-xl bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 p-0.5 shadow-xl transition hover:bg-[length:400%_400%] hover:shadow-sm hover:[animation-duration:_4s]">
            <div class="rounded-[10px] bg-white p-4 !pt-20 sm:p-6">
              <time datetime="2022-10-10" class="block text-xs text-gray-500">
                {" "}
                10th Oct 2022{" "}
              </time>

              <a href="#">
                <h3 class="mt-0.5 text-lg font-medium text-gray-900">
                  How to center an element using JavaScript and jQuery
                </h3>
              </a>

              <div class="mt-4 flex flex-wrap gap-1">
                <span class="whitespace-nowrap rounded-full bg-purple-100 px-2.5 py-0.5 text-xs text-purple-600">
                  Snippet
                </span>

                <span class="whitespace-nowrap rounded-full bg-purple-100 px-2.5 py-0.5 text-xs text-purple-600">
                  JavaScript
                </span>
              </div>
            </div>
          </article>
          <article class="hover:animate-background rounded-xl bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 p-0.5 shadow-xl transition hover:bg-[length:400%_400%] hover:shadow-sm hover:[animation-duration:_4s]">
            <div class="rounded-[10px] bg-white p-4 !pt-20 sm:p-6">
              <time datetime="2022-10-10" class="block text-xs text-gray-500">
                {" "}
                10th Oct 2022{" "}
              </time>

              <a href="#">
                <h3 class="mt-0.5 text-lg font-medium text-gray-900">
                  How to center an element using JavaScript and jQuery
                </h3>
              </a>

              <div class="mt-4 flex flex-wrap gap-1">
                <span class="whitespace-nowrap rounded-full bg-purple-100 px-2.5 py-0.5 text-xs text-purple-600">
                  Snippet
                </span>

                <span class="whitespace-nowrap rounded-full bg-purple-100 px-2.5 py-0.5 text-xs text-purple-600">
                  JavaScript
                </span>
              </div>
            </div>
          </article>
          <article class="hover:animate-background rounded-xl bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 p-0.5 shadow-xl transition hover:bg-[length:400%_400%] hover:shadow-sm hover:[animation-duration:_4s]">
            <div class="rounded-[10px] bg-white p-4 !pt-20 sm:p-6">
              <time datetime="2022-10-10" class="block text-xs text-gray-500">
                {" "}
                10th Oct 2022{" "}
              </time>

              <a href="#">
                <h3 class="mt-0.5 text-lg font-medium text-gray-900">
                  How to center an element using JavaScript and jQuery
                </h3>
              </a>

              <div class="mt-4 flex flex-wrap gap-1">
                <span class="whitespace-nowrap rounded-full bg-purple-100 px-2.5 py-0.5 text-xs text-purple-600">
                  Snippet
                </span>

                <span class="whitespace-nowrap rounded-full bg-purple-100 px-2.5 py-0.5 text-xs text-purple-600">
                  JavaScript
                </span>
              </div>
            </div>
          </article>
        </div>
      </main>

      {showCreateClassModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <form onSubmit={handleCreateClassFormSubmit}>
              <div className="form-group">
                <label htmlFor="classCode">Class Code</label>
                <input type="text" id="classCode" name="classCode" required />
              </div>
              <div className="form-group">
                <label htmlFor="className">Class Name</label>
                <input type="text" id="className" name="className" required />
              </div>
              <div className="form-group">
                <label htmlFor="startTime">Start Time</label>
                <input type="time" id="startTime" name="startTime" required />
              </div>
              <div className="form-group">
                <label>Days of the Week</label>
                <div>
                  {["Mon", "Tues", "Wed", "Thurs", "Fri"].map((day) => (
                    <label
                      key={day}
                      htmlFor={day}
                      className={`day-label ${
                        selectedDays.includes(day) ? "selected" : ""
                      }`}
                    >
                      {day}
                      <input
                        type="checkbox"
                        id={day}
                        name="classDays"
                        value={day}
                        checked={selectedDays.includes(day)}
                        onChange={() => handleDayChange(day)}
                        style={{ display: "none" }}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="endTime">End Time</label>
                <input type="time" id="endTime" name="endTime" required />
              </div>
              <button type="submit" className="button-primary">
                Create Class
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherPage;
