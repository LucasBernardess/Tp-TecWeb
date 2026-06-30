# FutAnalytics

Dashboard web interativo para análise e descoberta de jogadores de futebol das 10 principais ligas do mundo na temporada 2024-25. Explore mais de 6.000 jogadores com estatísticas completas, busca por perfil em linguagem natural, recomendações automáticas de similares e relatórios visuais de ranking e similaridade.

**Equipe:** André Chagas Limas, Lucas Eduardo Bernardes de Paula e Messias Feres Curi Melo  

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Banco de dados | Supabase (PostgreSQL + RLS) |
| ML / Busca | Python (BM25 via `backend/server.py`) |
| PDF | jsPDF + jspdf-autotable |

---

## Como executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18+
- Python 3.10+

### 1. Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse em **http://localhost:3000**. As credenciais do Supabase já estão em `frontend/.env`.

### 2. Backend ML (busca textual e recomendação)

```bash
cd backend
python server.py
```

Sobe em **http://localhost:8000**. O frontend faz proxy de `/api/ml/*` para essa porta.

> O índice BM25 já vem pré-compilado em `backend/data/bm25_index.pkl`. Para reconstruí-lo: `python train.py`.

---

## Funcionalidades

- **Jogadores** — lista com filtros por nome, posição, time e liga; perfil completo com estatísticas por temporada
- **Busca por Perfil** — busca textual em linguagem natural (ex.: "atacante veloz com alto xG")
- **Recomendar Similares** — KNN estatístico para encontrar jogadores parecidos
- **Relatório de Ranking** — ranking por métrica (gols, assists, xG…) com download em PDF
- **Relatório de Similaridade** — comparativo tabular entre jogador de referência e similares, com download em PDF
- **Histórico de buscas** — últimas 5 buscas por tela, salvas no Supabase (usuário logado) ou `localStorage`
- **Autenticação** — cadastro com nome/e-mail/senha e login; sessão salva em `localStorage`

---

## Estrutura principal

```
Tp-TecWeb/
├── frontend/          # App Next.js
│   ├── app/           # Rotas (pages)
│   ├── components/    # Componentes reutilizáveis (PlayerCard, Skeleton…)
│   ├── lib/           # Auth, Supabase client, histórico, geração de PDF
│   ├── services/      # CRUDs Supabase por tabela
│   └── .env           # Credenciais públicas do Supabase (versionadas)
└── backend/           # ML service Python
    ├── server.py      # HTTP server (POST /search, GET /health)
    ├── train.py       # Reconstrói o índice BM25
    └── data/          # Dataset CSV + índice pré-compilado
```
