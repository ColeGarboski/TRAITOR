import React, { useState } from 'react';
import Result from '/src/components/ResultComponent';
import { useSelector } from 'react-redux';
import { selectData } from '/src/dataSlice';
import ProgressWheel from '/src/components/ProgressWheel';

function ResultsPage() {
  const GPTResponse = useSelector(selectData);

  const tests = [
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
    {
      name: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
      status: "pass",
      response: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    }
  ];

  const [selectedTest, setSelectedTest] = useState(tests[0]);

  const percentage = 65; //Testing for progress wheel
  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-purple-900 to-indigo-800 font-inter text-white">
      <div className="flex flex-row items-center">
        <ProgressWheel percent={percentage} size={250} />
        <h1 className="mb-4 text-8xl font-logo leading-tight bg-gradient-to-r from-slate-900 to-slate-950 text-transparent bg-clip-text drop-shadow-2xl">
          TRAITOR
        </h1>
      </div>
      <div className="flex-grow w-full bg-white">
        <div className="flex justify-center space-x-4 mt-4 mb-4">
          {tests.map((test, index) => (
            <button
              key={index}
              className={`px-4 py-2 rounded-lg ${selectedTest.name === test.name ? 'bg-purple-500 text-white' : 'bg-purple-300 text-purple-900'}`}
              onClick={() => setSelectedTest(test)}
            >
              {test.name}
            </button>
          ))}
        </div>
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