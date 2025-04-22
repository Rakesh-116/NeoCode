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

export { createUser, loginUser, fetchUser };
