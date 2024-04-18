import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import logo from "/src/assets/logo.png";
import thinking from "/src/assets/thinking.svg";
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

function Results() {
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
  }, [db, userId]);

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
      <main className="flex flex-col items-center">
        <h1 className="text-2xl font-bold text-white sm:text-3xl pb-5">
          Assignment Name
        </h1>
        <article class="rounded-xl border-2 border-gray-100 bg-white overflow-y-auto max-w-4xl mx-auto">
          <div class="flex items-start gap-4 p-4 sm:p-6 lg:p-8">
            <a href="#" class="block shrink-0">
              <img
                alt="Thinking icon"
                src={thinking}
                class="h-14 w-14 rounded-lg object-cover"
              />
            </a>

            <div class="flex-1 min-w-0">
              <h3 class="font-medium sm:text-lg">
                <p>Does ChatGPT think the submission is AI-generated?</p>
              </h3>

              <p class="text-sm text-gray-700">
                Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                Accusamus, accusantium temporibus iure delectus ut totam natus
                nesciunt ex? Ducimus, enim.
              </p>
            </div>
          </div>

          <div class="flex justify-end">
            <strong class="-mb-[2px] -me-[2px] inline-flex items-center gap-1 rounded-ee-xl rounded-ss-xl bg-green-600 px-3 py-1.5 text-white">
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
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>

              <span class="text-[10px] font-medium sm:text-xs">Passed!</span>
            </strong>
          </div>
        </article>
      </main>
      )
    </div>
  );
}

export default Results;
