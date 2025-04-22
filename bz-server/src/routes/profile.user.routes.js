import { Router } from "express";
import {
  createUser,
  loginUser,
  fetchUser,
} from "../controllers/profile.user.controller.js";

import { userAuthentication } from "../middlewares/authentication.js";

const userRoute = Router();

userRoute.route("/auth/register").post(createUser);

userRoute.route("/auth/login").post(loginUser);

userRoute.route("/profile").get(userAuthentication, fetchUser);

export default userRoute;
