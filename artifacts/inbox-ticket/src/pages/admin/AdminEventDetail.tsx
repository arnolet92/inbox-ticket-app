import React, { useState, useMemo } from "react";
import { useParams, Link } from "wouter";
import {
  ChevronLeft, TrendingUp, Ticket, Users, CreditCard, ShoppingCart,
  Plus, Edit, Trash2, Phone, Mail, UserCircle, Calendar, MapPin,
  CheckCircle, XCircle, Clock, UserCheck, Settings, Store,
  Package, Tag, ShoppingBag, BarChart2, Receipt, Wallet,
  ArrowUpCircle, ArrowDownCircle, Minus,
} from "lucide-react";
import { format, eachDayOfInterval } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, AreaChart, Area, ReferenceLine, Cell,
} from "recharts";
import { AdminLayout } from "@/components/layout";
import { Card, Button, Badge, Dialog, Input, Label, Select, Textarea,
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui";
import { formatMGA, formatPaymentMethod } from "@/lib/utils";
import { getCategoryImage } from "@/components/EventCard";
import {
  useGetEvent, useListOrders, useListTicketTypes,
  useCreateTicketType, useDeleteEvent,
} from "@workspace/api-client-react";

type Tab = "overview" | "finance" | "depenses" | "tickets" | "orders" | "shop" | "staff";

type Expense = {
  id: number;
  label: string;
  category: string;
  amount: number;
  date: string;
  note?: string;
  status: "paid" | "pending";
};

const EXPENSE_CATEGORIES = [
  { name: "Location salle", emoji: "🏛️" },
  { name: "Artistes / Prestataires", emoji: "🎵" },
  { name: "Son & Lumière", emoji: "🔊" },
  { name: "Traiteur", emoji: "🍽️" },
  { name: "Marketing / Communication", emoji: "📣" },
  { name: "Transport / Logistique", emoji: "🚗" },
  { name: "Staff / Personnel", emoji: "👔" },
  { name: "Impression / Décoration", emoji: "🖨️" },
  { name: "Matériel technique", emoji: "🔧" },
  { name: "Autres", emoji: "💡" },
];

const EXPENSES_INITIAL: Expense[] = [
  { id: 1, label: "Location Hôtel Colbert – Salle Panorama", category: "Location salle", amount: 180000, date: "2026-03-10", status: "paid", note: "Acompte 50% versé" },
  { id: 2, label: "Groupe Jazz & Orchestre", category: "Artistes / Prestataires", amount: 120000, date: "2026-03-15", status: "paid" },
  { id: 3, label: "Régie son, lumière & écrans LED", category: "Son & Lumière", amount: 75000, date: "2026-03-18", status: "paid" },
  { id: 4, label: "Traiteur dîner gala – 300 couverts", category: "Traiteur", amount: 150000, date: "2026-03-20", status: "pending", note: "Solde à régler le jour J" },
  { id: 5, label: "Campagne réseaux sociaux & affiches", category: "Marketing / Communication", amount: 45000, date: "2026-02-28", status: "paid" },
  { id: 6, label: "Transport artistes & matériel", category: "Transport / Logistique", amount: 20000, date: "2026-04-14", status: "pending" },
  { id: 7, label: "Staff d'accueil & sécurité (5 pers.)", category: "Staff / Personnel", amount: 30000, date: "2026-04-15", status: "pending" },
  { id: 8, label: "Impression programmes & banderoles", category: "Impression / Décoration", amount: 18000, date: "2026-03-25", status: "paid" },
];

const STAFF_ROLES = [
  { id: 1, name: "Rakoto Jean", role: "Responsable billetterie", phone: "032 12 345 67", status: "confirmed" },
  { id: 2, name: "Rasoa Marie", role: "Agent de sécurité", phone: "034 98 765 43", status: "confirmed" },
  { id: 3, name: "Andry Paul", role: "Hôte / Hôtesse", phone: "033 11 223 34", status: "pending" },
  { id: 4, name: "Fanja Claire", role: "Technicien son & lumière", phone: "032 55 667 78", status: "confirmed" },
  { id: 5, name: "Hery Luc", role: "Coordinateur général", phone: "034 44 556 66", status: "pending" },
];

/* ── Shop data model ── */
type ShopProduct = {
  id: number;
  name: string;
  category: string;
  price: number;
  emoji: string;
  bg: string;
  sold: number;
  description?: string;
};

type ShopStore = { id: number; name: string; location: string };

type StockLevel = { productId: number; storeId: number; qty: number };

type StockMovement = {
  id: number;
  type: "entree" | "redressement" | "transfert";
  productId: number;
  fromStoreId?: number;
  toStoreId: number;
  qty: number;
  date: string;
  note?: string;
};

const SHOP_CATEGORIES_ACC = [
  "Vêtements", "Couvre-chef", "Bijoux & Bracelets", "Sacs & Pochettes", "Accessoires divers",
];

const SHOP_PRODUCTS_INITIAL: ShopProduct[] = [
  { id: 1, name: "T-Shirt Gala 2026", category: "Vêtements", price: 35000, emoji: "👕", bg: "#1a3a2a", sold: 47, description: "T-shirt coton 100%, logo événement" },
  { id: 2, name: "Polo Prestige", category: "Vêtements", price: 55000, emoji: "👔", bg: "#1a2a3a", sold: 23, description: "Polo brodé, qualité premium" },
  { id: 3, name: "Hoodie Collector", category: "Vêtements", price: 80000, emoji: "🧥", bg: "#2a1a3a", sold: 12, description: "Sweat à capuche édition limitée" },
  { id: 4, name: "Casquette Officielle", category: "Couvre-chef", price: 25000, emoji: "🧢", bg: "#3a2a1a", sold: 38, description: "Casquette brodée, ajustable" },
  { id: 5, name: "Chapeau Panama", category: "Couvre-chef", price: 45000, emoji: "🎩", bg: "#1a3a3a", sold: 15, description: "Chapeau élégant pour l'événement" },
  { id: 6, name: "Bracelet Event", category: "Bijoux & Bracelets", price: 8000, emoji: "📿", bg: "#3a1a1a", sold: 89, description: "Bracelet tissu aux couleurs de l'événement" },
  { id: 7, name: "Bracelet Cuir VIP", category: "Bijoux & Bracelets", price: 20000, emoji: "⌚", bg: "#2a3a1a", sold: 34, description: "Bracelet cuir gravé, édition VIP" },
  { id: 8, name: "Tote Bag", category: "Sacs & Pochettes", price: 18000, emoji: "👜", bg: "#1a1a3a", sold: 56, description: "Sac en toile sérigraphié" },
  { id: 9, name: "Écharpe Collector", category: "Accessoires divers", price: 22000, emoji: "🧣", bg: "#3a3a1a", sold: 19, description: "Écharpe aux couleurs de l'événement" },
];

const SHOP_STORES_INITIAL: ShopStore[] = [
  { id: 1, name: "Stand Principal", location: "Entrée principale" },
  { id: 2, name: "Stand VIP", location: "Salon VIP" },
  { id: 3, name: "Stand Annexe", location: "Hall secondaire" },
];

const STOCK_INITIAL: StockLevel[] = [
  // Stand Principal
  { productId: 1, storeId: 1, qty: 80 }, { productId: 2, storeId: 1, qty: 40 },
  { productId: 3, storeId: 1, qty: 25 }, { productId: 4, storeId: 1, qty: 60 },
  { productId: 5, storeId: 1, qty: 30 }, { productId: 6, storeId: 1, qty: 120 },
  { productId: 7, storeId: 1, qty: 45 }, { productId: 8, storeId: 1, qty: 70 },
  { productId: 9, storeId: 1, qty: 35 },
  // Stand VIP
  { productId: 1, storeId: 2, qty: 20 }, { productId: 2, storeId: 2, qty: 15 },
  { productId: 3, storeId: 2, qty: 8 },  { productId: 4, storeId: 2, qty: 25 },
  { productId: 5, storeId: 2, qty: 12 }, { productId: 6, storeId: 2, qty: 30 },
  { productId: 7, storeId: 2, qty: 18 }, { productId: 8, storeId: 2, qty: 20 },
  { productId: 9, storeId: 2, qty: 10 },
  // Stand Annexe
  { productId: 1, storeId: 3, qty: 15 }, { productId: 2, storeId: 3, qty: 10 },
  { productId: 3, storeId: 3, qty: 5 },  { productId: 4, storeId: 3, qty: 20 },
  { productId: 5, storeId: 3, qty: 8 },  { productId: 6, storeId: 3, qty: 25 },
  { productId: 7, storeId: 3, qty: 12 }, { productId: 8, storeId: 3, qty: 15 },
  { productId: 9, storeId: 3, qty: 8 },
];

const MOVEMENTS_INITIAL: StockMovement[] = [
  { id: 1, type: "entree", productId: 1, toStoreId: 1, qty: 100, date: "2026-03-10", note: "Réception commande fournisseur" },
  { id: 2, type: "entree", productId: 6, toStoreId: 1, qty: 200, date: "2026-03-10" },
  { id: 3, type: "transfert", productId: 1, fromStoreId: 1, toStoreId: 2, qty: 20, date: "2026-03-20", note: "Approvisionnement stand VIP" },
  { id: 4, type: "redressement", productId: 4, toStoreId: 1, qty: 60, date: "2026-03-22", note: "Correction après inventaire" },
  { id: 5, type: "transfert", productId: 8, fromStoreId: 1, toStoreId: 3, qty: 15, date: "2026-03-25" },
];

const methodColors: Record<string, string> = {
  orange_money: "#ff6600",
  mvola: "#e02020",
  mastercard: "#3b82f6",
};
const methodLabels: Record<string, string> = {
  orange_money: "Orange Money",
  mvola: "MVola",
  mastercard: "Mastercard",
};
const methodIcons: Record<string, string> = {
  orange_money: "OM",
  mvola: "M",
  mastercard: "💳",
};

const CHART_TOOLTIP_STYLE = {
  backgroundColor: "hsl(150 10% 6%)",
  border: "1px solid hsl(145 48% 20% / 0.5)",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "12px",
};

function formatArShort(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M Ar`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k Ar`;
  return `${v} Ar`;
}

export default function AdminEventDetail() {
  const { id } = useParams<{ id: string }>();
  const eventId = Number(id);

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isAddTicketOpen, setIsAddTicketOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [shopProducts, setShopProducts] = useState<ShopProduct[]>(SHOP_PRODUCTS_INITIAL);
  const [shopStores] = useState<ShopStore[]>(SHOP_STORES_INITIAL);
  const [stockLevels, setStockLevels] = useState<StockLevel[]>(STOCK_INITIAL);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(MOVEMENTS_INITIAL);
  const [editShopProduct, setEditShopProduct] = useState<ShopProduct | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isStockOpOpen, setIsStockOpOpen] = useState<"entree" | "redressement" | "transfert" | null>(null);
  const [stockOpProduct, setStockOpProduct] = useState<ShopProduct | null>(null);
  const [shopView, setShopView] = useState<"catalogue" | "stock" | "mouvements">("catalogue");
  const [shopCatFilter, setShopCatFilter] = useState<string>("all");
  const [expenses, setExpenses] = useState<Expense[]>(EXPENSES_INITIAL);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);

  const { data: event, isLoading: eventLoading } = useGetEvent(eventId);
  const { data: orders, isLoading: ordersLoading } = useListOrders({ eventId });
  const { data: ticketTypes, isLoading: ticketsLoading } = useListTicketTypes({ eventId });

  const createTicketType = useCreateTicketType();

  const confirmedOrders = useMemo(() => orders?.filter((o) => o.status === "confirmed") ?? [], [orders]);
  const totalRevenue = useMemo(() => confirmedOrders.reduce((s, o) => s + parseFloat(o.totalAmount), 0), [confirmedOrders]);
  const totalTickets = useMemo(() => confirmedOrders.reduce((s, o) => s + o.quantity, 0), [confirmedOrders]);

  /* ── Finance chart data ── */
  const financeData = useMemo(() => {
    if (!confirmedOrders.length) return [];
    const sorted = [...confirmedOrders].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const first = new Date(sorted[0].createdAt);
    const last = new Date(sorted[sorted.length - 1].createdAt);
    const days = eachDayOfInterval({ start: first, end: last });

    let cumulative = 0;
    return days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayOrders = confirmedOrders.filter((o) =>
        format(new Date(o.createdAt), "yyyy-MM-dd") === dayStr
      );
      const daily = dayOrders.reduce((s, o) => s + parseFloat(o.totalAmount), 0);
      cumulative += daily;
      const byMethod: Record<string, number> = {};
      for (const o of dayOrders) {
        const m = o.payment?.method ?? "other";
        byMethod[m] = (byMethod[m] ?? 0) + parseFloat(o.totalAmount);
      }
      return {
        date: format(day, "d MMM", { locale: fr }),
        daily,
        cumul: cumulative,
        orange_money: byMethod.orange_money ?? 0,
        mvola: byMethod.mvola ?? 0,
        mastercard: byMethod.mastercard ?? 0,
        orders: dayOrders.length,
      };
    });
  }, [confirmedOrders]);

  const ticketSalesData = useMemo(() => {
    return (ticketTypes ?? []).map((tt) => ({
      name: tt.name,
      vendus: tt.soldCount ?? 0,
      restants: tt.quantity - (tt.soldCount ?? 0),
      revenus: (tt.soldCount ?? 0) * parseFloat(String(tt.price)),
    }));
  }, [ticketTypes]);

  const revenueByMethod = useMemo(() =>
    ["orange_money", "mvola", "mastercard"].map((method) => {
      const methodOrders = confirmedOrders.filter((o) => o.payment?.method === method);
      const amount = methodOrders.reduce((s, o) => s + parseFloat(o.totalAmount), 0);
      return { method, amount, count: methodOrders.length };
    }),
  [confirmedOrders]);

  /* ── Expense stats ── */
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const paidExpenses = expenses.filter((e) => e.status === "paid").reduce((s, e) => s + e.amount, 0);
  const pendingExpenses = expenses.filter((e) => e.status === "pending").reduce((s, e) => s + e.amount, 0);
  const benefice = totalRevenue - totalExpenses;
  const beneficePct = totalRevenue > 0 ? Math.round((benefice / totalRevenue) * 100) : 0;

  const expenseByCat = EXPENSE_CATEGORIES
    .filter((c) => expenses.some((e) => e.category === c.name))
    .map((c) => {
      const items = expenses.filter((e) => e.category === c.name);
      return { name: c.name, emoji: c.emoji, amount: items.reduce((s, e) => s + e.amount, 0), count: items.length };
    })
    .sort((a, b) => b.amount - a.amount);

  /* ── Finance P&L comparison chart data ── */
  const plData = [
    { label: "Revenus", value: totalRevenue, color: "hsl(145 60% 35%)" },
    { label: "Dépenses", value: totalExpenses, color: "hsl(0 65% 50%)" },
    { label: "Bénéfice", value: benefice, color: benefice >= 0 ? "hsl(145 60% 45%)" : "hsl(0 65% 50%)" },
  ];

  /* ── Shop stats ── */
  const getStockQty = (productId: number, storeId?: number) =>
    storeId
      ? stockLevels.find((s) => s.productId === productId && s.storeId === storeId)?.qty ?? 0
      : stockLevels.filter((s) => s.productId === productId).reduce((sum, s) => sum + s.qty, 0);

  const shopRevenue = shopProducts.reduce((s, p) => s + p.price * p.sold, 0);
  const shopSoldTotal = shopProducts.reduce((s, p) => s + p.sold, 0);
  const shopTotalStock = stockLevels.reduce((s, l) => s + l.qty, 0);
  const shopCategoryData = SHOP_CATEGORIES_ACC.filter((c) => shopProducts.some((p) => p.category === c)).map((cat) => {
    const prods = shopProducts.filter((p) => p.category === cat);
    return {
      name: cat,
      revenus: prods.reduce((s, p) => s + p.price * p.sold, 0),
      vendus: prods.reduce((s, p) => s + p.sold, 0),
    };
  });

  const fillPct = event && event.totalCapacity > 0
    ? Math.round((event.soldTickets / event.totalCapacity) * 100) : 0;

  const handleAddTicket = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await createTicketType.mutateAsync({
        data: {
          eventId,
          name: fd.get("name") as string,
          description: fd.get("description") as string,
          price: fd.get("price") as string,
          quantity: Number(fd.get("quantity")),
          currency: "MGA",
        },
      });
      setIsAddTicketOpen(false);
    } catch {
      alert("Erreur lors de la création du billet");
    }
  };

  const handleAddExpense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (editExpense) {
      setExpenses((prev) =>
        prev.map((ex) =>
          ex.id === editExpense.id
            ? {
                ...ex,
                label: fd.get("label") as string,
                category: fd.get("category") as string,
                amount: Number(fd.get("amount")),
                date: fd.get("date") as string,
                note: fd.get("note") as string || undefined,
                status: fd.get("status") as "paid" | "pending",
              }
            : ex
        )
      );
      setEditExpense(null);
    } else {
      setExpenses((prev) => [
        ...prev,
        {
          id: Date.now(),
          label: fd.get("label") as string,
          category: fd.get("category") as string,
          amount: Number(fd.get("amount")),
          date: fd.get("date") as string,
          note: fd.get("note") as string || undefined,
          status: fd.get("status") as "paid" | "pending",
        },
      ]);
    }
    setIsAddExpenseOpen(false);
  };

  const deleteExpense = (expId: number) => {
    if (confirm("Supprimer cette dépense ?")) {
      setExpenses((prev) => prev.filter((e) => e.id !== expId));
    }
  };

  const CAT_EMOJIS: Record<string, string> = {
    "Vêtements": "👕", "Couvre-chef": "🧢", "Bijoux & Bracelets": "📿",
    "Sacs & Pochettes": "👜", "Accessoires divers": "🧣",
  };
  const CAT_BG: Record<string, string> = {
    "Vêtements": "#1a3a2a", "Couvre-chef": "#3a2a1a", "Bijoux & Bracelets": "#3a1a1a",
    "Sacs & Pochettes": "#1a1a3a", "Accessoires divers": "#3a3a1a",
  };

  const handleSaveProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const cat = fd.get("category") as string;
    if (editShopProduct) {
      setShopProducts((prev) => prev.map((p) =>
        p.id === editShopProduct.id
          ? { ...p, name: fd.get("name") as string, category: cat, price: Number(fd.get("price")),
              description: fd.get("description") as string, emoji: CAT_EMOJIS[cat] ?? "🛍️", bg: CAT_BG[cat] ?? "#1a1a1a" }
          : p
      ));
      setEditShopProduct(null);
    } else {
      const newProd: ShopProduct = {
        id: Date.now(), name: fd.get("name") as string, category: cat,
        price: Number(fd.get("price")), emoji: CAT_EMOJIS[cat] ?? "🛍️",
        bg: CAT_BG[cat] ?? "#1a1a1a", sold: 0, description: fd.get("description") as string,
      };
      setShopProducts((prev) => [...prev, newProd]);
      // init stock at 0 for all stores
      setStockLevels((prev) => [
        ...prev,
        ...shopStores.map((s) => ({ productId: newProd.id, storeId: s.id, qty: 0 })),
      ]);
    }
    setIsAddProductOpen(false);
  };

  const deleteProduct = (pid: number) => {
    if (confirm("Supprimer ce produit ?")) {
      setShopProducts((prev) => prev.filter((p) => p.id !== pid));
      setStockLevels((prev) => prev.filter((s) => s.productId !== pid));
    }
  };

  const handleStockOperation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stockOpProduct || !isStockOpOpen) return;
    const fd = new FormData(e.currentTarget);
    const qty = Number(fd.get("qty"));
    const toStoreId = Number(fd.get("toStoreId"));
    const fromStoreId = fd.get("fromStoreId") ? Number(fd.get("fromStoreId")) : undefined;
    const note = fd.get("note") as string;

    if (isStockOpOpen === "entree") {
      setStockLevels((prev) => prev.map((s) =>
        s.productId === stockOpProduct.id && s.storeId === toStoreId
          ? { ...s, qty: s.qty + qty } : s
      ));
    } else if (isStockOpOpen === "redressement") {
      setStockLevels((prev) => prev.map((s) =>
        s.productId === stockOpProduct.id && s.storeId === toStoreId
          ? { ...s, qty } : s
      ));
    } else if (isStockOpOpen === "transfert" && fromStoreId) {
      setStockLevels((prev) => prev.map((s) => {
        if (s.productId !== stockOpProduct.id) return s;
        if (s.storeId === fromStoreId) return { ...s, qty: Math.max(0, s.qty - qty) };
        if (s.storeId === toStoreId) return { ...s, qty: s.qty + qty };
        return s;
      }));
    }

    setStockMovements((prev) => [
      { id: Date.now(), type: isStockOpOpen, productId: stockOpProduct.id, fromStoreId, toStoreId, qty, date: new Date().toISOString().slice(0, 10), note: note || undefined },
      ...prev,
    ]);
    setIsStockOpOpen(null);
    setStockOpProduct(null);
  };

  if (eventLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
        </div>
      </AdminLayout>
    );
  }

  if (!event) {
    return (
      <AdminLayout>
        <div className="text-center py-32">
          <h2 className="text-2xl font-bold mb-4">Événement introuvable</h2>
          <Link href="/admin/events"><Button variant="outline">Retour aux événements</Button></Link>
        </div>
      </AdminLayout>
    );
  }

  const imageSrc = event.imageUrl || getCategoryImage(event.category);

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Vue d'ensemble", icon: <TrendingUp className="w-4 h-4" /> },
    { key: "finance", label: "Finances", icon: <BarChart2 className="w-4 h-4" /> },
    { key: "depenses", label: "Dépenses", icon: <Receipt className="w-4 h-4" /> },
    { key: "tickets", label: "Billets", icon: <Ticket className="w-4 h-4" /> },
    { key: "orders", label: "Commandes", icon: <ShoppingCart className="w-4 h-4" /> },
    { key: "shop", label: "Shop", icon: <Store className="w-4 h-4" /> },
    { key: "staff", label: "Staff", icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <AdminLayout>
      {/* Back link */}
      <Link href="/admin/events">
        <button className="flex items-center gap-2 text-muted-foreground hover:text-white mb-6 transition-colors text-sm">
          <ChevronLeft className="w-4 h-4" /> Retour aux événements
        </button>
      </Link>

      {/* Event banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8 h-52">
        <img src={imageSrc} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 flex items-end p-8">
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className="bg-black/50 backdrop-blur border-white/10 text-white">{event.category}</Badge>
              <Badge
                className={
                  event.status === "upcoming"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : "bg-muted text-muted-foreground"
                }
              >
                {event.status === "upcoming" ? "À venir" : event.status === "ongoing" ? "En cours" : "Passé"}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold font-display text-white mb-1">{event.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-white/70">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(event.startDate), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {event.location}, {event.city}
              </span>
            </div>
          </div>
          <div className="hidden md:flex gap-3">
            <Button variant="outline" size="sm" className="bg-black/40 border-white/20 text-white hover:bg-white/10">
              <Edit className="w-4 h-4 mr-2" /> Modifier
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-card rounded-xl border border-border mb-8 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── TAB: OVERVIEW ─── */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Chiffre d'affaires", value: formatMGA(totalRevenue), icon: <TrendingUp className="w-5 h-5" />, color: "text-emerald-400" },
              { label: "Billets vendus", value: `${event.soldTickets} / ${event.totalCapacity}`, icon: <Ticket className="w-5 h-5" />, color: "text-blue-400" },
              { label: "Commandes", value: String(orders?.length ?? 0), icon: <ShoppingCart className="w-5 h-5" />, color: "text-violet-400" },
              { label: "Taux de remplissage", value: `${fillPct}%`, icon: <UserCheck className="w-5 h-5" />, color: fillPct >= 80 ? "text-orange-400" : "text-emerald-400" },
            ].map((kpi) => (
              <Card key={kpi.label} className="p-5">
                <div className={`${kpi.color} mb-3`}>{kpi.icon}</div>
                <div className="text-2xl font-bold font-display mb-1">{kpi.value}</div>
                <div className="text-xs text-muted-foreground">{kpi.label}</div>
              </Card>
            ))}
          </div>

          {/* Filling progress */}
          <Card className="p-6">
            <h3 className="font-bold font-display text-lg mb-4">Remplissage de la salle</h3>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex-1">
                <div className="w-full bg-input rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${fillPct}%`,
                      background: fillPct >= 90 ? "hsl(0 70% 50%)" : fillPct >= 60 ? "hsl(38 95% 50%)" : "hsl(145 60% 35%)",
                    }}
                  />
                </div>
              </div>
              <span className="text-2xl font-bold font-display text-accent w-16 text-right">{fillPct}%</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{event.soldTickets.toLocaleString("fr-FR")} billets vendus</span>
              <span>Capacité : {event.totalCapacity.toLocaleString("fr-FR")}</span>
            </div>
          </Card>

          {/* Revenue by payment method */}
          <div>
            <h3 className="font-bold font-display text-lg mb-4">Chiffre d'affaires par mode de paiement</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {revenueByMethod.map(({ method, amount, count }) => (
                <Card key={method} className="p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1" style={{ background: methodColors[method] }} />
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm text-white"
                      style={{ background: methodColors[method] }}
                    >
                      {methodIcons[method]}
                    </div>
                    <div>
                      <div className="font-bold">{methodLabels[method]}</div>
                      <div className="text-xs text-muted-foreground">{count} paiement{count > 1 ? "s" : ""}</div>
                    </div>
                  </div>
                  <div className="text-3xl font-display font-bold" style={{ color: methodColors[method] }}>
                    {formatMGA(amount)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0}% du total
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Revenue total recap */}
          <Card className="p-6 border-accent/20 bg-gradient-to-r from-primary/10 to-transparent">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Chiffre d'affaires total</div>
                <div className="text-4xl font-display font-bold text-accent">{formatMGA(totalRevenue)}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground mb-1">Commandes confirmées</div>
                <div className="text-2xl font-bold">{confirmedOrders.length}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground mb-1">Total billets vendus</div>
                <div className="text-2xl font-bold">{totalTickets}</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ─── TAB: FINANCE ─── */}
      {activeTab === "finance" && (
        <div className="space-y-8">

          {/* P&L Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 to-transparent">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <ArrowUpCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-sm text-muted-foreground">Chiffre d'affaires</div>
              </div>
              <div className="text-3xl font-display font-bold text-emerald-400">{formatMGA(totalRevenue)}</div>
              <div className="text-xs text-muted-foreground mt-1">{confirmedOrders.length} commandes confirmées</div>
            </Card>

            <Card className="p-6 border-red-500/20 bg-gradient-to-br from-red-950/30 to-transparent">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <ArrowDownCircle className="w-5 h-5 text-red-400" />
                </div>
                <div className="text-sm text-muted-foreground">Total dépenses</div>
              </div>
              <div className="text-3xl font-display font-bold text-red-400">{formatMGA(totalExpenses)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {formatMGA(paidExpenses)} payé · {formatMGA(pendingExpenses)} en attente
              </div>
            </Card>

            <Card className={`p-6 ${benefice >= 0 ? "border-accent/30 bg-gradient-to-br from-primary/20 to-transparent" : "border-red-500/30 bg-gradient-to-br from-red-950/20 to-transparent"}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${benefice >= 0 ? "bg-accent/20" : "bg-red-500/20"}`}>
                  <Wallet className={`w-5 h-5 ${benefice >= 0 ? "text-accent" : "text-red-400"}`} />
                </div>
                <div className="text-sm text-muted-foreground">Bénéfice net</div>
              </div>
              <div className={`text-3xl font-display font-bold ${benefice >= 0 ? "text-accent" : "text-red-400"}`}>
                {benefice >= 0 ? "+" : ""}{formatMGA(benefice)}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-input rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(Math.abs(beneficePct), 100)}%`,
                      background: benefice >= 0 ? "hsl(145 60% 35%)" : "hsl(0 65% 50%)",
                    }}
                  />
                </div>
                <span className={`text-xs font-bold ${benefice >= 0 ? "text-accent" : "text-red-400"}`}>
                  {beneficePct >= 0 ? "+" : ""}{beneficePct}% marge
                </span>
              </div>
            </Card>
          </div>

          {/* Revenue vs Expenses comparison bar chart */}
          <Card className="p-6">
            <h3 className="font-bold font-display text-lg mb-6">Revenus · Dépenses · Bénéfice</h3>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={plData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(145 10% 12%)" />
                <XAxis dataKey="label" tick={{ fill: "hsl(145 5% 65%)", fontSize: 13, fontWeight: 600 }} />
                <YAxis tickFormatter={formatArShort} tick={{ fill: "hsl(145 5% 55%)", fontSize: 11 }} />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  formatter={(v: number) => [formatMGA(v)]}
                  labelStyle={{ color: "hsl(145 5% 75%)", marginBottom: 4 }}
                />
                <ReferenceLine y={0} stroke="hsl(145 10% 25%)" strokeWidth={1} />
                <Bar
                  dataKey="value"
                  radius={[6, 6, 0, 0]}
                  label={{ position: "top", formatter: (v: number) => formatArShort(Math.abs(v)), fill: "hsl(145 5% 65%)", fontSize: 11 }}
                >
                  {plData.map((entry) => (
                    <Cell key={entry.label} fill={entry.color} />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </Card>

          {/* Expense breakdown by category */}
          <Card className="p-6">
            <h3 className="font-bold font-display text-lg mb-4">Répartition des dépenses par catégorie</h3>
            {expenseByCat.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">Aucune dépense enregistrée</div>
            ) : (
              <div className="space-y-3">
                {expenseByCat.map((cat) => {
                  const pct = totalExpenses > 0 ? Math.round((cat.amount / totalExpenses) * 100) : 0;
                  return (
                    <div key={cat.name}>
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span className="flex items-center gap-2">
                          <span>{cat.emoji}</span>
                          <span className="font-medium">{cat.name}</span>
                          <span className="text-xs text-muted-foreground">({cat.count})</span>
                        </span>
                        <span className="font-bold">{formatMGA(cat.amount)} <span className="text-xs text-muted-foreground font-normal">({pct}%)</span></span>
                      </div>
                      <div className="w-full bg-input rounded-full h-2 overflow-hidden">
                        <div className="h-full rounded-full bg-red-500/70" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Revenu total", value: formatMGA(totalRevenue), color: "text-emerald-400", sub: `${confirmedOrders.length} commandes` },
              { label: "Revenu moyen/commande", value: confirmedOrders.length ? formatMGA(totalRevenue / confirmedOrders.length) : "—", color: "text-blue-400", sub: "par commande" },
              { label: "Revenu moyen/billet", value: totalTickets ? formatMGA(totalRevenue / totalTickets) : "—", color: "text-violet-400", sub: "par billet" },
              { label: "Revenu shop", value: formatMGA(shopRevenue), color: "text-orange-400", sub: `${shopSoldTotal} articles` },
            ].map((k) => (
              <Card key={k.label} className="p-5">
                <div className={`text-2xl font-bold font-display ${k.color} mb-1`}>{k.value}</div>
                <div className="text-xs text-muted-foreground">{k.label}</div>
                <div className="text-xs text-muted-foreground/60 mt-0.5">{k.sub}</div>
              </Card>
            ))}
          </div>

          {/* Revenue over time */}
          <Card className="p-6">
            <h3 className="font-bold font-display text-lg mb-6">Évolution du chiffre d'affaires</h3>
            {financeData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                Aucune donnée disponible
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={financeData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                  <defs>
                    <linearGradient id="cumulGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(145 60% 35%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(145 60% 35%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(145 10% 12%)" />
                  <XAxis dataKey="date" tick={{ fill: "hsl(145 5% 55%)", fontSize: 11 }} />
                  <YAxis tickFormatter={formatArShort} tick={{ fill: "hsl(145 5% 55%)", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(value: number, name: string) => [
                      formatMGA(value),
                      name === "daily" ? "Ventes du jour" : name === "cumul" ? "Cumul" : name,
                    ]}
                    labelStyle={{ color: "hsl(145 5% 75%)", marginBottom: 4 }}
                  />
                  <Legend
                    formatter={(v) => v === "daily" ? "Ventes du jour" : v === "cumul" ? "Cumul cumulatif" : v}
                    wrapperStyle={{ fontSize: 12, color: "hsl(145 5% 65%)" }}
                  />
                  <Bar dataKey="daily" fill="hsl(145 48% 20%)" radius={[4, 4, 0, 0]} name="daily" />
                  <Line
                    type="monotone"
                    dataKey="cumul"
                    stroke="hsl(145 60% 45%)"
                    strokeWidth={2.5}
                    dot={{ fill: "hsl(145 60% 45%)", r: 3 }}
                    activeDot={{ r: 5 }}
                    name="cumul"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Revenue by payment method – stacked bar */}
          <Card className="p-6">
            <h3 className="font-bold font-display text-lg mb-6">Revenus par mode de paiement (par jour)</h3>
            {financeData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                Aucune donnée disponible
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <ComposedChart data={financeData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(145 10% 12%)" />
                  <XAxis dataKey="date" tick={{ fill: "hsl(145 5% 55%)", fontSize: 11 }} />
                  <YAxis tickFormatter={formatArShort} tick={{ fill: "hsl(145 5% 55%)", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(value: number, name: string) => [
                      formatMGA(value),
                      methodLabels[name] ?? name,
                    ]}
                    labelStyle={{ color: "hsl(145 5% 75%)", marginBottom: 4 }}
                  />
                  <Legend
                    formatter={(v) => methodLabels[v] ?? v}
                    wrapperStyle={{ fontSize: 12, color: "hsl(145 5% 65%)" }}
                  />
                  <Bar dataKey="orange_money" stackId="a" fill="#ff6600" name="orange_money" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="mvola" stackId="a" fill="#e02020" name="mvola" />
                  <Bar dataKey="mastercard" stackId="a" fill="#3b82f6" name="mastercard" radius={[4, 4, 0, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Ticket type revenue chart */}
          <Card className="p-6">
            <h3 className="font-bold font-display text-lg mb-6">Ventes par type de billet</h3>
            {ticketSalesData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                Aucun type de billet configuré
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={ticketSalesData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(145 10% 12%)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "hsl(145 5% 55%)", fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "hsl(145 5% 55%)", fontSize: 11 }} width={90} />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(v: number, n: string) => [
                      n === "revenus" ? formatMGA(v) : `${v} billets`,
                      n === "vendus" ? "Vendus" : n === "restants" ? "Restants" : "Revenus",
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, color: "hsl(145 5% 65%)" }}
                    formatter={(v) => v === "vendus" ? "Vendus" : v === "restants" ? "Restants" : "Revenus"} />
                  <Bar dataKey="vendus" stackId="b" fill="hsl(145 60% 35%)" name="vendus" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="restants" stackId="b" fill="hsl(145 20% 18%)" name="restants" radius={[0, 4, 4, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Orders count over time */}
          <Card className="p-6">
            <h3 className="font-bold font-display text-lg mb-6">Nombre de commandes par jour</h3>
            {financeData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">Aucune donnée</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={financeData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                  <defs>
                    <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(145 10% 12%)" />
                  <XAxis dataKey="date" tick={{ fill: "hsl(145 5% 55%)", fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fill: "hsl(145 5% 55%)", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(v: number) => [`${v} commande${v > 1 ? "s" : ""}`, "Commandes"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stroke="#3b82f6"
                    fill="url(#ordersGradient)"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", r: 3 }}
                    name="orders"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>
      )}

      {/* ─── TAB: DÉPENSES ─── */}
      {activeTab === "depenses" && (
        <div className="space-y-8">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total dépenses", value: formatMGA(totalExpenses), icon: <Receipt className="w-5 h-5" />, color: "text-red-400" },
              { label: "Réglées", value: formatMGA(paidExpenses), icon: <CheckCircle className="w-5 h-5" />, color: "text-emerald-400" },
              { label: "En attente", value: formatMGA(pendingExpenses), icon: <Clock className="w-5 h-5" />, color: "text-orange-400" },
              { label: "Bénéfice estimé", value: (benefice >= 0 ? "+" : "") + formatMGA(benefice), icon: <Wallet className="w-5 h-5" />, color: benefice >= 0 ? "text-accent" : "text-red-400" },
            ].map((kpi) => (
              <Card key={kpi.label} className="p-5">
                <div className={`${kpi.color} mb-3`}>{kpi.icon}</div>
                <div className={`text-2xl font-bold font-display mb-1 ${kpi.color}`}>{kpi.value}</div>
                <div className="text-xs text-muted-foreground">{kpi.label}</div>
              </Card>
            ))}
          </div>

          {/* Expense list */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold font-display text-lg">Registre des dépenses ({expenses.length})</h3>
              <Button variant="accent" size="sm" onClick={() => { setEditExpense(null); setIsAddExpenseOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" /> Nouvelle dépense
              </Button>
            </div>

            {expenses.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border">
                <Receipt className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h4 className="font-bold mb-2">Aucune dépense enregistrée</h4>
                <Button variant="accent" size="sm" onClick={() => setIsAddExpenseOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Ajouter une dépense
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {expenses
                  .slice()
                  .sort((a, b) => b.amount - a.amount)
                  .map((exp) => {
                    const cat = EXPENSE_CATEGORIES.find((c) => c.name === exp.category);
                    return (
                      <Card key={exp.id} className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center text-2xl shrink-0">
                            {cat?.emoji ?? "💡"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="font-semibold truncate">{exp.label}</div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-muted-foreground">{exp.category}</span>
                                  <span className="text-muted-foreground/40">·</span>
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(exp.date), "d MMM yyyy", { locale: fr })}
                                  </span>
                                  {exp.note && (
                                    <>
                                      <span className="text-muted-foreground/40">·</span>
                                      <span className="text-xs text-muted-foreground italic truncate max-w-[180px]">{exp.note}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="shrink-0 flex items-center gap-3">
                                <div className="text-right">
                                  <div className="font-bold text-red-400">{formatMGA(exp.amount)}</div>
                                  <Badge variant={exp.status === "paid" ? "success" : "warning"} className="text-xs">
                                    {exp.status === "paid" ? (
                                      <span className="flex items-center gap-1"><CheckCircle className="w-2.5 h-2.5" /> Réglée</span>
                                    ) : (
                                      <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> En attente</span>
                                    )}
                                  </Badge>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="outline" size="sm" className="h-8 w-8 p-0"
                                    onClick={() => { setEditExpense(exp); setIsAddExpenseOpen(true); }}
                                  >
                                    <Edit className="w-3.5 h-3.5 text-blue-400" />
                                  </Button>
                                  <Button
                                    variant="outline" size="sm" className="h-8 w-8 p-0"
                                    onClick={() => deleteExpense(exp.id)}
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Category breakdown */}
          {expenseByCat.length > 0 && (
            <Card className="p-6">
              <h3 className="font-bold font-display text-lg mb-4">Répartition par catégorie</h3>
              <div className="space-y-3">
                {expenseByCat.map((cat) => {
                  const pct = totalExpenses > 0 ? Math.round((cat.amount / totalExpenses) * 100) : 0;
                  return (
                    <div key={cat.name}>
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span className="flex items-center gap-2">
                          <span>{cat.emoji}</span>
                          <span className="font-medium">{cat.name}</span>
                          <span className="text-xs text-muted-foreground">{cat.count} poste{cat.count > 1 ? "s" : ""}</span>
                        </span>
                        <span className="font-bold text-red-400">
                          {formatMGA(cat.amount)} <span className="text-muted-foreground font-normal text-xs">({pct}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-input rounded-full h-2 overflow-hidden">
                        <div className="h-full rounded-full bg-red-500/60" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
                <span className="font-bold">Total toutes catégories</span>
                <span className="font-bold text-xl text-red-400">{formatMGA(totalExpenses)}</span>
              </div>
            </Card>
          )}

          {/* Add/Edit expense dialog */}
          <Dialog
            isOpen={isAddExpenseOpen}
            onClose={() => { setIsAddExpenseOpen(false); setEditExpense(null); }}
            title={editExpense ? "Modifier la dépense" : "Nouvelle dépense"}
          >
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="space-y-2">
                <Label>Intitulé</Label>
                <Input name="label" required placeholder="Ex: Location salle des fêtes" defaultValue={editExpense?.label ?? ""} />
              </div>
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select name="category" required defaultValue={editExpense?.category ?? "Location salle"}>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c.name} value={c.name}>{c.emoji} {c.name}</option>
                  ))}
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Montant (Ar)</Label>
                  <Input name="amount" type="number" required min="0" placeholder="Ex: 50000" defaultValue={editExpense?.amount ?? ""} />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input name="date" type="date" required defaultValue={editExpense?.date ?? new Date().toISOString().slice(0, 10)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select name="status" defaultValue={editExpense?.status ?? "pending"}>
                  <option value="paid">✅ Réglée</option>
                  <option value="pending">⏳ En attente</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Note (optionnel)</Label>
                <Textarea name="note" placeholder="Informations complémentaires..." defaultValue={editExpense?.note ?? ""} />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => { setIsAddExpenseOpen(false); setEditExpense(null); }}>
                  Annuler
                </Button>
                <Button type="submit" variant="accent">
                  {editExpense ? "Enregistrer" : "Ajouter"}
                </Button>
              </div>
            </form>
          </Dialog>
        </div>
      )}

      {/* ─── TAB: TICKETS ─── */}
      {activeTab === "tickets" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold font-display text-xl">Types de billets</h3>
            <Button variant="accent" size="sm" onClick={() => setIsAddTicketOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Nouveau type
            </Button>
          </div>

          {ticketsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-card rounded-xl animate-pulse" />)}
            </div>
          ) : ticketTypes?.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border">
              <Ticket className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <h4 className="font-bold mb-2">Aucun type de billet</h4>
              <p className="text-muted-foreground text-sm mb-4">Ajoutez des types de billets pour cet événement.</p>
              <Button variant="accent" size="sm" onClick={() => setIsAddTicketOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Ajouter un billet
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {ticketTypes?.map((tt) => {
                const ticketOrders = confirmedOrders.filter((o) => o.ticketTypeId === tt.id);
                const ticketRevenue = ticketOrders.reduce((s, o) => s + parseFloat(o.totalAmount), 0);
                const sold = tt.soldCount ?? 0;
                const fillPctTt = tt.quantity > 0 ? Math.round((sold / tt.quantity) * 100) : 0;
                return (
                  <Card key={tt.id} className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-lg font-bold font-display">{tt.name}</h4>
                            <p className="text-sm text-muted-foreground">{tt.description}</p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Edit className="w-3.5 h-3.5 text-blue-400" />
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Trash2 className="w-3.5 h-3.5 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                            <span>{sold} / {tt.quantity} vendus</span>
                            <span>{fillPctTt}%</span>
                          </div>
                          <div className="w-full bg-input rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${fillPctTt}%`,
                                background: fillPctTt >= 90 ? "hsl(0 70% 50%)" : "hsl(145 60% 35%)",
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex md:flex-col gap-6 md:gap-2 md:text-right shrink-0 md:border-l md:border-border/50 md:pl-6">
                        <div>
                          <div className="text-xs text-muted-foreground">Prix unitaire</div>
                          <div className="text-xl font-display font-bold text-accent">{formatMGA(tt.price)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Revenus générés</div>
                          <div className="text-lg font-bold text-emerald-400">{formatMGA(ticketRevenue)}</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          <Dialog isOpen={isAddTicketOpen} onClose={() => setIsAddTicketOpen(false)} title="Nouveau type de billet">
            <form onSubmit={handleAddTicket} className="space-y-4">
              <div className="space-y-2">
                <Label>Nom du billet</Label>
                <Input name="name" required placeholder="Ex: VIP, Standard, Économique" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prix (Ar)</Label>
                  <Input name="price" type="number" required min="0" placeholder="Ex: 50000" />
                </div>
                <div className="space-y-2">
                  <Label>Quantité disponible</Label>
                  <Input name="quantity" type="number" required min="1" placeholder="Ex: 200" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea name="description" placeholder="Description des avantages..." />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsAddTicketOpen(false)}>Annuler</Button>
                <Button type="submit" variant="accent" isLoading={createTicketType.isPending}>Créer le billet</Button>
              </div>
            </form>
          </Dialog>
        </div>
      )}

      {/* ─── TAB: ORDERS & PAYMENTS ─── */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total commandes", value: orders?.length ?? 0, color: "text-foreground" },
              { label: "Confirmées", value: confirmedOrders.length, color: "text-emerald-400" },
              { label: "En attente", value: orders?.filter((o) => o.status === "pending").length ?? 0, color: "text-orange-400" },
            ].map((s) => (
              <Card key={s.label} className="p-4 text-center">
                <div className={`text-2xl font-bold font-display ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </Card>
            ))}
          </div>

          {ordersLoading ? (
            <div className="h-48 bg-card rounded-xl animate-pulse" />
          ) : orders?.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border">
              <ShoppingCart className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Aucune commande pour cet événement.</p>
            </div>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Billet</TableHead>
                      <TableHead>Paiement</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders?.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="text-muted-foreground text-sm font-mono">
                          #{String(order.id).padStart(5, "0")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-accent font-bold text-sm shrink-0">
                              {order.customerName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-sm">{order.customerName}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {order.customerEmail}
                              </div>
                              {order.customerPhone && (
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Phone className="w-3 h-3" /> {order.customerPhone}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{order.ticketType?.name ?? "—"}</div>
                          <div className="text-xs text-muted-foreground">x{order.quantity}</div>
                        </TableCell>
                        <TableCell>
                          {order.payment ? (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-black text-white"
                                style={{ background: methodColors[order.payment.method] ?? "#888" }}
                              >
                                {methodIcons[order.payment.method] ?? "?"}
                              </div>
                              <span className="text-sm">{methodLabels[order.payment.method] ?? order.payment.method}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-accent">{formatMGA(order.totalAmount)}</span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(order.createdAt), "dd MMM yy", { locale: fr })}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === "confirmed" ? "success"
                              : order.status === "cancelled" ? "destructive"
                              : "warning"
                            }
                          >
                            {order.status === "confirmed" ? (
                              <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Confirmé</span>
                            ) : order.status === "cancelled" ? (
                              <span className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Annulé</span>
                            ) : (
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> En attente</span>
                            )}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ─── TAB: SHOP ─── */}
      {activeTab === "shop" && (
        <div className="space-y-6">

          {/* Shop KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Revenu boutique", value: formatMGA(shopRevenue), icon: <Store className="w-5 h-5" />, color: "text-orange-400" },
              { label: "Articles vendus", value: String(shopSoldTotal), icon: <ShoppingBag className="w-5 h-5" />, color: "text-emerald-400" },
              { label: "Produits actifs", value: String(shopProducts.length), icon: <Package className="w-5 h-5" />, color: "text-blue-400" },
              { label: "Stock total", value: String(shopTotalStock), icon: <Tag className="w-5 h-5" />, color: "text-violet-400" },
            ].map((kpi) => (
              <Card key={kpi.label} className="p-5">
                <div className={`${kpi.color} mb-3`}>{kpi.icon}</div>
                <div className="text-2xl font-bold font-display mb-1">{kpi.value}</div>
                <div className="text-xs text-muted-foreground">{kpi.label}</div>
              </Card>
            ))}
          </div>

          {/* Sub-nav */}
          <div className="flex gap-1 p-1 bg-card rounded-xl border border-border w-fit">
            {(["catalogue", "stock", "mouvements"] as const).map((v) => (
              <button key={v} onClick={() => setShopView(v)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                  shopView === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}>
                {v === "catalogue" ? "🛍️ Catalogue" : v === "stock" ? "📦 Gestion stock" : "📋 Mouvements"}
              </button>
            ))}
          </div>

          {/* ── CATALOGUE (POS grid) ── */}
          {shopView === "catalogue" && (
            <div>
              {/* Category filter + add button */}
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <button onClick={() => setShopCatFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${shopCatFilter === "all" ? "bg-accent text-black border-accent" : "border-border text-muted-foreground hover:border-accent/50"}`}>
                  Tous
                </button>
                {SHOP_CATEGORIES_ACC.map((c) => (
                  <button key={c} onClick={() => setShopCatFilter(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${shopCatFilter === c ? "bg-accent text-black border-accent" : "border-border text-muted-foreground hover:border-accent/50"}`}>
                    {c}
                  </button>
                ))}
                <div className="flex-1" />
                <Button variant="accent" size="sm" onClick={() => { setEditShopProduct(null); setIsAddProductOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" /> Nouveau produit
                </Button>
              </div>

              {/* POS grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {shopProducts
                  .filter((p) => shopCatFilter === "all" || p.category === shopCatFilter)
                  .map((product) => {
                    const totalStock = getStockQty(product.id);
                    const stockColor = totalStock === 0 ? "text-red-400" : totalStock <= 10 ? "text-orange-400" : "text-emerald-400";
                    const stockBg = totalStock === 0 ? "bg-red-500/10 border-red-500/30" : totalStock <= 10 ? "bg-orange-500/10 border-orange-500/30" : "bg-emerald-500/10 border-emerald-500/30";
                    return (
                      <div key={product.id} className="rounded-2xl overflow-hidden border border-border bg-card hover:border-accent/40 transition-all group">
                        {/* Product image area */}
                        <div
                          className="relative flex items-center justify-center"
                          style={{ background: product.bg, height: 130 }}
                        >
                          <span className="text-6xl select-none">{product.emoji}</span>
                          {/* Actions overlay */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              onClick={() => { setEditShopProduct(product); setIsAddProductOpen(true); }}
                              className="w-9 h-9 rounded-lg bg-blue-500/80 flex items-center justify-center hover:bg-blue-500"
                            >
                              <Edit className="w-4 h-4 text-white" />
                            </button>
                            <button
                              onClick={() => { setStockOpProduct(product); setIsStockOpOpen("entree"); }}
                              className="w-9 h-9 rounded-lg bg-emerald-600/80 flex items-center justify-center hover:bg-emerald-600"
                              title="Entrée en stock"
                            >
                              <Plus className="w-4 h-4 text-white" />
                            </button>
                            <button
                              onClick={() => deleteProduct(product.id)}
                              className="w-9 h-9 rounded-lg bg-red-600/80 flex items-center justify-center hover:bg-red-600"
                            >
                              <Trash2 className="w-4 h-4 text-white" />
                            </button>
                          </div>
                          {/* Stock badge */}
                          <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-lg text-xs font-bold border ${stockBg} ${stockColor}`}>
                            {totalStock === 0 ? "Rupture" : `${totalStock} en stock`}
                          </div>
                        </div>

                        {/* Product info */}
                        <div className="p-3">
                          <div className="text-xs text-muted-foreground mb-0.5">{product.category}</div>
                          <div className="font-bold text-sm leading-tight mb-2 line-clamp-2">{product.name}</div>
                          <div className="text-xl font-display font-bold text-accent mb-2">{formatMGA(product.price)}</div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{product.sold} vendus</span>
                            <span className="text-emerald-400 font-semibold">{formatMGA(product.price * product.sold)}</span>
                          </div>
                          {/* Per-store mini stock */}
                          <div className="mt-2 pt-2 border-t border-border/50 space-y-1">
                            {shopStores.map((store) => {
                              const sq = getStockQty(product.id, store.id);
                              return (
                                <div key={store.id} className="flex justify-between text-xs">
                                  <span className="text-muted-foreground truncate max-w-[80px]">{store.name}</span>
                                  <span className={sq === 0 ? "text-red-400 font-bold" : sq <= 5 ? "text-orange-400 font-semibold" : "text-foreground"}>{sq}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ── STOCK MANAGEMENT (multi-store matrix) ── */}
          {shopView === "stock" && (
            <div className="space-y-6">
              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                <Button variant="accent" size="sm"
                  onClick={() => { setStockOpProduct(shopProducts[0]); setIsStockOpOpen("entree"); }}>
                  <Plus className="w-4 h-4 mr-2" /> Entrée en stock
                </Button>
                <Button variant="outline" size="sm"
                  onClick={() => { setStockOpProduct(shopProducts[0]); setIsStockOpOpen("redressement"); }}>
                  ⚖️ Redressement
                </Button>
                <Button variant="outline" size="sm"
                  onClick={() => { setStockOpProduct(shopProducts[0]); setIsStockOpOpen("transfert"); }}>
                  🔀 Transfert
                </Button>
              </div>

              {/* Stock matrix table */}
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left p-4 font-semibold text-muted-foreground w-48">Produit</th>
                        <th className="text-center p-4 font-semibold text-muted-foreground text-xs">Total</th>
                        {shopStores.map((store) => (
                          <th key={store.id} className="text-center p-4 font-semibold text-muted-foreground text-xs min-w-[110px]">
                            <div>{store.name}</div>
                            <div className="text-muted-foreground/60 font-normal">{store.location}</div>
                          </th>
                        ))}
                        <th className="p-4 w-28">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shopProducts.map((product, idx) => {
                        const total = getStockQty(product.id);
                        return (
                          <tr key={product.id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${idx % 2 === 0 ? "" : "bg-muted/10"}`}>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: product.bg }}>
                                  {product.emoji}
                                </div>
                                <div>
                                  <div className="font-semibold text-sm">{product.name}</div>
                                  <div className="text-xs text-muted-foreground">{product.category}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`text-lg font-display font-bold ${total === 0 ? "text-red-400" : total <= 15 ? "text-orange-400" : "text-foreground"}`}>{total}</span>
                            </td>
                            {shopStores.map((store) => {
                              const sq = getStockQty(product.id, store.id);
                              return (
                                <td key={store.id} className="p-4 text-center">
                                  <div className={`inline-flex items-center justify-center w-12 h-8 rounded-lg font-bold text-sm ${
                                    sq === 0 ? "bg-red-500/15 text-red-400 border border-red-500/30"
                                    : sq <= 5 ? "bg-orange-500/15 text-orange-400 border border-orange-500/30"
                                    : "bg-muted text-foreground border border-border/50"
                                  }`}>
                                    {sq}
                                  </div>
                                </td>
                              );
                            })}
                            <td className="p-4">
                              <div className="flex gap-1 justify-center">
                                <button
                                  onClick={() => { setStockOpProduct(product); setIsStockOpOpen("entree"); }}
                                  className="w-7 h-7 rounded-md bg-emerald-600/20 border border-emerald-600/30 flex items-center justify-center hover:bg-emerald-600/40 transition-colors"
                                  title="Entrée"
                                >
                                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                                </button>
                                <button
                                  onClick={() => { setStockOpProduct(product); setIsStockOpOpen("redressement"); }}
                                  className="w-7 h-7 rounded-md bg-blue-600/20 border border-blue-600/30 flex items-center justify-center hover:bg-blue-600/40 transition-colors"
                                  title="Redressement"
                                >
                                  <Minus className="w-3.5 h-3.5 text-blue-400" />
                                </button>
                                <button
                                  onClick={() => { setStockOpProduct(product); setIsStockOpOpen("transfert"); }}
                                  className="w-7 h-7 rounded-md bg-violet-600/20 border border-violet-600/30 flex items-center justify-center hover:bg-violet-600/40 transition-colors"
                                  title="Transfert"
                                >
                                  <ArrowUpCircle className="w-3.5 h-3.5 text-violet-400" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/30 border-t border-border">
                        <td className="p-4 font-bold text-sm">TOTAL GÉNÉRAL</td>
                        <td className="p-4 text-center font-display font-bold text-accent text-lg">
                          {stockLevels.reduce((s, l) => s + l.qty, 0)}
                        </td>
                        {shopStores.map((store) => (
                          <td key={store.id} className="p-4 text-center font-bold text-accent">
                            {stockLevels.filter((l) => l.storeId === store.id).reduce((s, l) => s + l.qty, 0)}
                          </td>
                        ))}
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ── MOUVEMENTS ── */}
          {shopView === "mouvements" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold font-display text-lg">Historique des mouvements ({stockMovements.length})</h3>
              </div>
              {stockMovements.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border text-muted-foreground">
                  Aucun mouvement enregistré
                </div>
              ) : (
                <div className="space-y-3">
                  {stockMovements.map((mv) => {
                    const prod = shopProducts.find((p) => p.id === mv.productId);
                    const toStore = shopStores.find((s) => s.id === mv.toStoreId);
                    const fromStore = shopStores.find((s) => s.id === mv.fromStoreId);
                    const typeConfig = {
                      entree: { label: "Entrée en stock", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", icon: "📥" },
                      redressement: { label: "Redressement", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30", icon: "⚖️" },
                      transfert: { label: "Transfert", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/30", icon: "🔀" },
                    }[mv.type];
                    return (
                      <Card key={mv.id} className="p-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg shrink-0 ${typeConfig.bg}`}>
                            {typeConfig.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${typeConfig.bg} ${typeConfig.color}`}>
                                {typeConfig.label}
                              </span>
                              <span className="font-semibold text-sm">{prod?.emoji} {prod?.name ?? "—"}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-3">
                              {mv.type === "transfert" ? (
                                <span>{fromStore?.name} → {toStore?.name}</span>
                              ) : (
                                <span>Vers : {toStore?.name}</span>
                              )}
                              <span>{format(new Date(mv.date), "d MMM yyyy", { locale: fr })}</span>
                              {mv.note && <span className="italic">"{mv.note}"</span>}
                            </div>
                          </div>
                          <div className={`text-xl font-display font-bold shrink-0 ${typeConfig.color}`}>
                            {mv.type === "redressement" ? "" : "+"}{mv.qty} unités
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Add/Edit Product Dialog ── */}
          <Dialog isOpen={isAddProductOpen} onClose={() => { setIsAddProductOpen(false); setEditShopProduct(null); }}
            title={editShopProduct ? "Modifier le produit" : "Nouveau produit"}>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="space-y-2">
                <Label>Nom du produit</Label>
                <Input name="name" required placeholder="Ex: T-Shirt Gala 2026" defaultValue={editShopProduct?.name ?? ""} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select name="category" required defaultValue={editShopProduct?.category ?? "Vêtements"}>
                    {SHOP_CATEGORIES_ACC.map((c) => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Prix de vente (Ar)</Label>
                  <Input name="price" type="number" required min="0" placeholder="Ex: 35000" defaultValue={editShopProduct?.price ?? ""} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea name="description" placeholder="Description du produit..." defaultValue={editShopProduct?.description ?? ""} />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => { setIsAddProductOpen(false); setEditShopProduct(null); }}>Annuler</Button>
                <Button type="submit" variant="accent">{editShopProduct ? "Enregistrer" : "Créer le produit"}</Button>
              </div>
            </form>
          </Dialog>

          {/* ── Stock Operation Dialog ── */}
          <Dialog
            isOpen={!!isStockOpOpen}
            onClose={() => { setIsStockOpOpen(null); setStockOpProduct(null); }}
            title={
              isStockOpOpen === "entree" ? "📥 Entrée en stock"
              : isStockOpOpen === "redressement" ? "⚖️ Redressement de stock"
              : "🔀 Transfert de stock"
            }
          >
            {isStockOpOpen && (
              <form onSubmit={handleStockOperation} className="space-y-4">
                {/* Product selector */}
                <div className="space-y-2">
                  <Label>Produit</Label>
                  <Select name="productId" required
                    defaultValue={stockOpProduct?.id ?? shopProducts[0]?.id}
                    onChange={(e) => {
                      const p = shopProducts.find((p) => p.id === Number((e.target as HTMLSelectElement).value));
                      setStockOpProduct(p ?? null);
                    }}>
                    {shopProducts.map((p) => <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
                  </Select>
                </div>

                {/* From store (transfert only) */}
                {isStockOpOpen === "transfert" && (
                  <div className="space-y-2">
                    <Label>Stand source</Label>
                    <Select name="fromStoreId" required defaultValue={shopStores[0]?.id}>
                      {shopStores.map((s) => (
                        <option key={s.id} value={s.id}>{s.name} — {s.location} ({stockOpProduct ? getStockQty(stockOpProduct.id, s.id) : "?"} en stock)</option>
                      ))}
                    </Select>
                  </div>
                )}

                {/* To store */}
                <div className="space-y-2">
                  <Label>{isStockOpOpen === "transfert" ? "Stand destination" : "Stand"}</Label>
                  <Select name="toStoreId" required defaultValue={isStockOpOpen === "transfert" ? shopStores[1]?.id : shopStores[0]?.id}>
                    {shopStores.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} — {s.location} ({stockOpProduct ? getStockQty(stockOpProduct.id, s.id) : "?"} en stock)</option>
                    ))}
                  </Select>
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <Label>{isStockOpOpen === "redressement" ? "Nouvelle quantité" : "Quantité"}</Label>
                  <Input name="qty" type="number" required min="0" placeholder={isStockOpOpen === "redressement" ? "Quantité réelle en stock" : "Nombre d'unités"} />
                </div>

                {/* Note */}
                <div className="space-y-2">
                  <Label>Motif / note (optionnel)</Label>
                  <Textarea name="note" placeholder="Ex: Réception commande fournisseur..." />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => { setIsStockOpOpen(null); setStockOpProduct(null); }}>Annuler</Button>
                  <Button type="submit" variant="accent">
                    {isStockOpOpen === "entree" ? "Valider l'entrée"
                    : isStockOpOpen === "redressement" ? "Valider le redressement"
                    : "Valider le transfert"}
                  </Button>
                </div>
              </form>
            )}
          </Dialog>
        </div>
      )}

      {/* ─── TAB: STAFF ─── */}
      {activeTab === "staff" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold font-display text-xl">Équipe staff ({STAFF_ROLES.length} membres)</h3>
            <Button variant="accent" size="sm">
              <Plus className="w-4 h-4 mr-2" /> Ajouter un membre
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {STAFF_ROLES.map((member) => (
              <Card key={member.id} className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent/60 flex items-center justify-center font-bold text-lg text-white shrink-0">
                  {member.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{member.name}</div>
                  <div className="text-sm text-muted-foreground">{member.role}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" /> {member.phone}
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-2">
                  <Badge variant={member.status === "confirmed" ? "success" : "warning"}>
                    {member.status === "confirmed" ? "Confirmé" : "En attente"}
                  </Badge>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                      <Edit className="w-3 h-3 text-blue-400" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-6 border-dashed border-accent/20 bg-primary/5">
            <div className="flex items-center gap-4">
              <Settings className="w-8 h-8 text-muted-foreground" />
              <div>
                <div className="font-semibold mb-1">Gestion avancée du staff</div>
                <p className="text-sm text-muted-foreground">
                  Assignez des rôles, gérez les accréditations et les horaires de chaque membre de l'équipe pour cet événement.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}
