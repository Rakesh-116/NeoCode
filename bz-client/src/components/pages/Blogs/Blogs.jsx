import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { Oval } from "react-loader-spinner";

import Header from "../Header.jsx";
import { useUser } from "../../../context/UserContext.jsx";
import BlogCard from "./BlogCard.jsx";

const apiStatusConstant = {
  initial: "INITIAL",
  inProgress: "IN_PROGRESS",
  success: "SUCCESS",
  noData: "NO_DATA",
  failure: "FAILURE",
};

const Blogs = () => {
  const navigate = useNavigate();
  const { userData } = useUser();

  const [blogs, setBlogs] = useState([]);
  const [apiStatus, setApiStatus] = useState(apiStatusConstant.initial);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setApiStatus(apiStatusConstant.inProgress);

    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

    try {
      const response = await axios.get(`${API_BASE_URL}/api/blogs/`);
      const blogList = response.data?.blogs || [];

      console.log(blogList);
      if (blogList.length === 0) {
        setApiStatus(apiStatusConstant.noData);
      } else {
        setBlogs(blogList);
        setApiStatus(apiStatusConstant.success);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setApiStatus(apiStatusConstant.failure);
    }
  };

  const onBlogSelect = (id) => {
    navigate(`/blog/${id}`);
  };

  const renderLoader = () => (
    <div className="flex justify-center items-center h-screen">
      <Oval height={50} width={50} color="#4fa94d" strokeWidth={4} />
    </div>
  );

  const renderBlogsFailure = () => (
    <div className="text-center text-white mt-10">
      <h2 className="text-2xl font-semibold">Failed to fetch blogs</h2>
      <p className="text-lg">Please try again later.</p>
    </div>
  );

  const renderNoBlogsFound = () => (
    <div className="text-center text-white mt-10">
      <h2 className="text-2xl font-semibold">No Blogs Found</h2>
      <p className="text-lg">Try creating a new blog!</p>
    </div>
  );

  const renderBlogsSuccess = () => (
    <div className="">
      <ul>
        {blogs.map((blog, index) => (
          <li key={index}>
            <BlogCard blogDetails={blog} onBlogSelect={onBlogSelect} />
          </li>
        ))}
      </ul>
    </div>
  );

  const renderBlogsComponent = () => {
    switch (apiStatus) {
      case apiStatusConstant.success:
        return renderBlogsSuccess();
      case apiStatusConstant.noData:
        return renderNoBlogsFound();
      case apiStatusConstant.failure:
        return renderBlogsFailure();
      case apiStatusConstant.inProgress:
        return renderLoader();
      default:
        return null;
    }
  };

  return (
    <div>
      <Header />
      <div className="bg-black/95 min-h-screen pt-28 px-10">
        <div className="flex justify-end">
          {userData && userData.role === "admin" && (
            <button
              className="mb-4 px-3 py-1 rounded-md border border-gray-400 hover:bg-gray-700 text-white"
              onClick={() => navigate("/newblog")}
            >
              New blog
            </button>
          )}
        </div>
        {renderBlogsComponent()}
      </div>
    </div>
  );
};

export default Blogs;
