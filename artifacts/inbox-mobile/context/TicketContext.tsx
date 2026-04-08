import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface SavedTicket {
  id: string;
  orderId: number;
  eventId: number;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  ticketTypeName: string;
  quantity: number;
  totalAmount: number;
  paymentMethod: "orange_money" | "mvola" | "mastercard";
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  ticketCode: string;
  createdAt: string;
  status: "confirmed" | "pending";
}

interface TicketContextValue {
  tickets: SavedTicket[];
  addTicket: (ticket: SavedTicket) => Promise<void>;
  removeTicket: (id: string) => Promise<void>;
  loading: boolean;
}

const STORAGE_KEY = "inbox_ticket_mobile_tickets";

const TicketContext = createContext<TicketContextValue | null>(null);

export function TicketProvider({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<SavedTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw) as SavedTicket[];
          setTickets(parsed);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const persist = useCallback(async (updated: SavedTicket[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const addTicket = useCallback(
    async (ticket: SavedTicket) => {
      const updated = [ticket, ...tickets];
      setTickets(updated);
      await persist(updated);
    },
    [tickets, persist],
  );

  const removeTicket = useCallback(
    async (id: string) => {
      const updated = tickets.filter((t) => t.id !== id);
      setTickets(updated);
      await persist(updated);
    },
    [tickets, persist],
  );

  return (
    <TicketContext.Provider value={{ tickets, addTicket, removeTicket, loading }}>
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets(): TicketContextValue {
  const ctx = useContext(TicketContext);
  if (!ctx) throw new Error("useTickets must be inside TicketProvider");
  return ctx;
}
