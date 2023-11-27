import React from 'react';

function ProgressWheel({ percent, size = 120 }) {
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex justify-center items-center">
      <svg height={size} width={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth="15"
          stroke="#ccc"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth="15"
          stroke="blue"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text 
          x="50%" 
          y="50%" 
          textAnchor="middle" 
          dy=".3em" 
          fontSize={size / 6} 
          stroke='#b64ef2'
          fontFamily='Dela Gothic One'
        >
          {`${percent}%`}
        </text>
      </svg>
    </div>
  );
}

export default ProgressWheel;
