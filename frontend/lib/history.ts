import { createPesquisa, getPesquisasByUsuario } from "@/services/pesquisaService";
import type { AuthUser } from "./auth";

export type HistoryType = "search" | "filter" | "recommend";

export interface HistoryEntry {
  id: string;
  termo: string;
  tipo: HistoryType;
  data_hora: string;
}

const PREFIXES: Record<HistoryType, string> = {
  search: "@search ",
  filter: "@filter ",
  recommend: "@recommend ",
};

const LOCAL_KEY = "futanalytics_history";
const LOCAL_LIMIT = 50;

function encode(termo: string, tipo: HistoryType): string {
  return `${PREFIXES[tipo]}${termo}`;
}

function decode(raw: string): { termo: string; tipo: HistoryType } | null {
  for (const [tipo, prefix] of Object.entries(PREFIXES) as [HistoryType, string][]) {
    if (raw.startsWith(prefix)) return { termo: raw.slice(prefix.length), tipo };
  }
  return null;
}

/** Registra uma busca/filtro/recomendação no histórico do usuário logado (Supabase) ou localmente. */
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

export async function listRecentHistory(
  user: AuthUser | null,
  tipo: HistoryType,
  limit = 5
): Promise<HistoryEntry[]> {
  if (user) {
    const rows = await getPesquisasByUsuario(user.id_usuario);
    return rows
      .map((r) => {
        const decoded = decode(r.termo);
        return decoded ? { id: String(r.id_pesquisa), data_hora: r.data_hora, ...decoded } : null;
      })
      .filter((e): e is HistoryEntry => e !== null && e.tipo === tipo)
      .sort((a, b) => b.data_hora.localeCompare(a.data_hora))
      .slice(0, limit);
  }
  return readLocal()
    .filter((e) => e.tipo === tipo)
    .slice(0, limit);
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
