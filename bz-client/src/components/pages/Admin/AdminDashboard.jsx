import React from "react";
import { useNavigate } from "react-router-dom";

import Header from "../Header";
import { useUser } from "../../../context/UserContext";
import AdminUsers from "./AdminUsers";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { userData } = useUser();

  return (
    <div className="bg-black/95 min-h-screen text-white">
      <Header />
      <div className="mt-28 px-10">
        <div className="flex items-start w-full space-x-4 min-h-[200px]">
          <div className="mb-8 p-4 border border-white/40 rounded-lg w-[40%] h-full">
            <h1 className="text-3xl font-semibold">
              Welcome, {userData?.username || "Admin"} 👋
            </h1>
            <p className="mt-2 text-white/80">
              You have access to powerful administrative features:
            </p>
            <ul className="list-disc list-inside mt-2 text-white/70">
              <li>View and manage registered users.</li>
              <li>Add, edit, or delete coding problems.</li>
              <li>Review and delete user submissions.</li>
            </ul>
          </div>

          <div className="mb-8 p-4 border border-white/40 rounded-lg w-[60%] h-full">
            <h2 className="text-2xl font-semibold mb-2">
              Feeling Smart Today? 🤓
            </h2>
            <p className="text-white/80">
              Share your tech wisdom, admin tales, or coding chaos stories! 💻✨
            </p>
            <p className="mt-2 text-white/70">
              Hit that button below and let the blog-writing magic begin! 🪄
            </p>
            <button
              onClick={() => navigate("/newblog")}
              className="mt-2 px-4 py-2 border border-white/30 rounded-lg hover:bg-gray-700 transition-all"
            >
              ✍️ Write a Blog
            </button>
          </div>
        </div>
        <AdminUsers />
      </div>
    </div>
  );
};

export default AdminDashboard;
