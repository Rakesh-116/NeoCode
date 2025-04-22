import { pool } from "../database/connect.db.js";

const getAllUsersController = async (req, res) => {
  const getAllUsersQuery =
    "SELECT id, email, username, role, created_at, updated_at FROM users ORDER BY id ASC";
  try {
    const getAllUsersResult = await pool.query(getAllUsersQuery);

    return res.status(200).json({
      success: true,
      response:
        getAllUsersResult.rowCount > 0
          ? getAllUsersResult.rows
          : "No Users Found",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
};

const deleteUserController = async (req, res) => {
  const { id } = req.params;
  // console.log(id);
  const deleteUserQuery = "DELETE FROM Users WHERE id = $1";
  try {
    await pool.query(deleteUserQuery, [id]);

    return res.status(200).json({
      success: true,
      response: "User Successfully Deleted",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Database error",
    });
  }
};

export { getAllUsersController, deleteUserController };
