import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setData } from '/src/dataSlice';

function HomePage() {
  const dispatch = useDispatch(); //Used for Redux
  const [text, setText] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let apiLink = 'https://tr-ai-torapi-d1938a8a0bce.herokuapp.com/generate'; //UNCOMMENT FOR PROD MODE
      //let apiLink = 'http://127.0.0.1:5000/generate'; //UNCOMMENT FOR DEV MODE
      const result = await axios.post(apiLink, { prompt: text });
      setResponse(result.data.response);
      dispatch(setData(result.data.response))
    } catch (error) {
      console.error('There was an error sending the request', error);
      setResponse('There was an error sending the request');
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