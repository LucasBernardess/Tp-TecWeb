"use client";

import { useEffect, useState } from "react";
import { History, Search, Sparkles, Trash2 } from "lucide-react";

interface HistoryEntry {
  id: string;
  queryText: string;
  queryType: "search" | "recommend";
  timestamp: string;
  resultCount: number;
}

const MOCK_HISTORY: HistoryEntry[] = [
  { id: "1", queryText: "creative winger high assists", queryType: "search", timestamp: new Date(Date.now() - 3600000).toISOString(), resultCount: 10 },
  { id: "2", queryText: "Erling Haaland", queryType: "recommend", timestamp: new Date(Date.now() - 7200000).toISOString(), resultCount: 10 },
  { id: "3", queryText: "defensive midfielder progressive passes", queryType: "search", timestamp: new Date(Date.now() - 86400000).toISOString(), resultCount: 10 },
  { id: "4", queryText: "Kevin De Bruyne", queryType: "recommend", timestamp: new Date(Date.now() - 172800000).toISOString(), resultCount: 10 },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    // Load from localStorage; fall back to mock
    try {
      const stored = localStorage.getItem("futanalytics_history");
      setHistory(stored ? JSON.parse(stored) : MOCK_HISTORY);
    } catch {
      setHistory(MOCK_HISTORY);
    }
  }, []);

  function clear() {
    localStorage.removeItem("futanalytics_history");
    setHistory([]);
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <History size={22} className="text-brand-600" />
            <h1 className="text-2xl font-bold text-gray-900">Histórico de Buscas</h1>
          </div>
          <p className="text-gray-500">Registro das suas consultas recentes.</p>
        </div>
        {history.length > 0 && (
          <button
            onClick={clear}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Trash2 size={14} /> Limpar histórico
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20">
          <History size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Nenhuma busca realizada ainda.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                entry.queryType === "search" ? "bg-blue-100" : "bg-purple-100"
              }`}>
                {entry.queryType === "search"
                  ? <Search size={16} className="text-blue-600" />
                  : <Sparkles size={16} className="text-purple-600" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{entry.queryText}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {entry.queryType === "search" ? "Busca textual" : "Recomendação"} · {entry.resultCount} resultados
                </p>
              </div>
              <p className="text-xs text-gray-400 shrink-0">{formatDate(entry.timestamp)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
