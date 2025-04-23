import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import Cookies from "js-cookie";

import Header from "../Header";
import { tags as availableTags } from "../../Common/constants";

const CreateBlog = () => {
  const [title, setTitle] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [blogContent, setBlogContent] = useState("");

  // Handle content change for ReactQuill editor
  const handleContentChange = (value) => {
    setBlogContent(value);
  };

  // Toggle tag selection
  const toggleTag = (tag) => {
    setSelectedTags(
      (prevTags) =>
        prevTags.includes(tag)
          ? prevTags.filter((item) => item !== tag) // Remove tag if already selected
          : [...prevTags, tag] // Add tag if not selected
    );
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"], // <-- Important!
      ["link", "image"],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "blockquote",
    "code-block",
    "link",
    "image",
    "color",
    "background",
    "align",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const blogData = {
      title,
      tags: selectedTags,
      description: blogContent,
    };
    console.log("Blog data:", blogData);
    const token = Cookies.get("neo_code_jwt_token");
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/blogs/newblog`,
        {
          blogData,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-black/95">
      <Header />
      <div className="pt-28 px-10 text-white">
        <h1 className="text-xl font-bold mb-4">Create New Blog</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
              required
            />
          </div>

          <div>
            <label className="block mb-1">Tags</label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full border transition text-sm whitespace-nowrap ${
                    selectedTags.includes(tag)
                      ? "bg-white text-black font-semibold"
                      : "text-white/80 border-white/80 hover:bg-white/10"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="my-4 mb-10">
            <label className="block mb-1">Description</label>
            <div className="h-[40vh]">
              <ReactQuill
                theme="snow"
                value={blogContent}
                onChange={handleContentChange}
                modules={modules}
                formats={formats}
                className="h-full"
              />
            </div>
          </div>
          <br />
          <br />
          <button
            type="submit"
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateBlog;
