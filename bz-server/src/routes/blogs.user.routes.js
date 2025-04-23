import { Router } from "express";
import {
  getAllBlogsController,
  getBlogDetailsController,
} from "../controllers/blogs.users.controller.js";

const userBlogsRoute = Router();

userBlogsRoute.get("/", getAllBlogsController);

userBlogsRoute.get("/:id", getBlogDetailsController);

export default userBlogsRoute;
