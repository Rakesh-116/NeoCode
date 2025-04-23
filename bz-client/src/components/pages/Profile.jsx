import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { Oval } from "react-loader-spinner";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import Header from "./Header";
import { useUser } from "../../context/UserContext";

ChartJS.register(ArcElement, Tooltip, Legend);

const apiStatusConstant = {
  initial: "INITIAL",
  inProgress: "IN_PROGRESS",
  success: "SUCCESS",
  failure: "FAILURE",
};

const Profile = () => {
  const { userData } = useUser(); // Get user info from context
  const navigate = useNavigate();
  const [verdictCounts, setVerdictCounts] = useState({
    accepted: 0,
    wrongAnswer: 0,
    rte: 0,
    tle: 0,
  });
  const [apiStatus, setApiStatus] = useState(apiStatusConstant.initial);
  const [error, setError] = useState("");

  useEffect(() => {
    if (userData) {
      fetchUserVerdictData();
    }
  }, [userData]);

  const fetchUserVerdictData = async () => {
    const jwtToken = Cookies.get("neo_code_jwt_token");
    if (!jwtToken) {
      navigate("/login");
      return;
    }
    setApiStatus(apiStatusConstant.inProgress);
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/score`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      const problems = response.data.verdictCounts;
      // Assuming the API gives verdict counts directly, so we can set them directly
      setVerdictCounts({
        accepted: problems.accepted,
        wrongAnswer: problems.wrongAnswer,
        rte: problems.rte,
        tle: problems.tle,
      });
      setApiStatus(apiStatusConstant.success);
    } catch (error) {
      setError("Error fetching score data");
      setApiStatus(apiStatusConstant.failure);
    }
  };

  const renderContent = () => {
    switch (apiStatus) {
      case apiStatusConstant.inProgress:
        return renderLoader();
      case apiStatusConstant.failure:
        return <div className="text-white">{error}</div>;
      case apiStatusConstant.success:
        return renderProfileContent();
      default:
        return null;
    }
  };

  const renderProfileContent = () => {
    return (
      <div className=" w-full h-[80vh]">
        {/* User Info Section */}
        <div className="mb-8">
          <h2 className="text-3xl text-white font-semibold">
            {`Welcome, ${userData?.username || "User"}`} 👋
          </h2>
          <p className="text-lg text-white/70">{userData?.email}</p>
        </div>

        {/* Pie Chart Section */}
        <div className="w-full max-w-sm  border border-white/70 p-4 rounded-md">
          <Pie
            data={{
              labels: ["Accepted", "Wrong Answer", "RTE", "TLE"],
              datasets: [
                {
                  label: "Verdict Distribution",
                  data: [
                    verdictCounts.accepted,
                    verdictCounts.wrongAnswer,
                    verdictCounts.rte,
                    verdictCounts.tle,
                  ],
                  backgroundColor: [
                    "rgba(34,197,94,0.8)",
                    "rgba(239,68,68,0.8)",
                    "rgba(59,130,246,0.8)",
                    "rgba(234,179,8,0.8)",
                  ],
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "bottom",
                  labels: {
                    color: "#ffffff",
                  },
                },
                tooltip: {
                  callbacks: {
                    label: (tooltipItem) => {
                      return `${tooltipItem.label}: ${tooltipItem.raw}`;
                    },
                  },
                },
              },
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-black/95 min-h-screen">
      <Header />
      <div className="pt-28 px-12">{renderContent()}</div>
    </div>
  );
};

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

export default Profile;
