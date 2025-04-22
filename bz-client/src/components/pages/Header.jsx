import { Link, useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useState, useEffect, useRef } from "react";

import { useUser } from "../../context/UserContext";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const { isLoggedIn, userData, updateUserData, clearUserData } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const jwtToken = Cookies.get("neo_code_jwt_token");
    if (jwtToken !== undefined && !userData) {
      fetchUserData();
    }
  }, [userData]);

  const fetchUserData = async () => {
    try {
      const jwtToken = Cookies.get("neo_code_jwt_token");
      const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        updateUserData(data.user);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const onLogOut = () => {
    Cookies.remove("neo_code_jwt_token");
    localStorage.removeItem("user");
    clearUserData();
    setShowDropdown(false);
    navigate("/login");
  };

  const onLogIn = () => {
    navigate("/login");
  };

  return (
    <div className="w-full flex justify-center transition-all bg-transparent">
      <div
        className={`w-[90vw] border border-white/20 rounded-xl px-6 py-2 bg-black text-white flex justify-between items-center  transition-all duration-300 fixed top-5 ${
          isScrolled ? "bg-black/50 backdrop-blur-md shadow-lg" : "bg-black"
        } z-40`}
      >
        <Link to="/">
          <span className="font-medium text-xl text-white/90 hover:text-white transition duration-300">
            NeoCode
          </span>
        </Link>
        <div className="flex space-x-8">
          <Link
            to="/"
            className={`hover:text-white ${
              location.pathname === "/" ? "text-white" : "text-white/70"
            }`}
          >
            Home
          </Link>
          <Link
            to="/blogs"
            className={`hover:text-white ${
              location.pathname === "/blogs" ? "text-white" : "text-white/70"
            }`}
          >
            Blogs
          </Link>
          <Link
            to="/problemset"
            className={`hover:text-white ${
              location.pathname === "/problemset"
                ? "text-white"
                : "text-white/70"
            }`}
          >
            Problems
          </Link>
          {isLoggedIn && (
            <Link
              to="/submissions"
              className={`hover:text-white ${
                location.pathname === "/submissions"
                  ? "text-white"
                  : "text-white/70"
              }`}
            >
              Submissions
            </Link>
          )}
          {isLoggedIn && (
            <Link
              to="/compiler"
              className={`hover:text-white ${
                location.pathname === "/compiler"
                  ? "text-white"
                  : "text-white/70"
              }`}
            >
              Code
            </Link>
          )}
          {userData && userData.role === "admin" && (
            <Link
              to="/admin"
              className={`hover:text-white ${
                location.pathname === "/admin" ? "text-white" : "text-white/70"
              }`}
            >
              Admin
            </Link>
          )}
        </div>
        {isLoggedIn ? (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              className="px-4 py-2 text-white rounded-md font-medium border border-white/20 hover:border-white/25 hover:bg-white/10 transition duration-300 flex items-center gap-2"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span>{userData?.username || "User"}</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-md bg-black border border-white/20 shadow-lg p-1 transition-all duration-300">
                {userData.role != "admin" && (
                  <h1 className="p-2 opacity-50 cursor-default text-sm">
                    {userData.email}
                  </h1>
                )}
                <Link
                  to="/profile"
                  className="block p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-md"
                  onClick={() => setShowDropdown(false)}
                >
                  My Profile
                </Link>
                <Link
                  to="/savedsnippets"
                  className="block p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-md"
                >
                  Saved Snippets
                </Link>
                <button
                  onClick={onLogOut}
                  className="w-full text-left p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-md"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            className="px-6 py-2 border border-white/25 text-white rounded-md font-medium hover:bg-white/10 transition duration-300"
            onClick={() => onLogIn()}
          >
            LogIn
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
