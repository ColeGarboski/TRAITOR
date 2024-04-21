import React from "react";
import { useLocation } from "react-router-dom";
import thinking from "/src/assets/thinking.svg";

function Results() {
  const { state } = useLocation();  // Assume state is passed as { submission: {...} }
  const { submission } = state;

  return (
    <div className="App">
      <header>
        <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
              Results for {submission.assignmentName}
            </h1>
          </div>
        </div>
      </header>
      <main className="flex flex-col items-center">
        <h2 className="text-lg font-bold text-gray-800 sm:text-xl mb-4">
          Student: {submission.studentName}
        </h2>

        {Object.entries(submission).filter(([key]) => key.includes('_result') && key !== 'comparison_results' && key !== 'reverse_prompt_result').map(([key, result]) => (
          <article key={key} className="rounded-xl border-2 border-gray-100 bg-white p-6 overflow-hidden shadow-lg mb-4 max-w-4xl w-full">
            <div className="flex items-start gap-4">
              <img
                alt="Thinking icon"
                src={thinking}
                className="h-14 w-14 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-semibold">{result.testName}</h3>
                {result.description && (
                  <p className="text-sm text-gray-700 mt-2">{result.description}</p>
                )}
                {result.response && (
                  <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">{result.response}</p>
                )}
                {typeof result.prediction !== 'undefined' && (
                  <p className="text-sm text-gray-700 mt-2">Prediction: {result.prediction ? 'AI-generated' : 'Human-written'}</p>
                )}
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <span className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-white ${result.success ? 'bg-green-500' : 'bg-red-500'}`}>
                <span>{result.success ? 'Passed' : 'Failed'}</span>
              </span>
            </div>
          </article>
        ))}

        {/* Display Reverse Prompt Results along with Comparison Metrics */}
        {submission.reverse_prompt_result && (
          <article className="rounded-xl border-2 border-gray-100 bg-white p-6 overflow-hidden shadow-lg mb-4 max-w-4xl w-full">
            <div className="flex items-start gap-4">
              <img
                alt="Thinking icon"
                src={thinking}
                className="h-14 w-14 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-semibold">{submission.reverse_prompt_result.testName}</h3>
                <p className="text-sm text-gray-700 mt-2">{submission.reverse_prompt_result.description}</p>
                <div className="mt-4">
                  <h4 className="font-semibold">Comparison Results:</h4>
                  {Object.entries(submission.reverse_prompt_result.comparison_results).map(([key, value]) => (
                    <div key={key} className="mt-2">
                      <h5 className="text-sm font-semibold">{key.replace(/([A-Z])/g, ' $1').trim()}</h5>
                      <p className="text-xs">GPT Recreation: {value['GPT Recreation'].toString()}</p>
                      <p className="text-xs">Your Text: {value['Your text'].toString()}</p>
                      <p className="text-xs">Similarity (%): {value['Similarity (%)']}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <span className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-white ${submission.reverse_prompt_result.success ? 'bg-green-500' : 'bg-red-500'}`}>
                <span>{submission.reverse_prompt_result.success ? 'Passed' : 'Failed'}</span>
              </span>
            </div>
          </article>
        )}
      </main>
    </div>
  );
}

export default Results;
