import type { Role } from "../types";

const TOKEN_KEY = "supporthub_token";
const ROLE_KEY = "supporthub_role";
const NAME_KEY = "supporthub_name";

export function setAuth(token: string, role: Role, name: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
  localStorage.setItem(NAME_KEY, name);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(NAME_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRole(): Role | null {
  return (localStorage.getItem(ROLE_KEY) as Role) || null;
}

export function getName(): string | null {
  return localStorage.getItem(NAME_KEY);
}
