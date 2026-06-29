"use client";

import { useState } from "react";
import { GitCompareArrows, Loader2 } from "lucide-react";
import { PlayerCard } from "@/components/player-card";
import { Skeleton, PlayerListSkeleton, TableSkeleton } from "@/components/skeleton";
import { getSimilaresPorNome } from "@/services/recomendacaoService";

type Player = Record<string, string | number | null>;

const STAT_COLS = [
  { key: "Gls",  label: "Gols" },
  { key: "Ast",  label: "Assist." },
  { key: "xG",   label: "xG" },
  { key: "xAG",  label: "xAG" },
  { key: "PrgC", label: "PrgC" },
  { key: "PrgP", label: "PrgP" },
  { key: "Min",  label: "Min" },
  { key: "MP",   label: "Part." },
];

export default function SimilarityReportPage() {
  const [playerName, setPlayerName] = useState("");
  const [topK, setTopK] = useState(10);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ player: Player; similar_players: Player[] } | null>(null);
  const [error, setError] = useState("");

  async function generate() {
    if (!playerName.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      setResult(await getSimilaresPorNome(playerName.trim(), topK));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <GitCompareArrows size={22} className="text-brand-600" />
          <h1 className="text-2xl font-bold text-gray-900">Relatório de Similaridade</h1>
        </div>
        <p className="text-gray-500">
          Comparativo estatístico entre um jogador de referência e seus similares por KNN.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-48">
          <label className="block text-xs font-medium text-gray-500 mb-1">Jogador de Referência</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && generate()}
            placeholder="Ex: Erling Haaland"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Top N</label>
          <select
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          >
            {[5, 10, 20].map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <button
          onClick={generate}
          disabled={loading || !playerName.trim()}
          className="flex items-center gap-2 bg-brand-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <GitCompareArrows size={15} />}
          Gerar Relatório
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4 mb-6">{error}</div>
      )}

      {/* Report */}
      {loading && (
        <div className="space-y-6">
          <div>
            <Skeleton className="h-4 w-40 mb-2" />
            <PlayerListSkeleton count={1} />
          </div>
          <TableSkeleton cols={9} />
        </div>
      )}
      {!loading && result && (
        <div className="space-y-6">
          {/* Reference card */}
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Jogador de Referência</p>
            <PlayerCard
              name={String(result.player.Player ?? "—")}
              squad={String(result.player.Squad ?? "—")}
              position={String(result.player.Pos ?? "—")}
              nationality={result.player.Nation ? String(result.player.Nation) : undefined}
              photoUrl={result.player.photo_url ? String(result.player.photo_url) : undefined}
              stats={STAT_COLS.slice(0, 5).map((s) => ({ label: s.label, value: result.player[s.key] ?? "—" }))}
            />
          </div>

          {/* Comparison table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">
                Comparativo Estatístico — Top {result.similar_players.length} Similares
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">#</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">Jogador</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">Time</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500">Pos</th>
                    {STAT_COLS.map((s) => (
                      <th key={s.key} className="px-4 py-3 text-xs font-semibold text-gray-500 text-right">
                        {s.label}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 text-right">Dist.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {/* Reference row */}
                  <tr className="bg-brand-50">
                    <td className="px-4 py-3 text-brand-600 font-bold">★</td>
                    <td className="px-4 py-3 font-bold text-brand-900">{String(result.player.Player ?? "—")}</td>
                    <td className="px-4 py-3 text-brand-700">{String(result.player.Squad ?? "—")}</td>
                    <td className="px-4 py-3 text-brand-700">{String(result.player.Pos ?? "—")}</td>
                    {STAT_COLS.map((s) => (
                      <td key={s.key} className="px-4 py-3 text-right font-semibold text-brand-800">
                        {result.player[s.key] ?? "—"}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right text-brand-600">—</td>
                  </tr>
                  {/* Similar rows */}
                  {result.similar_players.map((p, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{String(p.Player ?? "—")}</td>
                      <td className="px-4 py-3 text-gray-600">{String(p.Squad ?? "—")}</td>
                      <td className="px-4 py-3 text-gray-500">{String(p.Pos ?? "—")}</td>
                      {STAT_COLS.map((s) => (
                        <td key={s.key} className="px-4 py-3 text-right text-gray-600">
                          {p[s.key] ?? "—"}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right text-gray-500">
                        {typeof p.distance === "number" ? p.distance.toFixed(2) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
