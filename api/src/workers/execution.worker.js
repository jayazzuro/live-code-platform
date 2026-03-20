const executionQueue = require("../config/queue");
const prisma = require("../config/prisma");
const { spawn } = require("child_process");

executionQueue.process(async (job) => {
  const { execution_id, session_id } = job.data;

  try {
    const execution = await prisma.executions.findUnique({
      where: { execution_id },
    });

    if (!execution) {
      console.log(`Execution not found: ${execution_id}`);
      return;
    }

    const session = await prisma.code_sessions.findUnique({
      where: { session_id },
    });

    if (!session) {
      await prisma.executions.update({
        where: { execution_id },
        data: {
          status: "FAILED",
          stderr: "Session not found",
        },
      });
      return;
    }

    await prisma.executions.update({
      where: { execution_id },
      data: { status: "RUNNING" },
    });

    const start = Date.now();

    const child = spawn(
      "docker",
      [
        "run",
        "--rm",
        "-i",
        "--network",
        "none",
        "--memory=128m",
        "--cpus=0.5",
        "python:3.10",
        "sh",
        "-c",
        "cat > /tmp/main.py && python /tmp/main.py",
      ],
      {
        stdio: ["pipe", "pipe", "pipe"],
      }
    );

    let stdout = "";
    let stderr = "";
    let isTimedOut = false;

    const timer = setTimeout(() => {
      isTimedOut = true;
      child.kill("SIGKILL");
    }, 5000);

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", async (code) => {
      clearTimeout(timer);
      const executionTime = Date.now() - start;

      try {
        if (isTimedOut) {
          await prisma.executions.update({
            where: { execution_id },
            data: {
              status: "FAILED",
              stdout,
              stderr: "Execution timed out",
              execution_time_ms: executionTime,
            },
          });
          return;
        }

        if (code === 0) {
          await prisma.executions.update({
            where: { execution_id },
            data: {
              status: "COMPLETED",
              stdout,
              stderr,
              execution_time_ms: executionTime,
            },
          });
        } else {
          await prisma.executions.update({
            where: { execution_id },
            data: {
              status: "FAILED",
              stdout,
              stderr: stderr || `Process exited with code ${code}`,
              execution_time_ms: executionTime,
            },
          });
        }
      } catch (dbError) {
        console.error("DB update error:", dbError.message);
      }
    });

    child.on("error", async (err) => {
      clearTimeout(timer);

      await prisma.executions.update({
        where: { execution_id },
        data: {
          status: "FAILED",
          stderr: err.message,
          execution_time_ms: Date.now() - start,
        },
      });
    });

    child.stdin.write(session.source_code || "");
    child.stdin.end();
  } catch (error) {
    console.error("Worker error:", error.message);

    await prisma.executions
      .update({
        where: { execution_id },
        data: {
          status: "FAILED",
          stderr: error.message,
        },
      })
      .catch(() => {});
  }
});
