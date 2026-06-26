import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv(path) {
  const content = readFileSync(path, "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return env;
}

const env = loadEnv(new URL("../.env", import.meta.url));
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function insert(table, row) {
  const { data, error } = await supabase.from(table).insert(row).select().single();
  if (error) {
    console.error(`[FAIL] ${table}:`, error.message);
    return null;
  }
  console.log(`[OK] ${table}:`, data);
  return data;
}

async function main() {
  const liga = await insert("LIGA", { nome: "Brasileirão Teste", pais: "Brasil" });
  const clube = liga
    ? await insert("CLUBE", { nome: "Clube Teste", id_liga: liga.id_liga })
    : null;
  const jogador = clube
    ? await insert("JOGADOR", {
        nome: "Jogador Teste",
        nacionalidade: "BR",
        idade: 25,
        ano_nascimento: 2000,
        posicao: "FW",
        id_clube: clube.id_clube,
      })
    : null;
  if (jogador) {
    await insert("ESTATISTICA", {
      id_jogador: jogador.id_jogador,
      temporada: "2024/2025",
      partidas: 10,
      titular: 8,
      minutos: 720,
      gols: 5,
      assistencias: 3,
      gols_sem_penalti: 4,
      penaltis: 1,
      penaltis_tentados: 1,
      cartoes_amarelos: 2,
      cartoes_vermelhos: 0,
      xg: 4.5,
      npxg: 3.8,
      xag: 2.1,
      conducoes_prog: 30,
      passes_prog: 40,
      recepcoes_prog: 20,
    });
  }

  const usuario = await insert("USUARIO", {
    login: `teste_${Date.now()}`,
    senha: "senha123",
  });
  if (usuario) {
    await insert("PESQUISA", {
      id_usuario: usuario.id_usuario,
      termo: "Jogador Teste",
    });
  }
}

main();
