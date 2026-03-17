const express = require("express");
const router = express.Router();
const code_sessions = require("../controller/codeSession.controller");

router.post("/", code_sessions.createSession);
router.patch("/:session_id", code_sessions.autoSaveSession);
router.post("/:session_id/run", code_sessions.runSession);

module.exports = router;
