import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import useRoleRedirect from '../hooks/useRoleRedirect';
import '/src/ClassTeacherPage.css';

function StudentPage() {
    useRoleRedirect('student'); // Redirect if not a student

    const [data, setData] = useState([]); // Placeholder for your data

    useEffect(() => {
        const fetchData = async () => {
            const db = getFirestore();
            // Example: fetching some data from Firestore
            const q = query(collection(db, "someCollection"), where("role", "==", "teacher"));
            const querySnapshot = await getDocs(q);
            const items = [];
            querySnapshot.forEach((doc) => {
                items.push(doc.data());
            });
            setData(items);
        };

        fetchData();
    }, []);

    // Placeholder for your JS functions
    const yourFunction = () => {
        // Function logic here
    };

    return (
        <div className="App">
            <header className="navbar-logo-left">
                <div className="navbar-logo-left-container shadow-three">
                    <div className="container">
                        <div className="navbar-wrapper">
                            <a href="#" className="navbar-brand">
                                <div className="text-block">TR<em>AI</em>TOR</div>
                            </a>
                            <nav className="nav-menu-wrapper">
                                <ul className="nav-menu-two">
                                    <li>
                                        <a href="#" className="nav-link">Classes</a>
                                    </li>
                                    <li>
                                        <a href="#" className="nav-link">Upcoming Assignments</a>
                                    </li>
                                    <li>
                                        <a href="#" className="nav-link">Previous Scores</a>
                                    </li>
                                    <li>
                                        <div className="nav-divider"></div>
                                    </li>
                                    <li className="mobile-margin-top-10">
                                        <a href="#" className="button-primary">Create class</a>
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
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="div-block">
                            <div className="div-block-2">
                                <img src="/src/assets/classy.jpg" loading="lazy" alt="" className="image"/>
                            </div>
                            <div className="text-block-4">CS-301</div>
                            <div className="div-block-3">
                                <div className="text-block-5">Rasel Dazel</div>
                                <div className="text-block-6">2:00pm-3:15pm</div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Scripts */}
            <script src="https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=65e0ee506245ceae86864652" type="text/javascript" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossorigin="anonymous"></script>
            <script src="js/webflow.js" type="text/javascript"></script>
        </div>
    );
}

export default StudentPage;
