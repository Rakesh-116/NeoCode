import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import { exec } from "child_process";
import { hrtime } from "process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CLASS_FILE_PATH = join(
  __dirname,
  "..",
  "..",
  "workers",
  "java-worker",
  "NeoCode.class"
).replace(/\\/g, "/");

// 💡 Sanitize risky Java code
const sanitizeJavaCode = (code) => {
  return code
    .replace(/System\.exit\s*\(\s*\d*\s*\)/g, "// blocked System.exit")
    .replace(/Runtime\.getRuntime\s*\(\)/g, "// blocked Runtime")
    .replace(/import\s+java\.io\..*;/g, "// blocked java.io import")
    .replace(/import\s+java\.net\..*;/g, "// blocked java.net import")
    .replace(/import\s+java\.lang\.reflect\..*;/g, "// blocked reflection");
};

const executeJavaCode = async (sourceCode, input, testId) => {
  const executionId = `exec_${testId}_${Date.now()}`;
  const executionDirectory = `/sandbox/${executionId}`;

  return new Promise((resolve, reject) => {
    try {
      const LOCAL_WORKSPACE = join(
        __dirname,
        "..",
        "..",
        "workers",
        "java-worker",
        executionId
      );

      const LOCAL_JAVA_FILE = join(LOCAL_WORKSPACE, "NeoCode.java");
      const LOCAL_INPUT_FILE = join(LOCAL_WORKSPACE, "input.txt");

      fs.mkdirSync(LOCAL_WORKSPACE, { recursive: true });

      // 🧼 Sanitize user code
      const safeCode = sanitizeJavaCode(sourceCode);

      fs.writeFileSync(LOCAL_JAVA_FILE, safeCode, "utf-8");
      fs.writeFileSync(LOCAL_INPUT_FILE, input, "utf-8");

      const startTime = hrtime();

      exec(
        'docker ps -q --filter "name=java-container"',
        (psError, psStdout) => {
          if (psError) {
            return reject({
              success: false,
              message: `Failed to check Docker container: ${psError}`,
            });
          }

          if (!psStdout) {
            exec("docker start java-container", (startError) => {
              if (startError) {
                return reject({
                  success: false,
                  message: `Failed to start Docker container: ${startError}`,
                });
              }
            });
          }

          exec(
            `docker exec java-container mkdir -p ${executionDirectory} && docker cp ${LOCAL_JAVA_FILE} java-container:${executionDirectory}/NeoCode.java && docker cp ${LOCAL_INPUT_FILE} java-container:${executionDirectory}/input.txt`,
            (copyError) => {
              if (copyError) {
                fs.rmSync(LOCAL_WORKSPACE, { recursive: true, force: true });
                return reject({
                  success: false,
                  message: `Failed to copy files to container: ${copyError}`,
                });
              }

              // Compile + Run with timeout
              exec(
                `docker exec -i java-container sh -c "javac ${executionDirectory}/NeoCode.java && timeout 3 java -cp ${executionDirectory} NeoCode < ${executionDirectory}/input.txt"`,
                { timeout: 4000 },
                (error, stdout, stderr) => {
                  const endTime = hrtime(startTime);
                  const executionTime = `${
                    (endTime[0] * 1e9 + endTime[1]) / 1e6
                  } ms`;

                  const cleanUp = () => {
                    exec(
                      `docker exec java-container rm -rf ${executionDirectory}`,
                      () => {
                        fs.rmSync(LOCAL_WORKSPACE, {
                          recursive: true,
                          force: true,
                        });
                        fs.unlink(CLASS_FILE_PATH, (err) => {
                          if (!err) {
                            console.log("NeoCode.class deleted");
                          }
                        });
                      }
                    );
                  };

                  if (error) {
                    cleanUp();

                    // ⏱️ TLE Check
                    if (
                      error.killed ||
                      error.signal === "SIGTERM" ||
                      stderr.includes("timed out")
                    ) {
                      return resolve({
                        success: false,
                        message: "Time Limit Exceeded",
                        error: "Time Limit Exceeded",
                        executionTime,
                      });
                    }

                    // 💥 Runtime Error
                    return resolve({
                      success: false,
                      message: "Runtime Error",
                      error: stderr || error.message,
                      executionTime,
                    });
                  }

                  cleanUp();

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
    } catch (err) {
      return reject({ success: false, message: "Internal Server Error" });
    }
  });
};

export default executeJavaCode;
