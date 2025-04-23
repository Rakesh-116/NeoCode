import { Router } from "express";
import {
  createUser,
  loginUser,
  fetchUser,
  getProblemAnalysisController,
} from "../controllers/profile.user.controller.js";

import { userAuthentication } from "../middlewares/authentication.js";

const userRoute = Router();

userRoute.route("/auth/register").post(createUser);

userRoute.route("/auth/login").post(loginUser);

userRoute.route("/profile").get(userAuthentication, fetchUser);

userRoute.route("/score").get(userAuthentication, getProblemAnalysisController);

export default userRoute;
