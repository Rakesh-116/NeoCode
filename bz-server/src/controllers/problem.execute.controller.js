import { pool } from "../database/connect.db.js";
import executeJavaCode from "./compilers/executeJavaCode.controller.js";
import executePythonCode from "./compilers/executePythonCode.controller.js";
import executeCppCode from "./compilers/executeCppCode.controller.js";

import generateUuid from "../constants/generateUuid.js";

const executeProblemController = async (req, res) => {
  try {
    const { sourceCode, language, input } = req.body;
    console.log("Executing with input:", JSON.stringify(input.trim()));

    console.log(language, input);

    const userId = req.userId;

    if (typeof language === "string" && language.toLowerCase() === "java") {
      const result = await executeJavaCode(
        sourceCode,
        input,
        `sample_${userId}`
      );
      console.log(result.output);
      return result.success
        ? res.status(200).json(result)
        : res.status(402).json(result);
    } else if (
      typeof language === "string" &&
      language.toLowerCase() === "python"
    ) {
      const result = await executePythonCode(
        sourceCode,
        input,
        `sample_${userId}`
      );
      console.log(result);
      return result.success
        ? res.status(200).json(result)
        : res.status(402).json(result);
    } else if (
      typeof language === "string" &&
      language.toLowerCase() === "cpp"
    ) {
      const result = await executeCppCode(
        sourceCode,
        input,
        `sample_${userId}`
      );
      console.log(result);
      return result.success
        ? res.status(200).json(result)
        : res.status(402).json(result);
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Unsupported language" });
    }
  } catch (error) {
    console.error("Controller error:", error);
    return res.status(500).json({ success: false, message: error });
  }
};

const submitProblemController = async (req, res) => {
  try {
    const { problemId, sourceCode, language } = req.body;
    const userId = req.userId;

    const getProblemTestcasesQuery =
      "SELECT * FROM testcases WHERE problem_id = $1";

    const getProblemTestcasesResult = await pool.query(
      getProblemTestcasesQuery,
      [problemId]
    );

    if (getProblemTestcasesResult.rowCount > 0) {
      // console.log(getProblemTestcasesResult);

      const hiddenTestcases = getProblemTestcasesResult.rows;
      console.log("lkfne:", hiddenTestcases);

      let executeCode = null;
      if (typeof language === "string" && language.toLowerCase() === "java") {
        executeCode = executeJavaCode;
      } else if (
        typeof language === "string" &&
        language.toLowerCase() === "python"
      ) {
        executeCode = executePythonCode;
      } else if (
        typeof language === "string" &&
        language.toLowerCase() === "cpp"
      ) {
        executeCode = executeCppCode;
      } else {
        executeCode = null;
        return res
          .status(400)
          .json({ success: false, message: "Unsupported language" });
      }

      if (executeCode != null) {
        let testResults = [];
        for (const test of hiddenTestcases) {
          const result = await executeCode(
            sourceCode,
            test.testcase.input,
            test.id
          );
          // console.log("result luffy: ", result);
          // console.log(test);
          // console.log(test.testcase.input);
          let verdict;
          // console.log("luffy");
          // console.log(result.output);
          // console.log("-------");
          // console.log(test.testcase.output);
          // console.log(test.testcase.output === result.output);

          if (result.error) {
            if (result.error.toLowerCase().includes("time limit")) {
              verdict = "TLE";
            } else {
              verdict = "RTE";
            }
          } else if (
            result.output.trimEnd() === test.testcase.output.trimEnd()
          ) {
            verdict = "ACCEPTED";
          } else {
            verdict = "WRONG ANSWER";
          }

          testResults.push({ ...result, verdict });
        }
        // console.log("tr:", testResults);

        let verdict = "ACCEPTED";
        let totalExecutionTime = 0;

        for (let test of testResults) {
          totalExecutionTime += test.executionTime;

          if (test.verdict === "TLE") {
            verdict = "TLE";
            break;
          }
          if (test.verdict === "RTE") {
            verdict = "RTE";
            break;
          }
          if (test.verdict === "WRONG ANSWER") {
            verdict = "WRONG ANSWER";
            break;
          }
        }

        const insertProblemSubmissionQuery =
          "INSERT INTO submissions (id,problem_id, user_id, code, language, test_results, verdict, execution_time) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *";

        const insertHiddenTestcasesProps = [
          generateUuid(),
          problemId,
          userId,
          sourceCode,
          language,
          JSON.stringify(testResults),
          verdict,
          totalExecutionTime,
        ];

        const insertHiddenTestcasesResult = await pool.query(
          insertProblemSubmissionQuery,
          insertHiddenTestcasesProps
        );

        if (insertHiddenTestcasesResult.rowCount === 0) {
          return res.status(410).send("Submission Error");
        }

        console.log(insertHiddenTestcasesResult.rows);

        const totalTestcases = testResults.length;
        const passedTestcases = testResults.filter(
          (t) => t.verdict === "ACCEPTED"
        ).length;

        const responsePayload = {
          success: verdict === "ACCEPTED",
          verdict: verdict,
          totalTestcases,
          passedTestcases,
          totalExecutionTime,
          testResults, // Array of detailed results
          submissionDetails: insertHiddenTestcasesResult.rows[0], // You can still send this
        };

        return res
          .status(verdict === "ACCEPTED" ? 200 : 402)
          .json(responsePayload);
      }

      // if (typeof language === "string" && language.toLowerCase() === "java") {
      //   let testResults = [];
      //   for (const test of hiddenTestcases) {
      //     const result = await executeJavaCode(
      //       sourceCode,
      //       test.testcase.input,
      //       test.id
      //     );
      //     // console.log("result luffy: ", result);
      //     // console.log(test);
      //     // console.log(test.testcase.input);
      //     let verdict;
      //     if (result.output === test.testcase.output) {
      //       verdict = "ACCEPTED";
      //     } else {
      //       verdict = "WRONG ANSWER";
      //     }
      //     testResults.push({ ...result, verdict });
      //   }
      //   console.log("tr:", testResults);

      //   let verdict = "";
      //   let totalExecutionTime = 0;

      //   for (let test of testResults) {
      //     if (test.verdict === "WRONG ANSWER") {
      //       verdict = "WRONG ANSWER";
      //       break;
      //     } else {
      //       verdict = "ACCEPTED";
      //     }
      //     totalExecutionTime += test.executionTime;
      //   }

      //   const insertProblemSubmissionQuery =
      //     "INSERT INTO submissions (id,problem_id, user_id, code, language, test_results, verdict, execution_time) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *";

      //   const insertHiddenTestcasesProps = [
      //     generateUuid(),
      //     problemId,
      //     userId,
      //     sourceCode,
      //     language,
      //     JSON.stringify(testResults),
      //     verdict,
      //     totalExecutionTime,
      //   ];

      //   const insertHiddenTestcasesResult = await pool.query(
      //     insertProblemSubmissionQuery,
      //     insertHiddenTestcasesProps
      //   );

      //   if (insertHiddenTestcasesResult.rowCount === 0) {
      //     return res.status(410).send("Submission Error");
      //   }

      //   console.log(insertHiddenTestcasesResult);

      //   return res.status(200).json({
      //     success: true,
      //     insertHiddenTestcasesResult,
      //   });
      // } else if (
      //   typeof language === "string" &&
      //   language.toLowerCase() === "python"
      // ) {
      //   let testResults = [];
      //   for (const test of hiddenTestcases) {
      //     const result = await executePythonCode(
      //       sourceCode,
      //       test.testcase.input,
      //       test.id
      //     );
      //     let verdict;
      //     if (result.output === test.testcase.output) {
      //       verdict = "ACCEPTED";
      //     } else {
      //       verdict = "WRONG ANSWER";
      //     }
      //     testResults.push({ ...result, verdict });
      //   }
      //   console.log("tr:", testResults);

      //   let verdict = "";
      //   let totalExecutionTime = 0;

      //   for (let test of testResults) {
      //     if (test.verdict === "WRONG ANSWER") {
      //       verdict = "WRONG ANSWER";
      //       break;
      //     } else {
      //       verdict = "ACCEPTED";
      //     }
      //     totalExecutionTime += test.executionTime;
      //   }

      //   const insertProblemSubmissionQuery =
      //     "INSERT INTO submissions (id,problem_id, user_id, code, language, test_results, verdict, execution_time) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *";

      //   const insertHiddenTestcasesProps = [
      //     generateUuid(),
      //     problemId,
      //     userId,
      //     sourceCode,
      //     language,
      //     JSON.stringify(testResults),
      //     verdict,
      //     totalExecutionTime,
      //   ];

      //   const insertHiddenTestcasesResult = await pool.query(
      //     insertProblemSubmissionQuery,
      //     insertHiddenTestcasesProps
      //   );

      //   if (insertHiddenTestcasesResult.rowCount === 0) {
      //     return res.status(410).send("Submission Error");
      //   }

      //   console.log(insertHiddenTestcasesResult);

      //   return res.status(200).json({
      //     success: true,
      //     insertHiddenTestcasesResult,
      //   });
      // }
    } else {
      return res
        .status(400)
        .json({ success: false, message: "No Testcases for the Problem" });
    }
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Internal Server Error" });
  }
};

const getExpectedOutputController = async (req, res) => {
  const { problemId, input } = req.body;
  const userId = req.userId;

  const getSolutionQuery =
    "SELECT solution, solution_language FROM problem WHERE id = $1";

  try {
    const getSolutionResult = await pool.query(getSolutionQuery, [problemId]);

    if (getSolutionResult.rowCount === 0) {
      return res.status(404).json({
        success: true,
        message: "No Predefined Solution is Present",
      });
    }

    const { solution, solution_language } = getSolutionResult.rows[0];

    if (
      typeof solution_language === "string" &&
      solution_language.toLowerCase() === "java"
    ) {
      const result = await executeJavaCode(solution, input, `sample_${userId}`);
      return res.json(result);
    } else if (
      typeof solution_language === "string" &&
      solution_language.toLowerCase() === "python"
    ) {
      const result = await executePythonCode(
        solution,
        input,
        `sample_${userId}`
      );
      console.log(result);
      return res.json(result);
    } else if (
      typeof solution_language === "string" &&
      solution_language.toLowerCase() === "cpp"
    ) {
      const result = await executeCppCode(solution, input, `sample_${userId}`);
      console.log(result);
      return res.json(result);
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Unsupported language" });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

export {
  executeProblemController,
  submitProblemController,
  getExpectedOutputController,
};
