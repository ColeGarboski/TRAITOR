import React from 'react';
import Result from '/src/components/ResultComponent';
import { useSelector } from 'react-redux';
import { selectData } from '/src/dataSlice';

function ResultsPage() {
  const GPTResponse = useSelector(selectData);
  return (
    <div className="font-inter text-white bg-slate-950 min-w-full min-h-screen flex flex-col items-center justify-center space-y-4">
      <Result
        status="pass"
        testName="Does it think it wrote it?"
        evaluation={ GPTResponse }
      />
      <Result
        status="fail"
        testName="Does reverse engineered prompt have similar response?"
        evaluation="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
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
