import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserId, setUserRole } from "/src/userSlice";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import logo from "/src/assets/logo.png";

function SignupPage() {
  const [isActive, setIsActive] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isTeacher, setIsTeacher] = useState(false); // Default to student
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = getAuth();

  const handleToggle = () => {
    setIsActive(!isActive);
    setErrorMessage("");
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      dispatch(setUserId(userCredential.user.uid));
      dispatch(setUserRole(isTeacher ? "teacher" : "student"));

      const db = getFirestore();

      const collectionName = isTeacher ? "Teachers" : "Students";
      const userRef = doc(db, collectionName, userCredential.user.uid);

      const userData = {
        userId: userCredential.user.uid,
        username: name,
        email: email,
        role: isTeacher ? "teacher" : "student",
      };

      await setDoc(userRef, userData);
      console.log(
        `${
          isTeacher ? "Teacher" : "Student"
        } account created and added to Firestore`
      );

      // Redirect based on the role
      if (isTeacher) {
        navigate("/teacher"); // Route to TeacherPage
      } else {
        navigate("/student"); // Route to StudentPage
      }
    } catch (error) {
      console.error("Error signing up:", error);
      setErrorMessage(error.message); // Set the error message from Firebase
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      dispatch(setUserId(userCredential.user.uid));
      console.log("Signed in:", userCredential.user);

      // Attempt to fetch user role from Firestore
      const db = getFirestore();
      let userRole = "";
      const teacherRef = doc(db, "Teachers", userCredential.user.uid);
      const studentRef = doc(db, "Students", userCredential.user.uid);

      const teacherSnap = await getDoc(teacherRef);
      if (teacherSnap.exists()) {
        userRole = "teacher";
      } else {
        const studentSnap = await getDoc(studentRef);
        if (studentSnap.exists()) {
          userRole = "student";
        }
      }

      if (!userRole) {
        console.error("User role not found.");
        setErrorMessage(
          "Your account role could not be verified. Please contact support."
        );
        return;
      }

      // Dispatch user role and navigate accordingly
      dispatch(setUserRole(userRole));
      navigate(userRole === "teacher" ? "/teacher" : "/student");
    } catch (error) {
      console.error("Error signing in:", error);
      setErrorMessage(error.message); // Set the error message from Firebase
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-400 to-purple-500">
      <div className="max-w-md mx-auto px-6 py-10 bg-white shadow-lg rounded-xl">
        <div className="text-center mb-10">
          <img
            src={logo}
            alt="Logo"
            className="mx-auto mb-4 h-40 w-40 object-cover"
          />
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            {isActive ? "Sign Up" : "Sign In"}
          </h1>
          <p className="text-gray-600">
            {isActive
              ? "Join our community today."
              : "Welcome back, please sign in."}
          </p>
          {errorMessage && (
            <div className="text-red-500 text-sm">{errorMessage}</div>
          )}
        </div>

        <form
          className="space-y-6"
          onSubmit={isActive ? handleSignUp : handleSignIn}
        >
          {isActive && (
            <div className="flex justify-center items-center mb-4">
              <label className="text-gray-700 text-sm font-bold mr-2">
                I am a:
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={!isTeacher}
                    onChange={() => setIsTeacher(false)}
                    className="form-radio h-5 w-5 text-purple-600 border-gray-300 focus:ring-purple-500"
                  />
                  Student
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="teacher"
                    checked={isTeacher}
                    onChange={() => setIsTeacher(true)}
                    className="form-radio h-5 w-5 text-purple-600 border-gray-300 focus:ring-purple-500"
                  />
                  Teacher
                </label>
              </div>
            </div>
          )}
          <input
            type="text"
            placeholder="Name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-lg hover:bg-blue-700 transition duration-300"
          >
            {isActive ? "Create Account" : "Login"}
          </button>
        </form>

        <div className="text-center mt-8">
          <button
            onClick={handleToggle}
            className="text-purple-600 hover:underline"
          >
            {isActive
              ? "Already have an account? Log in"
              : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
