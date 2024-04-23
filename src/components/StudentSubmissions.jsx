import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

function StudentSubmissions() {
  const navigate = useNavigate();
  const location = useLocation();
  const { submissions } = location.state; // Assuming submissions are passed in location.state

  const handleSubmissionClick = (submission) => {
    console.log("Submission clicked", submission);
    navigate("/results", { state: { submission } }); // Navigate to Results component with the submission state
  };

  return (
    <div className="App">
      <header>
        <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 h-32">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl text-white font-bold sm:text-3xl">
                Class Submissions
              </h1>
            </div>
            <div className="mt-4 flex flex-col gap-4 sm:mt-0 sm:flex-row sm:items-center">
              <button
                onClick={() => navigate(-1)}
                className="block rounded-lg px-5 py-3  bg-black text-white hover:bg-orange-500 hover:text-white transition duration-300"
                type="button"
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      </header>
      <main
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <fieldset className="space-y-4 w-full max-w-2xl">
          <legend className="sr-only">Submissions</legend>
          {submissions.map((submission, index) => (
            <div
              key={index}
              className="flex cursor-pointer h-16 items-center justify-between gap-4 rounded-lg  bg-white p-4 text-sm font-medium shadow-sm hover:bg-orange-500 hover:text-white"
              onClick={() => handleSubmissionClick(submission)}
            >
              <p>{submission.assignmentName}</p>
              <p>{submission.studentName}</p>
            </div>
          ))}
        </fieldset>
      </main>
    </div>
  );
}

export default StudentSubmissions;
