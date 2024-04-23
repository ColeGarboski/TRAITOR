import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import thinking from "/src/assets/thinking.svg";

function Results() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { submission } = state;

  const [finalScore, setFinalScore] = useState(((submission.final_score * 100).toFixed(2)) || 0);

  const displayConfig = {
    toneScore: true,
    oxfordComma: false,
    commaFreak: false,
    hyphen: false,
    exclamationMark: false,
    questionMark: false,
    formalityScore: true,
    verbosityScore: true,
    cosineSimilarity: false, // Toggle this to show/hide cosine similarity
  };

  const isPassForAIModelAnalysis = (result) => result.prediction === 0; // 0 implies Human-written, should pass
  const isPassForReversePrompt = (result) =>
    result.comparison_results.cosineSimilarity < 0.5; // less than 0.5 cosine similarity, should pass (inverse of previous logic)

  return (
    <div className="App">
      <header>
        <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 h-32">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl text-white font-bold sm:text-3xl">
                Results for {submission.assignmentName}
              </h1>
            </div>
            <div className="mt-4 flex flex-col gap-4 sm:mt-0 sm:flex-row sm:items-center">
              <button
                onClick={() => navigate(-1)}
                className="block rounded-lg px-5 py-3 w-full bg-black text-white hover:bg-orange-500 hover:text-white transition duration-300"
                type="button"
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="flex flex-col items-center">
        <h2 className="text-lg font-bold text-white sm:text-xl">
          {submission.studentName}
        </h2>
        <h2 className="text-lg font-bold text-white sm:text-xl mb-4">
          Chance this is AI generated: {finalScore}%
        </h2>

        {Object.entries(submission)
          .filter(
            ([key]) => key.includes("_result") && key !== "comparison_results" && key !== "reverse_prompt_result"
          )
          .map(([key, result]) => (
            <article
              key={key}
              className="rounded-xl border-2 border-gray-100 bg-white p-6 overflow-hidden shadow-lg mb-4 max-w-4xl w-full"
            >
              <div className="flex items-start gap-4">
                <img
                  alt="Thinking icon"
                  src={thinking}
                  className="h-14 w-14 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold">{result.testName}</h3>
                  {result.description && (
                    <p className="text-sm text-gray-700 mt-2">
                      {result.description}
                    </p>
                  )}
                  {result.response && (
                    <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">
                      {result.response}
                    </p>
                  )}
                  {typeof result.prediction !== "undefined" && (
                    <p className="text-sm text-gray-700 mt-2">
                      Prediction: {result.prediction ? "AI-generated" : "Human-written"}
                    </p>
                  )}
                  {(key === "ai_model_result" ||
                    key === "reverse_prompt_result") &&
                    result.testName !== "AskGPT" &&
                    result.testName !== "MetadataAnalysis" && (
                    <div className="flex justify-end mt-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-white ${
                          (key === "ai_model_result" &&
                            isPassForAIModelAnalysis(result)) ||
                          (key === "reverse_prompt_result" &&
                            isPassForReversePrompt(result))
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      >
                        <span>
                          {(key === "ai_model_result" &&
                            isPassForAIModelAnalysis(result)) ||
                          (key === "reverse_prompt_result" &&
                            isPassForReversePrompt(result))
                            ? "Likely Human"
                            : "Likely AI"}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        {submission.reverse_prompt_result && (
          <article className="rounded-xl border-2 border-gray-100 bg-white p-6 overflow-hidden shadow-lg mb-4 max-w-4xl w-full">
            <div className="flex items-start gap-4">
              <img
                alt="Thinking icon"
                src={thinking}
                className="h-14 w-14 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-semibold">
                  {submission.reverse_prompt_result.testName}
                </h3>
                <p className="text-sm text-gray-700 mt-2">
                  {submission.reverse_prompt_result.description}
                </p>
                <div className="mt-4">
                  <h4 className="font-semibold">Comparison Results:</h4>
                  {Object.entries(
                    submission.reverse_prompt_result.comparison_results
                  )
                    .filter(([key]) => displayConfig[key])
                    .map(([key, value]) => (
                      <div key={key} className="mt-2">
                        <h5 className="text-sm font-semibold">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </h5>
                        <p className="text-xs">
                          GPT Recreation: {value["GPT Recreation"].toFixed(2)}
                        </p>
                        <p className="text-xs">
                          Your Text: {value["Your text"].toFixed(2)}
                        </p>
                        <p className="text-xs">
                          Similarity (%): {value["Similarity (%)"].toFixed(2)}
                        </p>
                      </div>
                    ))}
                  {displayConfig.cosineSimilarity &&
                    submission.reverse_prompt_result.comparison_results
                      .cosineSimilarity && (
                      <div className="mt-4">
                        <h4 className="font-semibold">Cosine Similarity:</h4>
                        <p className="text-xs">
                          {submission.reverse_prompt_result.comparison_results.cosineSimilarity.toFixed(
                            2
                          )}
                        </p>
                      </div>
                    )}
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <span
                className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-white ${
                  isPassForReversePrompt(submission.reverse_prompt_result) ? "bg-green-500" : "bg-red-500"
                }`}
              >
                <span>
                  {isPassForReversePrompt(submission.reverse_prompt_result) ? "Likely Human" : "Likely AI"}
                </span>
              </span>
            </div>
          </article>
        )}
      </main>
    </div>
  );
}

export default Results;
