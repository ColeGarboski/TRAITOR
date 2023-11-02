import {useEffect, useState} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setData } from '/src/dataSlice';
import { storage } from '/src/firebase';
import { ref, uploadBytes } from 'firebase/storage';

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500" />
    </div>
  );
}

function HomePage() {
  const dispatch = useDispatch(); //Used for Redux
  const [text, setText] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const navigate = useNavigate();

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
    } else {
      alert('Please upload a .docx file');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const [sessionID, setSessionID] = useState('');

  useEffect(() => {
    (async () => {
      try {
        //const response = await axios.get('http://127.0.0.1:5000/get-token'); // Change URL accordingly
        const response = await axios.get('https://tr-ai-torapi-d1938a8a0bce.herokuapp.com/get-token'); // Change URL accordingly
        //const response = await axios.get('http://127.0.0.1:8080/get-token'); // Change URL accordingly
        setSessionID(response.data);
      } catch (error) {
        console.error("Couldn't fetch session ID", error);
      }
    })();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      
      const apiLinks = [ //UNCOMMENT FOR PROD MODE
          'https://tr-ai-torapi-d1938a8a0bce.herokuapp.com/askgpt', 
          'https://tr-ai-torapi-d1938a8a0bce.herokuapp.com/reverseprompt', 
      ];

      //  const apiLinks = [ //UNCOMMENT FOR DEV MODE
      //    'http://127.0.0.1:5000/askgpt',
      //    'http://127.0.0.1:5000/reverseprompt',
      //  ];

      const results = await Promise.all(
        apiLinks.map(link => axios.post(link, { prompt: text }))
      );


      let combinedResponse = {};
      results.forEach((res, index) => {
        const routeKey = apiLinks[index].split('/').pop(); // Extract the last part of the URL as the key
        combinedResponse[routeKey] = res.data;
      });

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
              value={text}
              onChange={(e) => setText(e.target.value)}
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
        <p className="text-xs text-white">
          © 2023 TRAITOR. All rights reserved.
        </p>
      </footer>
    </div>
  );

}

export default HomePage;
