import { useEffect, useState } from "react";
import { IoEyeSharp } from "react-icons/io5";
import { LuEyeClosed } from "react-icons/lu";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  // useEffect(() => {
  //   const token = Cookies.get("neo_code_jwt_token");
  //   if (token) {
  //     navigate("/");
  //   }
  // }, []);

  const changeInput = (e) => {
    const { name, value } = e.target;
    if (name === "username") setUsername(value);
    if (name === "password") setPassword(value);
  };

  const changeVisibility = () => setIsVisible(!isVisible);

  const submitForm = async (e) => {
    e.preventDefault();
    if (!username || !password) return;

    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

    try {
      const response = await axios.post(`${API_BASE_URL}/api/user/auth/login`, {
        username,
        password,
      });
      if (response.status === 200) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        Cookies.set("neo_code_jwt_token", response.data.token, {
          expires: 4 / 24,
        });
        navigate("/");
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md bg-black/90 border border-gray-700 shadow-lg p-6 rounded-lg">
        <h1 className="text-white text-center text-2xl font-semibold mb-6">
          Login
        </h1>
        <form onSubmit={submitForm} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={username}
            onChange={changeInput}
            className="w-full bg-black/30 text-white border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <div className="relative">
            <input
              type={isVisible ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={password}
              onChange={changeInput}
              className="w-full bg-black/30 text-white border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none pr-10"
            />
            <button
              type="button"
              onClick={changeVisibility}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white"
            >
              {isVisible ? <IoEyeSharp size={20} /> : <LuEyeClosed size={20} />}
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 font-semibold"
          >
            Login
          </button>
          <div className="text-center text-gray-400">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-blue-400 hover:underline"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
