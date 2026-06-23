const projects = require("../data/projects");

function getProjects() {
  return projects.map(project => {

    const saldoHoras =
      project.horasVendidas -
      project.horasApontadas;

    const percentualAvanco =
      (project.horasApontadas /
        project.horasVendidas) * 100;

    let status = "Saudável";

    if (
      saldoHoras < 0 ||
      percentualAvanco > 90
    ) {
      status = "Crítico";
    } else if (
      percentualAvanco >= 70
    ) {
      status = "Atenção";
    }

    return {
      ...project,
      saldoHoras,
      percentualAvanco:
        Number(percentualAvanco.toFixed(2)),
      status
    };
  });
}

module.exports = {
  getProjects
};