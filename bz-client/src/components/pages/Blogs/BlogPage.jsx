import React, { useEffect, useState } from "react";
import Header from "../Header";
import { useParams } from "react-router-dom";
import axios from "axios";

const BlogPage = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
    try {
      const response = await axios.get(`${API_BASE_URL}/api/blogs/${id}`);
      if (response.data.success) {
        console.log(response.data.blog);
        setBlog(response.data.blog);
      } else {
        setBlog(null);
      }
    } catch (error) {
      console.error("Error fetching blog:", error);
    }
  };

  return (
    <div className="bg-black/95 min-h-screen px-4 sm:px-10 pb-10">
      <Header />
      <div className="pt-28 max-w-4xl mx-auto">
        {blog ? (
          <div className="border border-white/70 text-white p-6 sm:p-10 rounded-2xl shadow-xl">
            <h1 className="text-3xl sm:text-4xl font-bold text-teal-400 mb-4">
              {blog.title}
            </h1>
            <div className="text-sm text-gray-400 mb-6 flex flex-wrap items-center justify-between">
              <span>
                By{" "}
                <span className="text-white font-medium">
                  NC-{blog.username.toUpperCase()}
                </span>
              </span>
              <span>
                {new Date(blog.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div
              className="text-lg leading-relaxed text-gray-200 mb-6 prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: blog.description }}
            ></div>

            {blog.tags && (
              <div className="text-sm text-gray-300">
                <span className="font-medium text-teal-300">Tags: </span>
                {Array.isArray(blog.tags) ? blog.tags.join(", ") : blog.tags}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-white mt-10 text-xl">
            No Blog Found.
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
