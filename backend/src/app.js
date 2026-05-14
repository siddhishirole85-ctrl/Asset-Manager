require("dotenv").config();
const express = require("express");
const cors = require("cors");
const apiRouter = require("./routes/api");
const healthController = require("./controllers/healthController");
const { requestLogger, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(requestLogger);

app.get("/health", healthController.health);
app.get("/db-status", healthController.dbStatus);
app.get("/db-tables", healthController.dbTables);
app.get("/db-data-status", healthController.dbDataStatus);

app.use("/api", apiRouter);

app.use(errorHandler);

module.exports = app;
