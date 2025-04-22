import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import { exec } from "child_process";
import { hrtime } from "process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const executePythonCode = async (sourceCode, input, testId) => {
  const executionId = `exec_${testId}_${Date.now()}`;
  const executionDirectory = `/sandbox/${executionId}`;

  return new Promise((resolve, reject) => {
    try {
      const LOCAL_WORKSPACE = join(
        __dirname,
        "..",
        "..",
        "workers",
        "python-worker",
        executionId
      );

      const PYTHON_WORKER_PATH = join(LOCAL_WORKSPACE, "NeoCode.py");
      const INPUT_FILE_PATH = join(LOCAL_WORKSPACE, "input.txt");

      const SECURITY_HEADER = `
DISALLOWED_MODULES = {"os", "sys", "subprocess", "shutil", "resource", "socket", "ctypes"}
import builtins
_real_import = builtins.__import__
def secure_import(name, *args, **kwargs):
    if name in DISALLOWED_MODULES:
        raise ImportError(f"Usage of '{name}' is restricted.")
    return _real_import(name, *args, **kwargs)
builtins.__import__ = secure_import
      `;

      const securedCode = SECURITY_HEADER + "\n\n" + sourceCode;

      fs.mkdirSync(LOCAL_WORKSPACE, { recursive: true });
      fs.writeFileSync(PYTHON_WORKER_PATH, securedCode, "utf-8");
      fs.writeFileSync(INPUT_FILE_PATH, input, "utf-8");

      const startTime = hrtime();

      // Search for python-container
      exec(
        'docker ps -q --filter "name=python-container"',
        (psError, psStdout) => {
          if (psError) {
            return reject({
              success: false,
              message: "Failed to check Docker container",
            });
          }

          // Start the python-container if not started
          if (!psStdout) {
            exec("docker start python-container", (startError) => {
              if (startError) {
                return reject({
                  success: false,
                  message: "Failed to start Docker container",
                });
              }
            });
          }

          // Copy files and execute
          exec(
            `docker exec python-container mkdir -p ${executionDirectory} && docker cp ${PYTHON_WORKER_PATH} python-container:/${executionDirectory}/NeoCode.py && docker cp ${INPUT_FILE_PATH} python-container:/${executionDirectory}/input.txt`,
            (copyError) => {
              if (copyError) {
                fs.rmSync(LOCAL_WORKSPACE, { recursive: true, force: true });
                return reject({
                  success: false,
                  message: "Failed to copy files to container",
                });
              }

              exec(
                `docker exec -i python-container sh -c "timeout 3 python3 /${executionDirectory}/NeoCode.py < /${executionDirectory}/input.txt"`,
                { timeout: 4000 },
                (error, stdout, stderr) => {
                  const endTime = hrtime(startTime);
                  const executionTime = `${
                    (endTime[0] * 1e9 + endTime[1]) / 1e6
                  } ms`;

                  exec(
                    `docker exec python-container rm -rf ${executionDirectory}`,
                    () => {
                      fs.rmSync(LOCAL_WORKSPACE, {
                        recursive: true,
                        force: true,
                      });

                      if (error) {
                        // TLE detection
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

                        // Runtime Error
                        return resolve({
                          success: false,
                          message: "Runtime Error",
                          error: stderr || error.message,
                          executionTime,
                        });
                      }

                      // Successful Execution
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
      reject({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  });
};

export default executePythonCode;
