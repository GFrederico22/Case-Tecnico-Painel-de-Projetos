const express = require("express");
const cors = require("cors");

const projectRoutes = require("./routes/projectRoutes");

const app = express();

app.use(cors());

app.use("/projects", projectRoutes);

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});