import { createUsuario, getUsuarioByLogin } from "@/services/usuarioService";

export interface AuthUser {
  id_usuario: number;
  login: string;
}

const STORAGE_KEY = "futanalytics_user";

async function hashSenha(senha: string): Promise<string> {
  const data = new TextEncoder().encode(senha);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function signUp(login: string, senha: string): Promise<AuthUser> {
  const existing = await getUsuarioByLogin(login);
  if (existing) throw new Error("Esse login já está em uso.");

  const senhaHash = await hashSenha(senha);
  const usuario = await createUsuario({ login, senha: senhaHash });
  const user: AuthUser = { id_usuario: usuario.id_usuario, login: usuario.login };
  persistUser(user);
  return user;
}

export async function signIn(login: string, senha: string): Promise<AuthUser> {
  const usuario = await getUsuarioByLogin(login);
  const senhaHash = await hashSenha(senha);
  if (!usuario || usuario.senha !== senhaHash) {
    throw new Error("Login ou senha incorretos.");
  }
  const user: AuthUser = { id_usuario: usuario.id_usuario, login: usuario.login };
  persistUser(user);
  return user;
}

export function signOut(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function persistUser(user: AuthUser): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}
