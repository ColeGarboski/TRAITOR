import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '/src/assets/logo.png';
import '/src/LandingPage.css'

function LandingPage() {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('home');
    const [typedWord, setTypedWord] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletionDelay, setDeletionDelay] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [typingDelay, setTypingDelay] = useState(100);

    const words = [
        'Suspicious?',
        'Robotic?',
        'AI-Like?',
        'Unnatural?',
        'Formulaic?',
        'Inconsistent?',
        'Over-polished?',
        'Artificial?',
        'Overly-Technical?',
    ];

    const goToLogin = async () => {
        navigate('/signup');
    };

    useEffect(() => {
        const typeNextLetter = () => {
            const word = words[currentIndex];
            setTypedWord(word.substring(0, typedWord.length + 1));
            if (typedWord.length === word.length - 1 && !deletionDelay) {
                setDeletionDelay(true);
                setTimeout(() => {
                    setIsDeleting(true);
                    setDeletionDelay(false);
                    setTypingDelay(100);
                }, 3000);
            }
        };

        const deleteLetter = () => {
            setTypedWord((prevWord) => prevWord.substring(0, prevWord.length - 1));
            if (typedWord.length === 1) {
                setIsDeleting(false);
                setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
                setTypingDelay(100);
            }
        };

        const interval = setInterval(() => {
            if (!deletionDelay) {
                if (!isDeleting) {
                    typeNextLetter();
                } else {
                    deleteLetter();
                }
            }
        }, typingDelay);

        return () => clearInterval(interval);
    }, [currentIndex, isDeleting, typedWord, typingDelay, deletionDelay]);

    const handleScroll = () => {
        const aboutSection = document.getElementById('about');
        const contactSection = document.getElementById('contact');
        const topOfAbout = aboutSection.getBoundingClientRect().top;
        const topOfContact = contactSection.getBoundingClientRect().top;

        if (topOfContact < window.innerHeight / 2) {
            setActiveSection('contact');
        } else if (topOfAbout < window.innerHeight / 2) {
            setActiveSection('about');
        } else {
            setActiveSection('home');
        }
    };

    const smoothScrollToSection = (sectionId) => (event) => {
        event.preventDefault();
        const section = document.getElementById(sectionId);
        section.scrollIntoView({ behavior: 'smooth' });
    };


    useEffect(() => {
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className="flex overflow-hidden min-h-screen bg-gradient-to-r from-blue-400 to-purple-500 font-inter text-white relative">
            {/* Scrollable Left Side Content */}
            <div className="w-2/3 flex flex-col items-center overflow-auto">
                {/* Main Content Container */}
                <div id="home" className="flex flex-col justify-center h-screen w-full">
                    <div className="text-center p-8 z-10">
                        <h1 className="text-6xl font-bold mb-4 text-black">
                            Have you ever read an essay that was...
                        </h1>
                        <h1 className="text-6xl font-bold mb-4 text-white">
                            &nbsp;{typedWord}
                        </h1>
                    </div>
                </div>

                {/* About Us Section */}
                <div className="text-left p-8 z-10 mb-20" id="about" style={{ paddingBottom: '40vh' }}>
                    <h1 className="text-6xl font-bold mb-4 text-black">What do we do?</h1>
                    <p className="text-xl mb-4">
                        We figure that the best way to decide if something is AI generated is to leverage AI itself.
                        Although we are unable to give you a black and white answer on the authenticity of the content;
                        We can however deliver you the information to help make that decision yourself. Your text or
                        document will be sent through a multipart analysis to help provide you the best idea on if it
                        is authentic or not.
                    </p>
                    <div className="bg-white rounded-3xl p-6 opacity-95">
                    {/* Adding the ordered list here with Tailwind utility classes */}
                    <ol className="list-decimal list-outside pl-6 text-left text-xl mb-4">
                        <li className="mb-6 ml-4 gradient-text"><strong>We ask ChatGPT if your content looks like something it has written.</strong></li>
                        <li className="mb-6 ml-4 gradient-text"><strong>ChatGPT analyzes the content and tries to reverse engineer the prompt someone would have used to get that result from an AI service.</strong></li>
                        <li className="mb-6 ml-4 gradient-text"><strong>We use our own in-house algorithm to break down the content into small pieces to derive insightful information such as Tone, Wordiness, Formality, Meta-Data, etc.</strong></li>
                        <li className="mb-6 ml-4 gradient-text"><strong>The information is then presented to you clearly and concisely to help you make a decision on if AI was used in creating the uploaded content.</strong></li>
                    </ol>
                </div>
            </div>
                <div className="text-left p-8 z-10 mb-20" id="contact" style={{ paddingBottom: '40vh' }}>
                    <h1 className="text-6xl font-bold mb-4 text-black">Contact:</h1>
                    <p className="text-xl mb-4 text-center">
                        <strong>Don't.</strong>
                    </p>
                </div>
            </div>

            {/* Fixed Right Side Content */}
            <div className="fixed top-0 right-0 w-1/3 h-screen flex flex-col">
                {/* White Square with rounded edges */}
                <div className="w-full h-full bg-white rounded-l-3xl opacity-95 absolute z-10"></div>

                {/* Header and Navigation */}
                <header className="w-full py-4 z-20">
                    <div className="flex justify-center items-center">
                        <nav>
                            <ul className="flex space-x-4 font-bold">
                                <li><a href="#home" onClick={smoothScrollToSection('home')} className={`text-black ${activeSection === 'home' ? 'border-b-2 border-purple-700' : ''} hover:border-b-2 hover:border-purple-700`}>Home</a></li>
                                <li><a href="#about" onClick={smoothScrollToSection('about')} className={`text-black ${activeSection === 'about' ? 'border-b-2 border-purple-700' : ''} hover:border-b-2 hover:border-purple-700`}>About us</a></li>
                                <li><a href="#contact" onClick={smoothScrollToSection('contact')} className={`text-black ${activeSection === 'contact' ? 'border-b-2 border-purple-700' : ''} hover:border-b-2 hover:border-purple-700`}>Contact</a></li>
                            </ul>
                        </nav>
                    </div>
                </header>

                {/* Logo and Other Right Side Content */}
                <div className="flex items-center justify-center h-full z-20 pb-20 ">
                    <div className="text-center p-8">
                        <img src={logo} alt="Logo" className="w-40 h-40 mx-auto" />
                        <h1 className="mb-4 text-6xl font-bold drop-shadow-md" style={{ letterSpacing: '1.5px' }}>
                            <span style={{ color: 'black' }}>TR</span>
                            <span className="italic bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">AI</span>
                            <span style={{ color: 'black' }}>TOR</span>
                        </h1>
                        <h2 className="mb-6 text-2xl font-medium text-black">
                            Uncover the truth
                        </h2>
                        <button
                            onClick={goToLogin}
                            className="px-6 py-3 text-lg bg-gradient-to-r from-blue-400 to-purple-500 font-medium text-white rounded-full shadow-lg transition duration-300 hover:bg-gray-100 hover:shadow-md hover:text-black"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LandingPage;
