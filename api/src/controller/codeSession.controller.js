const prisma = require("../config/prisma");
const { randomUUID } = require("crypto");
const executionQueue = require("../config/queue");

exports.createSession = async (req, res) => {
  try {
    const id = randomUUID();
    const language = req.body.language || "python";
    const sourceCode = req.body.source_code || "";

    const session = await prisma.code_sessions.create({
      data: {
        session_id: id,
        language: language,
        source_code: sourceCode,
        status: "ACTIVE",
      },
    });

    const execution = await prisma.executions.create({
      data: {
        execution_id: randomUUID(),
        session_id: session.session_id,
        status: "PENDING",
      },
    });

    await executionQueue.add({
      execution_id: execution.execution_id,
    });

    res.status(201).json({
      session_id: session.session_id,
      execution_id: execution.execution_id,
      status: session.status,
    });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
};

exports.autoSaveSession = async (req, res) => {
  try {
    const { session_id } = req.params;
    const { language, source_code } = req.body;

    const session = await prisma.code_sessions.update({
      where: {
        session_id: session_id,
      },
      data: {
        language: language,
        source_code: source_code,
      },
    });

    res.json({
      session_id: session.session_id,
      status: session.status,
    });
  } catch (error) {
    res.status(500).json({ error: "Autosave failed" });
  }
};

exports.runSession = async (req, res) => {
  try {
    const { session_id } = req.params;

    const session = await prisma.code_sessions.findUnique({
      where: { session_id },
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const executionId = randomUUID();

    await prisma.executions.create({
      data: {
        execution_id: executionId,
        session_id: session_id,
        status: "QUEUED",
      },
    });

    await executionQueue.add({
      execution_id: executionId,
      session_id: session_id,
    });

    res.status(202).json({
      execution_id: executionId,
      status: "QUEUED",
    });
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
};
