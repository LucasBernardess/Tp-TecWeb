export interface Usuario {
  id_usuario: number;
  login: string;
  senha: string;
}

export interface Pesquisa {
  id_pesquisa: number;
  id_usuario: number | null;
  termo: string;
  data_hora: string;
}

export interface Liga {
  id_liga: number;
  nome: string;
  pais: string;
}

export interface Clube {
  id_clube: number;
  nome: string;
  id_liga: number | null;
}

export interface Jogador {
  id_jogador: number;
  nome: string;
  nacionalidade: string | null;
  idade: number | null;
  ano_nascimento: number | null;
  posicao: string | null;
  id_clube: number | null;
  foto_url: string | null;
}

export interface Estatistica {
  id_estatistica: number;
  id_jogador: number | null;
  temporada: string;
  partidas: number;
  titular: number;
  minutos: number;
  gols: number;
  assistencias: number;
  gols_sem_penalti: number;
  penaltis: number;
  penaltis_tentados: number;
  cartoes_amarelos: number;
  cartoes_vermelhos: number;
  xg: number;
  npxg: number;
  xag: number;
  conducoes_prog: number;
  passes_prog: number;
  recepcoes_prog: number;
}
