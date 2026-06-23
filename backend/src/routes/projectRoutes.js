const express = require("express");

const router = express.Router();

const {
  getProjects
} = require("../services/projectService");

router.get("/", (req, res) => {
  const projects = getProjects();

  res.json(projects);
});

module.exports = router;