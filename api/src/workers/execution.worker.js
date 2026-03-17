const executionQueue = require("../config/queue");
const prisma = require("../config/prisma");
const { exec } = require("child_process");

executionQueue.process(async (job) => {
  console.log("Job received:", job.data);
  const { execution_id } = job.data;

  const execution = await prisma.executions.findUnique({
    where: { execution_id },
  });

  if (!execution) return;

  const session = await prisma.code_sessions.findUnique({
    where: { session_id: execution.session_id },
  });

  if (!session) return;

  await prisma.executions.update({
    where: { execution_id },
    data: { status: "RUNNING" },
  });

  const start = Date.now();

  return new Promise((resolve) => {
    exec(`python3 -c "${session.source_code}"`, async (err, stdout, stderr) => {
      const executionTime = Date.now() - start;

      if (err) {
        await prisma.executions.update({
          where: { execution_id },
          data: {
            status: "FAILED",
            stderr: stderr,
            execution_time_ms: executionTime,
          },
        });

        return resolve();
      }

      await prisma.executions.update({
        where: { execution_id },
        data: {
          status: "COMPLETED",
          stdout: stdout,
          execution_time_ms: executionTime,
        },
      });

      resolve();
    });
  });
});
