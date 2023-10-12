import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '/src/store';
import HomePage from '/src/components/HomePage';
import ResultsPage from '/src/components/ResultsPage';
//import './App.css';

function App() {
    return (
        <Provider store={store}>
            <Router>
                <div>
                    <Routes>
                        <Route path="/" element={<HomePage />}></Route>
                        <Route path="/results" element={<ResultsPage />}></Route>
                    </Routes>
                </div>
            </Router>
        </Provider>
    );
}

export default App;
