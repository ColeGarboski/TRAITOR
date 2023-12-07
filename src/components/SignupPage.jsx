import React, { useState } from 'react';
import logo from '/src/assets/logo.png';

function SignupPage() {
    const [isActive, setIsActive] = useState(false);

    const handleToggle = () => {
        setIsActive(!isActive);
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-400 to-purple-500">
            <div className="container max-w-md mx-auto px-6 py-10 bg-white shadow-lg rounded-xl">
                <div className="text-center mb-10">
                    <img src={logo} alt="Logo" className="mx-auto mb-4 h-40 w-40 object-cover" /> {/* Adjust the size as needed */}
                    <h1 className="text-5xl font-bold text-gray-800 mb-4">{isActive ? 'Sign Up' : 'Sign In'}</h1>
                    <p className="text-gray-600">{isActive ? 'Join our community today.' : 'Welcome back, please sign in.'}</p>
                </div>

                <form className="space-y-6">
                    {isActive && (
                        <input
                            type="text"
                            placeholder="Name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />

                    <button type="button" className="w-full py-3 px-4 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-lg hover:bg-blue-700 transition duration-300 hover:text-black">
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
