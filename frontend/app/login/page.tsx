"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus, Loader2, Search, Network, Trophy, GitCompareArrows } from "lucide-react";
import { useAuth } from "@/lib/authContext";

type Mode = "signin" | "signup";

const FEATURES = [
  { icon: Search, text: "Busque jogadores por perfil textual em linguagem natural" },
  { icon: Network, text: "Receba recomendações de jogadores estatisticamente similares" },
  { icon: Trophy, text: "Gere rankings de desempenho por liga e posição" },
  { icon: GitCompareArrows, text: "Compare jogadores com relatórios visuais de similaridade" },
];

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, signIn, signUp } = useAuth();

  const [mode, setMode] = useState<Mode>("signin");
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && user) router.replace("/");
  }, [authLoading, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!login.trim() || !senha.trim()) return;
    setLoading(true);
    setError("");
    try {
      if (mode === "signin") {
        await signIn(login.trim(), senha);
      } else {
        await signUp(login.trim(), senha);
      }
      router.push("/");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gray-50">
      {/* Painel informativo */}
      <div className="hidden lg:flex flex-col justify-center bg-zinc-900 text-white p-12">
        <div className="flex items-center gap-3 mb-6">
          <svg width={36} height={36} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="#16a34a" />
            <rect x="6" y="18" width="4" height="8" rx="1" fill="white" />
            <rect x="14" y="12" width="4" height="14" rx="1" fill="white" />
            <rect x="22" y="6" width="4" height="20" rx="1" fill="white" />
          </svg>
          <span className="text-2xl font-bold tracking-tight">FutAnalytics</span>
        </div>

        <p className="text-zinc-300 text-base leading-relaxed mb-10 max-w-md">
          Dashboard interativo para análise e descoberta de jogadores de futebol das 10
          principais ligas do mundo na temporada 2024-25. Explore mais de 6.000 atletas de
          131 nacionalidades com estatísticas completas de desempenho.
        </p>

        <div className="space-y-5 max-w-md">
          {FEATURES.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-brand-500" />
              </div>
              <p className="text-sm text-zinc-300 leading-snug pt-1.5">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Formulário */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Branding mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <svg width={28} height={28} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="#16a34a" />
              <rect x="6" y="18" width="4" height="8" rx="1" fill="white" />
              <rect x="14" y="12" width="4" height="14" rx="1" fill="white" />
              <rect x="22" y="6" width="4" height="20" rx="1" fill="white" />
            </svg>
            <span className="font-bold text-lg text-gray-900">FutAnalytics</span>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              {mode === "signin" ? "Bem-vindo de volta" : "Crie sua conta"}
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              {mode === "signin"
                ? "Entre para acessar o dashboard e seu histórico de buscas."
                : "Crie uma conta para salvar seu histórico de buscas e recomendações."}
            </p>

            <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
              <button
                type="button"
                onClick={() => { setMode("signin"); setError(""); }}
                className={`flex-1 text-sm font-medium rounded-md py-1.5 transition-colors ${
                  mode === "signin" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => { setMode("signup"); setError(""); }}
                className={`flex-1 text-sm font-medium rounded-md py-1.5 transition-colors ${
                  mode === "signup" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                }`}
              >
                Criar conta
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Login</label>
                <input
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="seu_login"
                  autoComplete="username"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Senha</label>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !login.trim() || !senha.trim()}
                className="w-full flex items-center justify-center gap-2 bg-brand-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : mode === "signin" ? (
                  <LogIn size={16} />
                ) : (
                  <UserPlus size={16} />
                )}
                {mode === "signin" ? "Entrar" : "Criar conta"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
