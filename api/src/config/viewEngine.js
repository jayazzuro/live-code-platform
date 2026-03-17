const path = require("path");
const express = require("express");
const cors = require("cors");
const configViewEngine = (app) => {
  app.set("views", path.join("./src", "views"));
  app.use(express.static(path.join(__dirname, "../public")));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );
};

module.exports = configViewEngine;
