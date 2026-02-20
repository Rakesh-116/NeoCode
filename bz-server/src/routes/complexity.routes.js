import express from "express";
import { analyzeComplexityController } from "../controllers/complexity.controller.js";
import {userAuthentication} from "../middlewares/authentication.js";

const router = express.Router();

// POST /api/complexity/analyze
router.post("/analyze", userAuthentication, analyzeComplexityController);

export default router;