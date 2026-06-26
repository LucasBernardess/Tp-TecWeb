# FutAnalytics Dashboard

Dashboard de análise de jogadores de futebol com ranking, similaridade e histórico.

## Tecnologias

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, Recharts
- **Backend:** ML service (API separada em `/api/ml`)
- **Banco de dados/Auth:** Supabase

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

As credenciais públicas do Supabase (URL + `anon` key) já vêm versionadas em [frontend/.env](frontend/.env) — não é necessário configurar nada para rodar localmente. Essas chaves são seguras para expor publicamente quando o RLS (Row Level Security) está habilitado nas tabelas.

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
│   ├── lib/
│   │   ├── api.ts          # Funções de chamada à API ML
│   │   └── supabaseClient.ts # Cliente Supabase (browser, anon key)
│   ├── services/           # CRUDs de acesso ao banco (Supabase)
│   │   ├── types.ts        # Interfaces TS das tabelas
│   │   ├── usuarioService.ts
│   │   ├── pesquisaService.ts
│   │   ├── ligaService.ts
│   │   ├── clubeService.ts
│   │   ├── jogadorService.ts
│   │   └── estatisticaService.ts
│   └── .env                # URL + anon key do Supabase (públicas, versionadas)
```

> ⚠️ A `service_role` key do Supabase nunca deve ser usada no frontend nem commitada — ela ignora as políticas de RLS e dá acesso total ao banco. Use-a apenas em ambiente server-side (ex.: rotas de API), via variável sem prefixo `NEXT_PUBLIC_`.

## Camada de dados (`services/`)

Cada tabela do banco (`USUARIO`, `PESQUISA`, `LIGA`, `CLUBE`, `JOGADOR`, `ESTATISTICA`) tem um arquivo de serviço com operações CRUD usando o client do Supabase:

```ts
import {
  getJogadores,
  getJogadorById,
  createJogador,
  updateJogador,
  deleteJogador,
} from "@/services";

const jogadores = await getJogadores();
const jogador = await getJogadorById(1);
await createJogador({ nome: "Novo Jogador", nacionalidade: "BR", idade: 22, ano_nascimento: 2003, posicao: "FW", id_clube: 1 });
await updateJogador(1, { idade: 23 });
await deleteJogador(1);
```

Funções disponíveis por entidade:

| Tabela | Funções |
|--------|---------|
| `USUARIO` | `getUsuarios`, `getUsuarioById`, `createUsuario`, `updateUsuario`, `deleteUsuario` |
| `PESQUISA` | `getPesquisas`, `getPesquisaById`, `getPesquisasByUsuario`, `createPesquisa`, `updatePesquisa`, `deletePesquisa` |
| `LIGA` | `getLigas`, `getLigaById`, `createLiga`, `updateLiga`, `deleteLiga` |
| `CLUBE` | `getClubes`, `getClubeById`, `getClubesByLiga`, `createClube`, `updateClube`, `deleteClube` |
| `JOGADOR` | `getJogadores`, `getJogadorById`, `getJogadoresByClube`, `createJogador`, `updateJogador`, `deleteJogador` |
| `ESTATISTICA` | `getEstatisticas`, `getEstatisticaById`, `getEstatisticasByJogador`, `createEstatistica`, `updateEstatistica`, `deleteEstatistica` |

## Dependência do ML service

O frontend consome a API de ML via proxy no Next.js (`/api/ml`). Para que as funcionalidades funcionem corretamente, o serviço de ML deve estar em execução antes de iniciar o frontend.
