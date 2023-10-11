import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from '/src/components/HomePage';
import ResultsPage from '/src/components/ResultsPage';
import './App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <nav>
                    <ul>
                        <li>
                            <Link to="/">Home</Link>
                        </li>
                        <li>
                            <Link to="/results">Results Page</Link>
                        </li>
                    </ul>
                </nav>

                <Routes>
                    <Route path="/" element={<HomePage />}></Route>
                    <Route path="/results" element={<ResultsPage />}></Route>
                </Routes>
            </div>
        </Router>
    );
}

export default App;
