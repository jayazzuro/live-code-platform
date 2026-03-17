require("dotenv").config();
const express = require("express");
const configViewEngine = require("./config/viewEngine.js");
const code_sessions = require("./routes/codeSession.routes.js");
const executions = require("./routes/executions.routes.js");

const app = express();
const port = process.env.PORT;
const hostname = process.env.HOST_NAME;

configViewEngine(app);

app.use("/code-sessions", code_sessions);
app.use("/executions", executions);

app.listen(port, hostname, () => {
  console.log(`API running at http://${hostname}:${port}`);
});
