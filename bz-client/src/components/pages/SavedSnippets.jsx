import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { LuTrash2 } from "react-icons/lu";
import { RxCross2 } from "react-icons/rx";
import { Oval } from "react-loader-spinner";

import Header from "./Header";

const savedSnippetsApiStatusConstant = {
  initial: "INITIAL",
  inProgress: "IN_PROGRESS",
  success: "SUCCESS",
  failure: "FAILURE",
};

const SnippetCard = ({ snippet, onDelete }) => {
  const navigate = useNavigate();
  const [openWarningModal, setOpenWarningModal] = useState(false);

  const handleGoToSnippet = () => {
    navigate("/compiler", {
      state: {
        title: snippet.title,
        sourceCode: snippet.code,
        explanation: snippet.explanation,
        language: snippet.language,
      },
    });
  };

  const confirmDeleteSnippet = (id) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
        <div className="w-1/3 bg-gray-800 text-white rounded-lg p-4">
          <div className="flex justify-between items-center my-2">
            <h1 className="font-semibold text-xl">Confirm</h1>
            <button
              className="text-white"
              onClick={() => setOpenWarningModal(false)}
            >
              <RxCross2 />
            </button>
          </div>
          <div className="flex flex-col justify-center items-center p-4">
            <p className="text-center mb-4">
              Are sure you want to delete this snippet ?
            </p>
            <div className="flex space-x-3 items-center">
              <button
                onClick={() => {
                  onDelete(id);
                  setOpenWarningModal(false);
                }}
                className="bg-indigo-600 text-white rounded-md px-[12px] py-[8px] text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
              >
                YES
              </button>
              <button
                onClick={() => setOpenWarningModal(false)}
                className="bg-gray-600 text-white rounded-md px-[12px] py-[8px] text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
              >
                NO
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-black/70 border border-white/20 p-4 text-white w-[260px] h-[160px] rounded-lg shadow-lg flex flex-col justify-between">
      {openWarningModal && confirmDeleteSnippet(snippet.id)}
      <div className="flex justify-between">
        <h1 className="font-semibold font-mono">{snippet.title}</h1>
        <button
          onClick={() => setOpenWarningModal(true)}
          className="text-red-500 border border-red-500 rounded-lg p-1 hover:text-red-600 transition-colors duration-300 self-start"
        >
          <LuTrash2 />
        </button>
      </div>
      <div>
        <h1>
          Language: <span>{snippet.language}</span>
        </h1>
        <h1>{new Date(snippet.updated_at).toDateString()}</h1>
      </div>
      <button
        onClick={handleGoToSnippet}
        className="mt-1 border border-blue-500 rounded-lg px-2 py-1 text-sm text-blue-500 hover:bg-blue-500 hover:text-white transition-colors duration-300"
      >
        Go to Snippet
      </button>
    </div>
  );
};

const SavedSnippets = () => {
  const [apiStatus, setApiStatus] = useState(
    savedSnippetsApiStatusConstant.initial
  );
  const [savedSnippets, setSavedSnippets] = useState([]);

  const fetchSavedSnippets = async () => {
    setApiStatus(savedSnippetsApiStatusConstant.inProgress);
    const token = Cookies.get("neo_code_jwt_token");
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/snippets/get-all-snippets`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSavedSnippets(response.data.result);
      setApiStatus(savedSnippetsApiStatusConstant.success);
    } catch (error) {
      console.error("Error fetching saved snippets:", error);
      setApiStatus(savedSnippetsApiStatusConstant.failure);
    }
  };

  const handleDeleteSnippet = async (snippetId) => {
    const token = Cookies.get("neo_code_jwt_token");
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

    try {
      await axios.delete(
        `${API_BASE_URL}/api/snippets/delete-snippet/${snippetId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchSavedSnippets();
    } catch (error) {
      console.error("Error deleting snippet:", error);
    }
  };

  useEffect(() => {
    fetchSavedSnippets();
  }, []);

  const renderLoader = () => (
    <div className="flex justify-center items-center h-[200px]">
      <Oval
        height={50}
        width={50}
        color="#4fa94d"
        strokeWidth={4}
        strokeWidthSecondary={4}
      />
    </div>
  );

  const renderSuccess = () => (
    <div className="">
      {savedSnippets.length === 0 ? (
        <div className="flex justify-center">
          <h1 className="text-white/60">No Saved Snippets</h1>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {savedSnippets.map((snippet) => (
            <SnippetCard
              key={snippet.id}
              snippet={snippet}
              onDelete={handleDeleteSnippet}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderFailure = () => (
    <div className="text-center text-white mt-10">
      <h2 className="text-2xl font-semibold">Failed to fetch Saved Snippets</h2>
      <p className="text-lg">Please try again later.</p>
    </div>
  );

  const renderView = () => {
    switch (apiStatus) {
      case savedSnippetsApiStatusConstant.inProgress:
        return renderLoader();
      case savedSnippetsApiStatusConstant.success:
        return renderSuccess();
      case savedSnippetsApiStatusConstant.failure:
        return renderFailure();
      default:
        return null;
    }
  };

  return (
    <div>
      <Header />
      <div className="bg-black/95 min-h-screen pt-28 px-10">
        <h1 className="text-white text-3xl">Saved Snippets</h1>
        <div className="pt-4">{renderView()}</div>
      </div>
    </div>
  );
};

export default SavedSnippets;
