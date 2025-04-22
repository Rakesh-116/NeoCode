import React, { useEffect } from "react";
import { RxCross2 } from "react-icons/rx";
import Editor from "@monaco-editor/react";
import { Oval } from "react-loader-spinner";
import { Link } from "react-router-dom";
import JSConfetti from "js-confetti";

import Button from "../../Common/Button";

const renderLoader = (height = 50, width = 50) => (
  <Oval
    height={height}
    width={width}
    color="#4fa94d"
    strokeWidth={4}
    strokeWidthSecondary={4}
  />
);

const SubmissionModal = ({
  submissionResult,
  editorRef,
  language,
  theme,
  setOpenModal,
  setOutputValue,
}) => {
  language = language || submissionResult.language;
  const sourceCode = editorRef?.current?.getValue() || submissionResult.code;
  const title = submissionResult?.problem_title || null;
  const problemId = submissionResult?.problem_id || null;

  console.log(submissionResult);

  const jsConfetti = new JSConfetti();

  useEffect(() => {
    const path = window.location.pathname;

    if (submissionResult?.verdict === "ACCEPTED" && path !== "/submissions") {
      const emojis = ["🌈", "⚡️", "💥", "✨", "💫", "🌸", "🎉", "🔥"];
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

      jsConfetti.addConfetti({
        emojis: [randomEmoji],
        confettiNumber: 150,
      });
    }
  }, [submissionResult?.verdict]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-2/3 text-center">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            Submission{" "}
            {title && (
              <>
                for{" "}
                <Link
                  to={{
                    pathname: `/problems/${problemId}`,
                    state: {
                      submissionCode: sourceCode,
                      submissionLanguage: language,
                    },
                  }}
                  className="font-mono text-green-500"
                >
                  '{title}'
                </Link>
              </>
            )}
          </h2>
          <Button
            className="text-white"
            onClick={() => {
              setOpenModal(false);
              {
                setOutputValue && setOutputValue(null);
              }
            }}
          >
            <RxCross2 />
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-600">
            <thead>
              <tr className="bg-gray-700">
                <th className="border border-gray-600 px-4 py-2">Verdict</th>
                <th className="border border-gray-600 px-4 py-2">Language</th>
                <th className="border border-gray-600 px-4 py-2">Time</th>
                <th className="border border-gray-600 px-4 py-2">
                  Submission Id
                </th>
                <th className="border border-gray-600 px-4 py-2">
                  Subtask Info
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-800">
                <td className="border border-gray-600 px-4 py-2 text-[12px]">
                  {submissionResult ? (
                    <h1
                      className={`font-bold ${
                        submissionResult.verdict === "ACCEPTED"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {submissionResult.verdict}
                    </h1>
                  ) : (
                    <div className="flex justify-center">
                      {renderLoader(30, 30)}
                    </div>
                  )}
                </td>
                <td className="border border-gray-600 px-4 py-2 text-[12px]">
                  {language.toUpperCase()}
                </td>
                <td className="border border-gray-600 px-4 py-2 text-[12px]">
                  {new Date().toLocaleString()}
                </td>
                <td className="border border-gray-600 px-4 py-2 text-[12px]">
                  {submissionResult ? (
                    submissionResult.id || submissionResult.submissionDetails.id
                  ) : (
                    <div className="flex justify-center">
                      {renderLoader(30, 30)}
                    </div>
                  )}
                </td>
                <td className="border border-gray-600 px-4 py-2 text-[12px]">
                  {submissionResult ? (
                    submissionResult.subtaskInfo ||
                    `${submissionResult.passedTestcases} /
                      ${submissionResult.totalTestcases}`
                  ) : (
                    <div className="flex justify-center">
                      {renderLoader(30, 30)}
                    </div>
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="my-4">
            <Editor
              height="60vh"
              width="100%"
              language={language}
              theme={theme}
              value={sourceCode}
              options={{
                fontSize: 16,
                minimap: { enabled: false },
                readOnly: true,
                padding: { top: 10, bottom: 10 },
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionModal;
