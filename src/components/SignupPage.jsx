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
    <div className="flex justify-center items-center h-screen">
      <div className="max-w-2xl mx-auto px-6 py-10 bg-white/30 shadow-lg rounded-xl w-1/3 backdrop-blur-lg border border-gray-200/50">
        <div className="text-center mb-10">
          <img
            src={logo}
            alt="Logo"
            className="mx-auto mb-4 h-40 w-40 object-cover"
          />
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            {isActive ? "Sign Up" : "Sign In"}
          </h1>
          <p className="text-white">
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
            <>
              <div className="flex justify-center items-center mb-4">
                {/* Role Selector */}
              </div>
              <label
                htmlFor="UserName"
                className="block overflow-hidden rounded-md px-3 py-2 shadow-sm bg-white/20"
              >
                <span className="text-xs font-medium text-gray-800">
                  {" "}
                  Name{" "}
                </span>
                <input
                  type="text"
                  id="UserName"
                  placeholder="John Doe"
                  className="mt-1 w-full border-none p-0 bg-transparent focus:border-transparent focus:outline-none focus:ring-0 sm:text-sm placeholder-gray-600"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
            </>
          )}
          {/* Email Input */}
          <label
            htmlFor="UserEmail"
            className="block overflow-hidden rounded-md px-3 py-2 shadow-sm bg-white/20"
          >
            <span className="text-xs font-medium text-gray-800"> Email </span>
            <input
              type="email"
              id="UserEmail"
              placeholder="example@email.com"
              className="mt-1 w-full border-none p-0 bg-transparent focus:border-transparent focus:outline-none focus:ring-0 sm:text-sm placeholder-gray-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          {/* Password Input */}
          <label
            htmlFor="UserPassword"
            className="block overflow-hidden rounded-md px-3 py-2 shadow-sm bg-white/20"
          >
            <span className="text-xs font-medium text-gray-800">
              {" "}
              Password{" "}
            </span>
            <input
              type="password"
              id="UserPassword"
              placeholder="••••••••"
              className="mt-1 w-full border-none p-0 bg-transparent focus:border-transparent focus:outline-none focus:ring-0 sm:text-sm placeholder-gray-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r bg-white/30 text-black rounded-lg hover:bg-black transition duration-300 hover:text-white"
          >
            {isActive ? "Create Account" : "Login"}
          </button>
        </form>

        <div className="text-center mt-8">
          <button
            onClick={handleToggle}
            className="text-white hover:underline hover:text-black"
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
