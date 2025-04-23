import { Router } from "express";
import { userAuthentication } from "../middlewares/authentication.js";
import { createNewBlogController } from "../controllers/blogs.admin.controller.js";

const adminBlogsRoute = Router();

adminBlogsRoute.post("/newblog", userAuthentication, createNewBlogController);

export default adminBlogsRoute;
