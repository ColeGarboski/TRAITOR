import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '/src/assets/logo.png';

function LandingPage() {
    const navigate = useNavigate();

    const goToHomepage = async () => {
        navigate('/home');
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-br from-purple-900 to-indigo-800 font-inter text-white">
            <img src={logo} alt="TRAITOR Logo" className="w-60 h-auto mb-4" />
            <h1 className="mb-4 text-8xl font-logo leading-tight bg-gradient-to-r from-slate-900 to-slate-950 text-transparent bg-clip-text drop-shadow-2xl">
                TRAITOR
            </h1>
            <h2 className="mb-4 text-3xl font-medium font-logo leading-tight bg-gradient-to-r from-slate-900 to-slate-950 text-transparent bg-clip-text drop-shadow-2xl">
                Uncover the truth.
            </h2>
            <button
                onClick={goToHomepage}
                className="w-60 px-6 py-3 text-lg font-medium bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"
            >
                Get Started
            </button>

            <footer className="absolute bottom-0 flex flex-col items-center justify-center w-full p-4 bg-black bg-opacity-40">
                <p className="text-xs text-white">
                    © 2023 TRAITOR. All rights reserved.
                </p>
            </footer>
        </div>
    );
}

export default LandingPage;
