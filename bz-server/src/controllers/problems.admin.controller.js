import { pool } from "../database/connect.db.js";
import generateUuid from "../constants/generateUuid.js";

const createProblemController = async (req, res) => {
  const {
    title,
    description,
    input_format,
    output_format,
    constraints,
    prohibited_keys,
    sample_testcase,
    explaination,
    difficulty,
    score,
    hidden_testcases,
    category,
    solution,
    solutionLanguage,
  } = req.body;

  const userId = req.userId;

  const createProblemQuery = `
    INSERT INTO Problem (
      title, description, input_format, output_format,
      constraints, prohibited_keys, sample_testcase,
      explaination, difficulty, score, category,
      solution, solution_language, created_by
    )
    VALUES (
      $1, $2, $3, $4,
      $5, $6, $7,
      $8, $9, $10, $11,
      $12, $13, $14
    ) RETURNING id
  `;

  const createProblemProps = [
    title,
    description,
    input_format,
    output_format,
    constraints,
    prohibited_keys,
    sample_testcase,
    explaination || "Self Explainary!",
    difficulty,
    score,
    category || [],
    solution || "No Solution",
    solutionLanguage || null,
    userId,
  ];

  try {
    const createProblemResult = await pool.query(
      createProblemQuery,
      createProblemProps
    );

    if (createProblemResult.rowCount > 0) {
      const problemId = createProblemResult.rows[0].id;

      const insertHiddenTestcasesQuery = `
        INSERT INTO testcases (id, testcase, problem_id)
        VALUES ($1, $2, $3)
      `;

      for (const test of hidden_testcases) {
        await pool.query(insertHiddenTestcasesQuery, [
          generateUuid(),
          test,
          problemId,
        ]);
      }

      return res.status(200).json({
        success: true,
        message: "Problem created successfully",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Problem creation failed. Please try again.",
      });
    }
  } catch (error) {
    console.error("Error creating problem:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

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

export { createProblemController, deleteProblemController };
