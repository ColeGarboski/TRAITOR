import React from 'react';
import Result from '/src/components/ResultComponent';
import { useSelector } from 'react-redux';
import { selectData } from '/src/dataSlice';

function ResultsPage() {
  const GPTResponse = useSelector(selectData);

  const askGPTResponse = GPTResponse.askgpt ? GPTResponse.askgpt.response : '';
  const reversePromptResponse = GPTResponse.reverseprompt ? GPTResponse.reverseprompt.reversed_prompt : ''; // Assuming you have a "description" field in reverseprompt

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 to-indigo-800 font-inter text-white">
    <Result
        status="pass"
        testName="Does it think it wrote it?"
        evaluation={askGPTResponse}
      />
      <Result
        status="fail"
        testName="Does reverse engineered prompt give similar response?"
        evaluation={reversePromptResponse}
      />
      <Result
        status="pass"
        testName="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
        evaluation="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
      />
    </div>
  );
}

export default ResultsPage;
