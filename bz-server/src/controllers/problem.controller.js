import { pool } from "../database/connect.db.js";

const getAllProblemsController = async (req, res) => {
  const { categories, difficulty, search } = req.query;

  const categoryList = categories ? categories.split(",") : [];
  let baseQuery = `
    SELECT id, title, score, difficulty, category
    FROM Problem
  `;
  const conditions = [];
  const values = [];

  if (categoryList.length > 0) {
    values.push(categoryList);
    conditions.push(`category @> $${values.length}::text[]`);
  }

  if (difficulty) {
    values.push(difficulty.toLowerCase());
    conditions.push(`LOWER(difficulty::text) = $${values.length}`);
  }

  if (search) {
    values.push(`%${search.toLowerCase()}%`);
    conditions.push(`LOWER(title) LIKE $${values.length}`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderClause = "ORDER BY id ASC";
  const finalQuery = `${baseQuery} ${whereClause} ${orderClause}`;

  try {
    const result = await pool.query(finalQuery, values);
    return res.status(result.rowCount > 0 ? 200 : 404).json({
      success: result.rowCount > 0,
      problems: result.rows,
      message: result.rowCount > 0 ? undefined : "No problems found",
    });
  } catch (error) {
    console.error("Error fetching problems:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

const getProblemDetailsController = async (req, res) => {
  const problemId = req.params.id;
  const { submission_id } = req.query;

  try {
    const problemResult = await pool.query(
      "SELECT * FROM Problem WHERE id = $1",
      [problemId]
    );

    if (problemResult.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Problem not found" });
    }

    const responseData = {
      problem: problemResult.rows[0],
    };

    if (submission_id) {
      const submissionResult = await pool.query(
        "SELECT id, user_id, code, language FROM Submissions WHERE id = $1 AND problem_id = $2",
        [submission_id, problemId]
      );

      if (submissionResult.rowCount > 0) {
        responseData.submission = submissionResult.rows[0];
      } else {
        responseData.submission = null;
      }
    }

    return res.status(200).json({ success: true, ...responseData });
  } catch (error) {
    console.error("Error in getProblemDetailsController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

const getAllSubmissionsController = async (req, res) => {
  const userId = req.userId;
  const { limit, skip } = req.query;

  const parsedLimit = parseInt(limit, 10) || 10;
  const parsedSkip = parseInt(skip, 10) || 0;

  const getAllSubmissionsQuery = `
    SELECT s.*, p.title AS problem_title
    FROM submissions s
    JOIN problem p ON s.problem_id = p.id
    WHERE user_id = $1
    ORDER BY s.submission_time DESC
    LIMIT $2 OFFSET $3
  `;
  const getTotalSubmissionsQuery = `SELECT COUNT(*) FROM submissions WHERE user_id = $1`;

  try {
    const [submissionsResult, totalCountResult] = await Promise.all([
      pool.query(getAllSubmissionsQuery, [userId, parsedLimit, parsedSkip]),
      pool.query(getTotalSubmissionsQuery, [userId]),
    ]);

    const submissionsWithStats = submissionsResult.rows.map((submission) => {
      const testResults = submission.test_results || [];
      const totalTestcases = testResults.length;
      const passedTestcases = testResults.filter(
        (t) => t.success === true
      ).length;

      return {
        ...submission,
        totalTestcases,
        passedTestcases,
      };
    });

    return res.status(200).json({
      success: true,
      submissions: submissionsWithStats,
      totalSubmissions: parseInt(totalCountResult.rows[0].count, 10),
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

const getAllProblemSubmissionsController = async (req, res) => {
  const problemId = req.params.id;
  const userId = req.userId;

  try {
    const result = await pool.query(
      `SELECT * FROM submissions WHERE problem_id = $1 AND user_id = $2 ORDER BY submission_time DESC`,
      [problemId, userId]
    );

    return res.status(200).json({
      success: true,
      submissionDetails: result.rows,
      message: result.rowCount > 0 ? undefined : "No Submissions",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

export {
  getAllProblemsController,
  getProblemDetailsController,
  getAllSubmissionsController,
  getAllProblemSubmissionsController,
};
