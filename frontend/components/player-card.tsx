"use client";

import { useState } from "react";
import clsx from "clsx";
import Link from "next/link";

interface PlayerCardProps {
  name: string;
  squad: string;
  position: string;
  nationality?: string;
  photoUrl?: string | null;
  stats?: { label: string; value: string | number }[];
  score?: number;
  rank?: number;
  onClick?: () => void;
  /** Quando informado, o card vira um link de navegação (ex.: perfil do jogador). */
  href?: string;
}

const posColors: Record<string, string> = {
  GK: "bg-yellow-100 text-yellow-700",
  DF: "bg-blue-100 text-blue-700",
  MF: "bg-purple-100 text-purple-700",
  FW: "bg-red-100 text-red-700",
};

function initials(nome: string): string {
  const parts = nome.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function PlayerAvatar({ name, photoUrl, posColor }: { name: string; photoUrl?: string | null; posColor: string }) {
  const [failed, setFailed] = useState(false);

  if (photoUrl && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={name}
        onError={() => setFailed(true)}
        className="w-11 h-11 rounded-lg object-cover shrink-0 bg-gray-100"
      />
    );
  }

  return (
    <div className={clsx("w-11 h-11 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold", posColor)}>
      {initials(name)}
    </div>
  );
}

export function PlayerCard({ name, squad, position, nationality, photoUrl, stats, score, rank, onClick, href }: PlayerCardProps) {
  const pos = position?.split(",")[0]?.trim() ?? "—";
  const posColor = posColors[pos] ?? "bg-gray-100 text-gray-700";
  const clickable = Boolean(onClick || href);

  const card = (
    <div
      onClick={onClick}
      className={clsx(
        "bg-white rounded-xl border border-gray-100 p-4 shadow-sm transition-shadow",
        clickable && "cursor-pointer hover:shadow-md hover:border-brand-200"
      )}
    >
      <div className="flex items-start gap-3">
        {rank !== undefined && (
          <span className="text-2xl font-bold text-gray-200 w-8 shrink-0 text-right leading-none mt-0.5">
            {rank}
          </span>
        )}
        <PlayerAvatar name={name} photoUrl={photoUrl} posColor={posColor} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-900 truncate">{name}</p>
            <span className={clsx("text-xs px-2 py-0.5 rounded-full font-medium", posColor)}>
              {pos}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {squad}{nationality ? ` · ${nationality}` : ""}
          </p>

          {stats && stats.length > 0 && (
            <div className="flex gap-4 mt-3 flex-wrap">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-xs text-gray-400">{s.label}</p>
                  <p className="text-sm font-semibold text-gray-800">{s.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {score !== undefined && (
          <div className="shrink-0 text-right">
            <p className="text-xs text-gray-400">Score</p>
            <p className="text-sm font-bold text-brand-600">{score.toFixed(3)}</p>
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {card}
      </Link>
    );
  }

  return card;
}
