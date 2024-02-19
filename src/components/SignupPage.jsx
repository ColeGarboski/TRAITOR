import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUserId } from '/src/userSlice';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import logo from '/src/assets/logo.png';

function SignupPage() {
    const [isActive, setIsActive] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const dispatch = useDispatch();
    const auth = getAuth();

    const handleToggle = () => {
        setIsActive(!isActive);
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            dispatch(setUserId(userCredential.user.uid)); // 'dispatch' updates the Redux state with the user ID so we can use across the app
            console.log('Account created:', userCredential.user);
        } catch (error) {
            console.error('Error signing up:', error.message);
        }
    };
    
    const handleSignIn = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            dispatch(setUserId(userCredential.user.uid)); 
            console.log('Signed in:', userCredential.user);
        } catch (error) {
            console.error('Error signing in:', error.message);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-400 to-purple-500">
            <div className="container max-w-md mx-auto px-6 py-10 bg-white shadow-lg rounded-xl">
                <div className="text-center mb-10">
                    <img src={logo} alt="Logo" className="mx-auto mb-4 h-40 w-40 object-cover" />
                    <h1 className="text-5xl font-bold text-gray-800 mb-4">{isActive ? 'Sign Up' : 'Sign In'}</h1>
                    <p className="text-gray-600">{isActive ? 'Join our community today.' : 'Welcome back, please sign in.'}</p>
                </div>

                <form className="space-y-6" onSubmit={isActive ? handleSignUp : handleSignIn}>
                    {isActive && (
                        <input
                            type="text"
                            placeholder="Name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button type="submit" className="w-full py-3 px-4 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-lg hover:bg-blue-700 transition duration-300 hover:text-black">
                        {isActive ? 'Create Account' : 'Login'}
                    </button>
                </form>

                <div className="text-center mt-8">
                    <button
                        onClick={handleToggle}
                        className="text-purple-600 hover:underline"
                    >
                        {isActive ? 'Already have an account? Log in' : "Don't have an account? Register"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SignupPage;