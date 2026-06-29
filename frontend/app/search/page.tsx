"use client";

import { useState } from "react";
import { Search, Loader2, Info, SearchIcon } from "lucide-react";
import { PlayerCard } from "@/components/player-card";
import { PlayerListSkeleton } from "@/components/skeleton";
import { useAuth } from "@/lib/authContext";
import { recordHistory } from "@/lib/history";

const EXAMPLES = [
  "creative left winger with high goals and assists",
  "defensive midfielder high progressive passes",
  "goalkeeper with high saves and clean sheets",
  "young forward high xG low minutes",
];

type Player = Record<string, string | number | null>;

export default function SearchPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [topK, setTopK] = useState(10);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Player[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(q = query) {
    if (!q.trim()) return;
    setLoading(true);
    setError("");
    setSearched(false);

    try {
      const res = await fetch("/api/ml/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q.trim(), top_k: topK }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResults(data.results ?? []);
      recordHistory(user, q.trim(), "search").catch(() => {});
    } catch {
      setError("Não foi possível conectar ao serviço ML. Certifique-se de que o ml-service está rodando.");
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Search size={22} className="text-brand-600" />
          <h1 className="text-2xl font-bold text-gray-900">Buscar Jogadores</h1>
        </div>
        <p className="text-gray-500">
          Descreva o perfil desejado em linguagem natural. O sistema usa BM25 para encontrar os melhores candidatos.
        </p>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Ex: atacante veloz com alto xG e progressão..."
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          <select
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          >
            {[5, 10, 20, 50].map((k) => (
              <option key={k} value={k}>Top {k}</option>
            ))}
          </select>
          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="flex items-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Buscar
          </button>
        </div>

        {/* Examples */}
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => { setQuery(ex); handleSearch(ex); }}
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

      {/* Results */}
      {loading && <PlayerListSkeleton count={topK > 5 ? 5 : topK} />}
      {!loading && searched && !error && (
        <div>
          <p className="text-sm text-gray-500 mb-3">
            {results.length} resultado{results.length !== 1 ? "s" : ""} para{" "}
            <span className="font-medium text-gray-800">"{query}"</span>
          </p>
          <div className="space-y-2">
            {results.map((p, i) => (
              <PlayerCard
                key={i}
                name={String(p.Player ?? "—")}
                squad={String(p.Squad ?? "—")}
                position={String(p.Pos ?? "—")}
                nationality={p.Nation ? String(p.Nation) : undefined}
                photoUrl={p.photo_url ? String(p.photo_url) : undefined}
                rank={i + 1}
                score={typeof p.score === "number" ? p.score : undefined}
                stats={[
                  { label: "Gols", value: p.Gls ?? "—" },
                  { label: "Assist.", value: p.Ast ?? "—" },
                  { label: "xG", value: p.xG ?? "—" },
                  { label: "Min", value: p.Min ?? "—" },
                ]}
              />
            ))}
            {results.length === 0 && (
              <p className="text-gray-400 text-sm">Nenhum resultado encontrado.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
