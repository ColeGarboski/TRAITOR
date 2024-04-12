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

function UpcommingAssignments() {
  const [username, setUsername] = useState("");
  const userId = useSelector((state) => state.auth.userId);
  const userRole = useSelector((state) => state.auth.role);

  const navigate = useNavigate();
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
        <fieldset class="space-y-4">
          <legend class="sr-only">Delivery</legend>
          <div>
            <label
              for="DeliveryStandard"
              class="flex cursor-pointer items-center w-96 h-20 justify-between gap-4 rounded-lg border border-gray-100 bg-white p-4 text-sm font-medium shadow-sm hover:border-gray-200"
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
    </div>
  );
}

export default UpcommingAssignments;
