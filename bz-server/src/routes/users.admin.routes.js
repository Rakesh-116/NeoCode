import { Router } from "express";
import { userAuthentication } from "../middlewares/authentication.js";

import {
  getAllUsersController,
  deleteUserController,
} from "../controllers/users.admin.controller.js";

const usersRoute = Router();

usersRoute.get("/", userAuthentication, getAllUsersController);

usersRoute.delete("/delete/:id", userAuthentication, deleteUserController);

export default usersRoute;
