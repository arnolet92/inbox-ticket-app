import React, { createContext, useContext, useState, useCallback } from "react";

export type AuthUser = {
  name: string;
  phone: string;
  address: string;
};

type AuthContextType = {
  user: AuthUser | null;
  login: (phone: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (data: { name: string; address: string; phone: string; password: string }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "inbox_ticket_user";
const ACCOUNTS_KEY = "inbox_ticket_accounts";

type StoredAccount = { name: string; address: string; phone: string; password: string };

const DEMO_ACCOUNTS: StoredAccount[] = [
  { name: "Jean Rakoto",           phone: "+261341234567", address: "Antananarivo",  password: "demo123" },
  { name: "Marie Rasoa",           phone: "+261321234567", address: "Toamasina",     password: "demo123" },
  { name: "Hery Rasoamanarivo",    phone: "+261381234567", address: "Fianarantsoa",  password: "demo123" },
  { name: "Tiana Ratsimbazafy",    phone: "+261331234567", address: "Mahajanga",     password: "demo123" },
];

function getAccounts(): StoredAccount[] {
  try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]"); } catch { return []; }
}
function saveAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}
function getStoredUser(): AuthUser | null {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch { return null; }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);

  const login = useCallback(async (phone: string, password: string) => {
    const clean = phone.replace(/\s/g, "");

    const demo = DEMO_ACCOUNTS.find(
      a => a.phone.replace(/\s/g, "") === clean && a.password === password
    );
    if (demo) {
      const u: AuthUser = { name: demo.name, phone: demo.phone, address: demo.address };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      setUser(u);
      return { ok: true };
    }

    const accounts = getAccounts();
    const found = accounts.find(
      a => a.phone.replace(/\s/g, "") === clean && a.password === password
    );
    if (!found) return { ok: false, error: "Numéro ou mot de passe incorrect." };
    const u: AuthUser = { name: found.name, phone: found.phone, address: found.address };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
    return { ok: true };
  }, []);

  const register = useCallback(async (data: { name: string; address: string; phone: string; password: string }) => {
    const accounts = getAccounts();
    const clean = data.phone.replace(/\s/g, "");

    const isDemoPhone = DEMO_ACCOUNTS.some(a => a.phone.replace(/\s/g, "") === clean);
    if (isDemoPhone) {
      return { ok: false, error: "Ce numéro est déjà associé à un compte." };
    }
    if (accounts.some(a => a.phone.replace(/\s/g, "") === clean)) {
      return { ok: false, error: "Ce numéro est déjà associé à un compte." };
    }
    const newAccount: StoredAccount = { ...data, phone: clean };
    saveAccounts([...accounts, newAccount]);
    const u: AuthUser = { name: data.name, phone: clean, address: data.address };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
