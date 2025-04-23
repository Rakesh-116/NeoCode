import { pool } from "../database/connect.db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import generateUuid from "../constants/generateUuid.js";

const createUser = async (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields",
    });
  }

  const userCheckQuery = "SELECT * FROM users WHERE username = $1";

  try {
    const userCheck = await pool.query(userCheckQuery, [username]);
    if (userCheck.rowCount > 0) {
      return res.status(401).json({
        success: false,
        message: "Username already exists",
      });
    }
    const userInsertQuery =
      "INSERT INTO users (id, username, password, email) VALUES ($1, $2, $3, $4) RETURNING *;";

    const hashedPassword = await bcrypt.hash(password, 10);

    const userDetails = [generateUuid(), username, hashedPassword, email];

    const user = await pool.query(userInsertQuery, userDetails);

    const token = jwt.sign(
      { userId: user.rows[0].id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "4h" }
    );

    // console.log(user.rows[0]);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: user.rows[0],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields",
    });
  }

  const userCheckQuery = "SELECT * FROM users WHERE username = $1";

  try {
    const userCheck = await pool.query(userCheckQuery, [username]);

    if (userCheck.rowCount === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid User",
      });
    }

    const comparePassword = await bcrypt.compare(
      password,
      userCheck.rows[0].password
    );

    if (comparePassword) {
      const token = jwt.sign(
        { userId: userCheck.rows[0].id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "4h" }
      );

      // console.log(userCheck.rows[0]);

      res.status(200).json({
        success: true,
        message: "User logged in successfully",
        token,
        user: userCheck.rows[0],
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid Password",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
};

const fetchUser = async (req, res) => {
  const userId = req.userId;
  const userDetailsQuery =
    "SELECT id, username, email, role FROM users WHERE id = $1";
  try {
    const userDetails = await pool.query(userDetailsQuery, [userId]);
    return res.status(200).json({ success: true, user: userDetails.rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Database error" });
  }
};

const getProblemAnalysisController = async (req, res) => {
  const userId = req.userId;

  const problemAnalysisQuery = `
    SELECT 
      s.problem_id, 
      s.verdict
    FROM submissions s
    WHERE s.user_id = $1
    ORDER BY s.submission_time DESC;
  `;

  try {
    const result = await pool.query(problemAnalysisQuery, [userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No submissions found for the user",
      });
    }

    // Initialize counters
    let verdictCounts = {
      accepted: 0,
      wrongAnswer: 0,
      rte: 0,
      tle: 0,
    };

    // Count each verdict type
    for (const { verdict } of result.rows) {
      if (verdict === "ACCEPTED") {
        verdictCounts.accepted += 1;
      } else if (verdict === "WRONG ANSWER") {
        verdictCounts.wrongAnswer += 1;
      } else if (verdict === "RTE") {
        verdictCounts.rte += 1;
      } else if (verdict === "TLE") {
        verdictCounts.tle += 1;
      }
    }

    return res.status(200).json({
      success: true,
      message: "Verdict counts fetched successfully",
      verdictCounts,
    });
  } catch (error) {
    console.error("Error fetching problem analysis:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { createUser, loginUser, fetchUser, getProblemAnalysisController };
