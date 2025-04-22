import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { LuTrash2 } from "react-icons/lu";
import { RxCross2 } from "react-icons/rx";
import { FaCaretDown } from "react-icons/fa";
import { Oval } from "react-loader-spinner"; // make sure you have this installed

const getAllUsersApiStatusConstant = {
  initial: "INITIAL",
  inProgress: "IN_PROGRESS",
  success: "SUCCESS",
  failure: "FAILURE",
};

const renderLoader = () => (
  <div className="flex justify-center items-center mt-28 h-[70vh]">
    <Oval
      height={50}
      width={50}
      color="#4fa94d"
      strokeWidth={4}
      strokeWidthSecondary={4}
    />
  </div>
);

const UserDataCard = ({ userDetails, onRequestDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="bg-black/95 p-3 rounded-md shadow-lg border border-white/20 w-full
        transition-all duration-300 ease-in-out mt-2 overflow-hidden"
    >
      <div
        className={`flex justify-between ${
          isOpen ? "items-start" : "items-center"
        }`}
      >
        <div>
          <h1 className="text-gray-400 text-[16px]">
            Name: <span className="text-white">{userDetails.username}</span>
          </h1>
          <p
            className={`text-gray-400 text-[13px] ${
              isOpen ? "mt-2 text-[16px]" : ""
            }`}
          >
            Role:{" "}
            <span className="text-white/90">
              {userDetails.role === "admin" ? "Admin" : "User"}
            </span>
          </p>
        </div>

        <div className="flex space-x-4 items-start">
          {isOpen && (
            <button className="border border-green-400 px-2 py-1 mx-2 rounded-md text-green-400 text-[12px]">
              Edit Role to {userDetails.role === "admin" ? "User" : "Admin"}
            </button>
          )}
          <button
            className="text-red-500 border border-red-500 rounded-lg p-1 hover:text-red-600 transition-colors duration-300 self-start"
            onClick={() =>
              onRequestDelete(
                userDetails.id,
                `Are you sure you want to delete ${userDetails.username}?`
              )
            }
          >
            <LuTrash2 />
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white border border-white rounded-lg p-1 hover:text-white transition-colors duration-300 self-start"
          >
            <FaCaretDown
              className={`transform transition-transform duration-300 ${
                isOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-3 text-gray-300 text-sm">
          <p className="text-gray-400 text-[16px]">
            Email: <span className="text-white/90">{userDetails.email}</span>
          </p>
        </div>
      )}
    </div>
  );
};

const AdminUsers = () => {
  const [usersData, setUsersData] = useState([]);
  const [apiStatus, setApiStatus] = useState(
    getAllUsersApiStatusConstant.initial
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [toDeleteId, setToDeleteId] = useState(null);

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    setApiStatus(getAllUsersApiStatusConstant.inProgress);
    const token = Cookies.get("neo_code_jwt_token");
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsersData(res.data.response);
      setApiStatus(getAllUsersApiStatusConstant.success);
    } catch (err) {
      console.error(err);
      setApiStatus(getAllUsersApiStatusConstant.failure);
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
        `${API_BASE_URL}/api/admin/users/delete/${toDeleteId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await fetchAllUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const renderFailure = () => (
    <div className="text-center text-red-500 py-20 mt-28">
      Failed to load users.{" "}
      <button onClick={fetchAllUsers} className="underline hover:text-red-700">
        Try again
      </button>
    </div>
  );

  const renderUsersList = () => (
    <div className="">
      {usersData.map((user) => (
        <UserDataCard
          key={user.id}
          userDetails={user}
          onRequestDelete={handleRequestDelete}
        />
      ))}
    </div>
  );

  return (
    <div className="">
      <h1 className="text-white text-[40px]">Users Data</h1>
      {(() => {
        switch (apiStatus) {
          case getAllUsersApiStatusConstant.inProgress:
            return renderLoader();
          case getAllUsersApiStatusConstant.failure:
            return renderFailure();
          case getAllUsersApiStatusConstant.success:
            return renderUsersList();
          default:
            return null;
        }
      })()}

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
  );
};

export default AdminUsers;
