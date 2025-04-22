import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import { exec } from "child_process";
import { hrtime } from "process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const executeCppCode = async (sourceCode, input, testId) => {
  const executionId = `exec_${testId}_${Date.now()}`;
  const executionDirectory = `/sandbox/${executionId}`;

  return new Promise((resolve, reject) => {
    try {
      const LOCAL_WORKSPACE = join(
        __dirname,
        "..",
        "..",
        "workers",
        "cpp-worker",
        executionId
      );
      const LOCAL_CPP_FILE = join(LOCAL_WORKSPACE, "NeoCode.cpp");
      const LOCAL_INPUT_FILE = join(LOCAL_WORKSPACE, "input.txt");

      // Create local workspace for this execution
      fs.mkdirSync(LOCAL_WORKSPACE, { recursive: true });
      fs.writeFileSync(LOCAL_CPP_FILE, sourceCode, "utf-8");
      fs.writeFileSync(LOCAL_INPUT_FILE, input, "utf-8");

      const startTime = hrtime();

      exec(
        'docker ps -q --filter "name=cpp-container"',
        (psError, psStdout) => {
          if (psError) {
            console.error("Docker ps error:", psError);
            return reject({
              success: false,
              message: "Failed to check Docker container",
            });
          }

          // Start container if not running
          if (!psStdout) {
            exec("docker start cpp-container", (startError) => {
              if (startError) {
                console.error("Container start error:", startError);
                return reject({
                  success: false,
                  message: "Failed to start Docker container",
                });
              }
            });
          }

          // Create isolated workspace inside container and copy files
          exec(
            `docker exec cpp-container mkdir -p ${executionDirectory} && docker cp ${LOCAL_CPP_FILE} cpp-container:${executionDirectory}/NeoCode.cpp && docker cp ${LOCAL_INPUT_FILE} cpp-container:${executionDirectory}/input.txt`,
            (copyError) => {
              if (copyError) {
                console.error("File copy error: ", copyError);

                fs.rmSync(LOCAL_WORKSPACE, {
                  recursive: true,
                  force: true,
                });

                return reject({
                  success: false,
                  message: "Failed to copy files to container",
                });
              }

              // Compile and execute inside isolated directory
              exec(
                `docker exec -i cpp-container sh -c "g++ ${executionDirectory}/NeoCode.cpp -o ${executionDirectory}/NeoCode.out && ${executionDirectory}/NeoCode.out < ${executionDirectory}/input.txt"`,
                { timeout: 4000 },
                (error, stdout, stderr) => {
                  const endTime = hrtime(startTime);
                  const executionTime = `${
                    (endTime[0] * 1e9 + endTime[1]) / 1e6
                  } ms`;

                  // Clean up
                  exec(
                    `docker exec cpp-container rm -rf ${executionDirectory}`,
                    () => {
                      fs.rmSync(LOCAL_WORKSPACE, {
                        recursive: true,
                        force: true,
                      });

                      if (error) {
                        if (
                          error.code === 124 ||
                          error.killed ||
                          stderr.includes("Command terminated") ||
                          stderr.includes("timed out")
                        ) {
                          return resolve({
                            success: false,
                            message: "Time Limit Exceeded",
                            error: "Time Limit Exceeded",
                            executionTime,
                          });
                        }

                        return resolve({
                          success: false,
                          message: "Runtime Error",
                          error: stderr || error.message,
                          executionTime,
                        });
                      }

                      return resolve({
                        success: true,
                        output: stdout.trimEnd(),
                        executionTime,
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    } catch (error) {
      console.error("File write error:", error);
      reject({ success: false, message: "Internal Server Error" });
    }
  });
};

export default executeCppCode;
