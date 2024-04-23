import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";

function UpcomingAssignments() {
  const [username, setUsername] = useState("");
  const userId = useSelector((state) => state.auth.userId);
  const userRole = useSelector((state) => state.auth.role);
  const navigate = useNavigate();
  const { state } = useLocation(); // Retrieve state passed from previous component
  const assignments = state?.assignments || []; // Default to an empty array if no assignments were passed

  const db = getFirestore();

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

    console.log(assignments);
  }, [db, userId, userRole]);

  // Function to convert Firestore timestamp to JavaScript Date object
  const convertFirestoreTimestampToDate = (timestamp) => {
    return new Date(timestamp.seconds * 1000); // Convert seconds to milliseconds
  };

  const handleAssignmentClick = (assignment) => {
    navigate("/assignment", { state: { assignment } });
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
                className="block rounded-lg px-5 py-3  bg-black text-white hover:bg-orange-500 hover:text-white transition duration-300"
                type="button"
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      </header>
      <main
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <fieldset className="space-y-4 w-full max-w-md">
          <legend className="sr-only">Assignments</legend>
          {assignments.map((assignment, index) => (
            <div
              key={index}
              className="flex cursor-pointer h-16 items-center justify-between gap-4 rounded-lg  bg-white p-4 text-sm font-medium shadow-sm hover:bg-orange-500 hover:text-white"
              onClick={() => handleAssignmentClick(assignment)}
            >
              <p>{assignment.assignmentName}</p>
              <p>
                {convertFirestoreTimestampToDate(
                  assignment.endTime
                ).toLocaleDateString()}
              </p>
            </div>
          ))}
        </fieldset>
      </main>
    </div>
  );
}

export default UpcomingAssignments;
