import { Router } from "express";
import { userAuthentication } from "../middlewares/authentication.js";
import {
  createProblemController,
  deleteProblemController,
} from "../controllers/problems.admin.controller.js";

const problemsRoute = Router();

problemsRoute
  .route("/create")
  .post(userAuthentication, createProblemController);

problemsRoute.delete(
  "/delete/:id",
  userAuthentication,
  deleteProblemController
);

export default problemsRoute;
