import { Router } from "express";
import { userAuthentication } from "../middlewares/authentication.js";
import { deleteProblemController } from "../controllers/problems.admin.controller.js";

const problemsRoute = Router();

problemsRoute.delete(
  "/delete/:id",
  userAuthentication,
  deleteProblemController
);

export default problemsRoute;
