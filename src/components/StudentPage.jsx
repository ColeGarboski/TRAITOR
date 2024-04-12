import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  getFirestore,
  collection,
  query,
  getDocs,
  getDoc,
  where,
  doc,
  setDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import useRoleRedirect from "../hooks/useRoleRedirect";
import "/src/ClassTeacherPage.css";

function StudentPage() {
  useRoleRedirect("student");

  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [showJoinClassModal, setShowJoinClassModal] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [username, setUsername] = useState("");

  const navigate = useNavigate();
  const studentId = useSelector((state) => state.auth.userId); // Assume Redux store has this info
  const db = getFirestore();

  useEffect(() => {
    const fetchClasses = async () => {
      const studentClassesRef = collection(db, `Students/${studentId}/Classes`);
      const querySnapshot = await getDocs(studentClassesRef);
      const fetchedClassesPromises = querySnapshot.docs.map(async (docRef) => {
        const classRef = doc(db, `Classes/${docRef.id}`);
        const classSnap = await getDoc(classRef);
        if (classSnap.exists()) {
          return { id: classSnap.id, ...classSnap.data() };
        }
        return null;
      });

      const fetchedClasses = (await Promise.all(fetchedClassesPromises)).filter(
        Boolean
      );
      setClasses(fetchedClasses);
      fetchUpcomingAssignments(fetchedClasses);
    };

    fetchClasses();
  }, [studentId, db]);

  useEffect(() => {
    const fetchUsername = async () => {
      const studentRef = doc(db, `Students/${studentId}`);
      const docSnap = await getDoc(studentRef);

      if (docSnap.exists()) {
        setUsername(docSnap.data().username);
      } else {
        console.log("No such document!");
      }
    };

    fetchUsername();
  }, [db, studentId]); // Dependency array to avoid unnecessary re-renders

  const handleJoinClass = async () => {
    const classesRef = collection(db, "Classes");
    const q = query(classesRef, where("joinCode", "==", joinCode));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const classDoc = querySnapshot.docs[0]; // Assuming join codes are unique, there should only be one match.

      // Retrieve student's data
      const studentRef = doc(db, `Students/${studentId}`);
      const studentSnap = await getDoc(studentRef);

      if (!studentSnap.exists()) {
        alert("Student data not found.");
        return;
      }

      const { username, email } = studentSnap.data();

      // Add class to student
      const studentClassRef = doc(
        db,
        `Students/${studentId}/Classes`,
        classDoc.id
      );
      await setDoc(studentClassRef, { joinCode });

      // Add student to class with required data
      const classStudentRef = doc(
        db,
        `Classes/${classDoc.id}/Students`,
        studentId
      );
      await setDoc(classStudentRef, { studentId, username, email }); // Now storing additional student info

      alert("Successfully joined the class!");
    } else {
      alert("Invalid join code. Please try again.");
    }
  };

  const fetchUpcomingAssignments = async (fetchedClasses) => {
    const allAssignments = [];
    for (let classInfo of fetchedClasses) {
      const assignmentsRef = collection(
        db,
        `Classes/${classInfo.id}/Assignments`
      );
      const querySnapshot = await getDocs(assignmentsRef);
      querySnapshot.forEach((doc) => {
        allAssignments.push({
          id: doc.id,
          ...doc.data(),
          classCode: classInfo.classCode,
        });
      });
    }
    setAssignments(allAssignments);
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
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-5 py-3 text-white transition hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring"
                type="button"
              >
                <span className="text-sm font-medium"> Assignments </span>

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
                className="block rounded-lg px-5 py-3 w-full bg-black text-white hover:bg-white/30 hover:text-white transition duration-300"
                type="button"
                onClick={() => setShowJoinClassModal(true)}
              >
                Join Class
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
              <div className="rounded-[10px] bg-white p-4 sm:p-6 h-60 w-60 flex flex-col justify-center">
                <time
                  dateTime="2022-10-10"
                  className="block text-xs text-gray-500"
                >
                  {classItem.semester}
                </time>

                <a href="#">
                  <h3 className="mt-0.5 text-lg font-medium text-gray-900">
                    {`${classItem.classCode} - ${classItem.className}`}{" "}
                    {/* Updated this line */}
                  </h3>
                </a>
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

      <footer className="">
        <div className="mx-auto my-32 max-w-screen-xl">
          <p className="mt-4 text-center text-sm text-gray-500 lg:mt-0 lg:text-center">
            Traitor &copy; 2023. All rights reserved.
          </p>
        </div>
      </footer>

      {showJoinClassModal && (
        <div className="modal">
          <div className="modal-content">
            <span
              className="close"
              onClick={() => setShowJoinClassModal(false)}
            >
              &times;
            </span>
            <h2>Join Class</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleJoinClass();
              }}
            >
              <div className="form-group">
                <label htmlFor="joinCode">Class Join Code:</label>
                <input
                  type="text"
                  id="joinCode"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="button-primary">
                Join
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Scripts */}
      <script
        src="https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=65e0ee506245ceae86864652"
        type="text/javascript"
        integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0="
        crossOrigin="anonymous"
      ></script>
      <script src="js/webflow.js" type="text/javascript"></script>
    </div>
  );
}

export default StudentPage;
