# FutAnalytics Dashboard

Dashboard de análise de jogadores de futebol com ranking, similaridade e histórico.

## Tecnologias

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, Recharts
- **Backend:** ML service (API separada em `/api/ml`)

## Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- npm v9 ou superior

## Instalação e execução

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O app estará disponível em [http://localhost:3000](http://localhost:3000).

### Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm run start` | Inicia o servidor de produção (requer build) |
| `npm run lint` | Executa o linter |

## Estrutura do projeto

```
Tp-TecWeb/
├── frontend/
│   ├── app/
│   │   ├── history/        # Histórico de partidas
│   │   └── reports/
│   │       ├── ranking/    # Relatório de ranking por métrica
│   │       └── similarity/ # Relatório de similaridade entre jogadores
│   ├── components/         # Componentes reutilizáveis
│   └── lib/
│       └── api.ts          # Funções de chamada à API ML
```

## Dependência do ML service

O frontend consome a API de ML via proxy no Next.js (`/api/ml`). Para que as funcionalidades funcionem corretamente, o serviço de ML deve estar em execução antes de iniciar o frontend.
