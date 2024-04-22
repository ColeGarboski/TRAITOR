import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import logo from "/src/assets/logo.png";
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
  const [topics, setTopics] = useState("");
  const [semester, setSemester] = useState("");
  const [username, setUsername] = useState("");

  const navigate = useNavigate();
  const userId = useSelector((state) => state.auth.userId);
  const userRole = useSelector((state) => state.auth.role);
  const db = getFirestore();

  const fetchData = async () => {
    const teacherClassesRef = collection(db, `Teachers/${userId}/Classes`);
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
    const fetchUsername = async () => {
      const userRef = doc(
        db,
        `${userRole === "teacher" ? "Teachers" : "Students"}/${userId}`
      );
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        setUsername(docSnap.data().username);
      } else {
        console.log("No such document!");
      }
    };

    fetchUsername();
  }, [db, userId]); // Dependency array to avoid unnecessary re-renders

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
  }, [userId, db]); // Dependency array ensures fetchData is called when these values change

  const closeModal = () => {
    setShowCreateClassModal(false);
    setShowCreateAssignmentModal(false);
    setShowAddStudentModal(false);
    setSelectedDays([]);
    setTopics("");
    setSemester("");
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
        userId,
      };

      // Add the new class to the 'Classes' collection
      const classRef = doc(collection(db, "Classes"));
      await setDoc(classRef, newClassData);

      // Update the teacher's 'Classes' subcollection with the new class ID
      const teacherClassesRef = doc(
        db,
        `Teachers/${userId}/Classes`,
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
      topics: topics.split(",").map((topic) => topic.trim()),
      semester: semester,
    };
    createClass(classData);

    setTopics("");
    setSemester("");
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

  const handleAssignmentsButtonClick = () => {
    navigate("/assignments", { state: { assignments } });
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
                className="block rounded-lg px-5 py-3 w-full bg-black text-white hover:bg-orange-500 hover:text-white transition duration-300"
                type="button"
                onClick={() => setShowCreateClassModal(true)}
              >
                Create Class
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div>
          <div className="wave"></div>
          <div className="wave"></div>
          <div className="wave"></div>
        </div>
        <div className="grid">
          {classes.map((classItem) => (
            <article
              key={classItem.id}
              className="hover:animate-background rounded-xl bg-gradient-to-r from-green-300 via-blue-500 to-purple-600 p-0.5 shadow-xl transition hover:bg-[length:400%_400%] hover:shadow-sm hover:[animation-duration:_4s]"
              onClick={() => handleClassCardClick(classItem)}
            >
              <div className="rounded-[10px] bg-white p-4 sm:p-6 h-60 flex flex-col w-60 justify-center">
                <time
                  dateTime="2022-10-10"
                  className="block text-xs text-gray-500"
                >
                  {classItem.semester}
                </time>

                <h3 className="mt-0.5 text-lg font-medium text-gray-900">
                  {`${classItem.classCode} - ${classItem.className}`}{" "}
                </h3>
                <div className="mt-4 flex flex-wrap gap-1 top-4">
                  {classItem.topics.map((topic) => (
                    <span
                      key={topic}
                      className="whitespace-nowrap rounded-full bg-purple-100 px-2.5 py-0.5 text-xs text-purple-600"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      <footer>
        <div className="mx-auto max-w-screen-xl pt-52">
          <p className="text-center text-sm text-gray-500 lg:mt-0 lg:text-center">
            Traitor &copy; 2023. All rights reserved.
          </p>
        </div>
      </footer>

      {showCreateClassModal && (
        <div className="modal">
          <div className="max-w-2xl mx-auto px-6 py-10 bg-white/30 shadow-lg rounded-xl w-1/3 backdrop-blur-lg border border-gray-200/50">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <form onSubmit={handleCreateClassFormSubmit}>
              <div className="form-group">
                <label htmlFor="classCode" class=" font-medium text-gray-800">
                  Class Code
                </label>
                <input
                  type="text"
                  class="block overflow-hidden rounded-md px-3 py-2 shadow-sm bg-white/20"
                  id="classCode"
                  name="classCode"
                  required
                />
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
                <label htmlFor="semester">Semester</label>
                <input
                  type="text"
                  id="semester"
                  name="semester"
                  required
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="topics">Topics (comma-separated)</label>
                <input
                  type="text"
                  id="topics"
                  name="topics"
                  required
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
                />
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
              <button
                type="submit"
                class="block rounded-lg px-5 py-3 w-full bg-black text-white hover:bg-orange-500 hover:text-white transition duration-300"
              >
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
