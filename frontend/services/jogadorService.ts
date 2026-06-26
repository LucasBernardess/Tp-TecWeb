import { supabase } from "@/lib/supabaseClient";
import type { Jogador } from "./types";

const TABLE = "JOGADOR";

export async function getJogadores() {
  const { data, error } = await supabase.from(TABLE).select("*");
  if (error) throw error;
  return data as Jogador[];
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
