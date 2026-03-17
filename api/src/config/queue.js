require("dotenv").config();
const Queue = require("bull");

const executionQueue = new Queue("code-execution", process.env.REDIS_URL);

module.exports = executionQueue;
