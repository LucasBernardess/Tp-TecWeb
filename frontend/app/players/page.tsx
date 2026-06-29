"use client";

import { useEffect, useState, useCallback } from "react";
import { Filter, Users, X, Clock } from "lucide-react";
import { PlayerCard } from "@/components/player-card";
import { PlayerGridSkeleton } from "@/components/skeleton";
import {
  getJogadoresFiltrados,
  getClubes,
  getLigas,
  type JogadorListItem,
  type Clube,
  type Liga,
} from "@/services";
import { useAuth } from "@/lib/authContext";
import { recordHistory, listRecentHistory, type HistoryEntry } from "@/lib/history";

const POSITIONS = [
  { value: "", label: "Todas" },
  { value: "GK", label: "Goleiros (GK)" },
  { value: "DF", label: "Defensores (DF)" },
  { value: "MF", label: "Meias (MF)" },
  { value: "FW", label: "Atacantes (FW)" },
];

const LIMIT = 30;

export default function PlayersPage() {
  const { user } = useAuth();

  // Filtros (estado "em edição" — só são aplicados ao clicar em Filtrar)
  const [nome, setNome] = useState("");
  const [position, setPosition] = useState("");
  const [idClube, setIdClube] = useState("");
  const [idLiga, setIdLiga] = useState("");
  const [ordenarPor, setOrdenarPor] = useState<"nome" | "idade">("nome");

  // Filtros efetivamente aplicados na consulta
  const [applied, setApplied] = useState({
    nome: "",
    position: "",
    idClube: "",
    idLiga: "",
    ordenarPor: "nome" as "nome" | "idade",
  });

  const [players, setPlayers] = useState<JogadorListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Opções dos selects de clube/liga
  const [clubes, setClubes] = useState<Clube[]>([]);
  const [ligas, setLigas] = useState<Liga[]>([]);

  const [recent, setRecent] = useState<HistoryEntry[]>([]);
  const loadRecent = useCallback(async () => {
    try {
      setRecent(await listRecentHistory(user, "filter", 5));
    } catch {
      setRecent([]);
    }
  }, [user]);

  useEffect(() => {
    loadRecent();
  }, [loadRecent]);

  // Carrega as opções de filtro uma única vez
  useEffect(() => {
    (async () => {
      try {
        const [cs, ls] = await Promise.all([getClubes(), getLigas()]);
        setClubes(cs.sort((a, b) => a.nome.localeCompare(b.nome)));
        setLigas(ls.sort((a, b) => a.nome.localeCompare(b.nome)));
      } catch {
        // Filtros de clube/liga ficam indisponíveis, mas a listagem segue funcionando.
      }
    })();
  }, []);

  const fetchPlayers = useCallback(
    async (f: typeof applied, off: number) => {
      setLoading(true);
      setError("");
      try {
        const { jogadores, total } = await getJogadoresFiltrados({
          nome: f.nome || undefined,
          posicao: f.position || undefined,
          idClube: f.idClube ? Number(f.idClube) : undefined,
          idLiga: f.idLiga ? Number(f.idLiga) : undefined,
          ordenarPor: f.ordenarPor,
          limit: LIMIT,
          offset: off,
        });
        setPlayers(jogadores);
        setTotal(total);
      } catch {
        setError("Não foi possível carregar os jogadores. Verifique a conexão com o banco.");
        setPlayers([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPlayers(applied, offset);
  }, [fetchPlayers, applied, offset]);

  function applyFilters(overrideNome?: string) {
    const n = overrideNome ?? nome;
    if (overrideNome !== undefined) setNome(overrideNome);
    setOffset(0);
    setApplied({ nome: n, position, idClube, idLiga, ordenarPor });
    if (n.trim()) recordHistory(user, n.trim(), "filter").then(loadRecent).catch(() => {});
  }

  function clearFilters() {
    setNome("");
    setPosition("");
    setIdClube("");
    setIdLiga("");
    setOrdenarPor("nome");
    setOffset(0);
    setApplied({ nome: "", position: "", idClube: "", idLiga: "", ordenarPor: "nome" });
  }

  const hasFilters =
    applied.nome || applied.position || applied.idClube || applied.idLiga;

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Users size={22} className="text-brand-600" />
          <h1 className="text-2xl font-bold text-gray-900">Jogadores</h1>
        </div>
        <p className="text-gray-500">Explore e filtre os jogadores das grandes ligas.</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              placeholder="Buscar por nome…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Posição</label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            >
              {POSITIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Time</label>
            <select
              value={idClube}
              onChange={(e) => setIdClube(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 max-w-[200px]"
            >
              <option value="">Todos</option>
              {clubes.map((c) => (
                <option key={c.id_clube} value={c.id_clube}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Liga</label>
            <select
              value={idLiga}
              onChange={(e) => setIdLiga(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 max-w-[200px]"
            >
              <option value="">Todas</option>
              {ligas.map((l) => (
                <option key={l.id_liga} value={l.id_liga}>
                  {l.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Ordenar por</label>
            <select
              value={ordenarPor}
              onChange={(e) => setOrdenarPor(e.target.value as "nome" | "idade")}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="nome">Nome (A–Z)</option>
              <option value="idade">Idade</option>
            </select>
          </div>

          <button
            onClick={() => applyFilters()}
            className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            <Filter size={15} /> Filtrar
          </button>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 text-gray-500 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <X size={15} /> Limpar
            </button>
          )}
        </div>

        {/* Buscas recentes */}
        {recent.length > 0 && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
              <Clock size={12} /> Recentes:
            </span>
            {recent.map((r) => (
              <button
                key={r.id}
                onClick={() => applyFilters(r.termo)}
                className="text-xs bg-gray-100 hover:bg-brand-50 hover:text-brand-700 text-gray-600 px-3 py-1.5 rounded-full transition-colors"
              >
                {r.termo}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

      {/* Grid de jogadores */}
      {loading ? (
        <PlayerGridSkeleton />
      ) : players.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          Nenhum jogador encontrado com os filtros selecionados.
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">{total} jogadores</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {players.map((p) => (
              <PlayerCard
                key={p.id_jogador}
                href={`/players/${p.id_jogador}`}
                name={p.nome}
                squad={p.clube}
                position={p.posicao ?? "—"}
                nationality={p.nacionalidade ?? undefined}
                photoUrl={p.foto_url}
                escudoUrl={p.escudo_url}
                bandeiraUrl={p.bandeira_url}
                stats={[
                  { label: "Gols", value: p.gols ?? "—" },
                  { label: "Assist.", value: p.assistencias ?? "—" },
                  { label: "xG", value: p.xg != null ? p.xg.toFixed(1) : "—" },
                ]}
              />
            ))}
          </div>

          {/* Paginação */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setOffset(Math.max(0, offset - LIMIT))}
              disabled={offset === 0}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-500">
              {offset + 1}–{Math.min(offset + LIMIT, total)} de {total}
            </span>
            <button
              onClick={() => setOffset(offset + LIMIT)}
              disabled={offset + LIMIT >= total}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              Próxima
            </button>
          </div>
        </>
      )}
    </div>
  );
}
