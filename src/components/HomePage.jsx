import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setData } from '/src/dataSlice';
import { storage } from '/src/firebase';
import { ref, uploadBytes } from 'firebase/storage';
import logo from "../assets/logo.png";

// Define API base URLs
const DEV_API_BASE_URL = 'http://127.0.0.1:5000';
const OTHER_DEV_API_BASE_URL = 'http://127.0.0.1:8080';
const PROD_API_BASE_URL = 'https://tr-ai-torapi-d1938a8a0bce.herokuapp.com';

// Toggle this line for switching environments
const API_BASE_URL = DEV_API_BASE_URL; // For development
//const API_BASE_URL = OTHER_DEV_API_BASE_URL; // For development
//const API_BASE_URL = PROD_API_BASE_URL; // For production

function ProgressBar({ progress }) {
  const progressBarStyle = {
    width: `${progress}%`,
    transition: 'width 0.5s ease-in-out',
  };

  return (
    <div className="w-full bg-gray-200 rounded h-4">
      <div className="bg-gradient-to-r from-blue-400 to-purple-500 h-4 rounded" style={progressBarStyle}></div>
    </div>
  );
}

function HomePage() {
  const dispatch = useDispatch();
  const [text, setText] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [fileMetadata, setFileMetadata] = useState(null);
  const [fileMetadataAnalysis, setFileMetadataAnalysis] = useState(null);
  const [fileText, setFileText] = useState(null);
  const navigate = useNavigate();
  const [sessionID, setSessionID] = useState('');
  const [isTextAreaDisabled, setIsTextAreaDisabled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [flavorText, setFlavorText] = useState('');

  const handleDrop = async (e) => {
    e.preventDefault();
    if (fileUploaded) {
      alert('File has already been uploaded');
      return;
    }
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.docx')) {
      setFile(file);
      const fileRef = ref(storage, `files/${sessionID}/${file.name}`);
      await uploadBytes(fileRef, file);
      setFileUploaded(true);
      console.log('File uploaded successfully');
      notifyBackend(file.name);
    } else {
      alert('Please upload a .docx file');
    }
  };

  const notifyBackend = async (fileName) => {
    try {
      const documentFullText = await axios.post(`${API_BASE_URL}/extract-text`, { file_name: fileName, session_token: sessionID });
      setFileText(documentFullText.data.text);
      setText(documentFullText.data.text);
      setIsTextAreaDisabled(true);
    } catch (error) {
      console.error('Error in processing file:', error);
    }
  };

  const analyzeTexts = async (text1, text2) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/analyze-compare-texts`, { text1, text2 });
      return response.data;
    } catch (error) {
      console.error('Error in analyzing and comparing texts:', error);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    (async () => {
      try {
        let token = localStorage.getItem('sessionToken');
        if (!token) {
          const response = await axios.get(`${API_BASE_URL}/get-token`);
          token = response.data;
          localStorage.setItem('sessionToken', token);
        }
        setSessionID(token);
      } catch (error) {
        console.error("Couldn't fetch session ID", error);
      }
    })();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setProgress(0);
    setFlavorText('Initializing...');
    let currentProgress = 0;
  
    const flavorTexts = [
      { progress: 0, text: "Making sure ChatGPT is awake..." },
      { progress: 5, text: "ChatGPT is stretching its neural networks..." },
      { progress: 10, text: "Loading up all the AI wisdom..." },
      { progress: 15, text: "Asking ChatGPT to put on its thinking cap..." },
      { progress: 20, text: "ChatGPT is now sipping virtual coffee..." },
      { progress: 25, text: "Preparing the analysis engines..." },
      { progress: 30, text: "Diving into the depths of data..." },
      { progress: 35, text: "ChatGPT is now juggling with bytes..." },
      { progress: 40, text: "Calculating the secrets of the universe..." },
      { progress: 45, text: "Engaging in digital telepathy..." },
      { progress: 50, text: "It's busy analyzing..." },
      { progress: 55, text: "Cross-referencing with the Library of Babel..." },
      { progress: 60, text: "Reverse engineering your writing style..." },
      { progress: 65, text: "ChatGPT is now bending the fabric of algorithms..." },
      { progress: 70, text: "Polishing the pixels for clarity..." },
      { progress: 75, text: "Taking a brief AI nap..." },
      { progress: 80, text: "Nearly there, just adding some finishing touches..." },
      { progress: 85, text: "Running a final spell-check..." },
      { progress: 90, text: "Cleaning up your results..." },
      { progress: 95, text: "Almost ready to amaze you..." },
      { progress: 100, text: "Ta-da! Analysis complete!" },
    ].sort((a, b) => a.progress - b.progress);
  
    let flavorIndex = 0; 
  
    const updateInterval = 50; 
    let intervalId;
  
    try {
      const apiLinks = [
        `${API_BASE_URL}/askgpt`,
        `${API_BASE_URL}/reverseprompt`,
        // other API routes...
      ];
  
      const results = [];
      
      for (let i = 0; i < apiLinks.length; i++) {
        const targetProgress = ((i + 1) / apiLinks.length) * 100;
    
        intervalId = setInterval(() => {
          if (currentProgress < targetProgress) {
            currentProgress += 0.1;
            setProgress(currentProgress);
  
            if (flavorIndex < flavorTexts.length && currentProgress >= flavorTexts[flavorIndex].progress) {
              setFlavorText(flavorTexts[flavorIndex].text);
              flavorIndex++;
            }
          } else {
            clearInterval(intervalId);
          }
        }, updateInterval);
    
        const res = await axios.post(apiLinks[i], { prompt: text });
        results.push(res);
    
        while (currentProgress < targetProgress) {
          await new Promise(resolve => setTimeout(resolve, updateInterval));
        }
      }

      let combinedResponse = {};
      results.forEach((res, index) => {
        const routeKey = apiLinks[index].split('/').pop();
        combinedResponse[routeKey] = res.data;
      });

      if (fileUploaded) {
        const response = await axios.post(`${API_BASE_URL}/documentscan`, { file_name: file.name, session_token: sessionID });
        combinedResponse['fileMetadata'] = response.data.metadata;
        combinedResponse['fileText'] = fileText;
        combinedResponse['fileMetadataAnalysis'] = response.data.analysis;
      }

      const reversedPrompt = combinedResponse.reverseprompt.reversed_prompt;
      const comparisonResults = await analyzeTexts(text, reversedPrompt);
      combinedResponse.comparisonResults = comparisonResults;

      setResponse(combinedResponse);
      console.log(combinedResponse);
      dispatch(setData(combinedResponse));
    } catch (error) {
      clearInterval(intervalId);
      console.error('There was an error sending the requests', error);
      setResponse('There was an error sending the requests');
    } finally {
      navigate('/results');
      setLoading(false);
      clearInterval(intervalId);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 font-inter text-white">
      <header className="fixed top-0 left-0 right-0 p-4 bg-white rounded-b-md shadow-md z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold ml-2" style={{ letterSpacing: '1.5px' }}>
            <span style={{ color: 'black' }}>TR</span>
            <span className="italic bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">AI</span>
            <span style={{ color: 'black' }}>TOR</span>
          </Link>
        </div>
      </header>

      <div className="flex flex-col items-center justify-center h-screen">
        <div className="container max-w-md mx-auto px-6 py-10 bg-white opacity-90 shadow-lg rounded-xl">
          {loading ? (
            <div>
              <ProgressBar progress={progress} />
              <p style={{ color: 'black' }} className="text-center mt-4 tex">{flavorText}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-6">
              <div className="relative w-full text-black text-center">
                <h1 className="mb-8 font-bold">Paste or drag your content below to start:</h1>
                <textarea
                  value={fileText ? fileText : text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={isTextAreaDisabled}
                  placeholder="Enter your text here"
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <span className="absolute bottom-4 right-4 text-xs text-gray-500">
                  {text.length}
                </span>
              </div>
              <button
                onClick={handleSubmit}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-lg hover:bg-blue-700 transition duration-300 hover:text-black"
              >
                Submit
              </button>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="w-full h-32 border-2 text-black border-dashed border-gray-300 flex items-center justify-center rounded-lg"
              >
                {fileUploaded ? (
                  <p>File has been uploaded!</p>
                ) : (
                  <p>Drag and drop a .docx file here</p>
                )}
              </div>
            </div>
          )}
          {response && (
            <div className="flex flex-col items-center space-y-4">
              <h2 className="text-2xl leading-normal mb-2">Response:</h2>
              <p className="mb-4">{response}</p>
            </div>
          )}
        </div>
      </div>

      <footer className="absolute bottom-0 w-full p-4 bg-white bg-opacity-90">
        <p className="text-xs text-center text-black">
          © 2023 TRAITOR. All rights reserved.
        </p>
      </footer>
    </div>
  );
}


export default HomePage;
