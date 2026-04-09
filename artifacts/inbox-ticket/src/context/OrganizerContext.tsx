import React, { createContext, useContext, useState, useCallback } from "react";

export type OrganizerRole = "organisateur" | "agent-vente" | "agent-scan";

export type OrganizerSession = {
  id: string;
  name: string;
  company: string;
  email: string;
  role?: OrganizerRole;
};

type OrganizerContextType = {
  organizer: OrganizerSession | null;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  loginAs: (session: OrganizerSession) => void;
  logout: () => void;
};

const OrganizerContext = createContext<OrganizerContextType | null>(null);

const SESSION_KEY = "inbox_ticket_org_session";
const ORGS_KEY = "inbox_ticket_organizers";

type StoredOrganizer = {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  status: string;
  password?: string;
  createdAt: string;
};

function getStoredOrganizers(): StoredOrganizer[] {
  try { return JSON.parse(localStorage.getItem(ORGS_KEY) || "[]"); } catch { return []; }
}

function getStoredSession(): OrganizerSession | null {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch { return null; }
}

export function OrganizerProvider({ children }: { children: React.ReactNode }) {
  const [organizer, setOrganizer] = useState<OrganizerSession | null>(getStoredSession);

  const login = useCallback((email: string, password: string) => {
    const orgs = getStoredOrganizers();
    const found = orgs.find(
      (o) => o.email.toLowerCase() === email.toLowerCase().trim() && o.password === password
    );
    if (!found) return { ok: false, error: "Email ou mot de passe incorrect." };
    if (found.status === "suspended") return { ok: false, error: "Ce compte est suspendu. Contactez l'administrateur." };
    const session: OrganizerSession = { id: found.id, name: found.name, company: found.company, email: found.email };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setOrganizer(session);
    return { ok: true };
  }, []);

  const loginAs = useCallback((session: OrganizerSession) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setOrganizer(session);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setOrganizer(null);
  }, []);

  return (
    <OrganizerContext.Provider value={{ organizer, login, loginAs, logout }}>
      {children}
    </OrganizerContext.Provider>
  );
}

export function useOrganizer() {
  const ctx = useContext(OrganizerContext);
  if (!ctx) throw new Error("useOrganizer must be used within OrganizerProvider");
  return ctx;
}

export const ORG_EVENT_MAP_KEY = "inbox_ticket_event_org";

export function getEventOrgMap(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(ORG_EVENT_MAP_KEY) || "{}"); } catch { return {}; }
}

export function saveEventOrgMap(map: Record<string, string>) {
  localStorage.setItem(ORG_EVENT_MAP_KEY, JSON.stringify(map));
}

export function linkEventToOrganizer(eventId: number, organizerId: string) {
  const map = getEventOrgMap();
  map[String(eventId)] = organizerId;
  saveEventOrgMap(map);
}
