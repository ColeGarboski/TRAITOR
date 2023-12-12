import React from 'react';

function Result({description, evaluation}) {
    return (
        <div className="flex justify-center items-center"> {/* Flex container to center the Result component */}
            <div className="rounded-lg p-4 bg-white md:w-3/4 "> {/* Neutral background color */}
                <style>
                    {`
                        .result-pre {
                            white-space: pre-wrap;
                            word-wrap: break-word;
                            overflow-wrap: break-word;
                        }
                    `}
                </style>
                <div className="font-bold text-slate-700">{description}</div>
                <div className="mt-2 text-slate-600 text-sm result-pre">
                    {evaluation}
                </div>
            </div>
        </div>
    );
}

export default Result;
