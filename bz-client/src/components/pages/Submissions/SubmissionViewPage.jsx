import React, { useEffect, useMemo, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import Editor from "@monaco-editor/react";
import { Oval } from "react-loader-spinner";
import { Link } from "react-router-dom";
import JSConfetti from "js-confetti";
import axios from "axios";
import Cookies from "js-cookie";

import Button from "../../Common/Button";
import ComplexityCache from "../../../utils/complexityCache";

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

  // Complexity analysis states
  const [complexity, setComplexity] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [complexityError, setComplexityError] = useState(null);
  
  const jsConfetti = useMemo(() => new JSConfetti(), []);
  const complexityCache = useMemo(() => new ComplexityCache(), []);

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

  const analyzeComplexity = async () => {
    if (!sourceCode || !language) {
      setComplexityError("Code or language not available");
      return;
    }

    setIsAnalyzing(true);
    setComplexityError(null);

    try {
      // Check cache first
      const cachedResult = complexityCache.getCachedComplexity(sourceCode, language);
      
      if (cachedResult.found) {
        setComplexity({
          complexity: cachedResult.complexity,
          fromCache: true,
          timestamp: cachedResult.timestamp
        });
        setIsAnalyzing(false);
        return;
      }

      // Make API call to analyze complexity
      const token = Cookies.get("neo_code_jwt_token");
      const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

      const response = await axios.post(
        `${API_BASE_URL}/api/complexity/analyze`,
        {
          code: sourceCode,
          language: language
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.success) {
        const result = {
          complexity: response.data.complexity,
          fromCache: false,
          timestamp: response.data.timestamp
        };
        
        setComplexity(result);
        
        // Cache the result
        complexityCache.setCachedComplexity(sourceCode, language, response.data.complexity);
      } else {
        setComplexityError(response.data.error || "Failed to analyze complexity");
      }
    } catch (error) {
      console.error("Complexity analysis error:", error);
      const errorMessage = error.response?.data?.error || error.message || "Failed to analyze complexity";
      setComplexityError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

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
                  to={`/problems/${problemId}?submission_id=${submissionResult.id}`}
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
                <th className="border border-gray-600 px-4 py-2">
                  Time Complexity
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
                    submissionResult.id ||
                    submissionResult.submissionDetails?.id
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
                <td className="border border-gray-600 px-4 py-2 text-[12px]">
                  <div className="flex flex-col items-center gap-2">
                    {complexity ? (
                      <div className="flex flex-col items-center">
                        <span className="font-mono text-blue-400 font-bold">
                          {complexity.complexity}
                        </span>
                        {complexity.fromCache && (
                          <span className="text-xs text-gray-400">cached</span>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={analyzeComplexity}
                        disabled={isAnalyzing}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                          isAnalyzing
                            ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                            : "bg-purple-600 hover:bg-purple-700 text-white"
                        }`}
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <span className="text-sm">✨</span>
                            Analyze
                          </>
                        )}
                      </button>
                    )}
                    {complexityError && (
                      <div className="text-xs text-red-400 text-center">
                        {complexityError}
                      </div>
                    )}
                  </div>
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
