import React from 'react';

function Result({ status, testName, evaluation }) {
  const isPass = status === 'pass';

  return (
    <div className={`p-4 max-h-max shadow-md rounded-md mx-4 my-4 ${isPass ? 'bg-green-50' : 'bg-red-50'}`}>
      <div className={`flex items-center ${isPass ? 'text-green-500' : 'text-red-500'}`}>
        {/* SVG icons */}
        {isPass ? (
          <svg
            className="w-6 h-6 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M6.293 9.293a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            ></path>
          </svg>
        ) : (
          <svg
            className="w-6 h-6 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9.293 9.293a1 1 0 011.414 0L12 10.586l1.293-1.293a1 1 0 111.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414z"
              clipRule="evenodd"
            ></path>
          </svg>
        )}
        {isPass ? 'Pass' : 'Fail'}
      </div>
      <div className="mt-2 font-bold text-slate-700">{testName}</div>
      <div className="mt-1 text-slate-600 text-sm">{evaluation}</div>
    </div>
  );
}

export default Result;