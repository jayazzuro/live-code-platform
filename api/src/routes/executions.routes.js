const express = require("express");
const router = express.Router();
const executions = require("../controller/executions.controller");

router.get("/:execution_id", executions.getExecution);

module.exports = router;
