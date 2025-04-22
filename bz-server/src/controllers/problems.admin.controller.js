import { pool } from "../database/connect.db.js";

const deleteProblemController = async (req, res) => {
  const { id } = req.params;
  const deleteProblemQuery = "DELETE FROM Problem WHERE id = $1";
  try {
    await pool.query(deleteProblemQuery, [id]);
    return res.status(200).json({
      success: true,
      response: "Problem Successfully Deleted",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
};

export { deleteProblemController };
