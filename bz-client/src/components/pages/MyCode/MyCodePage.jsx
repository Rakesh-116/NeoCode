import { Editor } from "@monaco-editor/react";
import { useRef, useState, useEffect } from "react";
import Header from "../Header";
import { useLocation, useNavigate } from "react-router-dom";

import { RxCross2 } from "react-icons/rx";
import { languages, themes, defaultCode } from "../../Common/constants";
import axios from "axios";
import Cookies from "js-cookie";
import { Oval } from "react-loader-spinner";

const MyCodePage = () => {
  const { state } = useLocation();
  const editorRef = useRef(null);
  const [language, setLanguage] = useState(state?.language || languages[1]);
  const [codeValues, setCodeValues] = useState({ ...defaultCode });
  const [theme, setTheme] = useState("vs-dark");
  const [customInput, setCustomInput] = useState("");
  const [outputValue, setOutputValue] = useState(null);
  const [isCodeRunning, setIsCodeRunning] = useState(false);
  const [openSubmitFormModal, setOpenSubmitFormModal] = useState(false);
  const navigate = useNavigate();
  const [snippetData, setSnippetData] = useState({
    title: state?.title || "",
    explanation: state?.explanation || "",
  });
  const [openWarningModal, setOpenWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [titleValue, setTitleValue] = useState(state?.title || null);
  const [explanationValue, setExplanationValue] = useState(
    state?.explanation || null
  );

  useEffect(() => {
    if (state?.sourceCode) {
      setCodeValues((prev) => ({
        ...prev,
        [state.language]: state.sourceCode,
      }));
    }
    if (state?.title) {
      setTitleValue(state.title);
    }
    if (state?.explanation) {
      setExplanationValue(state.explanation);
    }
  }, [state]);

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();

    // Let scroll bubble up when there's no scroll in editor
    const domNode = editor.getDomNode();
    if (domNode) {
      domNode.addEventListener(
        "wheel",
        (e) => {
          const target = e.currentTarget;
          if (target) {
            const { scrollHeight, clientHeight, scrollTop } = target;
            const atTop = scrollTop === 0 && e.deltaY < 0;
            const atBottom = scrollTop + clientHeight >= scrollHeight;

            if (atTop || atBottom) {
              e.preventDefault();
              e.stopPropagation();
              window.scrollBy(0, e.deltaY);
            }
          }
        },
        { passive: false }
      );
    }
  };

  const handleLanguageChange = (e) => {
    setCodeValues((prev) => ({
      ...prev,
      [language]: editorRef.current.getValue(),
    }));
    setLanguage(e.target.value);
  };

  const sanitizeError = (errorOutput, language) => {
    if (language === "python") {
      let sanitized = errorOutput.replace(
        /\/?sandbox\/.*?\/NeoCode\.py/g,
        "main.py"
      );

      sanitized = sanitized.replace(/line (\d+)/g, (_, lineNum) => {
        const adjusted = parseInt(lineNum) - 11;
        return `line ${adjusted > 0 ? adjusted : 1}`;
      });

      return sanitized;
    } else if (language === "cpp") {
      return errorOutput
        .replace(/\/?sandbox\/.*?\/NeoCode\.cpp/g, "main.cpp")
        .replace(/NeoCode\.out/g, "main.out");
    } else if (language === "java") {
      return errorOutput
        .replace(/\/?sandbox\/.*?\/NeoCode\.java/g, "Main.java")
        .replace(/NeoCode\.java/g, "Main.java") // fallback if path is trimmed
        .replace(/NeoCode/g, "Main"); // adjust class name if it appears in errors
    }

    return errorOutput;
  };

  const runCode = async () => {
    const sourceCode = editorRef.current.getValue();
    const token = Cookies.get("neo_code_jwt_token");
    try {
      setIsCodeRunning(true);
      setOutputValue(null);
      console.log(language);
      const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
      const response = await axios.post(
        `${API_BASE_URL}/api/problem/execute`,
        {
          sourceCode,
          language,
          input: customInput,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data.output);
      const sanitizedOutput = sanitizeError(response.data.output, language);
      setOutputValue(sanitizedOutput);
      setIsCodeRunning(false);
    } catch (error) {
      console.log(error);
      const rawError = error?.response?.data?.error || "Unknown error occurred";
      console.error("Error: ", rawError);
      const sanitizedError = sanitizeError(rawError, language);
      setOutputValue(sanitizedError);
      setIsCodeRunning(false);
      if (error.response?.status === 405) {
        navigate("/login");
      }
    }
  };

  const handleSnippetInputChange = (e) => {
    const { name, value } = e.target;
    setSnippetData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveSnippet = async () => {
    const sourceCode = editorRef.current.getValue();

    if (!snippetData.title.trim()) {
      setWarningMessage("Please enter a title for your snippet.");
      setOpenWarningModal(true);
      return;
    }

    const token = Cookies.get("neo_code_jwt_token");
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/snippets/save`,
        {
          ...snippetData,
          sourceCode,
          language,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOpenSubmitFormModal(false);
      setSnippetData({
        title: "",
        explanation: "",
      });
      console.log(response.data.result);
      setTitleValue(response.data.result.title);
      setExplanationValue(response.data.result.explanation);
    } catch (error) {
      console.log(error);
      if (error.response?.status === 405) {
        Cookies.remove("neo_code_jwt_token");
        navigate("/login");
      }
    }
  };

  const renderLoader = (height = 50, width = 50) => (
    <Oval
      height={height}
      width={width}
      color="#4fa94d"
      strokeWidth={4}
      strokeWidthSecondary={4}
    />
  );

  const renderOpenSubmitFormModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
        <div className="w-1/3 h-2/3 bg-gray-800 text-white rounded-lg p-4">
          <div className="flex justify-between items-center my-2">
            <h1 className="font-semibold text-xl">Save Snippet</h1>
            <button
              className="text-white"
              onClick={() => {
                setOpenSubmitFormModal(false);
                setSnippetData({
                  title: "",
                  explanation: "",
                });
              }}
            >
              <RxCross2 />
            </button>
          </div>
          <div className="flex flex-col justify-center items-center">
            <div className="w-full my-2">
              <label htmlFor="title" className="text-lg">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                name="title"
                placeholder="Title here.."
                className="w-full rounded-md px-[10px] py-[6px] outline-none border-none text-[18px] text-black"
                value={snippetData.title}
                onChange={handleSnippetInputChange}
              />
            </div>
            <div className="w-full my-2">
              <label htmlFor="explanation" className="text-lg">
                Explanation
              </label>
              <textarea
                id="explanation"
                name="explanation"
                placeholder="Explain your code here..."
                className="w-full rounded-md px-[10px] py-[6px] outline-none border-none text-[18px] text-black min-h-[300px]"
                value={snippetData.explanation}
                onChange={handleSnippetInputChange}
              />
            </div>
            <button
              onClick={handleSaveSnippet}
              className="mt-4 w-full bg-indigo-600 text-white rounded-md px-[12px] py-[8px] text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderWarningModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
        <div className="w-1/3 bg-gray-800 text-white rounded-lg p-4">
          <div className="flex justify-between items-center my-2">
            <h1 className="font-semibold text-xl">Warning</h1>
            <button
              className="text-white"
              onClick={() => setOpenWarningModal(false)}
            >
              <RxCross2 />
            </button>
          </div>
          <div className="flex flex-col justify-center items-center p-4">
            <p className="text-center mb-4">{warningMessage}</p>
            <button
              onClick={() => setOpenWarningModal(false)}
              className="bg-indigo-600 text-white rounded-md px-[12px] py-[8px] text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleSnippetSaveModal = () => {
    const sourceCode = editorRef.current.getValue();

    // Input validation
    if (!sourceCode.trim()) {
      setWarningMessage("Please write some code before saving the snippet.");
      setOpenWarningModal(true);
      return;
    }
    setOpenSubmitFormModal(true);
  };

  return (
    <div className="bg-black/95 min-h-screen">
      {openSubmitFormModal && renderOpenSubmitFormModal()}
      {openWarningModal && renderWarningModal()}
      <Header />
      <div className="mt-28 px-10">
        <div className="flex items-center gap-4">
          <div className="w-1/2">
            <div className="px-4 bg-black border-b border-white/20 rounded-t-xl h-16 flex justify-between">
              <div className="flex items-center gap-4">
                <button
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white rounded-md px-[12px] py-[6px] text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
                  onClick={() => handleSnippetSaveModal()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                    />
                  </svg>
                  Save Snippet
                </button>
              </div>
              <div className="flex items-center gap-4">
                <select
                  id="language"
                  value={language}
                  onChange={handleLanguageChange}
                  className="rounded p-[6px] bg-white/10 text-white"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang} className="text-black">
                      {lang.toUpperCase()}
                    </option>
                  ))}
                </select>

                <select
                  id="theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="rounded p-[6px] bg-white/10 text-white"
                >
                  {themes.map((theme) => (
                    <option key={theme} value={theme} className="text-black">
                      {theme.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Editor
              height="60vh"
              width="100%"
              language={language}
              theme={theme}
              value={codeValues[language] || ""}
              onChange={(value) =>
                setCodeValues((prev) => ({ ...prev, [language]: value }))
              }
              onMount={onMount}
              options={{
                fontSize: 16,
                minimap: { enabled: false },
                padding: { top: 10, bottom: 10 },
                scrollBeyondLastLine: false,
              }}
            />
            <div className="bg-black rounded-b-xl h-16 flex justify-end items-center px-4 border-t border-white/20">
              <button
                onClick={runCode}
                disabled={isCodeRunning}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white rounded-md px-[12px] py-[6px] text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
              >
                {isCodeRunning ? "Running..." : "Run Code"}
              </button>
            </div>
          </div>
          <div className="w-1/2 flex flex-col gap-4 h-[60vh]">
            {titleValue && (
              <div className="rounded p-[6px] bg-white/10 text-white text-sm w-fit">
                <h1>{titleValue}</h1>
              </div>
            )}
            <div className="relative h-1/2">
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Enter your input here..."
                className="bg-slate-500 rounded-lg p-2 h-full w-full text-white outline-none"
              />
            </div>
            <div className="relative h-1/2">
              {isCodeRunning && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 z-10">
                  {renderLoader()}
                </div>
              )}
              <textarea
                value={outputValue ?? ""}
                readOnly
                placeholder="Output will appear here..."
                className="bg-slate-500 rounded-lg p-2 h-full w-full text-white outline-none"
              />
            </div>
          </div>
        </div>
        {explanationValue && (
          <div className="py-4 mt-4">
            <h1 className="text-white font-medium text-xl">Description</h1>
            <p className="text-white px-4 py-2 bg-gray-700 rounded-md my-2">
              {explanationValue}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCodePage;
