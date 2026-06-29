"use client";

import { useEffect, useState, useCallback } from "react";
import { History, Search, Sparkles, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { listHistory, clearHistory, removeHistoryEntry, type HistoryEntry } from "@/lib/history";
import { HistoryListSkeleton } from "@/components/skeleton";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setHistory(await listHistory(user));
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) load();
  }, [authLoading, load]);

  async function clear() {
    await clearHistory(user);
    setHistory([]);
  }

  async function removeOne(id: string) {
    await removeHistoryEntry(user, id);
    setHistory((h) => h.filter((e) => e.id !== id));
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <History size={22} className="text-brand-600" />
            <h1 className="text-2xl font-bold text-gray-900">Histórico de Buscas</h1>
          </div>
          <p className="text-gray-500">
            {user
              ? "Registro das suas consultas recentes, sincronizado com sua conta."
              : "Registro local das suas consultas recentes. Faça login para sincronizar entre dispositivos."}
          </p>
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

      {loading ? (
        <HistoryListSkeleton />
      ) : history.length === 0 ? (
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
                entry.tipo === "search" ? "bg-blue-100" : "bg-purple-100"
              }`}>
                {entry.tipo === "search"
                  ? <Search size={16} className="text-blue-600" />
                  : <Sparkles size={16} className="text-purple-600" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{entry.termo}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {entry.tipo === "search" ? "Busca textual" : "Recomendação"}
                </p>
              </div>
              <p className="text-xs text-gray-400 shrink-0">{formatDate(entry.data_hora)}</p>
              <button
                onClick={() => removeOne(entry.id)}
                title="Remover"
                className="text-gray-300 hover:text-red-500 p-1 transition-colors shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
