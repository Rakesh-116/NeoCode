import { pool } from "../database/connect.db.js";
import generateUuid from "../constants/generateUuid.js";

const createNewBlogController = async (req, res) => {
  const { blogData } = req.body;
  const userId = req.userId;
  const { title, tags, description } = blogData;

  const createNewBlogQuery =
    "INSERT INTO Blog (id, title, tags, description, created_by, updated_by) VALUES($1, $2, $3, $4, $5, $6) RETURNING *;";

  const createNewBlogParams = [
    generateUuid(),
    title,
    tags,
    description,
    userId,
    userId,
  ];

  try {
    const createNewBlogResult = await pool.query(
      createNewBlogQuery,
      createNewBlogParams
    );
    console.log(createNewBlogResult);
    return res.status(200).json({
      success: true,
      message: "Blog Added Successfully",
      blog: createNewBlogResult.rows[0],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
};

export { createNewBlogController };
