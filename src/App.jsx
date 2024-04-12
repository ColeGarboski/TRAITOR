import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "/src/store";
import LandingPage from "/src/components/LandingPage";
import HomePage from "/src/components/HomePage";
import ResultsPage from "/src/components/ResultsPage";
import SignupPage from "/src/components/SignupPage";
import TeacherPage from "./components/TeacherPage.jsx";
import StudentPage from "./components/StudentPage.jsx";
import Class from "./components/Class.jsx";
import UpcommingAssignments from "./components/UpcommingAssignments.jsx";
import Assignment from "./components/Assignment.jsx";

//import './App.css';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div>
          <Routes>
            <Route path="/" element={<LandingPage />}></Route>
            <Route path="/home" element={<HomePage />}></Route>
            <Route path="/results" element={<ResultsPage />}></Route>
            <Route path="/signup" element={<SignupPage />}></Route>
            <Route path="/teacher" element={<TeacherPage />}></Route>
            <Route path="/student" element={<StudentPage />}></Route>
            <Route path="/class" element={<Class />}></Route>
            <Route
              path="/assignments"
              element={<UpcommingAssignments />}
            ></Route>
            <Route path="/assignment" element={<Assignment />}></Route>
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
