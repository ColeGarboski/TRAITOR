import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

// Adjusted custom hook for redirecting based on user role
const useRoleRedirect = (expectedRole) => {
    const navigate = useNavigate();
    // Use the specific selector for user role according to your Redux setup
    const userRole = useSelector((state) => state.auth.role); // Adjusted to match your authSlice

    useEffect(() => {
        if (userRole && userRole !== expectedRole) {
            // Redirect to the correct route based on the user role
            const redirectTo = userRole === 'teacher' ? '/teacher' : '/student';
            navigate(redirectTo);
        }
    }, [userRole, navigate, expectedRole]);
};

export default useRoleRedirect;
