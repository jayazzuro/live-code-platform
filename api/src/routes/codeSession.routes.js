const express = require("express");
const router = express.Router();
const code_sessions = require("../controller/codeSession.controller");
const validateCode = require("../middlewares/validateCode");

router.post("/", validateCode, code_sessions.createSession);
router.patch("/:session_id", validateCode, code_sessions.autoSaveSession);
router.post("/:session_id/run", code_sessions.runSession);

module.exports = router;
