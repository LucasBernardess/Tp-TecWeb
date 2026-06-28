import { supabase } from "@/lib/supabaseClient";
import type { Jogador, Estatistica } from "./types";

const TABLE = "JOGADOR";

/** Item enxuto usado na listagem de jogadores (já com clube, liga e stats principais). */
export interface JogadorListItem {
  id_jogador: number;
  nome: string;
  nacionalidade: string | null;
  idade: number | null;
  posicao: string | null;
  id_clube: number | null;
  clube: string;
  liga: string;
  gols: number | null;
  assistencias: number | null;
  xg: number | null;
}

export interface JogadorFiltros {
  /** Busca por nome (case-insensitive, substring). */
  nome?: string;
  /** Prefixo da posição: "FW" | "MF" | "DF" | "GK". */
  posicao?: string;
  idClube?: number;
  idLiga?: number;
  ordenarPor?: "nome" | "idade";
  limit?: number;
  offset?: number;
}

export interface JogadoresPagina {
  jogadores: JogadorListItem[];
  total: number;
}

/** Perfil completo de um jogador: dados pessoais + clube/liga + todas as temporadas. */
export interface JogadorPerfil {
  id_jogador: number;
  nome: string;
  nacionalidade: string | null;
  idade: number | null;
  ano_nascimento: number | null;
  posicao: string | null;
  id_clube: number | null;
  clube: string;
  liga: string;
  pais_liga: string;
  estatisticas: Estatistica[];
}

type EmbeddedLiga = { nome?: string; pais?: string };
type EmbeddedClube = { nome?: string; id_liga?: number | null; LIGA?: EmbeddedLiga | EmbeddedLiga[] | null };

function first<T>(value: T | T[] | null | undefined): T | undefined {
  return Array.isArray(value) ? value[0] : value ?? undefined;
}

export async function getJogadores() {
  const { data, error } = await supabase.from(TABLE).select("*");
  if (error) throw error;
  return data as Jogador[];
}

/** Lista jogadores aplicando filtros combináveis, com paginação e total para a UI. */
export async function getJogadoresFiltrados(
  filtros: JogadorFiltros = {}
): Promise<JogadoresPagina> {
  const {
    nome,
    posicao,
    idClube,
    idLiga,
    ordenarPor = "nome",
    limit = 30,
    offset = 0,
  } = filtros;

  // O filtro por liga precisa de join interno para descartar jogadores de outras ligas;
  // sem ele, mantemos o join à esquerda para não perder quem está sem clube.
  const clubeEmbed = idLiga
    ? "CLUBE!inner(nome,id_liga,LIGA(nome,pais))"
    : "CLUBE(nome,id_liga,LIGA(nome,pais))";

  let query = supabase
    .from(TABLE)
    .select(
      `id_jogador,nome,nacionalidade,idade,posicao,id_clube,${clubeEmbed},ESTATISTICA(gols,assistencias,xg)`,
      { count: "exact" }
    );

  if (nome) query = query.ilike("nome", `%${nome}%`);
  if (posicao) query = query.like("posicao", `${posicao}%`);
  if (idClube) query = query.eq("id_clube", idClube);
  if (idLiga) query = query.eq("CLUBE.id_liga", idLiga);

  query = query
    .order(ordenarPor, { ascending: true, nullsFirst: false })
    .range(offset, offset + limit - 1);

  const { data, count, error } = await query;
  if (error) throw error;

  const jogadores: JogadorListItem[] = (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    const clube = first(r.CLUBE as EmbeddedClube | EmbeddedClube[] | undefined);
    const liga = first(clube?.LIGA);
    const est = first(
      r.ESTATISTICA as
        | { gols?: number; assistencias?: number; xg?: number }
        | { gols?: number; assistencias?: number; xg?: number }[]
        | undefined
    );
    return {
      id_jogador: Number(r.id_jogador),
      nome: String(r.nome ?? "—"),
      nacionalidade: (r.nacionalidade as string | null) ?? null,
      idade: (r.idade as number | null) ?? null,
      posicao: (r.posicao as string | null) ?? null,
      id_clube: (r.id_clube as number | null) ?? null,
      clube: clube?.nome ?? "—",
      liga: liga?.nome ?? "—",
      gols: est?.gols ?? null,
      assistencias: est?.assistencias ?? null,
      xg: est?.xg ?? null,
    };
  });

  return { jogadores, total: count ?? 0 };
}

/** Retorna o perfil completo de um jogador (dados + clube/liga + estatísticas). */
export async function getJogadorPerfil(id: number): Promise<JogadorPerfil> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*,CLUBE(nome,id_liga,LIGA(nome,pais)),ESTATISTICA(*)")
    .eq("id_jogador", id)
    .single();
  if (error) throw error;

  const r = data as Record<string, unknown>;
  const clube = first(r.CLUBE as EmbeddedClube | EmbeddedClube[] | undefined);
  const liga = first(clube?.LIGA);
  const estatisticas = (
    Array.isArray(r.ESTATISTICA) ? r.ESTATISTICA : r.ESTATISTICA ? [r.ESTATISTICA] : []
  ) as Estatistica[];

  return {
    id_jogador: Number(r.id_jogador),
    nome: String(r.nome ?? "—"),
    nacionalidade: (r.nacionalidade as string | null) ?? null,
    idade: (r.idade as number | null) ?? null,
    ano_nascimento: (r.ano_nascimento as number | null) ?? null,
    posicao: (r.posicao as string | null) ?? null,
    id_clube: (r.id_clube as number | null) ?? null,
    clube: clube?.nome ?? "—",
    liga: liga?.nome ?? "—",
    pais_liga: liga?.pais ?? "—",
    estatisticas,
  };
}

export async function getJogadorById(id: number) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id_jogador", id)
    .single();
  if (error) throw error;
  return data as Jogador;
}

export async function getJogadoresByClube(idClube: number) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id_clube", idClube);
  if (error) throw error;
  return data as Jogador[];
}

export async function createJogador(jogador: Omit<Jogador, "id_jogador">) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(jogador)
    .select()
    .single();
  if (error) throw error;
  return data as Jogador;
}

export async function updateJogador(
  id: number,
  jogador: Partial<Omit<Jogador, "id_jogador">>
) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(jogador)
    .eq("id_jogador", id)
    .select()
    .single();
  if (error) throw error;
  return data as Jogador;
}

export async function deleteJogador(id: number) {
  const { error } = await supabase.from(TABLE).delete().eq("id_jogador", id);
  if (error) throw error;
}
