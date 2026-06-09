"use client";

import { useEffect, useState, useCallback } from "react";
import { Filter, Loader2, Users } from "lucide-react";
import { PlayerCard } from "@/components/player-card";

type Player = Record<string, string | number | null>;

const POSITIONS = ["", "GK", "DF", "MF", "FW"];

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [position, setPosition] = useState("");
  const [squad, setSquad] = useState("");
  const [offset, setOffset] = useState(0);
  const LIMIT = 30;

  const fetchPlayers = useCallback(async (pos: string, sq: string, off: number) => {
    setLoading(true);
    setError("");
    try {
      const qs = new URLSearchParams({ limit: String(LIMIT), offset: String(off) });
      if (pos) qs.set("position", pos);
      if (sq) qs.set("squad", sq);
      const res = await fetch(`/api/ml/players?${qs}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPlayers(data.players ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setError("Não foi possível carregar jogadores. Verifique se o ml-service está rodando.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlayers(position, squad, offset);
  }, [fetchPlayers, position, squad, offset]);

  function applyFilters() {
    setOffset(0);
    fetchPlayers(position, squad, 0);
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Users size={22} className="text-brand-600" />
          <h1 className="text-2xl font-bold text-gray-900">Jogadores</h1>
        </div>
        <p className="text-gray-500">Explore todos os jogadores das top 10 ligas europeias.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Posição</label>
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Todas</option>
            {POSITIONS.filter(Boolean).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Time</label>
          <input
            type="text"
            value={squad}
            onChange={(e) => setSquad(e.target.value)}
            placeholder="Ex: Arsenal"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 w-44"
          />
        </div>
        <button
          onClick={applyFilters}
          className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          <Filter size={15} /> Filtrar
        </button>
        {total > 0 && (
          <span className="text-sm text-gray-400 ml-auto">{total} jogadores</span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4 mb-6">
          {error}
        </div>
      )}

      {/* Players grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-brand-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {players.map((p, i) => (
              <PlayerCard
                key={i}
                name={String(p.Player ?? "—")}
                squad={String(p.Squad ?? "—")}
                position={String(p.Pos ?? "—")}
                nationality={p.Nation ? String(p.Nation) : undefined}
                stats={[
                  { label: "Gols", value: p.Gls ?? "—" },
                  { label: "Assist.", value: p.Ast ?? "—" },
                  { label: "xG", value: p.xG ?? "—" },
                ]}
              />
            ))}
          </div>

          {/* Pagination */}
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
