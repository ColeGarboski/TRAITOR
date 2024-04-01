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
      <header className="navbar-logo-left">
        <div className="navbar-logo-left-container shadow-three">
          <div className="container">
            <div className="navbar-wrapper">
              <a href="#" className="navbar-brand">
                <div className="text-block">
                  TR<em>AI</em>TOR
                </div>
              </a>
              <nav className="nav-menu-wrapper">
                <ul className="nav-menu-two">
                  <li>
                    <a href="#" className="nav-link">
                      Classes
                    </a>
                  </li>
                  <li>
                    <a href="#" className="nav-link">
                      Upcoming Assignments
                    </a>
                  </li>
                  <li>
                    <a href="#" className="nav-link">
                      Previous Scores
                    </a>
                  </li>
                </ul>
              </nav>
              <div className="menu-button">
                <div className="w-icon-nav-menu"></div>
                <button
                  onClick={() => setShowJoinClassModal(true)}
                  className="button-primary"
                >
                  Join a Class
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div className="grid">
          {classes.map((classItem, i) => (
            <div
              key={i}
              className="div-block"
              onClick={() => handleClassCardClick(classItem)}
            >
              <div className="div-block-2">
                <img
                  src="/src/assets/classy.jpg"
                  loading="lazy"
                  alt=""
                  className="image"
                />
              </div>
              <div className="text-block-4">{classItem.classCode}</div>
              <div className="div-block-3">
                <div className="text-block-5">{classItem.className}</div>
                <div className="text-block-6">{`${classItem.startTime} - ${classItem.endTime}`}</div>
                <div className="text-block-7">{`Days: ${classItem.days.join(
                  ", "
                )}`}</div>
                <div className="text-block-8">{`Teacher: ${classItem.teacherName}`}</div>
              </div>
            </div>
          ))}
        </div>
      </main>

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
        crossorigin="anonymous"
      ></script>
      <script src="js/webflow.js" type="text/javascript"></script>
    </div>
  );
}

export default StudentPage;
