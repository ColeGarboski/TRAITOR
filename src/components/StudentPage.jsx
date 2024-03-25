import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getFirestore, collection, query, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "/src/ClassTeacherPage.css";

function StudentPage() {
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const navigate = useNavigate();
  const studentId = useSelector((state) => state.auth.userId); // Assume Redux store has this info
  const db = getFirestore();

  useEffect(() => {
    const fetchClasses = async () => {
      const classesRef = collection(db, `Users/${studentId}/Classes`);
      const querySnapshot = await getDocs(classesRef);
      const fetchedClassesPromises = querySnapshot.docs.map(async (doc) => {
        const classData = { id: doc.id, ...doc.data() };
        const teacherRef = doc(db, `Users/${classData.teacherId}`);
        const teacherSnap = await getDocs(teacherRef);
        if (teacherSnap.exists()) {
          classData.teacherName = teacherSnap.data().username; // Fetching teacher's username
        } else {
          classData.teacherName = "Unknown"; // Fallback if teacher not found
        }
        return classData;
      });

      const fetchedClasses = await Promise.all(fetchedClassesPromises);
      setClasses(fetchedClasses);
      fetchUpcomingAssignments(fetchedClasses);
    };

    fetchClasses();
  }, [studentId, db]);

  const fetchUpcomingAssignments = async (fetchedClasses) => {
    const allAssignments = [];
    for (let classInfo of fetchedClasses) {
      const teacherId = classInfo.teacherId; // Assuming each classData has a teacherId field
      const assignmentsRef = collection(
        db,
        `Users/${teacherId}/Classes/${classInfo.id}/Assignments`
      );
      const querySnapshot = await getDocs(assignmentsRef);
      querySnapshot.forEach((doc) => {
        const assignmentData = {
          id: doc.id,
          ...doc.data(),
          classCode: classInfo.classCode,
        };
        allAssignments.push(assignmentData);
      });
    }
    setAssignments(allAssignments);
  };

  const handleClassCardClick = (classData) => {
    navigate('/class', { state: { classData } });
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
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div className="grid">
          {classes.map((classItem, i) => (
            <div key={i} className="div-block" onClick={() => handleClassCardClick(classItem)}>
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
