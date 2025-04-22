import React from "react";
import { Outlet } from "react-router-dom";
import NotFound from "../NotFound";

const AdminRoute = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== "admin") {
    return <NotFound />;
  }

  return <Outlet />;
};

export default AdminRoute;
