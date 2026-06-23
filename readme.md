Case Técnico – Painel de Projetos

# Contexto
Este documento apresenta a proposta de modelagem e arquitetura para o módulo Painel de Projetos do Portal de Gestão da PVT Software & Serviços.
O objetivo da solução é permitir o acompanhamento da saúde dos projetos, consolidando informações de horas vendidas, planejadas e realizadas, bem como indicadores de avanço e status operacional.
Como o TOTVS RM é a fonte oficial dos dados, ele será tratado como um sistema externo responsável pelo fornecimento das informações utilizadas pelo portal.

## Como Executar

### Backend

```bash
cd backend
npm install
npm run dev
```

Após iniciar o servidor, a API estará disponível em:

```text
http://localhost:3000/projects
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Após iniciar a aplicação, ela estará disponível em:

```text
http://localhost:5173
```
# 1. Modelagem do Domínio

## Cliente: Representa a empresa contratante do projeto.
### Principais atributos
- id
- nome
- cnpj
- email
- telefone

## Projeto: Representa um projeto executado pela PVT.
### Principais atributos
- id
- nome
- descricao
- data_inicio
- data_fim_prevista
- horas_vendidas
- horas_planejadas
- valor_vendido
- percentual_entrega_previsto
- percentual_entrega_real
- status
- cliente_id

## Analista: Representa o colaborador responsável pela execução das atividades.
### Principais atributos
- id
- nome
- email
- cargo

## Alocação: Representa a participação planejada de um analista em um projeto.
### Principais atributos
- id
- projeto_id
- analista_id
- horas_previstas

## Apontamento: Representa o registro das horas efetivamente trabalhadas pelos analistas.
### Principais atributos
- id
- projeto_id
- analista_id
- data
- horas
- descricao

## Relacionamentos
```text
Cliente (1)
   │
   └───< (N) Projeto

Projeto
   │
   ├───< (N) Alocacao (N) >─── (1) Analista
   │
   └───< (N) Apontamento (N) >── (1) Analista
```

**Observação:**
A entidade Alocação representa o planejamento da participação dos analistas nos projetos. A entidade Apontamento representa as horas efetivamente trabalhadas. Essa separação permite comparar o planejado com o realizado, auxiliando na identificação de desvios de execução e consumo de horas.

A entidade central do domínio é Projeto, pois concentra o acompanhamento operacional e financeiro utilizado para cálculo dos indicadores de saúde.

# 2. Arquitetura da Solução

A arquitetura foi desenhada em camadas para garantir clareza, escalabilidade e facilidade de manutenção.

## Frontend (Web)
Responsável pela interface do usuário.

### Funcionalidades
- Visualização de dashboards;
- Lista de projetos;
- Indicadores de saúde;
- Consulta de apontamentos e alocações.
### Tecnologias sugeridas:
- React
- TypeScript

## Backend (API)
Responsável pela aplicação das regras de negócio e exposição dos dados.

### Tecnologia
- Node.js
- Express
### Estrutura
- Controllers (entrada HTTP)
- Services (regras de negócio)
- Repositories (acesso a dados)

## Banco de Dados

### Tecnologia
- PostgreSQL
### Responsabilidades
- Armazenamento estruturado dos dados;
- Histórico de apontamentos;
- Indicadores operacionais;
- Dados sincronizados do ERP.

## Integração com ERP (TOTVS RM)

O TOTVS RM será tratado como fonte oficial dos dados. A integração ocorrerá por meio de processos de sincronização periódicos (jobs/batches).

### Motivos da sincronização
- Redução da dependência direta do ERP;
- Melhor desempenho das consultas;
- Continuidade da operação mesmo durante indisponibilidades do RM;
- Possibilidade de auditoria e histórico local.

## Fluxo da Solução
```text
ERP TOTVS RM
        ↓
Processo de Sincronização
        ↓
PostgreSQL
        ↓
API Node.js
        ↓
Frontend (Painel de Projetos)
```

# 3. Design da API (REST)

## Projetos

GET /projects (Lista todos os projetos com resumo operacional.)
Exemplo de retorno
```json
{
  "id": 1,
  "nome": "Implantação TOTVS RM",
  "cliente": "Empresa ABC",
  "horas_vendidas": 200,
  "horas_apontadas": 150,
  "saldo_horas": 50,
  "percentual_avanco": 75,
  "status": "Saudável"
}
```

GET /projects/:id (Retorna os detalhes completos do projeto.)

GET /projects/:id/health (Retorna os indicadores de saúde do projeto.)
Exemplo de retorno
```json
{
  "saldo_horas": 50,
  "percentual_avanco": 75,
  "percentual_entrega_real": 70,
  "percentual_entrega_previsto": 80,
  "status": "Atenção"
}
```

## Apontamentos

POST /time-entries (Registra horas trabalhadas.)
Body
```json
{
  "projeto_id": 1,
  "analista_id": 2,
  "horas_trabalhadas": 8,
  "data": "2026-06-22",
  "descricao": "Configuração de ambiente"
}
```

GET /projects/:id/time-entries (Lista todos os apontamentos de um projeto.)

## Analistas

GET /analysts (Lista todos os analistas.)

## Integração ERP

POST /sync/erp (Dispara manualmente uma sincronização com o ERP (mockado neste escopo).)

# 4. Regras de Negócio

## Saldo de Horas
```text
Saldo = Horas Vendidas - Horas Apontadas
```
O saldo representa a quantidade de horas ainda disponível para execução do projeto.

## Percentual de Avanço
```text
Percentual de Avanço (%) =
(Horas Apontadas / Horas Vendidas) * 100
```
Esse indicador demonstra quanto do esforço contratado já foi consumido.

## Acompanhamento da Entrega Física

A entrega física representa o progresso real do projeto. Pode ser calculada com base em:

Atividades concluídas / atividades planejadas
ou
Marcos concluídos / marcos totais

## Classificação de Status
🟢 Saudável
Consumo inferior a 70% das horas vendidas;
Entrega física compatível com o planejamento.
🟡 Atenção
Consumo entre 70% e 90%;
Pequenos desvios de execução;
Risco moderado de atraso ou estouro.
🔴 Crítico
Um projeto é considerado crítico quando ocorre pelo menos uma das condições:

- Saldo de horas negativo;
- Consumo superior a 90% das horas vendidas;
- Entrega física significativamente abaixo do planejado;
- Indícios de estouro de escopo ou orçamento.

O objetivo da classificação é permitir ações preventivas antes que o projeto gere impacto financeiro ou operacional.

# 5. Decisões e Trade-offs

## Decisões Tomadas
- Arquitetura em camadas para facilitar manutenção e evolução;
- PostgreSQL como banco relacional confiável;
- Separação entre alocação (planejado) e apontamento (real);
- Integração desacoplada do ERP através de sincronização.

## Decisões Evitadas
- Arquitetura de microserviços;
- Integração síncrona com o ERP;
- Complexidade excessiva no frontend.

## Trade-off da Solução

Foi priorizada uma arquitetura monolítica em camadas devido à simplicidade operacional e ao escopo atual do sistema. Embora arquiteturas baseadas em microserviços ofereçam maior independência entre componentes, sua adoção neste momento aumentaria significativamente a complexidade de desenvolvimento, implantação e monitoramento sem gerar benefícios proporcionais ao contexto apresentado.

# 6. Evolução e Escalabilidade

## Performance
- Cache de métricas utilizando Redis;
- Pré-cálculo de indicadores operacionais;
- Paginação em listagens;
- Índices em campos frequentemente consultados.

## Resiliência da Integração com ERP
- Jobs assíncronos de sincronização;
- Retry automático em falhas;
- Persistência do último estado válido;
- Reprocessamento automático após recuperação do ERP.

## Escalabilidade
- Índices em projeto_id e analista_id;
- Separação futura entre leitura e escrita (CQRS leve);
- Processamento assíncrono utilizando filas;
- Escalabilidade horizontal da API.

## Observabilidade e Monitoramento
- Logs centralizados;
- Monitoramento de jobs de sincronização;
- Alertas para falhas de integração;
- Métricas de desempenho da API;
- Dashboard operacional.

## Falhas no ERP
Caso o ERP esteja indisponível:

- O sistema continua operando com o último snapshot sincronizado;
- Os usuários mantêm acesso aos dados existentes;
- As falhas são registradas para auditoria;
- A sincronização é retomada automaticamente após a recuperação do ERP.

# Considerações Finais

A proposta apresentada busca equilibrar simplicidade de implementação, clareza arquitetural e capacidade de evolução. A solução foi desenhada para atender ao cenário atual da PVT, permitindo acompanhamento eficiente da saúde dos projetos, cálculo de indicadores operacionais e integração segura com o ERP TOTVS RM. Ao mesmo tempo, a arquitetura permanece preparada para crescimento futuro, suportando aumento de volume de dados, usuários simultâneos e novas funcionalidades sem exigir mudanças estruturais significativas.