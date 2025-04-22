import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "../Header";
import axios from "axios";
import Cookies from "js-cookie";
import { pagesCount } from "../../Common/constants";
import SubmissionModal from "./SubmissionViewPage";
import { Oval } from "react-loader-spinner";

// API status constants
const getSubmissionsApiStatusConstants = {
  initial: "INITIAL",
  inProgress: "IN_PROGRESS",
  success: "SUCCESS",
  failure: "FAILURE",
};

const Submissions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [recordsPerPage, setRecordsPerPage] = useState(pagesCount[0]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [getSubmissionsApiStatus, setGetSubmissionsApiStatus] = useState(
    getSubmissionsApiStatusConstants.initial
  );

  const page = parseInt(searchParams.get("page")) || 1;

  const fetchSubmissions = async () => {
    const token = Cookies.get("neo_code_jwt_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

    try {
      setGetSubmissionsApiStatus(getSubmissionsApiStatusConstants.inProgress);
      const response = await axios.get(
        `${API_BASE_URL}/api/problem/submissions?limit=${recordsPerPage}&skip=${
          (page - 1) * recordsPerPage
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSubmissions(response.data.submissions);
      setTotalRecords(response.data.totalSubmissions);
      setTotalPages(Math.ceil(response.data.totalSubmissions / recordsPerPage));
      setGetSubmissionsApiStatus(getSubmissionsApiStatusConstants.success);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      setGetSubmissionsApiStatus(getSubmissionsApiStatusConstants.failure);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [page, recordsPerPage]);

  const setPageInUrl = (newPage) => {
    setSearchParams({ page: newPage });
  };

  const renderLoader = () => (
    <div className="flex justify-center items-center py-10">
      <Oval height={50} width={50} color="#4fa94d" strokeWidth={4} />
    </div>
  );

  const renderFailureView = () => (
    <div className="text-center text-red-400 mt-10">
      <p>Failed to fetch submissions. Please try again later.</p>
    </div>
  );

  const renderGetSubmissionsSuccessPage = () => (
    <div>
      {totalRecords === 0 ? (
        <div className="mt-10">
          <h1 className="text-white font-medium text-2xl text-center">
            No Submissions Yet !!
          </h1>
        </div>
      ) : (
        <div className="space-y-4">
          {openModal && (
            <SubmissionModal
              submissionResult={selectedSubmission}
              theme="vs-dark"
              setOpenModal={setOpenModal}
            />
          )}
          {submissions.map((submission, index) => (
            <div
              key={index}
              className="bg-black/70 hover:bg-white/5 p-3 rounded-lg shadow-lg border border-white/10 w-full flex flex-col md:flex-row items-center md:items-start justify-between cursor-pointer transition ease-out duration-300"
              onClick={() => {
                setSelectedSubmission(submission);
                setOpenModal(true);
              }}
            >
              <div className="flex-1">
                <h2 className="text-lg font-semibold">
                  {submission.problem_title}
                </h2>
                <p className="text-sm text-gray-400">
                  Language: {submission.language}
                </p>
              </div>
              <div className="text-center md:text-right">
                <p className="text-sm font-bold">
                  Verdict:{" "}
                  <span
                    className={`${
                      submission.verdict === "ACCEPTED"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {submission.verdict}
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Submitted on:{" "}
                  {new Date(submission.submission_time).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderView = () => {
    switch (getSubmissionsApiStatus) {
      case getSubmissionsApiStatusConstants.inProgress:
        return renderLoader();
      case getSubmissionsApiStatusConstants.success:
        return renderGetSubmissionsSuccessPage();
      case getSubmissionsApiStatusConstants.failure:
        return renderFailureView();
      default:
        return null;
    }
  };

  return (
    <div className="bg-black/95 min-h-screen px-10 pb-10 text-white">
      <Header />
      <div className="pt-28">
        <h1 className="text-2xl font-bold font-mono mb-6">Submissions Page</h1>

        <div className="mb-4 flex justify-between items-center">
          <div>
            <label className="text-sm font-medium">Records Per Page: </label>
            <select
              value={recordsPerPage}
              onChange={(e) => {
                setPageInUrl(1);
                setRecordsPerPage(Number(e.target.value));
              }}
              className="bg-black/70 text-white p-2 rounded-md border border-gray-700 ml-2"
            >
              {pagesCount.map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
              {totalRecords > 100 && (
                <option value={totalRecords}>All ({totalRecords})</option>
              )}
            </select>
          </div>
          <div className="text-sm text-gray-300">
            Total Records: {totalRecords}
          </div>
        </div>

        {renderView()}

        {totalPages > 1 && (
          <div className="flex justify-center items-center transition-all bg-transparent w-full mt-28">
            <div className="fixed bottom-10 w-[90%] bg-black/50 p-4 flex justify-between items-center space-x-4 border border-white/20 rounded-xl backdrop-blur-md text-white text-sm font-thin">
              <button
                onClick={() => setPageInUrl(1)}
                disabled={page === 1}
                className={`px-4 py-2 rounded-md border ${
                  page === 1
                    ? "border-gray-700 text-gray-500 cursor-not-allowed"
                    : "border-gray-400 hover:bg-gray-700"
                } transition`}
              >
                First Page
              </button>

              <div className="flex items-center space-x-6">
                <button
                  onClick={() => setPageInUrl(Math.max(page - 1, 1))}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded-md border ${
                    page === 1
                      ? "border-gray-700 text-gray-500 cursor-not-allowed"
                      : "border-gray-400 hover:bg-gray-700"
                  } transition`}
                >
                  Prev
                </button>

                <p>
                  Page{" "}
                  <span className="px-3 py-2 rounded-md border border-gray-700">
                    {page}
                  </span>{" "}
                  of {totalPages}
                </p>

                <button
                  onClick={() => setPageInUrl(Math.min(page + 1, totalPages))}
                  disabled={page === totalPages}
                  className={`px-4 py-2 rounded-md border ${
                    page === totalPages
                      ? "border-gray-700 text-gray-500 cursor-not-allowed"
                      : "border-gray-400 hover:bg-gray-700"
                  } transition`}
                >
                  Next
                </button>
              </div>

              <button
                onClick={() => setPageInUrl(totalPages)}
                disabled={page === totalPages}
                className={`px-4 py-2 rounded-md border ${
                  page === totalPages
                    ? "border-gray-700 text-gray-500 cursor-not-allowed"
                    : "border-gray-400 hover:bg-gray-700"
                } transition`}
              >
                Last Page
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Submissions;
