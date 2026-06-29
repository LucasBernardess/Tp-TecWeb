import { createPesquisa, getPesquisasByUsuario, deletePesquisa } from "@/services/pesquisaService";
import type { AuthUser } from "./auth";

export type HistoryType = "search" | "recommend";

export interface HistoryEntry {
  id: string;
  termo: string;
  tipo: HistoryType;
  data_hora: string;
}

const RECOMMEND_PREFIX = "@recommend ";
const LOCAL_KEY = "futanalytics_history";
const LOCAL_LIMIT = 50;

function encode(termo: string, tipo: HistoryType): string {
  return tipo === "recommend" ? `${RECOMMEND_PREFIX}${termo}` : termo;
}

function decode(raw: string): { termo: string; tipo: HistoryType } {
  if (raw.startsWith(RECOMMEND_PREFIX)) {
    return { termo: raw.slice(RECOMMEND_PREFIX.length), tipo: "recommend" };
  }
  return { termo: raw, tipo: "search" };
}

/** Registra uma busca/recomendação no histórico do usuário logado (Supabase) ou localmente. */
export async function recordHistory(
  user: AuthUser | null,
  termo: string,
  tipo: HistoryType
): Promise<void> {
  if (user) {
    await createPesquisa({ id_usuario: user.id_usuario, termo: encode(termo, tipo) });
    return;
  }
  const entries = readLocal();
  entries.unshift({
    id: crypto.randomUUID(),
    termo,
    tipo,
    data_hora: new Date().toISOString(),
  });
  writeLocal(entries.slice(0, LOCAL_LIMIT));
}

export async function listHistory(user: AuthUser | null): Promise<HistoryEntry[]> {
  if (user) {
    const rows = await getPesquisasByUsuario(user.id_usuario);
    return rows
      .map((r) => {
        const { termo, tipo } = decode(r.termo);
        return { id: String(r.id_pesquisa), termo, tipo, data_hora: r.data_hora };
      })
      .sort((a, b) => b.data_hora.localeCompare(a.data_hora));
  }
  return readLocal();
}

export async function removeHistoryEntry(user: AuthUser | null, id: string): Promise<void> {
  if (user) {
    await deletePesquisa(Number(id));
    return;
  }
  writeLocal(readLocal().filter((e) => e.id !== id));
}

export async function clearHistory(user: AuthUser | null): Promise<void> {
  if (user) {
    const rows = await getPesquisasByUsuario(user.id_usuario);
    await Promise.all(rows.map((r) => deletePesquisa(r.id_pesquisa)));
    return;
  }
  writeLocal([]);
}

function readLocal(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(entries: HistoryEntry[]): void {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(entries));
}
