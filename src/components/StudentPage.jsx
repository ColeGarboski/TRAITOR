import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import useRoleRedirect from '../hooks/useRoleRedirect';

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
        <div>
            {/* Your HTML and design go here */}
            <h1>Student Page</h1>
            {/* Example of displaying data */}
            {data.map((item, index) => (
                <div key={index}>{item.name}</div> // Assuming items have a 'name' field
            ))}
        </div>
    );
}

export default StudentPage;
