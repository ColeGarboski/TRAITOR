import React, { useState } from 'react';
import Result from '/src/components/ResultComponent';
import { useSelector } from 'react-redux';
import { selectData } from '/src/dataSlice';
import ProgressWheel from '/src/components/ProgressWheel';

function ResultsPage() {
  const GPTResponse = useSelector(selectData);

  const tests = [
    // Add all test data here
    {
      name: "Does it think it wrote it?",
      status: "pass",
      response: GPTResponse.askgpt ? GPTResponse.askgpt.response : ''
    },
    {
      name: "Does reverse engineered prompt give similar response?",
      status: "fail",
      response: GPTResponse.reverseprompt ? GPTResponse.reverseprompt.reversed_prompt : ''
    },
  ];

  const [selectedTest, setSelectedTest] = useState(tests[0]);

  const percentage = 65; // Testing for progress wheel
  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-900 to-indigo-800 font-inter text-white">
      <div className="flex justify-center items-center w-full mt-10 mb-5">
        <div className="flex justify-end flex-1 mx-20">
          <ProgressWheel percent={percentage} size={250} />
        </div>
        <h1 className="text-6xl md:text-8xl font-logo leading-tight bg-gradient-to-r from-slate-900 to-slate-950 text-transparent bg-clip-text drop-shadow-lg">
          TRAITOR
        </h1>
        <div className="flex-1 mx-20" style={{ width: 250, visibility: 'hidden' }}></div>
      </div>
      <div className="flex justify-center flex-wrap gap-2 mb-4">
        {tests.map((test, index) => (
          <button
            key={index}
            className={`px-3 py-1 md:px-4 md:py-2 rounded-lg text-sm md:text-base ${selectedTest.name === test.name ? 'bg-purple-500 text-white' : 'bg-purple-300 text-purple-900'}`}
            onClick={() => setSelectedTest(test)}
          >
            {test.name}
          </button>
        ))}
      </div>
      <div className="flex-grow w-full p-4 bg-white rounded-lg shadow-lg">
        <Result
          status={selectedTest.status}
          testName={selectedTest.name}
          evaluation={selectedTest.response}
        />
      </div>
    </div>
  );
}

export default ResultsPage;
