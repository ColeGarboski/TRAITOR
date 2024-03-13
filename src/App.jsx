import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '/src/store';
import LandingPage from '/src/components/LandingPage';
import HomePage from '/src/components/HomePage';
import ResultsPage from '/src/components/ResultsPage';
import SignupPage from '/src/components/SignupPage';
<<<<<<< Updated upstream
import TeacherPage from '/src/components/TeacherPage';
import StudentPage from '/src/components/StudentPage';
=======
import ClassTeacherPage from "./components/ClassTeacherPage.jsx";
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
                        <Route path="/teacher" element={<TeacherPage />}></Route>
                        <Route path="/student" element={<StudentPage />}></Route>
=======
                        <Route path="/class" element={<ClassTeacherPage />}></Route>
>>>>>>> Stashed changes
                    </Routes>
                </div>
            </Router>
        </Provider>
    );
}

export default App;
