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
  const userId = useSelector((state) => state.auth.userId);
  const userRole = useSelector((state) => state.auth.role);
  const db = getFirestore();

  useEffect(() => {
    const fetchUsername = async () => {
      const userRef = doc(db, `${userRole === "teacher" ? "Teachers" : "Students"}/${userId}`);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        setUsername(docSnap.data().username);
      } else {
        console.log("No such document!");
      }
    };

    fetchUsername();
  }, [db, userId]); // Dependency array to avoid unnecessary re-renders

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
