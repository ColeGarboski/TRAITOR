import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setData } from '/src/dataSlice';
import { storage } from '/src/firebase';
import { ref, uploadBytes } from 'firebase/storage';

// Define API base URLs
const DEV_API_BASE_URL = 'http://127.0.0.1:5000';
const OTHER_DEV_API_BASE_URL = 'http://127.0.0.1:8080';
const PROD_API_BASE_URL = 'https://tr-ai-torapi-d1938a8a0bce.herokuapp.com';

// Toggle this line for switching environments
const API_BASE_URL = DEV_API_BASE_URL; // For development
//const API_BASE_URL = OTHER_DEV_API_BASE_URL; // For development
//const API_BASE_URL = PROD_API_BASE_URL; // For production

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500" />
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
      await axios.post(`${API_BASE_URL}/file-uploaded`, { fileName, sessionID }); // Potentially irrelevant line
      const documentFullText = await axios.post(`${API_BASE_URL}/extract-text`, { file_name: fileName, session_token: sessionID });
      setFileText(documentFullText.data.text);
      setText(documentFullText.data.text);
      setIsTextAreaDisabled(true);
    } catch (error) {
      console.error('Error in processing file:', error);
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
    try {
      const apiLinks = [
        `${API_BASE_URL}/askgpt`,
        `${API_BASE_URL}/reverseprompt`,
        // other API routes...
      ];

      const results = await Promise.all(
        apiLinks.map(link => axios.post(link, { prompt: text }))
      );

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

      setResponse(combinedResponse);
      console.log(combinedResponse);
      dispatch(setData(combinedResponse));
    } catch (error) {
      console.error('There was an error sending the requests', error);
      setResponse('There was an error sending the requests');
    } finally {
      navigate('/results');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 to-indigo-800 font-inter text-white">
      <h1 className="mb-4 text-8xl font-logo leading-tight bg-gradient-to-r from-slate-900 to-slate-950 text-transparent bg-clip-text drop-shadow-2xl">
        TRAITOR
      </h1>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-96 rounded-md">
            <textarea
              value={fileText ? fileText : text}
              onChange={(e) => setText(e.target.value)}
              disabled={isTextAreaDisabled}
              placeholder="Enter your text here"
              rows={5}
              className="w-full p-4 bg-slate-700 text-slate-100 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200"
            />

            <span className="absolute bottom-4 right-4 text-xs text-slate-500">
              {text.length}
            </span>
          </div>
          <button
            onClick={handleSubmit}
            className="w-60 px-4 py-3 text-lg font-medium bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"
          >
            Submit
          </button>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="w-96 h-32 border-2 border-dashed border-slate-500 flex items-center justify-center rounded"
          >
            {fileUploaded ? (
              <p>File has been uploaded</p>
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
      <footer className="absolute bottom-0 flex flex-col items-center justify-center w-full p-4 bg-black bg-opacity-40">
        <p className="text-xs text-white z-10">
          © 2023 TRAITOR. All rights reserved.
        </p>
      </footer>
    </div>
  );

}

export default HomePage;
