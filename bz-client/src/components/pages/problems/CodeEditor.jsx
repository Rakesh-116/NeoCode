import React, { useRef, useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Oval } from "react-loader-spinner";
import { RxCross2 } from "react-icons/rx";
import { CiPlay1 } from "react-icons/ci";
import { RiResetLeftLine } from "react-icons/ri";

import { languages, themes, defaultCode } from "../../Common/constants";
import SubmissionModal from "../Submissions/SubmissionViewPage.jsx";
import Button from "../../Common/Button";

const CodeEditor = ({
  problemId,
  title,
  sampleIO,
  prohibitedKeys,
  solution,
  openEditorData,
}) => {
  const editorRef = useRef(null);
  const navigate = useNavigate();

  const [language, setLanguage] = useState(languages[1]);
  const [theme, setTheme] = useState("vs-dark");
  const [codeValues, setCodeValues] = useState({ ...defaultCode });
  const [customInput, setCustomInput] = useState("");
  const [inputDisplay, setInputDisplay] = useState("si1");
  const [isHovered, setIsHovered] = useState(null);
  const [outputValue, setOutputValue] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isCodeRunning, setIsCodeRunning] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [openProhibitedKeyModal, setOpenProhibitedKeyModal] = useState(false);

  const [isFromOpenEditor, setIsFromOpenEditor] = useState(false);

  useEffect(() => {
    if (openEditorData && openEditorData.code && openEditorData.language) {
      const { code, language } = openEditorData;
      setCodeValues((prev) => ({
        ...prev,
        [language]: code,
      }));
      setLanguage(language);
    } else {
      setCodeValues(codeValues);
    }
  }, [openEditorData]);

  // useEffect(() => {
  //   setCodeValues(codeValues);
  //   console.log("cdscs: ", codeValues[language]);
  // }, [language]);

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

  const selectedInputValue =
    inputDisplay === "custom" ? customInput : sampleIO.input || "";

  const handleCustomInputChange = (e) => {
    setCustomInput(e.target.value);
  };

  const handleLanguageChange = (e) => {
    setCodeValues((prev) => ({
      ...prev,
      [language]: editorRef.current.getValue(),
    }));
    setLanguage(e.target.value);
  };

  const checkForProhibitedKeys = (sourceCode, language) => {
    if (!language || !prohibitedKeys[language]) return false;

    const pkeyArray = prohibitedKeys[language].split(",");

    for (let i = 0; i < pkeyArray.length; i++) {
      if (sourceCode.includes(pkeyArray[i].trim())) return true;
    }
    return false;
  };

  const renderProhibitedKeyModal = () => {
    return (
      <div className="fixed inset-0 flex items-start justify-center bg-black bg-opacity-60 z-50">
        <div className="bg-gray-800 mt-32 text-white p-6 rounded-lg shadow-lg w-2/3 text-center">
          <div className="flex justify-between">
            <h1 className="text-xl font-semibold">Prohibited Key Detected</h1>
            <Button
              className="text-white"
              onClick={() => {
                setOpenProhibitedKeyModal(false);
              }}
            >
              <RxCross2 />
            </Button>
          </div>
          <h1 className="text-start mt-6">
            Do not use any prohibited keys mentioned, you are using{" "}
            <span className="text-red-600">'{prohibitedKeys[language]}'</span>{" "}
            in your code
          </h1>
        </div>
      </div>
    );
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
    console.log(solution);
    const sourceCode = editorRef.current.getValue();

    if (prohibitedKeys !== null) {
      if (checkForProhibitedKeys(sourceCode, language)) {
        setOpenProhibitedKeyModal(true);
        return;
      }
    }

    const token = Cookies.get("neo_code_jwt_token");
    // if (!token) {
    //   navigate("/login");
    //   return;
    // }
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

    try {
      setIsCodeRunning(true);

      const response = await axios.post(
        `${API_BASE_URL}/api/problem/execute`,
        {
          sourceCode,
          language,
          input: selectedInputValue,
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

  const submitCode = async () => {
    setSubmissionResult(null);
    const sourceCode = editorRef.current.getValue();
    if (prohibitedKeys !== null) {
      if (checkForProhibitedKeys(sourceCode)) {
        setOpenProhibitedKeyModal(true);
        return;
      }
    }
    // console.log(sourceCode, language, selectedInputValue);
    const token = Cookies.get("neo_code_jwt_token");
    // if (!token) {
    //   navigate("/login");
    //   return;
    // }
    console.log("JWT Token:", token);
    console.log("si:", selectedInputValue);
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
    try {
      setOpenModal(true);
      const response = await axios.post(
        `${API_BASE_URL}/api/problem/submit`,
        {
          problemId,
          sourceCode,
          language,
          input: selectedInputValue,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response);
      const finalResult = response.data;
      console.log("luffy final:", finalResult);
      setSubmissionResult(finalResult);
    } catch (error) {
      console.error("Error: ", error);
      setOutputValue(error.response.data);
      setSubmissionResult(error.response.data);
      setIsCodeRunning(false);
      // JWT token is present in cookies but it is expired, so instead of refreshing the token, we are asking the user to login again, so the new token will re-initialized to exporation time
      // All the expiration error will have status code of 405
      if (error.response.status === 405) {
        navigate("/login");
      }
    }
  };

  const getExpectedOutput = async () => {
    const token = Cookies.get("neo_code_jwt_token");
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
    try {
      setIsCodeRunning(true);
      const response = await axios.post(
        `${API_BASE_URL}/api/problem/get-expected-output`,
        {
          problemId,
          input: selectedInputValue,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOutputValue(response.data.output);
      console.log(response);
      setIsCodeRunning(false);
    } catch (error) {
      setOutputValue(error.response.data.message.message);
      setIsCodeRunning(false);
      if (error.response.status === 405) {
        navigate("/login");
      }
    }
  };
  //   console.log(submissionResult);
  //   const sourceCode = editorRef.current.getValue();
  //   return (
  //     <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
  //       <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-2/3 text-center">
  //         <div className="flex justify-between items-center mb-6">
  //           <h2 className="text-xl font-semibold">Submission</h2>
  //           <Button
  //             className="text-white"
  //             onClick={() => {
  //               setOpenModal(false);
  //               setOutputValue(null);
  //             }}
  //           >
  //             <RxCross2 />
  //           </Button>
  //         </div>
  //         <div className="overflow-x-auto">
  //           <table className="w-full border-collapse border border-gray-600">
  //             <thead>
  //               <tr className="bg-gray-700">
  //                 <th className="border border-gray-600 px-4 py-2">Verdict</th>
  //                 <th className="border border-gray-600 px-4 py-2">Language</th>
  //                 <th className="border border-gray-600 px-4 py-2">Time</th>
  //                 <th className="border border-gray-600 px-4 py-2">
  //                   Submission Id
  //                 </th>
  //                 <th className="border border-gray-600 px-4 py-2">
  //                   Subtask Info
  //                 </th>
  //               </tr>
  //             </thead>
  //             <tbody>
  //               <tr className="bg-gray-800">
  //                 <td className="border border-gray-600 px-4 py-2 text-[12px]">
  //                   {submissionResult ? (
  //                     <h1
  //                       className={`font-bold ${
  //                         submissionResult.verdict === "ACCEPTED"
  //                           ? "text-green-500"
  //                           : "text-red-500"
  //                       }`}
  //                     >
  //                       {submissionResult.verdict}
  //                     </h1>
  //                   ) : (
  //                     <div className="flex justify-center">
  //                       {renderLoader(30, 30)}
  //                     </div>
  //                   )}
  //                 </td>
  //                 <td className="border border-gray-600 px-4 py-2 text-[12px]">
  //                   {language.toUpperCase()}
  //                 </td>
  //                 <td className="border border-gray-600 px-4 py-2 text-[12px]">
  //                   {new Date().toLocaleString()}
  //                 </td>
  //                 <td className="border border-gray-600 px-4 py-2 text-[12px]">
  //                   {submissionResult ? (
  //                     submissionResult.id
  //                   ) : (
  //                     <div className="flex justify-center">
  //                       {renderLoader(30, 30)}
  //                     </div>
  //                   )}
  //                 </td>
  //                 <td className="border border-gray-600 px-4 py-2 text-[12px]">
  //                   {submissionResult ? (
  //                     submissionResult.subtaskInfo
  //                   ) : (
  //                     <div className="flex justify-center">
  //                       {renderLoader(30, 30)}
  //                     </div>
  //                   )}
  //                 </td>
  //               </tr>
  //             </tbody>
  //           </table>
  //           <div className="my-4">
  //             <Editor
  //               height="60vh"
  //               width="100%"
  //               language={language}
  //               theme={theme}
  //               value={sourceCode}
  //               options={{
  //                 fontSize: 16,
  //                 minimap: { enabled: false },
  //                 readOnly: true,
  //                 padding: { top: 10, bottom: 10 },
  //                 scrollBeyondLastLine: false,
  //               }}
  //             />
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // };

  const renderLoader = (height = 50, width = 50) => (
    <Oval
      height={height}
      width={width}
      color="#4fa94d"
      strokeWidth={4}
      strokeWidthSecondary={4}
    />
  );

  // useEffect(() => {
  //   const defaultCode = codeValues[language] || "";

  //   const codeObject = {
  //     title: title,
  //     problemCode: defaultCode,
  //     selectedLanguage: language,
  //   };

  //   const storedList = JSON.parse(localStorage.getItem("storedDataList")) || [];

  //   const existingIndex = storedList.findIndex(
  //     (item) => item.title === title && item.selectedLanguage === language
  //   );

  //   if (existingIndex === -1) {
  //     storedList.push(codeObject);
  //     localStorage.setItem("storedDataList", JSON.stringify(storedList));
  //   }
  // }, [title, language]);

  // useEffect(() => {
  //   const storedList = JSON.parse(localStorage.getItem("storedDataList")) || [];
  //   const savedCode = storedList.find(
  //     (item) => item.title === title && item.selectedLanguage === language
  //   );

  //   if (savedCode) {
  //     setCodeValues((prev) => ({
  //       ...prev,
  //       [language]: savedCode.problemCode,
  //     }));
  //   }
  // }, [language]);

  return (
    <div className="flex flex-col h-full w-full rounded-md px-4">
      <div className="flex justify-center items-center w-full h-full">
        {openProhibitedKeyModal && renderProhibitedKeyModal()}
        {openModal && (
          <SubmissionModal
            submissionResult={submissionResult}
            editorRef={editorRef}
            language={language}
            theme={theme}
            setOpenModal={setOpenModal}
            setOutputValue={setOutputValue}
          />
        )}
      </div>
      <div className="w-full flex flex-col">
        <div className="px-4 bg-black border-b border-white/20 rounded-t-xl h-16 flex gap-4 items-center">
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
          <button
            onMouseEnter={() => setIsHovered("reset")}
            onMouseLeave={() => setIsHovered(null)}
            className="outline-none"
          >
            <RiResetLeftLine className="text-white" />
            <p
              className={`bg-black text-white px-2 py-1 rounded-md absolute z-20 text-xs  ${
                isHovered === "reset" ? "" : "hidden"
              }`}
            >
              Reset Code
            </p>
          </button>
        </div>

        <div className="rounded-lg scroll-smooth h-[60vh] w-full">
          <Editor
            height="100%"
            width="100%"
            language={language}
            theme={theme}
            value={codeValues[language] || ""}
            onChange={(value) => {
              const codeObject = {
                title: title,
                problemCode: value,
                selectedLanguage: language,
              };

              const storedList =
                JSON.parse(localStorage.getItem("storedDataList")) || [];

              // Check if an entry with the same title and language exists
              const existingIndex = storedList.findIndex(
                (item) =>
                  item.title === title && item.selectedLanguage === language
              );

              if (existingIndex !== -1) {
                // Update existing entry
                storedList[existingIndex].problemCode = value;
              } else {
                // Add new entry
                storedList.push(codeObject);
              }

              localStorage.setItem(
                "storedDataList",
                JSON.stringify(storedList)
              );

              setCodeValues((prev) => ({ ...prev, [language]: value }));
            }}
            onMount={onMount}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              padding: { top: 10, bottom: 10 },
              scrollBeyondLastLine: false,
            }}
          />
        </div>
        <div className="px-4 py-2 bg-black border-t border-white/20 rounded-b-xl h-14 mb-2">
          <div className="flex justify-between items-center">
            <select
              id="inputType"
              className="rounded p-[6px] bg-white/10 text-white"
              value={inputDisplay}
              onChange={(e) => setInputDisplay(e.target.value)}
            >
              <option value="custom" className="text-black">
                CUSTOM INPUT
              </option>
              <option value="si1" className="text-black">
                SAMPLE INPUT 1
              </option>
            </select>
            {solution && (
              <button
                className={`p-2 rounded-lg border border-white/50 flex justify-center items-center outline-none hover:border-white text-white transition-all duration-300 ${
                  inputDisplay === "custom" ? "block" : "hidden"
                }`}
                onClick={() => getExpectedOutput()}
              >
                <CiPlay1 className="transition-all duration-300 text-green-400" />
                <p className="px-2 py-[2px] text-xs ">Expected Output</p>
              </button>
            )}
            <div className="flex gap-4">
              <Button
                className={`${
                  isCodeRunning
                    ? "bg-slate-500 text-slate-800"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white px-[12px] py-[6px]`}
                onClick={() => runCode()}
                disabled={isCodeRunning}
              >
                Run
              </Button>
              <Button
                className={`${
                  isCodeRunning
                    ? "bg-slate-500 text-slate-800"
                    : "bg-green-500 hover:bg-green-600"
                } text-white px-[12px] py-[6px]`}
                disabled={isCodeRunning}
                onClick={() => submitCode()}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="relative">
        {/* Loader */}

        {isCodeRunning && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 z-10">
            {" "}
            {renderLoader()}
          </div>
        )}

        <div className={``}>
          <textarea
            value={selectedInputValue}
            onChange={
              inputDisplay === "custom" ? handleCustomInputChange : undefined
            }
            className="bg-slate-500 my-2 rounded-lg p-2 h-[100px] w-full text-white"
            disabled={inputDisplay !== "custom"}
          />

          <p className="text-[20px] font-semibold mt-2">Output</p>

          <textarea
            value={outputValue ?? ""}
            readOnly
            className={`my-2 rounded-lg p-2 w-full h-20 outline-none text-white ${
              outputValue === null
                ? "bg-slate-500"
                : outputValue === sampleIO.output
                ? "bg-green-400"
                : "bg-red-400"
            }`}
          />

          {/* <div className="bg-slate-600 py-2 px-3 rounded-md my-2">
            <pre
              className={`${
                outputValue === sampleIO.output.trimEnd()
                  ? "bg-green-400"
                  : "bg-red-400"
              }`}
            >
              {console.log(sampleIO.output)}
              {console.log(outputValue.trimEnd())}
              {console.log(sampleIO.output === outputValue.trimEnd())}
            </pre>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;

// import java.util.*;

// class NeoCode {
//     public static void main(String[] args){
//         Scanner sc = new Scanner(System.in);
//         int t = sc.nextInt();
//         while(t-->0){
//             int a = sc.nextInt();
//             int b = sc.nextInt();
//             System.out.println(Math.abs(-a-b));
//         }
//     }
// }
