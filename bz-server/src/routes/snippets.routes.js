import { Router } from "express";
import { userAuthentication } from "../middlewares/authentication.js";
import {
  saveSnippetController,
  getAllSnippetsController,
  deleteSnippetController,
} from "../controllers/snippets.controller.js";

const snippetsRoute = Router();

snippetsRoute.post("/save", userAuthentication, saveSnippetController);

snippetsRoute.get(
  "/get-all-snippets",
  userAuthentication,
  getAllSnippetsController
);

snippetsRoute.delete(
  "/delete-snippet/:id",
  userAuthentication,
  deleteSnippetController
);

export default snippetsRoute;
