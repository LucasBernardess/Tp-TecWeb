"use client";

import { useState } from "react";
import { Network, Sparkles, Loader2, Info } from "lucide-react";

import { PlayerCard } from "@/components/player-card";
import { Skeleton, PlayerListSkeleton } from "@/components/skeleton";
import { useAuth } from "@/lib/authContext";
import { recordHistory } from "@/lib/history";

const EXAMPLES = ["Erling Haaland", "Kylian Mbappé", "Kevin De Bruyne", "Virgil van Dijk"];

type Player = Record<string, string | number | null>;

export default function RecommendPage() {
  const { user } = useAuth();
  const [playerName, setPlayerName] = useState("");
  const [topK, setTopK] = useState(10);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ player: Player; similar_players: Player[] } | null>(null);
  const [error, setError] = useState("");

  async function handleRecommend(name = playerName) {
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/ml/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player_name: name.trim(), top_k: topK }),
      });
      if (res.status === 404) throw new Error("Jogador não encontrado. Verifique o nome e tente novamente.");
      if (!res.ok) throw new Error("Erro ao conectar ao serviço ML.");
      const data = await res.json();
      setResult(data);
      recordHistory(user, name.trim(), "recommend").catch(() => {});
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Network size={22} className="text-brand-600" />
          <h1 className="text-2xl font-bold text-gray-900">Recomendar Jogadores Similares</h1>
        </div>
        <p className="text-gray-500">
          Digite o nome de um jogador e o sistema encontra os mais similares estatisticamente usando KNN.
        </p>
      </div>

      {/* Input */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRecommend()}
            placeholder="Nome do jogador (ex: Erling Haaland)"
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          <select
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          >
            {[5, 10, 20].map((k) => (
              <option key={k} value={k}>Top {k}</option>
            ))}
          </select>
          <button
            onClick={() => handleRecommend()}
            disabled={loading || !playerName.trim()}
            className="flex items-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Recomendar
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => { setPlayerName(ex); handleRecommend(ex); }}
              className="text-xs bg-gray-100 hover:bg-brand-50 hover:text-brand-700 text-gray-600 px-3 py-1.5 rounded-full transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4 mb-6">
          <Info size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Result */}
      {loading && (
        <div>
          <Skeleton className="h-4 w-40 mb-2" />
          <PlayerListSkeleton count={1} />
          <Skeleton className="h-4 w-48 mt-6 mb-2" />
          <PlayerListSkeleton count={topK > 5 ? 5 : topK} />
        </div>
      )}
      {!loading && result && (
        <div>
          {/* Reference player */}
          {result.player && Object.keys(result.player).length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Jogador de Referência</p>
              <PlayerCard
                name={String(result.player.Player ?? "—")}
                squad={String(result.player.Squad ?? "—")}
                position={String(result.player.Pos ?? "—")}
                nationality={result.player.Nation ? String(result.player.Nation) : undefined}
                photoUrl={result.player.photo_url ? String(result.player.photo_url) : undefined}
                stats={[
                  { label: "Gols", value: result.player.Gls ?? "—" },
                  { label: "Assist.", value: result.player.Ast ?? "—" },
                  { label: "xG", value: result.player.xG ?? "—" },
                  { label: "Min", value: result.player.Min ?? "—" },
                ]}
              />
            </div>
          )}

          {/* Similar players */}
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Jogadores Similares ({result.similar_players.length})
          </p>
          <div className="space-y-2">
            {result.similar_players.map((p, i) => (
              <PlayerCard
                key={i}
                name={String(p.Player ?? "—")}
                squad={String(p.Squad ?? "—")}
                position={String(p.Pos ?? "—")}
                nationality={p.Nation ? String(p.Nation) : undefined}
                photoUrl={p.photo_url ? String(p.photo_url) : undefined}
                rank={i + 1}
                score={typeof p.distance === "number" ? p.distance : undefined}
                stats={[
                  { label: "Gols", value: p.Gls ?? "—" },
                  { label: "Assist.", value: p.Ast ?? "—" },
                  { label: "xG", value: p.xG ?? "—" },
                  { label: "Min", value: p.Min ?? "—" },
                ]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
