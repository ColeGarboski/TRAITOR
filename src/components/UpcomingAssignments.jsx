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
        <>
            <div className="navbar-logo-left">
                <div data-animation="default" data-collapse="medium" data-duration="400" data-easing="ease" data-easing2="ease" role="banner" className="navbar-logo-left-container shadow-three w-nav">
                    <div className="container">
                        <div className="navbar-wrapper">
                            <a href="#" className="navbar-brand w-nav-brand">
                                <div className="text-block">TR<em>AI</em>TOR</div>
                            </a>
                            <nav role="navigation" className="nav-menu-wrapper w-nav-menu">
                                <ul role="list" className="nav-menu-two w-list-unstyled">
                                    <li><a href="#" className="nav-link">Classes</a></li>
                                    <li><a href="#" className="nav-link">Upcoming Assignments</a></li>
                                    <li><a href="#" className="nav-link">Previous Scores</a></li>
                                </ul>
                            </nav>
                            <div className="menu-button w-nav-button"><div className="w-icon-nav-menu"></div></div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="div-block-4">
                <div className="text-block-7">CS-301</div>
                <div className="div-block-5">
                    <div className="w-layout-grid grid-2">
                        {Array(5).fill().map((_, index) => (
                            <div key={index} className="div-block-6">
                                <div className="text-block-8">Feb 01<br/>11:59 PM</div>
                                <div className="text-block-9">Project Proposal</div>
                                <div className="text-block-10">-----------------------------------------------------------------</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

export default StudentPage;
