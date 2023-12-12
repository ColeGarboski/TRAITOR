import React, { useState } from 'react';
import Result from '/src/components/ResultComponent';
import { useSelector } from 'react-redux';
import { selectData } from '/src/dataSlice';
import { Link } from "react-router-dom";

function ResultsPage() {
    const GPTResponse = useSelector(selectData);

    const formatComparisonResults = (comparisonResults) => {
        let formattedOutput = '';
        if (comparisonResults) {
            Object.keys(comparisonResults).forEach(testName => {
                const testResults = comparisonResults[testName];
                formattedOutput += `Test Name: ${testName}\n`;
                formattedOutput += `    Your Text Score: ${testResults['Your text']}\n`;
                formattedOutput += `    GPT Generated Text Score: ${testResults['GPT Recreation']}\n`;
                formattedOutput += `    Similarity: ${testResults['Similarity (%)']}%\n\n`;
            });
        }
        return formattedOutput;
    };

    const tests = [
        {
            name: "What does ChatGPT think?",
            description: "We have asked ChatGPT if it thinks the content you submitted looks like it was generated using AI.",
            response: GPTResponse.askgpt ? GPTResponse.askgpt.response : ''
        },
        {
            name: "Reverse Engineered Prompt",
            description: "Analyzes the similarity between your text and GPT's recreation.",
            response: formatComparisonResults(GPTResponse.comparisonResults)
        },
        {
            name: "File Metadata",
            description: "Checks the metadata of the provided file for analysis.",
            response: GPTResponse.fileMetadataAnalysis ? GPTResponse.fileMetadataAnalysis.response : 'No metadata available'
        },
        {
            name: "File Text",
            description: "Displays the text extracted from the file.",
            response: GPTResponse.fileText || 'No text available'
        },
    ];

    const [selectedTest, setSelectedTest] = useState(tests[0]);

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 font-inter text-white">
            <header className="top-0 left-0 right-0 p-4 bg-white rounded-b-md shadow-md">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link to="/" className="text-xl font-bold ml-2" style={{ letterSpacing: '1.5px' }}>
                        <span style={{ color: 'black' }}>TR</span>
                        <span className="italic bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">AI</span>
                        <span style={{ color: 'black' }}>TOR</span>
                    </Link>
                </div>
            </header>
            <div className="pt-10">
                <div className="flex justify-center flex-wrap gap-2 mb-4 z-10">
                    <div className="bg-white rounded-lg shadow-md p-2">
                        {tests.map((test, index) => (
                            <button
                                key={index}
                                className={`px-3 py-1 md:px-4 mx-2 md:py-2 rounded-lg text-sm md:text-base ${selectedTest.name === test.name ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-black rounded-lg' : 'bg-gradient-to-br from-blue-500 to-purple-600 hover:bg-blue-700 transition duration-300 hover:text-black'}`}
                                onClick={() => setSelectedTest(test)}
                            >
                                {test.name}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <Result
                        testName={selectedTest.name}
                        description={selectedTest.description}
                        evaluation={<pre className="result-pre">{selectedTest.response}</pre>}
                    />
                </div>
            </div>
            <footer className="w-full p-4 bg-white bg-opacity-90">
                <p className="text-xs text-center text-black">
                    © 2023 TRAITOR. All rights reserved.
                </p>
            </footer>
        </div>
    );
}

export default ResultsPage;
