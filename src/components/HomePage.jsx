import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setData } from '/src/dataSlice';
import { storage } from '/src/firebase';
import { ref, uploadBytes } from 'firebase/storage';

function HomePage() {
  const dispatch = useDispatch(); //Used for Redux
  const [text, setText] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.docx')) {
      setFile(file);
      const fileRef = ref(storage, `files/${file.name}`);
      await uploadBytes(fileRef, file);
      console.log('File uploaded successfully');
    } else {
      alert('Please upload a .docx file');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      
      const apiLinks = [ //UNCOMMENT FOR PROD MODE
          'https://tr-ai-torapi-d1938a8a0bce.herokuapp.com/askgpt', 
          'https://tr-ai-torapi-d1938a8a0bce.herokuapp.com/reverseprompt', 
      ];

      // const apiLinks = [ //UNCOMMENT FOR DEV MODE
      //   'http://127.0.0.1:5000/askgpt',
      //   'http://127.0.0.1:5000/reverseprompt',
      // ]; 

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
    <div className="font-inter text-white bg-slate-950 min-w-full min-h-screen flex flex-col items-center justify-center space-y-4">
      <h1 className="text-6xl text-slate-300 leading-tight mb-4 font-logo border-8 border-spacing-8 rounded-md">trAItor</h1>
      <div className="flex flex-col items-center space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your text here"
          rows={5}
          className="w-96 h-32 p-2 bg-slate-700 text-slate-100 rounded"
        />
        {!loading && (
          <button onClick={handleSubmit} className="px-4 py-2 text-base font-medium bg-slate-900 rounded-lg transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50">
            Submit
          </button>
        )}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="w-96 h-32 border-2 border-dashed border-slate-500 flex items-center justify-center rounded"
        >
          <p>Drag and drop a .docx file here</p>
        </div>
      </div>
      {response && (
        <div className="flex flex-col items-center space-y-4">
          <h2 className="text-2xl leading-normal mb-2">Response:</h2>
          <p className="mb-4">{response}</p>
        </div>
      )}
    </div>
  );
}

export default HomePage;
