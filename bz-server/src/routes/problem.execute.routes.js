import { Router } from "express";
import { userAuthentication } from "../middlewares/authentication.js";

import { executeProblemController } from "../controllers/problem.execute.controller.js";
import { submitProblemController } from "../controllers/problem.execute.controller.js";
import { getExpectedOutputController } from "../controllers/problem.execute.controller.js";

import { getAllProblemsController } from "../controllers/problem.controller.js";
import { getProblemDetailsController } from "../controllers/problem.controller.js";

import { getAllSubmissionsController } from "../controllers/problem.controller.js";
import { getAllProblemSubmissionsController } from "../controllers/problem.controller.js";

const problemExecuteRoute = Router();

problemExecuteRoute
  .route("/execute")
  .post(userAuthentication, executeProblemController);

problemExecuteRoute
  .route("/submit")
  .post(userAuthentication, submitProblemController);

problemExecuteRoute.route("/get-all").get(getAllProblemsController);

problemExecuteRoute
  .route("/get/:id")
  .get(userAuthentication, getProblemDetailsController);

problemExecuteRoute
  .route("/submissions")
  .get(userAuthentication, getAllSubmissionsController);

problemExecuteRoute
  .route("/:id/get-all-submissions")
  .get(userAuthentication, getAllProblemSubmissionsController);

problemExecuteRoute
  .route("/get-expected-output")
  .post(userAuthentication, getExpectedOutputController);

export default problemExecuteRoute;
