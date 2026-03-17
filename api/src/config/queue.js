require("dotenv").config();
const Queue = require("bull");

const executionQueue = new Queue("code-execution", {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

module.exports = executionQueue;
