import React, { useState } from 'react';

const LandingPage = () => {
    const [text, setText] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleTextChange = (event) => {
        setText(event.target.value);
    };

    const analyzeText = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/analyze-ai-model', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });
            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error('Error:', error);
            setResult({ error: "Failed to analyze text. Please check the console for more details." });
        }
        setLoading(false);
    };

    const getPredictionText = (prediction) => {
        return prediction === 1
            ? "The text is likely AI-generated."
            : "The text is likely written by a human.";
    };

    return (
        <div className="max-w-xl mx-auto p-4">
            <h1 className="font-bold mb-4 text-5xl text-center text-gray-950">AI Text Analyzer</h1>
            <textarea
                className="border-2 border-gray-300 w-full p-2 mb-4"
                rows="6"
                placeholder="Enter text to analyze"
                value={text}
                onChange={handleTextChange}
            ></textarea>
            <button
                className={`w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={analyzeText}
                disabled={loading}
            >
                {loading ? 'Analyzing...' : 'Analyze Text'}
            </button>
            {result && (
                <div className="mt-4 p-4 border rounded text-xl text-gray-950">
                    {result.error ? (
                        <p className="text-red-500">{result.error}</p>
                    ) : (
                        <div>
                            <p><strong>Prediction:</strong> {getPredictionText(result.prediction)}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LandingPage;
