import { pool } from "../database/connect.db.js";

const getAllBlogsController = async (req, res) => {
  const getAllBlogsQuery = `
    SELECT 
      b.*, 
      u.username 
    FROM 
      Blog b 
    JOIN 
      Users u 
    ON 
      b.created_by = u.id 
    ORDER BY 
      b.id ASC;
  `;

  try {
    const getAllBlogsResult = await pool.query(getAllBlogsQuery);
    return res.status(200).json({
      success: true,
      blogs:
        getAllBlogsResult.rowCount > 0
          ? getAllBlogsResult.rows
          : "No Blogs Found",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
};

const getBlogDetailsController = async (req, res) => {
  const { id } = req.params;
  const getBlogDetailsQuery =
    "SELECT b.*, u.username FROM Blog as b JOIN Users as u ON b.created_by = u.id WHERE b.id = $1;";
  try {
    const result = await pool.query(getBlogDetailsQuery, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No Blog Found with the provided ID",
      });
    }

    return res.status(200).json({
      success: true,
      blog: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching blog details:", error);
    return res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
};

export { getAllBlogsController, getBlogDetailsController };
