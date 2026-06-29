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
│   │   ├── login/           # Tela de login/cadastro
│   │   ├── history/         # Histórico de buscas (Supabase ou localStorage)
│   │   └── reports/
│   │       ├── ranking/     # Relatório de ranking por métrica
│   │       └── similarity/  # Relatório de similaridade entre jogadores
│   ├── components/          # Componentes reutilizáveis
│   ├── lib/
│   │   ├── api.ts           # Funções de chamada à API ML
│   │   ├── supabaseClient.ts # Cliente Supabase (browser, anon key)
│   │   ├── auth.ts          # Lógica de login/cadastro (tabela USUARIO)
│   │   ├── authContext.tsx  # Contexto React de autenticação (useAuth)
│   │   └── history.ts       # Lógica de histórico de buscas
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

## Autenticação

Login simples baseado na tabela `USUARIO` (sem Supabase Auth): tela em `/login` com abas "Entrar"/"Criar conta". A senha é hasheada (SHA-256) no client antes de ir para o banco — não é um esquema de auth robusto (sem salt), mas evita texto puro. Lógica em [frontend/lib/auth.ts](frontend/lib/auth.ts) e [frontend/lib/authContext.tsx](frontend/lib/authContext.tsx) (contexto React, usado via `useAuth()`). O usuário logado fica salvo no `localStorage` e aparece na sidebar, com botão de logout.

## Histórico de buscas

Toda busca textual (`/search`) ou recomendação (`/recommend`) bem-sucedida é registrada automaticamente:

- **Usuário logado:** grava na tabela `PESQUISA` (vinculada ao `id_usuario`) via `pesquisaService`.
- **Usuário anônimo:** grava no `localStorage` do navegador.

A tela `/history` lê de uma fonte ou da outra dependendo do login, com opção de remover item ou limpar tudo. Lógica em [frontend/lib/history.ts](frontend/lib/history.ts).

## Fotos dos jogadores

A tabela `JOGADOR` tem a coluna `foto_url`, populada a partir de `backend/data/processed/players_with_photo_url.csv` (fotos já raspadas para o ml-service). Componentes `PlayerCard` e o hero do perfil do jogador mostram a foto quando disponível, com fallback para iniciais coloridas caso a URL falhe ao carregar.

Scripts usados (em `frontend/scripts/`, não fazem parte do app, são utilitários de setup):

| Script | Uso |
|--------|-----|
| `rls-policies.sql` | Policies de RLS permissivas para a role `anon` (rodar uma vez no SQL Editor do Supabase) |
| `add-photo-column.sql` | Adiciona a coluna `foto_url` em `JOGADOR` (rodar uma vez no SQL Editor) |
| `update-photos.mjs` | Lê o CSV do backend e popula `foto_url` em `JOGADOR` por correspondência de nome + nacionalidade (`node scripts/update-photos.mjs`) |
