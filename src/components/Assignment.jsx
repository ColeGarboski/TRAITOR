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

function Assignment() {
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
              <button class="relative flex h-[50px] w-40 items-center rounded-lg justify-center overflow-hidden bg-gray-800 text-white shadow-2xl transition-all before:absolute before:h-0 before:w-0 before:rounded-full before:bg-orange-600 before:duration-500 before:ease-out hover:before:h-56 hover:before:w-56">
                <span class="relative z-10">Go back</span>
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

        <a
          href="#"
          class=" h-96 w-1/2 relative block overflow-hidden rounded-lg border bg-white border-gray-100 p-4 sm:p-6 lg:p-8"
        >
          <span class="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-green-300 via-blue-500 to-purple-600"></span>

          <div class="sm:flex sm:justify-between sm:gap-4">
            <div>
              <h3 class="text-lg font-bold text-gray-900 sm:text-xl">
                Microkernal Presentation
              </h3>

              <p class="mt-1 text-xs font-medium text-gray-600">Dastan Banae</p>
            </div>
          </div>

          <div class="mt-4 w-full">
            <p
              class="text-pretty text-sm text-gray-500"
              style={{ maxHeight: "100px", overflowY: "auto" }}
            >
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. At velit
              illum provident a, ipsa maiores deleniti consectetur nobis et
              eaque. Lorem ipsum dolor sit, amet consectetur adipisicing elit.
              At velit illum provident a, ipsa maiores deleniti consectetur
              nobis et eaque. Lorem ipsum dolor sit, amet consectetur
              adipisicing elit. At velit illum provident a, ipsa maiores
              deleniti consectetur nobis et eaque. Lorem ipsum dolor sit, amet
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-4 justify-center  algsm:mt-0 sm:flex-row sm:items-center pt-14">
            <button class="relative flex h-[50px] w-40 items-center rounded-lg justify-center overflow-hidden bg-gray-800 text-white shadow-2xl transition-all before:absolute before:h-0 before:w-0 before:rounded-full before:bg-purple-600 before:duration-500 before:ease-out hover:before:h-56 hover:before:w-56">
              <span class="relative z-10">Submit</span>
            </button>
          </div>

          <dl class="mt-6 flex gap-4 justify-center sm:gap-6">
            <div class="flex flex-col-reverse">
              <dt class="text-sm font-medium text-gray-600">April 6</dt>
              <dd class="text-xs text-gray-500">Posted</dd>
            </div>

            <div class="flex flex-col-reverse">
              <dt class="text-sm font-medium text-gray-600">April 12</dt>
              <dd class="text-xs text-gray-500">Due</dd>
            </div>
          </dl>
        </a>
      </main>
      )
    </div>
  );
}

export default Assignment;
