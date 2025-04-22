import { useEffect, useState } from "react";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";

import Header from "./Header";
import stars from "../../assets/stars.png";
import { useUser } from "../../context/UserContext";

const Home = () => {
  const navigate = useNavigate();
  const { userData, updateUserData } = useUser();
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    const jwtToken = Cookies.get("neo_code_jwt_token");
    // if (!jwtToken) {
    //   navigate("/login");
    //   return;
    // }

    if (!userData) {
      fetchUserData(jwtToken);
    }
  }, [userData]);

  const fetchUserData = async (jwtToken) => {
    setLoadingProfile(true);
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      updateUserData(response.data.user);
    } catch (error) {
      console.error("Error fetching user data:", error);
      if (error.response?.status === 405) {
        Cookies.remove("neo_code_jwt_token");
        navigate("/login");
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  return (
    <div>
      <Header />
      <div
        className="bg-black min-h-screen bg-cover bg-center flex flex-col items-center justify-center"
        style={{ backgroundImage: `url(${stars})` }}
      >
        <div className="container mx-auto px-6 relative">
          <div className="absolute inset-0 flex justify-center items-center">
            <div
              className="h-[100%] w-[40%] bg-white/15 
              bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] 
              bg-[size:44px_44px] 
              backdrop-blur-md opacity-50 rounded-xl"
              style={{
                maskImage:
                  "radial-gradient(closest-side, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 90%)",
                WebkitMaskImage:
                  "radial-gradient(closest-side, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 90%)",
              }}
            />
          </div>
          <div className="relative z-10 text-center max-w-4xl mx-auto pt-20">
            <div className="text-white/70 font-thin tracking-wider mb-4 w-fit mx-auto">
              <motion.span className="border border-white/25 px-4 py-2 rounded-md backdrop-blur-md bg-white/10 text-sm flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-shadow duration-300 cursor-crosshair">
                <FaWandMagicSparkles />
                TRANSFORM YOUR CODING EXPERIENCE TO A NEW LEVEL
              </motion.span>
            </div>
            <h1 className="text-6xl font-bold text-white mb-6 bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent mt-10">
              NeoCode
            </h1>
            <p className="text-lg text-white/80 mb-8 mt-10">
              A Next-Gen Coding Platform that supports multiple programming
              languages including C++, Python, and Java. Practice problems,
              compile code, and enhance your programming skills.
            </p>
            <div className="flex gap-4 justify-center mt-10">
              <button
                className="px-8 py-3 bg-white text-black rounded-md font-medium hover:bg-white/90 transition duration-300"
                onClick={() => navigate("/problemset")}
              >
                Practice Problems
              </button>
              <button
                className="px-8 py-3 border border-white/25 text-white rounded-md font-medium hover:bg-white/10 transition duration-300"
                onClick={() => navigate("/compiler")}
              >
                Try Compiler
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
