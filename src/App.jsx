import { useState } from 'react';
import axios from 'axios'; 
import './App.css';

function App() {
    const [text, setText] = useState(''); 
    const [response, setResponse] = useState(''); 
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true); // Set loading to true when request starts
        try {
            const result = await axios.post('http://127.0.0.1:5000/generate', { prompt: text });
            setResponse(result.data.response);
        } catch (error) {
            console.error('There was an error sending the request', error);
            setResponse('There was an error sending the request');
        } finally {
            setLoading(false); // Set loading back to false once request completes
        }
    };

    return (
        <div className="App">
            <h1>trAItor</h1>
            <div className="inputContainer">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter your text here"
                    rows={5}
                    cols={50}
                />
                {!loading && <button onClick={handleSubmit}>Submit</button>}
            </div>
            {response && <div><h2>Response:</h2><p>{response}</p></div>}
        </div>
    );
}

export default App;
