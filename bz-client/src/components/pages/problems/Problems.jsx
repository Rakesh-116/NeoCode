import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { Oval } from "react-loader-spinner";
import { FiSearch } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";

import Header from "../Header";
import ProblemCard from "./ProblemCard.jsx";
import { useUser } from "../../../context/UserContext.jsx";
import { categoriesList, difficultyLevels } from "../../Common/constants.js";

const apiStatusConstant = {
  initial: "INITIAL",
  inProgress: "IN_PROGRESS",
  success: "SUCCESS",
  noData: "NO_DATA",
  failure: "FAILURE",
};

const Problems = () => {
  const [problems, setProblems] = useState([]);
  const [apiStatus, setApiStatus] = useState(apiStatusConstant.initial);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || ""
  );

  const navigate = useNavigate();
  const { userData } = useUser();

  // Read params
  const selectedCategoriesString = searchParams.get("categories") || "";
  const selectedCategories = selectedCategoriesString
    ? selectedCategoriesString.split(",")
    : [];
  const selectedDifficulty = searchParams.get("difficulty") || "";
  const searchQuery = searchParams.get("search") || "";

  const [modalOpen, setModalOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [toDeleteId, setToDeleteId] = useState(null);

  useEffect(() => {
    fetchProblems();
  }, [searchParams, userData]);

  const fetchProblems = async () => {
    setApiStatus(apiStatusConstant.inProgress);
    // const token = Cookies.get("neo_code_jwt_token");
    // if (!token) {
    //   navigate("/login");
    //   return;
    // }

    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

    try {
      const queryParams = new URLSearchParams();
      if (selectedCategoriesString) {
        queryParams.set("categories", selectedCategoriesString);
      }
      if (selectedDifficulty) {
        queryParams.set("difficulty", selectedDifficulty.toLowerCase());
      }
      if (searchQuery) {
        queryParams.set("search", searchQuery);
      }

      console.log(queryParams.toString());

      const response = await axios.get(
        `${API_BASE_URL}/api/problem/get-all?${queryParams.toString()}`
      );

      const updatedProblems = response.data.problems.filter(
        (item) => item.category !== "Web"
      );

      const finalProblems =
        userData?.role === "admin" ? response.data.problems : updatedProblems;

      setProblems(finalProblems);
      setApiStatus(apiStatusConstant.success);
    } catch (error) {
      console.error("Error fetching problems:", error);
      if (error.response?.status === 405) {
        handleUnauthorizedError();
      } else if (error.response?.status === 404) {
        setApiStatus(apiStatusConstant.noData);
      } else {
        setApiStatus(apiStatusConstant.failure);
      }
    }
  };

  const handleRequestDelete = (id, message) => {
    setToDeleteId(id);
    setWarningMessage(message);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    const token = Cookies.get("neo_code_jwt_token");
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
    try {
      await axios.delete(
        `${API_BASE_URL}/api/admin/problems/delete/${toDeleteId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await fetchProblems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnauthorizedError = () => {
    Cookies.remove("neo_code_jwt_token");
    navigate("/login");
  };

  const toggleCategory = (category) => {
    let updated = new Set(selectedCategories);
    if (updated.has(category)) {
      updated.delete(category);
    } else {
      updated.add(category);
    }

    const updatedArray = Array.from(updated);
    const updatedParams = new URLSearchParams(searchParams);

    if (updatedArray.length > 0) {
      updatedParams.set("categories", updatedArray.join(","));
    } else {
      updatedParams.delete("categories");
    }

    setSearchParams(updatedParams);
  };

  const handleDifficultyChange = (value) => {
    const updatedParams = new URLSearchParams(searchParams);
    if (value) {
      updatedParams.set("difficulty", value);
    } else {
      updatedParams.delete("difficulty");
    }
    setSearchParams(updatedParams);
  };

  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const updatedParams = new URLSearchParams(searchParams);
    if (searchInput) {
      updatedParams.set("search", searchInput);
    } else {
      updatedParams.delete("search");
    }
    setSearchParams(updatedParams);
  };

  const handleResetFilters = () => {
    setSearchParams({});
    setSearchInput("");
  };

  const onProblemSelect = (probId) => {
    navigate(`/problems/${probId}`);
  };

  const renderLoader = () => (
    <div className="flex justify-center items-center h-screen">
      <Oval height={50} width={50} color="#4fa94d" strokeWidth={4} />
    </div>
  );

  const renderProblemsFailure = () => (
    <div className="text-center text-white mt-10">
      <h2 className="text-2xl font-semibold">Failed to fetch problems</h2>
      <p className="text-lg">Please try again later.</p>
    </div>
  );

  const renderNoProblemsFound = () => (
    <div className="text-center text-white mt-10">
      <h2 className="text-2xl font-semibold">No Problems Found</h2>
      <p className="text-lg">Try adjusting your filters or search.</p>
    </div>
  );

  const renderProblemsSuccess = () => (
    <div className="px-[4%]">
      <ul>
        {problems.map((pro, index) => (
          <li key={index}>
            <ProblemCard
              problemDetails={pro}
              onProblemSelect={onProblemSelect}
              onRequestDelete={handleRequestDelete}
            />
          </li>
        ))}
      </ul>
    </div>
  );

  const renderProblemsComponent = () => {
    switch (apiStatus) {
      case apiStatusConstant.success:
        return renderProblemsSuccess();
      case apiStatusConstant.noData:
        return renderNoProblemsFound();
      case apiStatusConstant.failure:
        return renderProblemsFailure();
      case apiStatusConstant.inProgress:
        return renderLoader();
      default:
        return null;
    }
  };

  return (
    <div>
      <Header />
      <div className="bg-black/95 min-h-screen pt-20">
        <div className="px-[4%] pt-4">
          <h1 className="text-white text-2xl font-mono">Problems</h1>

          <form
            onSubmit={handleSearchSubmit}
            className="bg-black/70 px-2 py-1 my-3 border border-white/35 rounded-lg flex space-x-2 items-center"
          >
            <FiSearch className="text-white text-xl" />
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchInputChange}
              placeholder="Search for a problem"
              className="bg-slate-800 backdrop-blur-lg rounded-md w-full outline-none px-2 py-1 my-1 text-white"
            />
          </form>

          <div className="flex justify-between items-center space-x-4 relative mb-4">
            <div className="flex overflow-x-auto space-x-2 pr-4 scrollbar-hide">
              {categoriesList.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleCategory(item.name)}
                  className={`px-3 py-1 rounded-full border transition text-sm whitespace-nowrap ${
                    selectedCategories.includes(item.name)
                      ? "bg-white text-black font-semibold"
                      : "text-white/80 border-white/80 hover:bg-white/10"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>

            <div className="flex space-x-3 items-center shrink-0">
              {userData && userData.role === "admin" && (
                <button
                  className="px-3 py-1 rounded-md border border-gray-400 hover:bg-gray-700 text-white"
                  onClick={() => navigate("/newproblem")}
                >
                  Add New
                </button>
              )}
              <select
                value={selectedDifficulty}
                onChange={(e) => handleDifficultyChange(e.target.value)}
                className="bg-black/70 text-white border border-white/30 px-3 py-1 rounded-md outline-none cursor-pointer hover:border-white transition"
              >
                <option value="">All</option>
                {difficultyLevels.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <button
                onClick={handleResetFilters}
                className="px-3 py-1 rounded-md border border-gray-400 hover:bg-gray-700 text-white"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div>
          {renderProblemsComponent()}
          {modalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
              <div className="w-1/3 bg-gray-800 text-white rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="font-semibold text-xl">Confirm Delete</h1>
                  <button
                    className="text-white"
                    onClick={() => setModalOpen(false)}
                  >
                    <RxCross2 />
                  </button>
                </div>
                <p className="text-center mb-6">{warningMessage}</p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => {
                      handleConfirmDelete();
                      setModalOpen(false);
                      setToDeleteId(null);
                    }}
                    className="bg-indigo-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    YES
                  </button>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="bg-gray-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-700 transition-colors"
                  >
                    NO
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Problems;
