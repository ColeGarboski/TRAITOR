import React from 'react';
import Result from '/src/components/ResultComponent';
import { useSelector } from 'react-redux';
import { selectData } from '/src/dataSlice';

function ResultsPage() {
  const GPTResponse = useSelector(selectData);

  const askGPTResponse = GPTResponse.askgpt ? GPTResponse.askgpt.response : '';
  const reversePromptResponse = GPTResponse.reverseprompt ? GPTResponse.reverseprompt.reversed_prompt : ''; // Assuming you have a "description" field in reverseprompt

  return (
    <div className="font-inter text-white bg-slate-950 min-w-full min-h-screen flex flex-col items-center justify-center space-y-4">
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
