import React from 'react';

function Result({ status, testName, evaluation }) {
  const isPass = status === 'pass';

  return (
    <div className={`p-4 max-h-max shadow-md rounded-md mx-4 my-4 ${isPass ? 'bg-green-50' : 'bg-red-50'}`}>
      <style>
        {`
          .result-pre {
            white-space: pre-wrap;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
        `}
      </style>
      <div className={`flex items-center ${isPass ? 'text-green-500' : 'text-red-500'}`}>
        {/* SVG icons */}
        {isPass ? (
          <svg
            className="w-6 h-6 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            {/* SVG path */}
          </svg>
        ) : (
          <svg
            className="w-6 h-6 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            {/* SVG path */}
          </svg>
        )}
        {isPass ? 'Pass' : 'Fail'}
      </div>
      <div className="mt-2 font-bold text-slate-700">{testName}</div>
      <div className="mt-1 text-slate-600 text-sm result-pre">
        {evaluation}
      </div>
    </div>
  );
}

export default Result;
