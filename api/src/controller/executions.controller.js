const prisma = require("../config/prisma");

exports.getExecution = async (req, res) => {
  try {
    const { execution_id } = req.params;

    const e = await prisma.executions.findUnique({
      where: {
        execution_id,
      },
    });

    if (!e) {
      return res.status(404).json({ detail: error.message });
    }

    res.json({
      execution_id: e.execution_id,
      status: e.status,
      stdout: e.stdout || "",
      stderr: e.stderr || "",
      execution_time_ms: e.execution_time_ms,
    });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
};
