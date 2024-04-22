import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "/src/assets/logo.png";
import "/src/LandingPage.css";

function LandingPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("home");
  const [typedWord, setTypedWord] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionDelay, setDeletionDelay] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typingDelay, setTypingDelay] = useState(100);

  const words = [
    "Suspicious?",
    "Robotic?",
    "AI-Like?",
    "Unnatural?",
    "Formulaic?",
    "Inconsistent?",
    "Over-polished?",
    "Artificial?",
    "Overly-Technical?",
  ];

  const goToLogin = async () => {
    navigate("/signup");
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
    const aboutSection = document.getElementById("about");
    const contactSection = document.getElementById("contact");
    const topOfAbout = aboutSection.getBoundingClientRect().top;
    const topOfContact = contactSection.getBoundingClientRect().top;

    if (topOfContact < window.innerHeight / 2) {
      setActiveSection("contact");
    } else if (topOfAbout < window.innerHeight / 2) {
      setActiveSection("about");
    } else {
      setActiveSection("home");
    }
  };

  const smoothScrollToSection = (sectionId) => (event) => {
    event.preventDefault();
    const section = document.getElementById(sectionId);
    section.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="flex overflow-hidden min-h-screen  font-inter text-white relative">
      {/* Scrollable Left Side Content */}
      <div className="w-2/3 flex flex-col items-center overflow-auto">
        {/* Main Content Container */}
        <div id="home" className="flex flex-col justify-center h-screen w-full">
          <div className="text-center p-8 z-10">
            <h1 className="text-6xl font-bold mb-4 text-white">
              Have you ever read an essay that was...
            </h1>
            <h1 className="text-6xl font-bold mb-4 text-orange-500">
              &nbsp;{typedWord}
            </h1>
          </div>
        </div>

        {/* Fixed Right Side Content */}
        <div className="fixed top-0 right-0 w-1/3 h-screen flex flex-col">
          {/* White Square with rounded edges */}
          <div className="w-full h-full bg-white/30 rounded-l-3xl opacity-95 absolute z-10"></div>

          {/* Header and Navigation */}
          <header className="w-full py-4 z-20">
            <div className="flex justify-center items-center"></div>
          </header>

          {/* Logo and Other Right Side Content */}
          <div className="flex items-center justify-center h-full z-20 pb-20 ">
            <div className="text-center p-8">
              <h1
                className="mb-4 text-6xl font-bold drop-shadow-md"
                style={{ letterSpacing: "1.5px" }}
              >
                <span style={{ color: "black" }}>TR</span>
                <span className="italic bg-clip-text text-transparent bg-orange-500">
                  AI
                </span>
                <span style={{ color: "black" }}>TOR</span>
              </h1>
              <h2 className="mb-6 text-2xl font-medium text-white">
                Uncover the truth
              </h2>
              <button
                onClick={goToLogin}
                className=" rounded-lg px-3 py-3 h-[50px] w-40 bg-black text-white hover:bg-orange-500 transition duration-300"
              >
                <span className="relative z-10 text-lg">Get Started</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
