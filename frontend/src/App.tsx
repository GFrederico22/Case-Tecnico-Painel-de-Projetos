import { useEffect, useState } from "react";
import axios from "axios";

interface Project {
  id: number;
  nome: string;
  horasVendidas: number;
  horasApontadas: number;
  saldoHoras: number;
  percentualAvanco: number;
  status: string;
}

function App() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/projects")
      .then((response) => {
        setProjects(response.data);
      })
      .catch((error) => {
        console.error("Erro ao buscar projetos:", error);
      });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Painel de Projetos - PVT</h1>

      <table border={1}>
        <thead>
          <tr>
            <th>Projeto</th>
            <th>Horas Vendidas</th>
            <th>Horas Apontadas</th>
            <th>Saldo</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {projects.map((project) => (
            <tr key={project.id}>
              <td>{project.nome}</td>
              <td>{project.horasVendidas}</td>
              <td>{project.horasApontadas}</td>
              <td>{project.saldoHoras}</td>
              <td>
  {project.status === "Saudável" && "🟢 Saudável"}
  {project.status === "Atenção" && "🟡 Atenção"}
  {project.status === "Crítico" && "🔴 Crítico"}
</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;