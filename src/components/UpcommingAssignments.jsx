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

function UpcommingAssignments() {
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
    const fetchUsername = async () => {
      const teacherRef = doc(db, `Teachers/${teacherId}`);
      const docSnap = await getDoc(teacherRef);

      if (docSnap.exists()) {
        setUsername(docSnap.data().username);
      } else {
        console.log("No such document!");
      }
    };

    fetchUsername();
  }, [db, teacherId]); // Dependency array to avoid unnecessary re-renders

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
        <div>
          <div className="wave"></div>
          <div className="wave"></div>
          <div className="wave"></div>
        </div>
        <fieldset class="space-y-4 ">
          <legend class="sr-only">Delivery</legend>

          <div>
            <label
              for="DeliveryStandard"
              class="flex cursor-pointer items-center w-96 h-20 justify-between gap-4 rounded-lg border border-gray-100 bg-white p-4 text-sm font-medium shadow-sm hover:border-gray-200 "
            >
              <p class="text-gray-700">Microkernal Presentation</p>

              <p class="text-gray-900">April 12</p>

              <input
                type="radio"
                name="DeliveryOption"
                value="DeliveryStandard"
                id="DeliveryStandard"
                class="sr-only"
                checked
              />
            </label>
          </div>
        </fieldset>
      </main>
      )
    </div>
  );
}

export default UpcommingAssignments;
