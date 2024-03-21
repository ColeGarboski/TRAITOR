import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getFirestore, collection, query, getDocs } from 'firebase/firestore';
import '/src/ClassTeacherPage.css';

function StudentPage() {
    const [classes, setClasses] = useState([]);

    const studentId = useSelector((state) => state.auth.userId); // Assume Redux store has this info

    useEffect(() => {
        const fetchClasses = async () => {
            const db = getFirestore();
            const classesRef = collection(db, `Users/${studentId}/Classes`);
            const querySnapshot = await getDocs(classesRef);
            const fetchedClasses = [];
            querySnapshot.forEach((doc) => {
                // Assuming the document structure matches your description
                const classData = { id: doc.id, ...doc.data() };
                fetchedClasses.push(classData);
            });
            setClasses(fetchedClasses);
        };

        fetchClasses();
    }, [studentId]);

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
                        <div key={i} className="div-block">
                            <div className="div-block-2">
                                <img src="/src/assets/classy.jpg" loading="lazy" alt="" className="image"/>
                            </div>
                            <div className="text-block-4">{classItem.classCode}</div>
                            <div className="div-block-3">
                                <div className="text-block-5">{classItem.className}</div>
                                <div className="text-block-6">{`${classItem.startTime} - ${classItem.endTime}`}</div>
                                <div className="text-block-7">{`Days: ${classItem.days.join(', ')}`}</div>
                                {/* Optionally display teacher name if you fetch it */}
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
