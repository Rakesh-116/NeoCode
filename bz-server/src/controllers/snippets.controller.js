import { pool } from "../database/connect.db.js";
import generateUuid from "../constants/generateUuid.js";

const saveSnippetController = async (req, res) => {
  const { title, explanation, sourceCode, language } = req.body;
  const userId = req.userId;

  const saveSnippetQuery = `INSERT into savedSnippets (id, user_id, title, explanation, code, language) VALUES($1, $2, $3, $4, $5, $6) RETURNING *`;

  const saveSnippetProps = [
    generateUuid(),
    userId,
    title,
    explanation,
    sourceCode,
    language,
  ];

  try {
    const result = await pool.query(saveSnippetQuery, saveSnippetProps);
    // console.log(result);
    if (result.rowCount > 0) {
      return res.status(200).json({
        success: true,
        message: "Snippet added to the database",
        result: result.rows[0],
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const getAllSnippetsController = async (req, res) => {
  const userId = req.userId;

  const getAllSavedSnippetsQuery =
    "SELECT * FROM savedSnippets WHERE user_id = $1";

  try {
    const result = await pool.query(getAllSavedSnippetsQuery, [userId]);
    // console.log(result.rows);
    if (result.rowCount > 0) {
      return res.status(200).json({
        success: true,
        message: "All Snippets Retrieved",
        result: result.rows,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "No Snippets Found",
        result: [],
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const deleteSnippetController = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  const deleteSnippetQuery = `DELETE FROM savedSnippets WHERE id = $1 AND user_id = $2 RETURNING *`;

  try {
    const result = await pool.query(deleteSnippetQuery, [id, userId]);
    if (result.rowCount > 0) {
      // console.log(result.rows[0]);
      return res.status(200).json({
        success: true,
        message: "Snippet Deleted",
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export {
  saveSnippetController,
  getAllSnippetsController,
  deleteSnippetController,
};
