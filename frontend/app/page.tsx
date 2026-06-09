import { Users, Globe, Shield, Trophy, LayoutDashboard } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { PlayerCard } from "@/components/player-card";

const MOCK_OVERVIEW = {
  total_players: 2583,
  total_teams: 98,
  total_nations: 112,
  positions: { FW: 612, MF: 798, DF: 891, GK: 282 },
  top_scorers: [
    { Player: "Erling Haaland", Squad: "Manchester City", Pos: "FW", Gls: 27, Ast: 5, xG: 24.1 },
    { Player: "Kylian Mbappé", Squad: "Real Madrid", Pos: "FW", Gls: 25, Ast: 8, xG: 22.4 },
    { Player: "Harry Kane", Squad: "Bayern Munich", Pos: "FW", Gls: 24, Ast: 11, xG: 21.8 },
    { Player: "Robert Lewandowski", Squad: "Barcelona", Pos: "FW", Gls: 22, Ast: 6, xG: 20.3 },
    { Player: "Victor Osimhen", Squad: "Galatasaray", Pos: "FW", Gls: 21, Ast: 4, xG: 18.9 },
  ],
  top_assists: [
    { Player: "Kevin De Bruyne", Squad: "Manchester City", Pos: "MF", Gls: 5, Ast: 18, xAG: 16.2 },
    { Player: "Bukayo Saka", Squad: "Arsenal", Pos: "FW", Gls: 16, Ast: 14, xAG: 13.1 },
    { Player: "Trent Alexander-Arnold", Squad: "Liverpool", Pos: "DF", Gls: 3, Ast: 13, xAG: 12.4 },
    { Player: "Bruno Fernandes", Squad: "Manchester Utd", Pos: "MF", Gls: 10, Ast: 12, xAG: 11.8 },
    { Player: "Bernardo Silva", Squad: "Manchester City", Pos: "MF", Gls: 7, Ast: 11, xAG: 10.9 },
  ],
};

const posLabel: Record<string, string> = { FW: "Atacantes", MF: "Meias", DF: "Defensores", GK: "Goleiros" };

export default function HomePage() {
  const d = MOCK_OVERVIEW;
  const totalPos = Object.values(d.positions).reduce((a, b) => a + b, 0);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <LayoutDashboard size={22} className="text-brand-600" />
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <p className="text-gray-500">Visão geral · Top 10 Ligas Europeias 2024-25</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total de Jogadores" value={d.total_players.toLocaleString("pt-BR")} icon={Users} color="green" />
        <StatCard label="Times" value={d.total_teams} icon={Shield} color="blue" />
        <StatCard label="Nacionalidades" value={d.total_nations} icon={Globe} color="purple" />
        <StatCard label="Ligas" value={10} icon={Trophy} color="orange" sub="Top 10 da Europa" />
      </div>

      {/* Position breakdown */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Distribuição por Posição
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(d.positions).map(([pos, count]) => {
            const pct = Math.round((count / totalPos) * 100);
            return (
              <div key={pos}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">{posLabel[pos] ?? pos}</span>
                  <span className="text-sm font-bold text-gray-900">{count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{pct}%</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top scorers + Top assists */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Top 5 Artilheiros
          </h2>
          <div className="space-y-2">
            {d.top_scorers.map((p, i) => (
              <PlayerCard
                key={p.Player}
                name={p.Player}
                squad={p.Squad}
                position={p.Pos}
                rank={i + 1}
                stats={[
                  { label: "Gols", value: p.Gls },
                  { label: "Assist.", value: p.Ast },
                  { label: "xG", value: p.xG },
                ]}
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Top 5 Assistências
          </h2>
          <div className="space-y-2">
            {d.top_assists.map((p, i) => (
              <PlayerCard
                key={p.Player}
                name={p.Player}
                squad={p.Squad}
                position={p.Pos}
                rank={i + 1}
                stats={[
                  { label: "Assist.", value: p.Ast },
                  { label: "Gols", value: p.Gls },
                  { label: "xAG", value: p.xAG },
                ]}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
