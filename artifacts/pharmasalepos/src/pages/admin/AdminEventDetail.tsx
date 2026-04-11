import React, { useState, useMemo, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useParams, Link } from "wouter";
import { PaymentBadge } from "@/components/PaymentBadge";
import {
  ChevronLeft, TrendingUp, Ticket, Users, CreditCard, ShoppingCart,
  Plus, Edit, Trash2, Phone, Calendar, MapPin,
  CheckCircle, XCircle, Clock, UserCheck, Settings, Store,
  Package, Tag, ShoppingBag, BarChart2, Receipt, Wallet,
  ArrowUpCircle, ArrowDownCircle, Minus, Search, X, Filter, ScanLine,
} from "lucide-react";
import { format, eachDayOfInterval } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, AreaChart, Area, ReferenceLine, Cell,
} from "recharts";
import { AdminLayout } from "@/components/layout";
import { Card, Button, Badge, Dialog, DeleteModal, Input, Label, Select, Textarea,
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui";
import { formatMGA } from "@/lib/utils";
import { getCategoryImage } from "@/components/EventCard";
import { getBilletCodesForUnit, getUsedTickets, toggleTicketUsed, makeTicketId } from "@/lib/billetCodes";
import { STATIC_ORDERS, useGetEvent } from "@/data/static";
import type { Order, TicketType } from "@/data/static";

type Tab = "overview" | "finance" | "depenses" | "tickets" | "orders" | "shop" | "staff" | "vente" | "scan";

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
  { productId: 1, storeId: 1, qty: 80 }, { productId: 2, storeId: 1, qty: 40 },
  { productId: 3, storeId: 1, qty: 25 }, { productId: 4, storeId: 1, qty: 60 },
  { productId: 5, storeId: 1, qty: 30 }, { productId: 6, storeId: 1, qty: 120 },
  { productId: 7, storeId: 1, qty: 45 }, { productId: 8, storeId: 1, qty: 70 },
  { productId: 9, storeId: 1, qty: 35 },
  { productId: 1, storeId: 2, qty: 20 }, { productId: 2, storeId: 2, qty: 15 },
  { productId: 3, storeId: 2, qty: 8 },  { productId: 4, storeId: 2, qty: 25 },
  { productId: 5, storeId: 2, qty: 12 }, { productId: 6, storeId: 2, qty: 30 },
  { productId: 7, storeId: 2, qty: 18 }, { productId: 8, storeId: 2, qty: 20 },
  { productId: 9, storeId: 2, qty: 10 },
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
  mvola: "#16a34a",
  mastercard: "#2563eb",
  especes: "#a855f7",
};
const methodLabels: Record<string, string> = {
  orange_money: "Orange Money",
  mvola: "MVola",
  mastercard: "Mastercard",
  especes: "Espèces",
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

const CAT_EMOJIS: Record<string, string> = {
  "Vêtements": "👕", "Couvre-chef": "🧢", "Bijoux & Bracelets": "📿",
  "Sacs & Pochettes": "👜", "Accessoires divers": "🧣",
};
const CAT_BG: Record<string, string> = {
  "Vêtements": "#1a3a2a", "Couvre-chef": "#3a2a1a", "Bijoux & Bracelets": "#3a1a1a",
  "Sacs & Pochettes": "#1a1a3a", "Accessoires divers": "#3a3a1a",
};

export default function AdminEventDetail() {
  const { id } = useParams<{ id: string }>();
  const eventId = Number(id);

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isAddTicketOpen, setIsAddTicketOpen] = useState(false);
  const [editTicketType, setEditTicketType] = useState<TicketType | null>(null);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: "", role: "", phone: "", status: "pending" as "confirmed" | "pending" });
  const [staffFormError, setStaffFormError] = useState("");
  const [ventePhoneError, setVentePhoneError] = useState(false);
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
  const [referralEnabled, setReferralEnabled] = useState(true);
  const [referralRewardType, setReferralRewardType] = useState<"cash" | "discount">("discount");
  const [referralRewardValue, setReferralRewardValue] = useState(5);
  const [referralMinOrder, setReferralMinOrder] = useState(20000);
  const [referralUsesLimit, setReferralUsesLimit] = useState(3);
  const [referralCode, setReferralCode] = useState("INBOX-2026");
  const [settlementStatus, setSettlementStatus] = useState<"pending" | "paid">("pending");
  const [settlementRef, setSettlementRef] = useState("");
  const [settlementDate, setSettlementDate] = useState("");
  const [settlingMethod, setSettlingMethod] = useState<string | null>(null);
  const [settlingRef, setSettlingRef] = useState("");
  const [settlingDate, setSettlingDate] = useState("");

  const [usedTickets, setUsedTickets] = useState<Set<string>>(() => getUsedTickets());

  const [venteCart, setVenteCart] = useState<Map<number, number>>(new Map());
  const [venteCustomerName, setVenteCustomerName] = useState("");
  const [venteCustomerPhone, setVenteCustomerPhone] = useState("");
  const [ventePaymentMethod, setVentePaymentMethod] = useState("especes");
  const [venteSales, setVenteSales] = useState<Array<{
    id: number; items: string[]; total: number;
    customerName: string; method: string; time: Date;
  }>>([]);
  const [venteMobileStep, setVenteMobileStep] = useState<"vente" | "panier" | "paiement">("vente");
  const [venteConfirmOpen, setVenteConfirmOpen] = useState(false);
  const [venteIsProcessing, setVenteIsProcessing] = useState(false);
  const [venteSuccessMsg, setVenteSuccessMsg] = useState("");

  const [scanMobileKey, setScanMobileKey] = useState("");
  const [scanMobileCode, setScanMobileCode] = useState("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const qrScannerRef = useRef<Html5Qrcode | null>(null);
  const [scanResult, setScanResult] = useState<null | {
    status: "valid" | "used" | "invalid";
    order?: Order;
    unitIndex?: number;
    codes?: ReturnType<typeof getBilletCodesForUnit>;
    ticketId?: string;
  }>(null);
  const [scanHistory, setScanHistory] = useState<Array<{
    input: string; status: string; customerName?: string; time: Date;
  }>>([]);

  const [inboxCommissionPct, setInboxCommissionPct] = useState(5);
  const [settlementRows, setSettlementRows] = useState<Record<string, { status: "pending" | "paid"; ref: string; date: string }>>({
    orange_money: { status: "pending", ref: "", date: "" },
    mvola:        { status: "pending", ref: "", date: "" },
    mastercard:   { status: "pending", ref: "", date: "" },
    especes:      { status: "pending", ref: "", date: "" },
  });

  const [ordSearch,    setOrdSearch]    = useState("");
  const [ordKey,       setOrdKey]       = useState("");
  const [ordCode,      setOrdCode]      = useState("");
  const [ordTicketSt,  setOrdTicketSt]  = useState<"all" | "used" | "unused">("all");
  const [ordPaySt,     setOrdPaySt]     = useState<"all" | "confirmed" | "pending" | "cancelled">("all");
  const [ordDateFrom,  setOrdDateFrom]  = useState("");
  const [ordDateTo,    setOrdDateTo]    = useState("");

  const clearOrdFilters = () => {
    setOrdSearch(""); setOrdKey(""); setOrdCode("");
    setOrdTicketSt("all"); setOrdPaySt("all");
    setOrdDateFrom(""); setOrdDateTo("");
  };
  const hasOrdFilters = !!(ordSearch || ordKey || ordCode || ordTicketSt !== "all" || ordPaySt !== "all" || ordDateFrom || ordDateTo);

  const { data: event, isLoading: eventLoading } = useGetEvent(eventId);

  const orders = useMemo(() => STATIC_ORDERS.filter(o => o.event.id === eventId), [eventId]);

  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  useEffect(() => {
    if (event) setTicketTypes(event.ticketTypes);
  }, [event]);

  const confirmedOrders = useMemo(() => orders.filter((o) => o.status === "confirmed"), [orders]);
  const totalRevenue = useMemo(() => confirmedOrders.reduce((s, o) => s + o.totalAmount, 0), [confirmedOrders]);
  const totalTickets = useMemo(() => confirmedOrders.reduce((s, o) => s + o.quantity, 0), [confirmedOrders]);

  const handleToggleUsed = (ticketId: string) => {
    toggleTicketUsed(ticketId);
    setUsedTickets(getUsedTickets());
  };

  const filteredOrderRows = useMemo(() => {
    const sq = ordSearch.toLowerCase().trim();
    const sk = ordKey.toLowerCase().trim();
    const sc = ordCode.toUpperCase().trim();
    const fromMs = ordDateFrom ? new Date(ordDateFrom).setHours(0, 0, 0, 0) : null;
    const toMs   = ordDateTo   ? new Date(ordDateTo).setHours(23, 59, 59, 999) : null;

    const rows: Array<{ order: Order; unitIndex: number; codes: ReturnType<typeof getBilletCodesForUnit>; ticketId: string }> = [];

    for (const order of orders) {
      if (ordPaySt !== "all" && order.status !== ordPaySt) continue;
      const orderMs = new Date(order.createdAt).getTime();
      if (fromMs && orderMs < fromMs) continue;
      if (toMs   && orderMs > toMs)   continue;
      if (sq) {
        const hay = `${order.customerName} ${order.customerPhone} ${String(order.id).padStart(5, "0")}`.toLowerCase();
        if (!hay.includes(sq)) continue;
      }
      for (let i = 0; i < order.quantity; i++) {
        const codes    = getBilletCodesForUnit(order.id, i);
        const ticketId = makeTicketId(order.id, i);
        const isUsed   = usedTickets.has(ticketId);
        if (sk && !codes.ticketKey.includes(sk)) continue;
        if (sc && !codes.confirmCode.includes(sc)) continue;
        if (ordTicketSt === "used"   && !isUsed) continue;
        if (ordTicketSt === "unused" && isUsed)  continue;
        rows.push({ order, unitIndex: i, codes, ticketId });
      }
    }
    return rows;
  }, [orders, ordSearch, ordKey, ordCode, ordTicketSt, ordPaySt, ordDateFrom, ordDateTo, usedTickets]);

  const financeData = useMemo(() => {
    if (!confirmedOrders.length) return [];
    const sorted = [...confirmedOrders].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const first = new Date(sorted[0].createdAt);
    const last  = new Date(sorted[sorted.length - 1].createdAt);
    const days  = eachDayOfInterval({ start: first, end: last });
    let cumulative = 0;
    return days.map((day) => {
      const dayStr    = format(day, "yyyy-MM-dd");
      const dayOrders = confirmedOrders.filter((o) => format(new Date(o.createdAt), "yyyy-MM-dd") === dayStr);
      const daily     = dayOrders.reduce((s, o) => s + o.totalAmount, 0);
      cumulative += daily;
      const byMethod: Record<string, number> = {};
      for (const o of dayOrders) {
        const m = o.paymentMethod ?? "other";
        byMethod[m] = (byMethod[m] ?? 0) + o.totalAmount;
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

  const ticketSalesData = useMemo(() =>
    ticketTypes.map((tt) => ({
      name: tt.name,
      vendus: tt.soldCount ?? 0,
      restants: tt.quantity - (tt.soldCount ?? 0),
      revenus: (tt.soldCount ?? 0) * tt.price,
    })),
  [ticketTypes]);

  const revenueByMethod = useMemo(() =>
    ["orange_money", "mvola", "mastercard", "especes"].map((method) => {
      const methodOrders = confirmedOrders.filter((o) => o.paymentMethod === method);
      const amount = methodOrders.reduce((s, o) => s + o.totalAmount, 0);
      return { method, amount, count: methodOrders.length };
    }),
  [confirmedOrders]);

  const settlementData = revenueByMethod.map(({ method, amount }) => {
    const commission = Math.round(amount * inboxCommissionPct / 100);
    const isEspeces  = method === "especes";
    return {
      method,
      amount,
      commission,
      net:       isEspeces ? commission : Math.max(0, amount - commission),
      direction: isEspeces ? "org_to_inbox" as const : "inbox_to_org" as const,
      ...(settlementRows[method] ?? { status: "pending" as const, ref: "", date: "" }),
    };
  });
  const totalToOrgNet        = settlementData.filter(d => d.direction === "inbox_to_org").reduce((s, d) => s + d.net, 0);
  const totalEspecesCommission = settlementData.filter(d => d.direction === "org_to_inbox").reduce((s, d) => s + d.net, 0);

  const totalExpenses  = expenses.reduce((s, e) => s + e.amount, 0);
  const paidExpenses   = expenses.filter((e) => e.status === "paid").reduce((s, e) => s + e.amount, 0);
  const pendingExpenses = expenses.filter((e) => e.status === "pending").reduce((s, e) => s + e.amount, 0);
  const benefice       = totalRevenue - totalExpenses;
  const beneficePct    = totalRevenue > 0 ? Math.round((benefice / totalRevenue) * 100) : 0;

  const expenseByCat = EXPENSE_CATEGORIES
    .filter((c) => expenses.some((e) => e.category === c.name))
    .map((c) => {
      const items = expenses.filter((e) => e.category === c.name);
      return { name: c.name, emoji: c.emoji, amount: items.reduce((s, e) => s + e.amount, 0), count: items.length };
    })
    .sort((a, b) => b.amount - a.amount);

  const plData = [
    { label: "Revenus",   value: totalRevenue,  color: "hsl(145 60% 35%)" },
    { label: "Dépenses",  value: totalExpenses, color: "hsl(0 65% 50%)" },
    { label: "Bénéfice",  value: benefice,      color: benefice >= 0 ? "hsl(145 60% 45%)" : "hsl(0 65% 50%)" },
  ];

  const getStockQty = (productId: number, storeId?: number) =>
    storeId
      ? stockLevels.find((s) => s.productId === productId && s.storeId === storeId)?.qty ?? 0
      : stockLevels.filter((s) => s.productId === productId).reduce((sum, s) => sum + s.qty, 0);

  const shopRevenue    = shopProducts.reduce((s, p) => s + p.price * p.sold, 0);
  const shopSoldTotal  = shopProducts.reduce((s, p) => s + p.sold, 0);
  const shopTotalStock = stockLevels.reduce((s, l) => s + l.qty, 0);

  const addToCart = (ttId: number) => setVenteCart((prev) => { const m = new Map(prev); m.set(ttId, (m.get(ttId) ?? 0) + 1); return m; });
  const removeFromCart = (ttId: number) => setVenteCart((prev) => { const m = new Map(prev); const cur = m.get(ttId) ?? 0; if (cur <= 1) m.delete(ttId); else m.set(ttId, cur - 1); return m; });
  const clearVenteCart = () => { setVenteCart(new Map()); setVenteCustomerName(""); setVenteCustomerPhone(""); setVentePaymentMethod("especes"); setVenteMobileStep("vente"); };
  const cartTotal     = Array.from(venteCart.entries()).reduce((sum, [ttId, qty]) => { const tt = ticketTypes.find((t) => t.id === ttId); return sum + (tt ? tt.price * qty : 0); }, 0);
  const cartItemCount = Array.from(venteCart.values()).reduce((s, q) => s + q, 0);

  const handleVenteConfirm = async () => {
    setVenteConfirmOpen(false);
    setVenteIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1600));
    setVenteIsProcessing(false);
    const items: string[] = [];
    venteCart.forEach((qty, ttId) => { const tt = ticketTypes.find((t) => t.id === ttId); if (tt) items.push(`${tt.name} ×${qty}`); });
    setVenteSales((prev) => [{ id: Date.now(), items, total: cartTotal, customerName: venteCustomerName, method: ventePaymentMethod, time: new Date() }, ...prev]);
    setVenteSuccessMsg(`✅ Encaissement confirmé — ${venteCustomerName} — ${formatMGA(cartTotal)}`);
    clearVenteCart();
    setTimeout(() => setVenteSuccessMsg(""), 5000);
  };

  const fillPct = event && event.totalCapacity > 0 ? Math.round((event.soldTickets / event.totalCapacity) * 100) : 0;

  const handleAddTicket = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (editTicketType) {
      setTicketTypes(prev => prev.map(t => t.id === editTicketType.id
        ? { ...t, name: fd.get("name") as string, description: (fd.get("description") as string) || undefined, price: Number(fd.get("price")), quantity: Number(fd.get("quantity")) }
        : t));
      setEditTicketType(null);
    } else {
      setTicketTypes(prev => [...prev, { id: Date.now(), eventId, name: fd.get("name") as string, description: (fd.get("description") as string) || undefined, price: Number(fd.get("price")), quantity: Number(fd.get("quantity")), soldCount: 0 }]);
    }
    setIsAddTicketOpen(false);
  };

  const handleAddExpense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (editExpense) {
      setExpenses((prev) => prev.map((ex) => ex.id === editExpense.id
        ? { ...ex, label: fd.get("label") as string, category: fd.get("category") as string,
            amount: Number(fd.get("amount")), date: fd.get("date") as string,
            note: (fd.get("note") as string) || undefined, status: fd.get("status") as "paid" | "pending" }
        : ex));
      setEditExpense(null);
    } else {
      setExpenses((prev) => [...prev, {
        id: Date.now(), label: fd.get("label") as string, category: fd.get("category") as string,
        amount: Number(fd.get("amount")), date: fd.get("date") as string,
        note: (fd.get("note") as string) || undefined, status: fd.get("status") as "paid" | "pending",
      }]);
    }
    setIsAddExpenseOpen(false);
  };

  const deleteExpense = (expId: number) => {
    if (confirm("Supprimer cette dépense ?")) setExpenses((prev) => prev.filter((e) => e.id !== expId));
  };

  const handleSaveProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const cat = fd.get("category") as string;
    if (editShopProduct) {
      setShopProducts((prev) => prev.map((p) => p.id === editShopProduct.id
        ? { ...p, name: fd.get("name") as string, category: cat, price: Number(fd.get("price")),
            description: fd.get("description") as string, emoji: CAT_EMOJIS[cat] ?? "🛍️", bg: CAT_BG[cat] ?? "#1a1a1a" }
        : p));
      setEditShopProduct(null);
    } else {
      const newProd: ShopProduct = {
        id: Date.now(), name: fd.get("name") as string, category: cat,
        price: Number(fd.get("price")), emoji: CAT_EMOJIS[cat] ?? "🛍️",
        bg: CAT_BG[cat] ?? "#1a1a1a", sold: 0, description: fd.get("description") as string,
      };
      setShopProducts((prev) => [...prev, newProd]);
      setStockLevels((prev) => [...prev, ...shopStores.map((s) => ({ productId: newProd.id, storeId: s.id, qty: 0 }))]);
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
      setStockLevels((prev) => prev.map((s) => s.productId === stockOpProduct.id && s.storeId === toStoreId ? { ...s, qty: s.qty + qty } : s));
    } else if (isStockOpOpen === "redressement") {
      setStockLevels((prev) => prev.map((s) => s.productId === stockOpProduct.id && s.storeId === toStoreId ? { ...s, qty } : s));
    } else if (isStockOpOpen === "transfert" && fromStoreId) {
      setStockLevels((prev) => prev.map((s) => {
        if (s.productId !== stockOpProduct.id) return s;
        if (s.storeId === fromStoreId) return { ...s, qty: Math.max(0, s.qty - qty) };
        if (s.storeId === toStoreId)   return { ...s, qty: s.qty + qty };
        return s;
      }));
    }
    setStockMovements((prev) => [{
      id: Date.now(), type: isStockOpOpen, productId: stockOpProduct.id,
      fromStoreId, toStoreId, qty, date: new Date().toISOString().slice(0, 10), note: note || undefined,
    }, ...prev]);
    setIsStockOpOpen(null);
    setStockOpProduct(null);
  };

  const handleScan = (override?: string) => {
    const raw = (override ?? "").trim();
    if (!raw) return;

    const qrMatch = raw.match(/INBOXTICKET-ORD-(\d+)/i);
    if (qrMatch) {
      const orderId = parseInt(qrMatch[1]);
      const order   = orders.find((o) => o.id === orderId);
      const label   = `QR #${String(orderId).padStart(5, "0")}`;
      if (!order) {
        setScanResult({ status: "invalid" });
        setScanHistory((prev) => [{ input: label, status: "invalid", time: new Date() }, ...prev.slice(0, 19)]);
        return;
      }
      let qrFound: { order: Order; unitIndex: number; codes: ReturnType<typeof getBilletCodesForUnit>; ticketId: string } | null = null;
      for (let i = 0; i < order.quantity; i++) {
        const ticketId = makeTicketId(order.id, i);
        if (!usedTickets.has(ticketId)) {
          const codes = getBilletCodesForUnit(order.id, i);
          qrFound = { order, unitIndex: i, codes, ticketId };
          break;
        }
      }
      if (!qrFound) {
        const codes = getBilletCodesForUnit(order.id, 0);
        const ticketId = makeTicketId(order.id, 0);
        setScanResult({ status: "used", order, unitIndex: 0, codes, ticketId });
        setScanHistory((prev) => [{ input: label, status: "used", customerName: order.customerName, time: new Date() }, ...prev.slice(0, 19)]);
      } else {
        setScanResult({ status: "valid", ...qrFound });
        setScanHistory((prev) => [{ input: label, status: "valid", customerName: order.customerName, time: new Date() }, ...prev.slice(0, 19)]);
      }
      return;
    }

    const q = raw.toUpperCase();
    let found: { order: Order; unitIndex: number; codes: ReturnType<typeof getBilletCodesForUnit>; ticketId: string } | null = null;
    for (const order of orders) {
      for (let i = 0; i < order.quantity; i++) {
        const codes    = getBilletCodesForUnit(order.id, i);
        const ticketId = makeTicketId(order.id, i);
        if (codes.ticketKey.toUpperCase() === q || codes.confirmCode.toUpperCase() === q) {
          found = { order, unitIndex: i, codes, ticketId };
          break;
        }
      }
      if (found) break;
    }
    if (found) {
      const isUsed = usedTickets.has(found.ticketId);
      const result = { status: (isUsed ? "used" : "valid") as "valid" | "used", ...found };
      setScanResult(result);
      setScanHistory((prev) => [{ input: q, status: result.status, customerName: found!.order.customerName, time: new Date() }, ...prev.slice(0, 19)]);
    } else {
      setScanResult({ status: "invalid" });
      setScanHistory((prev) => [{ input: q, status: "invalid", time: new Date() }, ...prev.slice(0, 19)]);
    }
  };

  useEffect(() => {
    const elementId = "qr-reader-mobile";
    if (activeTab !== "scan" || scanResult !== null) return;
    if (window.innerWidth >= 1024) return;
    const el = document.getElementById(elementId);
    if (!el) return;
    let scanner: Html5Qrcode | null = null;
    let stopped = false;
    const start = async () => {
      try {
        scanner = new Html5Qrcode(elementId);
        qrScannerRef.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 200, height: 200 }, aspectRatio: 1 },
          (decodedText) => { if (stopped) return; stopped = true; scanner?.stop().catch(() => {}); handleScan(decodedText); },
          () => {}
        );
        setCameraError(null);
      } catch {
        setCameraError("Caméra non disponible — saisie manuelle uniquement.");
      }
    };
    start();
    return () => { stopped = true; scanner?.stop().catch(() => {}); qrScannerRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, scanResult]);

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
    { key: "overview",  label: "Vue d'ensemble", icon: <TrendingUp className="w-4 h-4" /> },
    // { key: "finance",   label: "Finances",        icon: <BarChart2 className="w-4 h-4" /> },
    // { key: "depenses",  label: "Dépenses",        icon: <Receipt className="w-4 h-4" /> },
    { key: "tickets",   label: "Billets",         icon: <Ticket className="w-4 h-4" /> },
    { key: "orders",    label: "Commandes",       icon: <ShoppingCart className="w-4 h-4" /> },
    // { key: "shop",      label: "Shop",            icon: <Store className="w-4 h-4" /> },
    { key: "staff",     label: "Staff",           icon: <Users className="w-4 h-4" /> },
    { key: "referral",  label: "Parrainage organisateur", icon: <Users className="w-4 h-4" /> },
    { key: "vente",     label: "Vente",           icon: <ShoppingBag className="w-4 h-4" /> },
    { key: "scan",      label: "Scan billet",     icon: <ScanLine className="w-4 h-4" /> },
  ];

  return (
    <AdminLayout>
      <Link href="/admin/events">
        <button className="flex items-center gap-2 text-muted-foreground hover:text-white mb-6 transition-colors text-sm">
          <ChevronLeft className="w-4 h-4" /> Retour aux événements
        </button>
      </Link>

      {/* Hero banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8 h-52">
        <img src={imageSrc} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 flex items-end p-8">
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className="bg-black/50 backdrop-blur border-white/10 text-white">{event.category}</Badge>
              <Badge className={event.status === "upcoming" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-muted text-muted-foreground"}>
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

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-card rounded-xl border border-border mb-8 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.key ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* ─── OVERVIEW ─── */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Chiffre d'affaires", value: formatMGA(totalRevenue), icon: <TrendingUp className="w-5 h-5" />, color: "text-emerald-400" },
              { label: "Billets vendus",     value: `${event.soldTickets} / ${event.totalCapacity}`, icon: <Ticket className="w-5 h-5" />, color: "text-blue-400" },
              { label: "Commandes",          value: String(orders.length), icon: <ShoppingCart className="w-5 h-5" />, color: "text-violet-400" },
              { label: "Taux de remplissage", value: `${fillPct}%`, icon: <UserCheck className="w-5 h-5" />, color: fillPct >= 80 ? "text-orange-400" : "text-emerald-400" },
            ].map((kpi) => (
              <Card key={kpi.label} className="p-5">
                <div className={`${kpi.color} mb-3`}>{kpi.icon}</div>
                <div className="text-2xl font-bold font-display mb-1">{kpi.value}</div>
                <div className="text-xs text-muted-foreground">{kpi.label}</div>
              </Card>
            ))}
          </div>

          <Card className="p-6">
            <h3 className="font-bold font-display text-lg mb-4">Remplissage de la salle</h3>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex-1">
                <div className="w-full bg-input rounded-full h-4 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${fillPct}%`, background: fillPct >= 90 ? "hsl(0 70% 50%)" : fillPct >= 60 ? "hsl(38 95% 50%)" : "hsl(145 60% 35%)" }} />
                </div>
              </div>
              <span className="text-2xl font-bold font-display text-accent w-16 text-right">{fillPct}%</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{event.soldTickets.toLocaleString("fr-FR")} billets vendus</span>
              <span>Capacité : {event.totalCapacity.toLocaleString("fr-FR")}</span>
            </div>
          </Card>

          <div>
            <h3 className="font-bold font-display text-lg mb-4">Chiffre d'affaires par mode de paiement</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {revenueByMethod.map(({ method, amount, count }) => (
                <Card key={method} className="p-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ background: methodColors[method] }} />
                  <div className="flex items-center gap-2 mb-3">
                    <PaymentBadge method={method} size="lg" showLabel={false} />
                    <div>
                      <div className="font-bold text-sm">{methodLabels[method]}</div>
                      <div className="text-xs text-muted-foreground">{count} paiement{count > 1 ? "s" : ""}</div>
                    </div>
                  </div>
                  <div className="text-2xl font-display font-bold" style={{ color: methodColors[method] }}>{formatMGA(amount)}</div>
                  <div className="text-xs text-muted-foreground mt-1">{totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0}% du total</div>
                </Card>
              ))}
            </div>
          </div>

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

          {/* ── Règlement organisateur par mode de paiement ── */}
          <Card className="p-6 border border-violet-500/20 bg-gradient-to-br from-violet-950/20 to-transparent">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
              <div>
                <h3 className="font-bold font-display text-lg flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-violet-400" /> Règlement organisateur
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Détail par mode de paiement — commission par virement</p>
              </div>
              <div className="flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-xl px-4 py-2">
                <span className="text-xs text-muted-foreground">Commission InBox</span>
                <input
                  type="number" min={0} max={100} step={0.5}
                  value={inboxCommissionPct}
                  onChange={e => setInboxCommissionPct(Number(e.target.value))}
                  className="w-12 bg-transparent text-violet-300 font-bold text-base text-center focus:outline-none border-b border-violet-400/40"
                />
                <span className="text-violet-300 font-bold text-sm">%</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-4">
              <span className="flex items-center gap-1.5 text-emerald-400"><ArrowDownCircle className="w-3.5 h-3.5" /> InBox verse à l'organisateur (paiements digitaux)</span>
              <span className="flex items-center gap-1.5 text-orange-400"><ArrowUpCircle className="w-3.5 h-3.5" /> Organisateur verse à InBox (espèces encaissées)</span>
            </div>

            <div className="space-y-2">
              {settlementData.map(({ method, amount, commission, net, direction, status, ref, date }) => {
                const isPaid     = status === "paid";
                const isOpening  = settlingMethod === method;
                const dirColor   = direction === "inbox_to_org" ? "text-emerald-400" : "text-orange-400";
                const dirBorder  = direction === "inbox_to_org" ? "border-emerald-500/20" : "border-orange-500/20";
                return (
                  <div key={method} className={`rounded-xl border p-4 transition-colors ${isPaid ? "bg-emerald-500/5 border-emerald-500/20" : `bg-muted/10 ${dirBorder}`}`}>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">

                      {/* Mode */}
                      <div className="flex items-center gap-2 w-36">
                        <span className="font-bold text-sm" style={{ color: methodColors[method] }}>{methodLabels[method]}</span>
                      </div>

                      {/* Calcul */}
                      <div className="flex items-center gap-2 text-sm flex-wrap flex-1">
                        <span className="text-muted-foreground">{formatMGA(amount)}</span>
                        <span className="text-muted-foreground text-xs">CA</span>
                        <Minus className="w-3 h-3 text-muted-foreground" />
                        <span className="text-violet-400">{formatMGA(commission)}</span>
                        <span className="text-muted-foreground text-xs">comm.</span>
                        <span className="text-muted-foreground">=</span>
                        <span className={`font-bold flex items-center gap-1 ${dirColor}`}>
                          {direction === "inbox_to_org"
                            ? <ArrowDownCircle className="w-3.5 h-3.5" />
                            : <ArrowUpCircle className="w-3.5 h-3.5" />}
                          {formatMGA(net)}
                        </span>
                        <span className={`text-xs ${dirColor} opacity-70`}>
                          {direction === "inbox_to_org" ? "InBox → organisateur" : "Organisateur → InBox"}
                        </span>
                      </div>

                      {/* Statut / Action */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {net === 0 ? (
                          <span className="text-xs text-muted-foreground italic">Néant</span>
                        ) : isPaid ? (
                          <>
                            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-1 rounded-full">
                              <CheckCircle className="w-3 h-3" /> Réglé{date ? ` · ${date}` : ""}{ref ? ` · ${ref}` : ""}
                            </span>
                            <button
                              onClick={() => setSettlementRows(prev => ({ ...prev, [method]: { status: "pending", ref: "", date: "" } }))}
                              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
                            >Annuler</button>
                          </>
                        ) : isOpening ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <input
                              type="date" value={settlingDate}
                              onChange={e => setSettlingDate(e.target.value)}
                              className="px-2 py-1 rounded-lg bg-input border border-border text-xs focus:outline-none focus:border-accent"
                            />
                            <input
                              type="text" placeholder="Réf…" value={settlingRef}
                              onChange={e => setSettlingRef(e.target.value)}
                              className="px-2 py-1 rounded-lg bg-input border border-border text-xs w-28 focus:outline-none focus:border-accent"
                            />
                            <button
                              onClick={() => {
                                setSettlementRows(prev => ({ ...prev, [method]: { status: "paid", ref: settlingRef, date: settlingDate } }));
                                setSettlingMethod(null); setSettlingRef(""); setSettlingDate("");
                              }}
                              className="flex items-center gap-1 text-xs font-semibold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-full hover:bg-emerald-500/30 transition-colors"
                            ><CheckCircle className="w-3 h-3" /> Confirmer</button>
                            <button
                              onClick={() => { setSettlingMethod(null); setSettlingRef(""); setSettlingDate(""); }}
                              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >Annuler</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setSettlingMethod(method); setSettlingRef(""); setSettlingDate(""); }}
                            className="flex items-center gap-1 text-xs font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/25 px-2.5 py-1 rounded-full hover:bg-amber-500/25 transition-colors"
                          ><Clock className="w-3 h-3" /> Régler</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totaux récap */}
            <div className="mt-5 pt-4 border-t border-border/30 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl p-4 bg-emerald-500/5 border border-emerald-500/15">
                <div className="text-xs text-muted-foreground mb-1">Total à verser à l'organisateur</div>
                <div className="text-2xl font-bold font-display text-emerald-400">{formatMGA(totalToOrgNet)}</div>
                <div className="text-xs text-muted-foreground mt-1">Orange Money + MVola + Mastercard (net)</div>
              </div>
              <div className="rounded-xl p-4 bg-orange-500/5 border border-orange-500/15">
                <div className="text-xs text-muted-foreground mb-1">Commission espèces à encaisser</div>
                <div className="text-2xl font-bold font-display text-orange-400">{formatMGA(totalEspecesCommission)}</div>
                <div className="text-xs text-muted-foreground mt-1">L'organisateur verse cette commission à InBox</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "referral" && (
        <div className="space-y-6">
          <Card className="p-6 border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-transparent">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
              <div>
                <h3 className="font-bold font-display text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" /> Programme de parrainage organisateur
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Idéal pour lancer les ventes avec un bouche-à-oreille récompensé</p>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${referralEnabled ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "bg-muted/20 text-muted-foreground border-border/40"}`}>
                {referralEnabled ? "Actif" : "Désactivé"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
              <div className="rounded-xl p-4 bg-muted/20 border border-border/40">
                <div className="text-xs text-muted-foreground mb-1">Code de campagne</div>
                <div className="text-lg font-bold font-display">{referralCode}</div>
              </div>
              <div className="rounded-xl p-4 bg-emerald-500/5 border border-emerald-500/15">
                <div className="text-xs text-muted-foreground mb-1">Récompense</div>
                <div className="text-lg font-bold font-display text-emerald-400">
                  {referralRewardType === "cash" ? `${formatMGA(referralRewardValue)}` : `${referralRewardValue}%`}
                </div>
              </div>
              <div className="rounded-xl p-4 bg-violet-500/5 border border-violet-500/15">
                <div className="text-xs text-muted-foreground mb-1">Achat minimum</div>
                <div className="text-lg font-bold font-display text-violet-300">{formatMGA(referralMinOrder)}</div>
              </div>
              <div className="rounded-xl p-4 bg-orange-500/5 border border-orange-500/15">
                <div className="text-xs text-muted-foreground mb-1">Utilisations max</div>
                <div className="text-lg font-bold font-display text-orange-300">{referralUsesLimit}</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ─── FINANCE ─── */}
      {activeTab === "finance" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 to-transparent">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center"><ArrowUpCircle className="w-5 h-5 text-emerald-400" /></div>
                <div className="text-sm text-muted-foreground">Chiffre d'affaires</div>
              </div>
              <div className="text-3xl font-display font-bold text-emerald-400">{formatMGA(totalRevenue)}</div>
              <div className="text-xs text-muted-foreground mt-1">{confirmedOrders.length} commandes confirmées</div>
            </Card>
            <Card className="p-6 border-red-500/20 bg-gradient-to-br from-red-950/30 to-transparent">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center"><ArrowDownCircle className="w-5 h-5 text-red-400" /></div>
                <div className="text-sm text-muted-foreground">Total dépenses</div>
              </div>
              <div className="text-3xl font-display font-bold text-red-400">{formatMGA(totalExpenses)}</div>
              <div className="text-xs text-muted-foreground mt-1">{formatMGA(paidExpenses)} payé · {formatMGA(pendingExpenses)} en attente</div>
            </Card>
            <Card className={`p-6 ${benefice >= 0 ? "border-accent/30 bg-gradient-to-br from-primary/20 to-transparent" : "border-red-500/30 bg-gradient-to-br from-red-950/20 to-transparent"}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${benefice >= 0 ? "bg-accent/20" : "bg-red-500/20"}`}>
                  <Wallet className={`w-5 h-5 ${benefice >= 0 ? "text-accent" : "text-red-400"}`} />
                </div>
                <div className="text-sm text-muted-foreground">Bénéfice net</div>
              </div>
              <div className={`text-3xl font-display font-bold ${benefice >= 0 ? "text-accent" : "text-red-400"}`}>{benefice >= 0 ? "+" : ""}{formatMGA(benefice)}</div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-input rounded-full h-1.5 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(Math.abs(beneficePct), 100)}%`, background: benefice >= 0 ? "hsl(145 60% 35%)" : "hsl(0 65% 50%)" }} />
                </div>
                <span className={`text-xs font-bold ${benefice >= 0 ? "text-accent" : "text-red-400"}`}>{beneficePct >= 0 ? "+" : ""}{beneficePct}% marge</span>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="font-bold font-display text-lg mb-6">Revenus · Dépenses · Bénéfice</h3>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={plData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(145 10% 12%)" />
                <XAxis dataKey="label" tick={{ fill: "hsl(145 5% 65%)", fontSize: 13, fontWeight: 600 }} />
                <YAxis tickFormatter={formatArShort} tick={{ fill: "hsl(145 5% 55%)", fontSize: 11 }} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v: number) => [formatMGA(v)]} labelStyle={{ color: "hsl(145 5% 75%)", marginBottom: 4 }} />
                <ReferenceLine y={0} stroke="hsl(145 10% 25%)" strokeWidth={1} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} label={{ position: "top", formatter: (v: number) => formatArShort(Math.abs(v)), fill: "hsl(145 5% 65%)", fontSize: 11 }}>
                  {plData.map((entry) => <Cell key={entry.label} fill={entry.color} />)}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </Card>

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
                        <span className="flex items-center gap-2"><span>{cat.emoji}</span><span className="font-medium">{cat.name}</span><span className="text-xs text-muted-foreground">({cat.count})</span></span>
                        <span className="font-bold">{formatMGA(cat.amount)} <span className="text-xs text-muted-foreground font-normal">({pct}%)</span></span>
                      </div>
                      <div className="w-full bg-input rounded-full h-2 overflow-hidden"><div className="h-full rounded-full bg-red-500/70" style={{ width: `${pct}%` }} /></div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Revenu total",              value: formatMGA(totalRevenue),    color: "text-emerald-400", sub: `${confirmedOrders.length} commandes` },
              { label: "Revenu moyen/commande",     value: confirmedOrders.length ? formatMGA(totalRevenue / confirmedOrders.length) : "—", color: "text-blue-400",    sub: "par commande" },
              { label: "Revenu moyen/billet",       value: totalTickets ? formatMGA(totalRevenue / totalTickets) : "—",  color: "text-violet-400", sub: "par billet" },
              { label: "Revenu shop",               value: formatMGA(shopRevenue),     color: "text-orange-400", sub: `${shopSoldTotal} articles` },
            ].map((k) => (
              <Card key={k.label} className="p-5">
                <div className={`text-2xl font-bold font-display ${k.color} mb-1`}>{k.value}</div>
                <div className="text-xs text-muted-foreground">{k.label}</div>
                <div className="text-xs text-muted-foreground/60 mt-0.5">{k.sub}</div>
              </Card>
            ))}
          </div>

          <Card className="p-6">
            <h3 className="font-bold font-display text-lg mb-6">Évolution du chiffre d'affaires</h3>
            {financeData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">Aucune donnée disponible</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={financeData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                  <defs>
                    <linearGradient id="cumulGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="hsl(145 60% 35%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(145 60% 35%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(145 10% 12%)" />
                  <XAxis dataKey="date" tick={{ fill: "hsl(145 5% 55%)", fontSize: 11 }} />
                  <YAxis tickFormatter={formatArShort} tick={{ fill: "hsl(145 5% 55%)", fontSize: 11 }} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(value: number, name: string) => [formatMGA(value), name === "daily" ? "Ventes du jour" : name === "cumul" ? "Cumul" : name]} labelStyle={{ color: "hsl(145 5% 75%)", marginBottom: 4 }} />
                  <Legend formatter={(v) => v === "daily" ? "Ventes du jour" : v === "cumul" ? "Cumul cumulatif" : v} wrapperStyle={{ fontSize: 12, color: "hsl(145 5% 65%)" }} />
                  <Bar dataKey="daily" fill="hsl(145 48% 20%)" radius={[4, 4, 0, 0]} name="daily" />
                  <Line type="monotone" dataKey="cumul" stroke="hsl(145 60% 45%)" strokeWidth={2.5} dot={{ fill: "hsl(145 60% 45%)", r: 3 }} activeDot={{ r: 5 }} name="cumul" />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="font-bold font-display text-lg mb-6">Revenus par mode de paiement (par jour)</h3>
            {financeData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">Aucune donnée disponible</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <ComposedChart data={financeData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(145 10% 12%)" />
                  <XAxis dataKey="date" tick={{ fill: "hsl(145 5% 55%)", fontSize: 11 }} />
                  <YAxis tickFormatter={formatArShort} tick={{ fill: "hsl(145 5% 55%)", fontSize: 11 }} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(value: number, name: string) => [formatMGA(value), methodLabels[name] ?? name]} labelStyle={{ color: "hsl(145 5% 75%)", marginBottom: 4 }} />
                  <Legend formatter={(v) => methodLabels[v] ?? v} wrapperStyle={{ fontSize: 12, color: "hsl(145 5% 65%)" }} />
                  <Bar dataKey="orange_money" stackId="a" fill="#ff6600" name="orange_money" />
                  <Bar dataKey="mvola"        stackId="a" fill="#16a34a" name="mvola" />
                  <Bar dataKey="mastercard"   stackId="a" fill="#3b82f6" name="mastercard" radius={[4, 4, 0, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="font-bold font-display text-lg mb-6">Ventes par type de billet</h3>
            {ticketSalesData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">Aucun type de billet configuré</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={ticketSalesData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(145 10% 12%)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "hsl(145 5% 55%)", fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "hsl(145 5% 55%)", fontSize: 11 }} width={90} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v: number, n: string) => [n === "revenus" ? formatMGA(v) : `${v} billets`, n === "vendus" ? "Vendus" : n === "restants" ? "Restants" : "Revenus"]} />
                  <Legend wrapperStyle={{ fontSize: 12, color: "hsl(145 5% 65%)" }} formatter={(v) => v === "vendus" ? "Vendus" : v === "restants" ? "Restants" : "Revenus"} />
                  <Bar dataKey="vendus"   stackId="b" fill="hsl(145 60% 35%)" name="vendus" />
                  <Bar dataKey="restants" stackId="b" fill="hsl(145 20% 18%)" name="restants" radius={[0, 4, 4, 0]} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="font-bold font-display text-lg mb-6">Nombre de commandes par jour</h3>
            {financeData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">Aucune donnée</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={financeData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                  <defs>
                    <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(145 10% 12%)" />
                  <XAxis dataKey="date" tick={{ fill: "hsl(145 5% 55%)", fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fill: "hsl(145 5% 55%)", fontSize: 11 }} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v: number) => [`${v} commande${v > 1 ? "s" : ""}`, "Commandes"]} />
                  <Area type="monotone" dataKey="orders" stroke="#3b82f6" fill="url(#ordersGradient)" strokeWidth={2} dot={{ fill: "#3b82f6", r: 3 }} name="orders" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>
        </div>
      )}

      {/* ─── DÉPENSES ─── */}
      {activeTab === "depenses" && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total dépenses",   value: formatMGA(totalExpenses),  icon: <Receipt className="w-5 h-5" />,      color: "text-red-400" },
              { label: "Réglées",          value: formatMGA(paidExpenses),   icon: <CheckCircle className="w-5 h-5" />, color: "text-emerald-400" },
              { label: "En attente",       value: formatMGA(pendingExpenses),icon: <Clock className="w-5 h-5" />,       color: "text-orange-400" },
              { label: "Bénéfice estimé",  value: (benefice >= 0 ? "+" : "") + formatMGA(benefice), icon: <Wallet className="w-5 h-5" />, color: benefice >= 0 ? "text-accent" : "text-red-400" },
            ].map((kpi) => (
              <Card key={kpi.label} className="p-5">
                <div className={`${kpi.color} mb-3`}>{kpi.icon}</div>
                <div className={`text-2xl font-bold font-display mb-1 ${kpi.color}`}>{kpi.value}</div>
                <div className="text-xs text-muted-foreground">{kpi.label}</div>
              </Card>
            ))}
          </div>

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
                <Button variant="accent" size="sm" onClick={() => setIsAddExpenseOpen(true)}><Plus className="w-4 h-4 mr-2" /> Ajouter une dépense</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {expenses.slice().sort((a, b) => b.amount - a.amount).map((exp) => {
                  const cat = EXPENSE_CATEGORIES.find((c) => c.name === exp.category);
                  return (
                    <Card key={exp.id} className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center text-2xl shrink-0">{cat?.emoji ?? "💡"}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="font-semibold truncate">{exp.label}</div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-muted-foreground">{exp.category}</span>
                                <span className="text-muted-foreground/40">·</span>
                                <span className="text-xs text-muted-foreground">{format(new Date(exp.date), "d MMM yyyy", { locale: fr })}</span>
                                {exp.note && <><span className="text-muted-foreground/40">·</span><span className="text-xs text-muted-foreground italic truncate max-w-[180px]">{exp.note}</span></>}
                              </div>
                            </div>
                            <div className="shrink-0 flex items-center gap-3">
                              <div className="text-right">
                                <div className="font-bold text-red-400">{formatMGA(exp.amount)}</div>
                                <Badge variant={exp.status === "paid" ? "success" : "warning"} className="text-xs">
                                  {exp.status === "paid" ? <span className="flex items-center gap-1"><CheckCircle className="w-2.5 h-2.5" /> Réglée</span> : <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> En attente</span>}
                                </Badge>
                              </div>
                              <div className="flex gap-1">
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => { setEditExpense(exp); setIsAddExpenseOpen(true); }}><Edit className="w-3.5 h-3.5 text-blue-400" /></Button>
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => deleteExpense(exp.id)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
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

          {expenseByCat.length > 0 && (
            <Card className="p-6">
              <h3 className="font-bold font-display text-lg mb-4">Répartition par catégorie</h3>
              <div className="space-y-3">
                {expenseByCat.map((cat) => {
                  const pct = totalExpenses > 0 ? Math.round((cat.amount / totalExpenses) * 100) : 0;
                  return (
                    <div key={cat.name}>
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span className="flex items-center gap-2"><span>{cat.emoji}</span><span className="font-medium">{cat.name}</span><span className="text-xs text-muted-foreground">{cat.count} poste{cat.count > 1 ? "s" : ""}</span></span>
                        <span className="font-bold text-red-400">{formatMGA(cat.amount)} <span className="text-muted-foreground font-normal text-xs">({pct}%)</span></span>
                      </div>
                      <div className="w-full bg-input rounded-full h-2 overflow-hidden"><div className="h-full rounded-full bg-red-500/60" style={{ width: `${pct}%` }} /></div>
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

          <Dialog isOpen={isAddExpenseOpen} onClose={() => { setIsAddExpenseOpen(false); setEditExpense(null); }} title={editExpense ? "Modifier la dépense" : "Nouvelle dépense"}>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="space-y-2"><Label>Intitulé</Label><Input name="label" required placeholder="Ex: Location salle des fêtes" defaultValue={editExpense?.label ?? ""} /></div>
              <div className="space-y-2"><Label>Catégorie</Label><Select name="category" required defaultValue={editExpense?.category ?? "Location salle"}>{EXPENSE_CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.emoji} {c.name}</option>)}</Select></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Montant (Ar)</Label><Input name="amount" type="number" required min="0" placeholder="Ex: 50000" defaultValue={editExpense?.amount ?? ""} /></div>
                <div className="space-y-2"><Label>Date</Label><Input name="date" type="date" required defaultValue={editExpense?.date ?? new Date().toISOString().slice(0, 10)} /></div>
              </div>
              <div className="space-y-2"><Label>Statut</Label><Select name="status" defaultValue={editExpense?.status ?? "pending"}><option value="paid">✅ Réglée</option><option value="pending">⏳ En attente</option></Select></div>
              <div className="space-y-2"><Label>Note (optionnel)</Label><Textarea name="note" placeholder="Informations complémentaires..." defaultValue={editExpense?.note ?? ""} /></div>
              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => { setIsAddExpenseOpen(false); setEditExpense(null); }}>Annuler</Button>
                <Button type="submit" variant="accent">{editExpense ? "Enregistrer" : "Ajouter"}</Button>
              </div>
            </form>
          </Dialog>
        </div>
      )}

      {/* ─── TICKETS ─── */}
      {activeTab === "tickets" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold font-display text-xl">Types de billets</h3>
            <Button variant="accent" size="sm" onClick={() => setIsAddTicketOpen(true)}><Plus className="w-4 h-4 mr-2" /> Nouveau type</Button>
          </div>
          {ticketTypes.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border">
              <Ticket className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <h4 className="font-bold mb-2">Aucun type de billet</h4>
              <p className="text-muted-foreground text-sm mb-4">Ajoutez des types de billets pour cet événement.</p>
              <Button variant="accent" size="sm" onClick={() => setIsAddTicketOpen(true)}><Plus className="w-4 h-4 mr-2" /> Ajouter un billet</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {ticketTypes.map((tt) => {
                const ticketOrders = confirmedOrders.filter((o) => o.ticketType.id === tt.id);
                const ticketRevenue = ticketOrders.reduce((s, o) => s + o.totalAmount, 0);
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
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => { setEditTicketType(tt); setIsAddTicketOpen(true); }}><Edit className="w-3.5 h-3.5 text-blue-400" /></Button>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setTicketTypes(prev => prev.filter(t => t.id !== tt.id))}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1.5"><span>{sold} / {tt.quantity} vendus</span><span>{fillPctTt}%</span></div>
                          <div className="w-full bg-input rounded-full h-2 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${fillPctTt}%`, background: fillPctTt >= 90 ? "hsl(0 70% 50%)" : "hsl(145 60% 35%)" }} /></div>
                        </div>
                      </div>
                      <div className="flex md:flex-col gap-6 md:gap-2 md:text-right shrink-0 md:border-l md:border-border/50 md:pl-6">
                        <div><div className="text-xs text-muted-foreground">Prix unitaire</div><div className="text-xl font-display font-bold text-accent">{formatMGA(tt.price)}</div></div>
                        <div><div className="text-xs text-muted-foreground">Revenus générés</div><div className="text-lg font-bold text-emerald-400">{formatMGA(ticketRevenue)}</div></div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
          <Dialog isOpen={isAddTicketOpen} onClose={() => { setIsAddTicketOpen(false); setEditTicketType(null); }} title={editTicketType ? "Modifier le billet" : "Nouveau type de billet"}>
            <form onSubmit={handleAddTicket} className="space-y-4">
              <div className="space-y-2"><Label>Nom du billet</Label><Input key={editTicketType?.id ?? "new"} name="name" required placeholder="Ex: VIP, Standard, Économique" defaultValue={editTicketType?.name ?? ""} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Prix (Ar)</Label><Input name="price" type="number" required min="0" placeholder="Ex: 50000" defaultValue={editTicketType?.price ?? ""} /></div>
                <div className="space-y-2"><Label>Quantité disponible</Label><Input name="quantity" type="number" required min="1" placeholder="Ex: 200" defaultValue={editTicketType?.quantity ?? ""} /></div>
              </div>
              <div className="space-y-2"><Label>Description</Label><Textarea name="description" placeholder="Description des avantages..." defaultValue={editTicketType?.description ?? ""} /></div>
              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => { setIsAddTicketOpen(false); setEditTicketType(null); }}>Annuler</Button>
                <Button type="submit" variant="accent">{editTicketType ? "Enregistrer" : "Créer le billet"}</Button>
              </div>
            </form>
          </Dialog>
        </div>
      )}

      {/* ─── ORDERS ─── */}
      {activeTab === "orders" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total commandes",      value: orders.length,                                         color: "text-foreground" },
              { label: "Billets émis",          value: orders.reduce((s, o) => s + o.quantity, 0),            color: "text-accent" },
              { label: "Paiements confirmés",   value: confirmedOrders.length,                                color: "text-emerald-400" },
              { label: "En attente",            value: orders.filter((o) => o.status === "pending").length,   color: "text-orange-400" },
            ].map((s) => (
              <Card key={s.label} className="p-4 text-center">
                <div className={`text-2xl font-bold font-display ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </Card>
            ))}
          </div>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold">Filtres</span>
              {hasOrdFilters && (
                <button onClick={clearOrdFilters} className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border border-border rounded-full px-2.5 py-0.5 transition-colors">
                  <X className="w-3 h-3" /> Effacer les filtres
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input value={ordSearch} onChange={(e) => setOrdSearch(e.target.value)} placeholder="Nom, tél, n° commande…" className="w-full pl-8 pr-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent/50" />
              </div>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[10px] font-mono font-bold">CLÉ</span>
                <input value={ordKey} onChange={(e) => setOrdKey(e.target.value.toLowerCase())} placeholder="clé de billet…" maxLength={6} className="w-full pl-9 pr-3 py-1.5 text-sm font-mono bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent/50" />
              </div>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[10px] font-mono font-bold">CODE</span>
                <input value={ordCode} onChange={(e) => setOrdCode(e.target.value.toUpperCase())} placeholder="CODE CONFIRMATION…" maxLength={6} className="w-full pl-12 pr-3 py-1.5 text-sm font-mono bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent/50" />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1 block">Statut billet</label>
                <select value={ordTicketSt} onChange={(e) => setOrdTicketSt(e.target.value as typeof ordTicketSt)} className="w-full px-2.5 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent/50">
                  <option value="all">Tous</option><option value="unused">Non utilisé</option><option value="used">Utilisé</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1 block">Statut paiement</label>
                <select value={ordPaySt} onChange={(e) => setOrdPaySt(e.target.value as typeof ordPaySt)} className="w-full px-2.5 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent/50">
                  <option value="all">Tous</option><option value="confirmed">Succès</option><option value="pending">En attente</option><option value="cancelled">Annulé</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1 block">Du</label>
                <input type="date" value={ordDateFrom} onChange={(e) => setOrdDateFrom(e.target.value)} className="w-full px-2.5 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent/50" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1 block">Au</label>
                <input type="date" value={ordDateTo} onChange={(e) => setOrdDateTo(e.target.value)} className="w-full px-2.5 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent/50" />
              </div>
            </div>
            {hasOrdFilters && <p className="mt-3 text-xs text-muted-foreground">{filteredOrderRows.length === 0 ? "Aucun résultat." : `${filteredOrderRows.length} billet${filteredOrderRows.length > 1 ? "s" : ""} trouvé${filteredOrderRows.length > 1 ? "s" : ""}`}</p>}
          </Card>

          {orders.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border">
              <ShoppingCart className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Aucune commande pour cet événement.</p>
            </div>
          ) : filteredOrderRows.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-2xl border border-dashed border-border">
              <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Aucun billet ne correspond aux filtres.</p>
            </div>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">N° / Unité</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="whitespace-nowrap">Clé de billet</TableHead>
                      <TableHead className="whitespace-nowrap">Code confirmation</TableHead>
                      <TableHead className="whitespace-nowrap">N° série</TableHead>
                      <TableHead>Mode paiement</TableHead>
                      <TableHead className="whitespace-nowrap">Statut paiement</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="whitespace-nowrap">Statut billet</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrderRows.map(({ order, unitIndex, codes, ticketId }) => {
                      const isUsed  = usedTickets.has(ticketId);
                      const isFirst = unitIndex === 0;
                      return (
                        <TableRow key={ticketId} className={`${isUsed ? "opacity-60" : ""} ${isFirst ? "" : "bg-card/30"}`}>
                          <TableCell className="font-mono text-xs whitespace-nowrap">
                            {isFirst && <span className="text-foreground font-semibold block">#{String(order.id).padStart(5, "0")}</span>}
                            <span className="text-muted-foreground">unité {unitIndex + 1}/{order.quantity}</span>
                          </TableCell>
                          <TableCell>
                            {isFirst ? (
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-accent font-bold text-xs shrink-0">{order.customerName.charAt(0).toUpperCase()}</div>
                                <div>
                                  <div className="font-semibold text-sm whitespace-nowrap">{order.customerName}</div>
                                  <div className="text-xs text-muted-foreground whitespace-nowrap">{order.customerPhone}</div>
                                </div>
                              </div>
                            ) : <span className="text-muted-foreground text-xs pl-9">↳</span>}
                          </TableCell>
                          <TableCell><span className="text-xs font-medium whitespace-nowrap">{order.ticketType.name}</span></TableCell>
                          <TableCell><span className="font-mono text-xs bg-card border border-border rounded px-2 py-0.5 text-foreground/70">{codes.ticketKey}</span></TableCell>
                          <TableCell><span className="font-mono text-xs font-bold text-accent bg-accent/10 border border-accent/20 rounded px-2 py-0.5">{codes.confirmCode}</span></TableCell>
                          <TableCell><span className="font-mono text-xs text-muted-foreground whitespace-nowrap">{codes.ticketNumber}</span></TableCell>
                          <TableCell>{isFirst ? <PaymentBadge method={order.paymentMethod} size="sm" /> : null}</TableCell>
                          <TableCell>
                            {isFirst ? (
                              <span className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-0.5 border ${order.status === "confirmed" ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30" : order.status === "pending" ? "bg-orange-950/40 text-orange-400 border-orange-500/30" : "bg-red-950/40 text-red-400 border-red-500/30"}`}>
                                {order.status === "confirmed" ? <><CheckCircle className="w-3 h-3" /> Succès</> : order.status === "pending" ? <><Clock className="w-3 h-3" /> En attente</> : <><XCircle className="w-3 h-3" /> Annulé</>}
                              </span>
                            ) : null}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{isFirst ? format(new Date(order.createdAt), "dd MMM yy", { locale: fr }) : null}</TableCell>
                          <TableCell>
                            <button onClick={() => handleToggleUsed(ticketId)}
                              className={`flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1 border transition-all whitespace-nowrap ${isUsed ? "bg-red-950/40 text-red-400 border-red-500/30 hover:bg-red-950/60" : "bg-emerald-950/40 text-emerald-400 border-emerald-500/30 hover:bg-emerald-950/60"}`}
                              title={isUsed ? "Cliquer pour marquer comme non utilisé" : "Cliquer pour marquer comme utilisé"}>
                              {isUsed ? <><XCircle className="w-3 h-3" /> Utilisé</> : <><CheckCircle className="w-3 h-3" /> Non utilisé</>}
                            </button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ─── SHOP ─── */}
      {activeTab === "shop" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Revenu boutique", value: formatMGA(shopRevenue),    icon: <Store className="w-5 h-5" />,       color: "text-orange-400" },
              { label: "Articles vendus", value: String(shopSoldTotal),      icon: <ShoppingBag className="w-5 h-5" />, color: "text-emerald-400" },
              { label: "Produits actifs", value: String(shopProducts.length),icon: <Package className="w-5 h-5" />,    color: "text-blue-400" },
              { label: "Stock total",     value: String(shopTotalStock),     icon: <Tag className="w-5 h-5" />,        color: "text-violet-400" },
            ].map((kpi) => (
              <Card key={kpi.label} className="p-5">
                <div className={`${kpi.color} mb-3`}>{kpi.icon}</div>
                <div className="text-2xl font-bold font-display mb-1">{kpi.value}</div>
                <div className="text-xs text-muted-foreground">{kpi.label}</div>
              </Card>
            ))}
          </div>

          <div className="flex gap-1 p-1 bg-card rounded-xl border border-border w-fit">
            {(["catalogue", "stock", "mouvements"] as const).map((v) => (
              <button key={v} onClick={() => setShopView(v)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${shopView === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
                {v === "catalogue" ? "🛍️ Catalogue" : v === "stock" ? "📦 Gestion stock" : "📋 Mouvements"}
              </button>
            ))}
          </div>

          {shopView === "catalogue" && (
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <button onClick={() => setShopCatFilter("all")} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${shopCatFilter === "all" ? "bg-accent text-black border-accent" : "border-border text-muted-foreground hover:border-accent/50"}`}>Tous</button>
                {SHOP_CATEGORIES_ACC.map((c) => (<button key={c} onClick={() => setShopCatFilter(c)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${shopCatFilter === c ? "bg-accent text-black border-accent" : "border-border text-muted-foreground hover:border-accent/50"}`}>{c}</button>))}
                <div className="flex-1" />
                <Button variant="accent" size="sm" onClick={() => { setEditShopProduct(null); setIsAddProductOpen(true); }}><Plus className="w-4 h-4 mr-2" /> Nouveau produit</Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {shopProducts.filter((p) => shopCatFilter === "all" || p.category === shopCatFilter).map((product) => {
                  const totalStock = getStockQty(product.id);
                  const stockColor = totalStock === 0 ? "text-red-400" : totalStock <= 10 ? "text-orange-400" : "text-emerald-400";
                  const stockBg    = totalStock === 0 ? "bg-red-500/10 border-red-500/30" : totalStock <= 10 ? "bg-orange-500/10 border-orange-500/30" : "bg-emerald-500/10 border-emerald-500/30";
                  return (
                    <div key={product.id} className="rounded-2xl overflow-hidden border border-border bg-card hover:border-accent/40 transition-all group">
                      <div className="relative flex items-center justify-center" style={{ background: product.bg, height: 130 }}>
                        <span className="text-6xl select-none">{product.emoji}</span>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button onClick={() => { setEditShopProduct(product); setIsAddProductOpen(true); }} className="w-9 h-9 rounded-lg bg-blue-500/80 flex items-center justify-center hover:bg-blue-500"><Edit className="w-4 h-4 text-white" /></button>
                          <button onClick={() => { setStockOpProduct(product); setIsStockOpOpen("entree"); }} className="w-9 h-9 rounded-lg bg-emerald-600/80 flex items-center justify-center hover:bg-emerald-600" title="Entrée en stock"><Plus className="w-4 h-4 text-white" /></button>
                          <button onClick={() => deleteProduct(product.id)} className="w-9 h-9 rounded-lg bg-red-600/80 flex items-center justify-center hover:bg-red-600"><Trash2 className="w-4 h-4 text-white" /></button>
                        </div>
                        <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-lg text-xs font-bold border ${stockBg} ${stockColor}`}>{totalStock === 0 ? "Rupture" : `${totalStock} en stock`}</div>
                      </div>
                      <div className="p-3">
                        <div className="text-xs text-muted-foreground mb-0.5">{product.category}</div>
                        <div className="font-bold text-sm leading-tight mb-2 line-clamp-2">{product.name}</div>
                        <div className="text-xl font-display font-bold text-accent mb-2">{formatMGA(product.price)}</div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground"><span>{product.sold} vendus</span><span className="text-emerald-400 font-semibold">{formatMGA(product.price * product.sold)}</span></div>
                        <div className="mt-2 pt-2 border-t border-border/50 space-y-1">
                          {shopStores.map((store) => {
                            const sq = getStockQty(product.id, store.id);
                            return (<div key={store.id} className="flex justify-between text-xs"><span className="text-muted-foreground truncate max-w-[80px]">{store.name}</span><span className={sq === 0 ? "text-red-400 font-bold" : sq <= 5 ? "text-orange-400 font-semibold" : "text-foreground"}>{sq}</span></div>);
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {shopView === "stock" && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3">
                <Button variant="accent" size="sm" onClick={() => { setStockOpProduct(shopProducts[0]); setIsStockOpOpen("entree"); }}><Plus className="w-4 h-4 mr-2" /> Entrée en stock</Button>
                <Button variant="outline" size="sm" onClick={() => { setStockOpProduct(shopProducts[0]); setIsStockOpOpen("redressement"); }}>⚖️ Redressement</Button>
                <Button variant="outline" size="sm" onClick={() => { setStockOpProduct(shopProducts[0]); setIsStockOpOpen("transfert"); }}>🔀 Transfert</Button>
              </div>
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-card/50">
                        <th className="text-left p-3 font-semibold text-muted-foreground">Produit</th>
                        {shopStores.map((s) => (<th key={s.id} className="text-center p-3 font-semibold text-muted-foreground whitespace-nowrap">{s.name}<br /><span className="text-xs font-normal">{s.location}</span></th>))}
                        <th className="text-center p-3 font-semibold text-muted-foreground">Total</th>
                        <th className="p-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {shopProducts.map((product) => {
                        const total = getStockQty(product.id);
                        return (
                          <tr key={product.id} className="border-b border-border/50 hover:bg-card/30 transition-colors">
                            <td className="p-3"><div className="flex items-center gap-2"><span className="text-xl">{product.emoji}</span><div><div className="font-semibold text-sm">{product.name}</div><div className="text-xs text-muted-foreground">{product.category}</div></div></div></td>
                            {shopStores.map((store) => { const sq = getStockQty(product.id, store.id); return (<td key={store.id} className="p-3 text-center"><span className={`font-bold text-base ${sq === 0 ? "text-red-400" : sq <= 5 ? "text-orange-400" : "text-foreground"}`}>{sq}</span></td>); })}
                            <td className="p-3 text-center"><span className={`font-bold text-base ${total === 0 ? "text-red-400" : "text-accent"}`}>{total}</span></td>
                            <td className="p-3">
                              <div className="flex gap-1 justify-end">
                                <button onClick={() => { setStockOpProduct(product); setIsStockOpOpen("entree"); }} className="text-xs px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors whitespace-nowrap">+ Entrée</button>
                                <button onClick={() => { setStockOpProduct(product); setIsStockOpOpen("transfert"); }} className="text-xs px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors">🔀</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {shopView === "mouvements" && (
            <div>
              <h3 className="font-bold font-display text-lg mb-4">Historique des mouvements ({stockMovements.length})</h3>
              {stockMovements.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-2xl border border-dashed border-border"><Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground text-sm">Aucun mouvement enregistré</p></div>
              ) : (
                <div className="space-y-3">
                  {stockMovements.map((mv) => {
                    const prod      = shopProducts.find((p) => p.id === mv.productId);
                    const toStore   = shopStores.find((s) => s.id === mv.toStoreId);
                    const fromStore = mv.fromStoreId ? shopStores.find((s) => s.id === mv.fromStoreId) : undefined;
                    const typeConfig = mv.type === "entree" ? { label: "📥 Entrée", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" } : mv.type === "redressement" ? { label: "⚖️ Redressement", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" } : { label: "🔀 Transfert", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" };
                    return (
                      <Card key={mv.id} className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${typeConfig.bg} ${typeConfig.color}`}>{typeConfig.label}</span>
                              <span className="font-semibold text-sm">{prod?.emoji} {prod?.name ?? "—"}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-3">
                              {mv.type === "transfert" ? <span>{fromStore?.name} → {toStore?.name}</span> : <span>Vers : {toStore?.name}</span>}
                              <span>{format(new Date(mv.date), "d MMM yyyy", { locale: fr })}</span>
                              {mv.note && <span className="italic">"{mv.note}"</span>}
                            </div>
                          </div>
                          <div className={`text-xl font-display font-bold shrink-0 ${typeConfig.color}`}>{mv.type === "redressement" ? "" : "+"}{mv.qty} unités</div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <Dialog isOpen={isAddProductOpen} onClose={() => { setIsAddProductOpen(false); setEditShopProduct(null); }} title={editShopProduct ? "Modifier le produit" : "Nouveau produit"}>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="space-y-2"><Label>Nom du produit</Label><Input name="name" required placeholder="Ex: T-Shirt Gala 2026" defaultValue={editShopProduct?.name ?? ""} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Catégorie</Label><Select name="category" required defaultValue={editShopProduct?.category ?? "Vêtements"}>{SHOP_CATEGORIES_ACC.map((c) => <option key={c} value={c}>{c}</option>)}</Select></div>
                <div className="space-y-2"><Label>Prix de vente (Ar)</Label><Input name="price" type="number" required min="0" placeholder="Ex: 35000" defaultValue={editShopProduct?.price ?? ""} /></div>
              </div>
              <div className="space-y-2"><Label>Description</Label><Textarea name="description" placeholder="Description du produit..." defaultValue={editShopProduct?.description ?? ""} /></div>
              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => { setIsAddProductOpen(false); setEditShopProduct(null); }}>Annuler</Button>
                <Button type="submit" variant="accent">{editShopProduct ? "Enregistrer" : "Créer le produit"}</Button>
              </div>
            </form>
          </Dialog>

          <Dialog isOpen={!!isStockOpOpen} onClose={() => { setIsStockOpOpen(null); setStockOpProduct(null); }} title={isStockOpOpen === "entree" ? "📥 Entrée en stock" : isStockOpOpen === "redressement" ? "⚖️ Redressement de stock" : "🔀 Transfert de stock"}>
            {isStockOpOpen && (
              <form onSubmit={handleStockOperation} className="space-y-4">
                <div className="space-y-2">
                  <Label>Produit</Label>
                  <Select name="productId" required defaultValue={stockOpProduct?.id ?? shopProducts[0]?.id} onChange={(e) => { const p = shopProducts.find((p) => p.id === Number((e.target as HTMLSelectElement).value)); setStockOpProduct(p ?? null); }}>
                    {shopProducts.map((p) => <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
                  </Select>
                </div>
                {isStockOpOpen === "transfert" && (
                  <div className="space-y-2"><Label>Stand source</Label><Select name="fromStoreId" required defaultValue={shopStores[0]?.id}>{shopStores.map((s) => (<option key={s.id} value={s.id}>{s.name} — {s.location} ({stockOpProduct ? getStockQty(stockOpProduct.id, s.id) : "?"} en stock)</option>))}</Select></div>
                )}
                <div className="space-y-2"><Label>{isStockOpOpen === "transfert" ? "Stand destination" : "Stand"}</Label><Select name="toStoreId" required defaultValue={isStockOpOpen === "transfert" ? shopStores[1]?.id : shopStores[0]?.id}>{shopStores.map((s) => (<option key={s.id} value={s.id}>{s.name} — {s.location} ({stockOpProduct ? getStockQty(stockOpProduct.id, s.id) : "?"} en stock)</option>))}</Select></div>
                <div className="space-y-2"><Label>{isStockOpOpen === "redressement" ? "Nouvelle quantité" : "Quantité"}</Label><Input name="qty" type="number" required min="0" placeholder={isStockOpOpen === "redressement" ? "Quantité réelle en stock" : "Nombre d'unités"} /></div>
                <div className="space-y-2"><Label>Motif / note (optionnel)</Label><Textarea name="note" placeholder="Ex: Réception commande fournisseur..." /></div>
                <div className="pt-2 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => { setIsStockOpOpen(null); setStockOpProduct(null); }}>Annuler</Button>
                  <Button type="submit" variant="accent">{isStockOpOpen === "entree" ? "Valider l'entrée" : isStockOpOpen === "redressement" ? "Valider le redressement" : "Valider le transfert"}</Button>
                </div>
              </form>
            )}
          </Dialog>
        </div>
      )}

      {/* ─── STAFF ─── */}
      {activeTab === "staff" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold font-display text-xl">Équipe staff ({STAFF_ROLES.length} membres)</h3>
            <Button variant="accent" size="sm" onClick={() => { setStaffForm({ name: "", role: "", phone: "", status: "pending" }); setStaffFormError(""); setIsAddStaffOpen(true); }}><Plus className="w-4 h-4 mr-2" /> Ajouter un membre</Button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {STAFF_ROLES.map((member) => (
              <Card key={member.id} className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent/60 flex items-center justify-center font-bold text-lg text-white shrink-0">{member.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{member.name}</div>
                  <div className="text-sm text-muted-foreground">{member.role}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" /> {member.phone}</div>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-2">
                  <Badge variant={member.status === "confirmed" ? "success" : "warning"}>{member.status === "confirmed" ? "Confirmé" : "En attente"}</Badge>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0"><Edit className="w-3 h-3 text-blue-400" /></Button>
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0"><Trash2 className="w-3 h-3 text-destructive" /></Button>
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
                <p className="text-sm text-muted-foreground">Assignez des rôles, gérez les accréditations et les horaires de chaque membre de l'équipe pour cet événement.</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ─── VENTE ─── */}
      {activeTab === "vente" && (
        <div className="relative">
          {venteIsProcessing && (
            <>
              <style>{`
                @keyframes letterFloat { 0%,100%{transform:translateY(0px) scale(1);opacity:1;} 50%{transform:translateY(-14px) scale(1.08);opacity:0.6;} }
                @keyframes barSlide   { 0%{transform:translateX(-100%);} 100%{transform:translateX(400%);} }
              `}</style>
              <div className="fixed inset-0 z-[100] bg-black/92 backdrop-blur-xl flex flex-col items-center justify-center gap-10">
                <div className="flex items-end gap-0.5 select-none">
                  {"INBOX TICKET".split("").map((char, i) => (
                    char === " " ? <span key={i} className="w-6" /> :
                    <span key={i} className="font-display font-black text-6xl md:text-7xl text-accent drop-shadow-[0_0_20px_rgba(45,158,78,0.6)]" style={{ display: "inline-block", animation: "letterFloat 1.6s ease-in-out infinite", animationDelay: `${i * 0.09}s` }}>{char}</span>
                  ))}
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="text-muted-foreground text-sm tracking-[0.25em] uppercase animate-pulse">Traitement en cours</div>
                  <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent to-transparent w-1/3 rounded-full" style={{ animation: "barSlide 1.2s ease-in-out infinite" }} />
                  </div>
                </div>
              </div>
            </>
          )}

          {venteSuccessMsg && (
            <div className="mb-5 p-4 bg-emerald-950/70 border border-emerald-500/50 rounded-2xl text-emerald-300 font-semibold flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />{venteSuccessMsg}
            </div>
          )}

          {/* DESKTOP */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold font-display text-xl">Catalogue des billets</h3>
              {ticketTypes.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border"><Ticket className="w-10 h-10 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground text-sm">Aucun type de billet configuré.</p></div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {ticketTypes.map((tt) => {
                    const remaining = tt.quantity - (tt.soldCount ?? 0);
                    const qty = venteCart.get(tt.id) ?? 0;
                    return (
                      <div key={tt.id} className={`rounded-2xl border-2 p-5 transition-all ${qty > 0 ? "border-accent bg-accent/5 shadow-accent/10 shadow-lg" : "border-border bg-card"} ${remaining === 0 ? "opacity-50" : ""}`}>
                        <div className="mb-3">
                          <div className="font-bold text-lg leading-tight">{tt.name}</div>
                          {tt.description && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{tt.description}</div>}
                          <div className={`text-xs mt-1 ${remaining === 0 ? "text-red-400" : remaining <= 10 ? "text-orange-400" : "text-muted-foreground"}`}>{remaining === 0 ? "Épuisé" : `${remaining} restant${remaining > 1 ? "s" : ""}`}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-display font-bold text-accent">{formatMGA(tt.price)}</div>
                          <div className="flex items-center gap-2">
                            {qty > 0 && <button onClick={() => removeFromCart(tt.id)} className="w-9 h-9 rounded-xl border border-border bg-background hover:bg-muted flex items-center justify-center transition-colors"><Minus className="w-4 h-4" /></button>}
                            {qty > 0 && <span className="w-8 text-center text-xl font-display font-bold text-accent">{qty}</span>}
                            <button onClick={() => addToCart(tt.id)} disabled={remaining === 0} className="w-10 h-10 rounded-xl bg-accent hover:bg-accent/80 text-black flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed font-bold shadow-md"><Plus className="w-5 h-5" /></button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-bold font-display text-xl">Encaissement</h3>
              <Card className="p-5 space-y-4 sticky top-4">
                {cartItemCount === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    Cliquez sur <span className="font-bold text-accent">+</span> pour ajouter des billets
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-3">Panier ({cartItemCount} billet{cartItemCount > 1 ? "s" : ""})</div>
                      {Array.from(venteCart.entries()).map(([ttId, qty]) => {
                        const tt = ticketTypes.find((t) => t.id === ttId);
                        if (!tt) return null;
                        const sub = tt.price * qty;
                        return (
                          <div key={ttId} className="flex items-center justify-between gap-2 py-2 border-b border-border/50 last:border-0">
                            <div className="flex-1 min-w-0"><div className="text-sm font-semibold truncate">{tt.name}</div><div className="text-xs text-muted-foreground">{qty} × {formatMGA(tt.price)}</div></div>
                            <div className="font-bold text-accent text-sm shrink-0">{formatMGA(sub)}</div>
                          </div>
                        );
                      })}
                      <div className="flex justify-between items-center pt-2 font-bold"><span>Total</span><span className="text-2xl font-display text-accent">{formatMGA(cartTotal)}</span></div>
                    </div>
                    <div className="space-y-3 pt-2 border-t border-border/50">
                      <div>
                        <label className="text-xs text-muted-foreground uppercase tracking-wide mb-1 block">Nom du client</label>
                        <input value={venteCustomerName} onChange={(e) => setVenteCustomerName(e.target.value)} placeholder="Ex: Rakoto Jean" className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent/50" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground uppercase tracking-wide mb-1 block">Téléphone *</label>
                        <input value={venteCustomerPhone} onChange={(e) => setVenteCustomerPhone(e.target.value)} placeholder="Ex: 034 12 345 67" className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent/50" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">Mode de paiement</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[{ key: "especes", label: "💵 Espèces" }, { key: "orange_money", label: "🟠 Orange Money" }, { key: "mvola", label: "🔴 MVola" }].map((m) => (
                          <button key={m.key} onClick={() => setVentePaymentMethod(m.key)} className={`py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all text-center leading-tight ${ventePaymentMethod === m.key ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:border-accent/40"}`}>{m.label}</button>
                        ))}
                      </div>
                    </div>
                    {ventePhoneError && (
                      <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-sm font-semibold animate-in slide-in-from-top-2 fade-in duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-red-400"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        Veuillez saisir le numéro de téléphone du client
                      </div>
                    )}
                    <button onClick={() => { if (!venteCustomerPhone.trim()) { setVentePhoneError(true); setTimeout(() => setVentePhoneError(false), 3000); return; } setVentePhoneError(false); setVenteConfirmOpen(true); }} className="w-full py-3.5 rounded-xl bg-accent hover:bg-accent/80 text-black font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20">
                      <CreditCard className="w-5 h-5" /> Encaisser {formatMGA(cartTotal)}
                    </button>
                  </>
                )}
              </Card>
            </div>
          </div>

          {/* MOBILE */}
          <div className="lg:hidden">
            <div className="flex mb-6 rounded-2xl border border-border overflow-hidden bg-card">
              {(["vente", "panier", "paiement"] as const).map((step, i) => {
                const labels = ["🎟 Billets", `🛒 Panier${cartItemCount > 0 ? ` (${cartItemCount})` : ""}`, "✅ Confirmation"];
                const isActive = venteMobileStep === step;
                const isPast = (venteMobileStep === "panier" && i === 0) || (venteMobileStep === "paiement" && i <= 1);
                return (
                  <div key={step} className={`flex-1 py-3.5 text-xs font-bold border-r last:border-0 border-border text-center select-none cursor-default transition-all ${isActive ? "bg-accent text-black" : isPast ? "bg-accent/20 text-accent" : "text-muted-foreground/50"}`}>{labels[i]}</div>
                );
              })}
            </div>

            {venteMobileStep === "vente" && (
              <div className="pb-24">
                {ticketTypes.length === 0 ? (
                  <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border"><Ticket className="w-10 h-10 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground text-sm">Aucun billet configuré.</p></div>
                ) : (
                  <div className="space-y-3">
                    {ticketTypes.map((tt) => {
                      const remaining = tt.quantity - (tt.soldCount ?? 0);
                      const qty = venteCart.get(tt.id) ?? 0;
                      return (
                        <div key={tt.id} className={`rounded-2xl border-2 p-4 flex items-center gap-4 transition-all ${qty > 0 ? "border-accent bg-accent/5" : "border-border bg-card"}`}>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold">{tt.name}</div>
                            {tt.description && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{tt.description}</div>}
                            <div className="text-xl font-display font-bold text-accent mt-1">{formatMGA(tt.price)}</div>
                            <div className={`text-xs mt-0.5 ${remaining === 0 ? "text-red-400" : remaining <= 10 ? "text-orange-400" : "text-muted-foreground"}`}>{remaining === 0 ? "Épuisé" : `${remaining} restant${remaining > 1 ? "s" : ""}`}</div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {qty > 0 && <button onClick={() => removeFromCart(tt.id)} className="w-10 h-10 rounded-xl border border-border bg-background flex items-center justify-center"><Minus className="w-4 h-4" /></button>}
                            {qty > 0 && <span className="w-7 text-center font-display font-bold text-accent text-xl">{qty}</span>}
                            <button onClick={() => addToCart(tt.id)} disabled={remaining === 0} className="w-10 h-10 rounded-xl bg-accent hover:bg-accent/80 text-black flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed font-bold"><Plus className="w-5 h-5" /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {cartItemCount > 0 && (
                  <button onClick={() => setVenteMobileStep("panier")} className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 bg-accent text-black font-bold rounded-2xl shadow-2xl shadow-accent/40 active:scale-95 transition-transform">
                    <ShoppingCart className="w-5 h-5" /><span className="text-base">{cartItemCount}</span><span className="text-sm opacity-80">— {formatMGA(cartTotal)}</span>
                  </button>
                )}
              </div>
            )}

            {venteMobileStep === "panier" && (
              <div className="space-y-4 pb-28">
                <button onClick={() => setVenteMobileStep("vente")} className="flex items-center gap-1.5 text-muted-foreground hover:text-accent transition-colors text-sm font-semibold -mt-1 mb-1"><ChevronLeft className="w-4 h-4" /> Retour aux billets</button>
                {cartItemCount === 0 ? (
                  <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border"><ShoppingCart className="w-10 h-10 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">Panier vide</p></div>
                ) : (
                  <>
                    <Card className="p-4 space-y-2">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-3">Récapitulatif billets</div>
                      {Array.from(venteCart.entries()).map(([ttId, qty]) => {
                        const tt = ticketTypes.find((t) => t.id === ttId); if (!tt) return null;
                        return (
                          <div key={ttId} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                            <div className="flex-1 min-w-0"><div className="font-semibold truncate">{tt.name}</div><div className="text-xs text-muted-foreground">{formatMGA(tt.price)} / billet</div></div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button onClick={() => removeFromCart(ttId)} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center"><Minus className="w-3.5 h-3.5" /></button>
                              <span className="w-6 text-center font-bold text-accent">{qty}</span>
                              <button onClick={() => addToCart(ttId)} className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 text-accent flex items-center justify-center"><Plus className="w-3.5 h-3.5" /></button>
                            </div>
                            <div className="text-sm font-bold text-accent shrink-0 w-20 text-right">{formatMGA(tt.price * qty)}</div>
                          </div>
                        );
                      })}
                      <div className="flex justify-between items-center pt-2 font-bold"><span>Total</span><span className="text-2xl font-display text-accent">{formatMGA(cartTotal)}</span></div>
                    </Card>
                    <Card className="p-4 space-y-3">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Infos client</div>
                      <div><label className="text-xs text-muted-foreground mb-1 block">Nom du client</label><input value={venteCustomerName} onChange={(e) => setVenteCustomerName(e.target.value)} placeholder="Ex: Rakoto Jean" className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-accent/50" /></div>
                      <div><label className="text-xs text-muted-foreground mb-1 block">Téléphone <span className="text-accent font-bold">*</span></label><input value={venteCustomerPhone} onChange={(e) => setVenteCustomerPhone(e.target.value)} placeholder="Ex: 034 12 345 67" type="tel" className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-accent/50" /></div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-3">Mode de paiement</div>
                      <div className="space-y-2">
                        {[{ key: "especes", label: "💵 Espèces", sub: "Paiement en liquide" }, { key: "orange_money", label: "🟠 Orange Money", sub: "Paiement mobile Orange" }, { key: "mvola", label: "🔴 MVola", sub: "Paiement mobile MVola" }].map((m) => (
                          <button key={m.key} onClick={() => setVentePaymentMethod(m.key)} className={`w-full p-3.5 rounded-xl border-2 text-left flex items-center gap-3 transition-all ${ventePaymentMethod === m.key ? "border-accent bg-accent/10" : "border-border"}`}>
                            <div className="flex-1"><div className="font-bold text-sm">{m.label}</div><div className="text-xs text-muted-foreground">{m.sub}</div></div>
                            {ventePaymentMethod === m.key && <CheckCircle className="w-5 h-5 text-accent shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </Card>
                  </>
                )}
                {cartItemCount > 0 && (
                  <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-background/95 backdrop-blur-sm border-t border-border">
                    {ventePhoneError && (
                      <div className="mb-3 flex items-center gap-2.5 p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-sm font-semibold animate-in slide-in-from-top-2 fade-in duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-red-400"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        Veuillez saisir le numéro de téléphone du client
                      </div>
                    )}
                    <button onClick={() => { if (!venteCustomerPhone.trim()) { setVentePhoneError(true); setTimeout(() => setVentePhoneError(false), 3000); return; } setVentePhoneError(false); setVenteMobileStep("paiement"); }} className="w-full py-4 rounded-2xl bg-accent text-black font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-accent/20">
                      <CreditCard className="w-5 h-5" /> Encaisser {formatMGA(cartTotal)}
                    </button>
                  </div>
                )}
              </div>
            )}

            {venteMobileStep === "paiement" && (
              <div className="space-y-4 pb-28">
                <button onClick={() => setVenteMobileStep("panier")} className="flex items-center gap-1.5 text-muted-foreground hover:text-accent transition-colors text-sm font-semibold -mt-1 mb-1"><ChevronLeft className="w-4 h-4" /> Retour au panier</button>
                <div className="p-4 bg-card rounded-xl border border-border flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0 text-xl font-bold text-accent">{venteCustomerPhone.charAt(0)}</div>
                  <div>{venteCustomerName && <div className="font-bold text-lg leading-tight">{venteCustomerName}</div>}<div className="font-mono text-sm text-muted-foreground">{venteCustomerPhone}</div></div>
                </div>
                <div className="p-4 bg-accent/10 rounded-xl border border-accent/20">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-3">Commande</div>
                  {Array.from(venteCart.entries()).map(([ttId, qty]) => { const tt = ticketTypes.find((t) => t.id === ttId); if (!tt) return null; return (<div key={ttId} className="flex justify-between text-sm py-2 border-b border-accent/10 last:border-0"><span className="text-muted-foreground">{tt.name} <span className="font-bold text-foreground">×{qty}</span></span><span className="font-bold">{formatMGA(tt.price * qty)}</span></div>); })}
                  <div className="flex justify-between font-bold text-xl pt-3 mt-1"><span>Total</span><span className="text-accent">{formatMGA(cartTotal)}</span></div>
                </div>
                {ventePaymentMethod === "especes" && (<div className="p-4 rounded-xl border-2 border-emerald-600/40 bg-emerald-950/40 space-y-1"><div className="font-bold text-base">💵 Paiement en Espèces</div><div className="text-sm text-muted-foreground">Montant à encaisser en liquide :</div><div className="text-3xl font-display font-black text-accent">{formatMGA(cartTotal)}</div><div className="text-xs text-emerald-400/80 pt-1">Remettez le reçu au client après validation.</div></div>)}
                {ventePaymentMethod === "orange_money" && (<div className="p-4 rounded-xl border-2 border-orange-500/40 bg-orange-950/30 space-y-1"><div className="font-bold text-base text-orange-400">🟠 Orange Money</div><div className="text-sm text-muted-foreground">Montant à recevoir via Orange Money :</div><div className="text-3xl font-display font-black text-orange-400">{formatMGA(cartTotal)}</div><div className="p-2.5 bg-black/30 rounded-lg mt-2"><div className="text-xs text-muted-foreground mb-0.5">Numéro expéditeur (client)</div><div className="font-mono font-bold text-orange-300">{venteCustomerPhone}</div></div><div className="text-xs text-orange-300/70 pt-1">Vérifiez la réception avant de valider.</div></div>)}
                {ventePaymentMethod === "mvola" && (<div className="p-4 rounded-xl border-2 border-red-500/40 bg-red-950/30 space-y-1"><div className="font-bold text-base text-red-400">🔴 MVola</div><div className="text-sm text-muted-foreground">Montant à recevoir via MVola :</div><div className="text-3xl font-display font-black text-red-400">{formatMGA(cartTotal)}</div><div className="p-2.5 bg-black/30 rounded-lg mt-2"><div className="text-xs text-muted-foreground mb-0.5">Numéro expéditeur (client)</div><div className="font-mono font-bold text-red-300">{venteCustomerPhone}</div></div><div className="text-xs text-red-300/70 pt-1">Vérifiez la réception avant de valider.</div></div>)}
                <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-background/95 backdrop-blur-sm border-t border-border">
                  <button onClick={handleVenteConfirm} className="w-full py-4 rounded-2xl bg-accent text-black font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-accent/20"><CheckCircle className="w-5 h-5" /> Valider l'encaissement</button>
                </div>
              </div>
            )}
          </div>

          {venteSales.length > 0 && (
            <div className="mt-8">
              <h3 className="font-bold font-display text-lg mb-4">Ventes de la session ({venteSales.length})</h3>
              <div className="space-y-3">
                {venteSales.map((sale) => (
                  <Card key={sale.id} className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0"><Ticket className="w-5 h-5 text-accent" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold">{sale.customerName}</div>
                      <div className="text-xs text-muted-foreground truncate">{sale.items.join(" · ")} · {sale.method === "especes" ? "💵 Espèces" : sale.method === "orange_money" ? "🟠 Orange Money" : "🔴 MVola"}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-emerald-400">{formatMGA(sale.total)}</div>
                      <div className="text-xs text-muted-foreground">{format(sale.time, "HH:mm", { locale: fr })}</div>
                    </div>
                  </Card>
                ))}
              </div>
              <div className="mt-4 p-4 bg-card rounded-xl border border-accent/20 flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Total session</span>
                <span className="text-xl font-display font-bold text-accent">{formatMGA(venteSales.reduce((s, v) => s + v.total, 0))}</span>
              </div>
            </div>
          )}

          <Dialog isOpen={venteConfirmOpen} onClose={() => setVenteConfirmOpen(false)} title="Confirmer l'encaissement">
            <div className="space-y-4">
              <div className="p-4 bg-card rounded-xl border border-border flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0 text-xl font-bold text-accent">{venteCustomerName.charAt(0).toUpperCase()}</div>
                <div><div className="text-xs text-muted-foreground mb-0.5">Client</div><div className="font-bold text-lg leading-tight">{venteCustomerName}</div><div className="text-sm text-muted-foreground font-mono">{venteCustomerPhone}</div></div>
              </div>
              <div className="p-4 bg-accent/10 rounded-xl border border-accent/20">
                <div className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-3">Détail commande</div>
                {Array.from(venteCart.entries()).map(([ttId, qty]) => { const tt = ticketTypes.find((t) => t.id === ttId); if (!tt) return null; return (<div key={ttId} className="flex justify-between text-sm py-2 border-b border-accent/10 last:border-0"><span className="text-muted-foreground">{tt.name} <span className="font-bold text-foreground">×{qty}</span></span><span className="font-bold">{formatMGA(tt.price * qty)}</span></div>); })}
                <div className="flex justify-between font-bold text-xl pt-3 mt-1"><span>Total</span><span className="text-accent">{formatMGA(cartTotal)}</span></div>
              </div>
              {ventePaymentMethod === "especes" && (<div className="p-4 rounded-xl border-2 border-emerald-600/40 bg-emerald-950/40 space-y-2"><div className="flex items-center gap-2 font-bold text-lg"><span>💵</span> Paiement en Espèces</div><div className="text-sm text-muted-foreground">Encaissez le montant en liquide :</div><div className="text-3xl font-display font-black text-accent">{formatMGA(cartTotal)}</div><div className="text-xs text-emerald-400/80 pt-1">Remettez le reçu au client après validation.</div></div>)}
              {ventePaymentMethod === "orange_money" && (<div className="p-4 rounded-xl border-2 border-orange-500/40 bg-orange-950/30 space-y-2"><div className="flex items-center gap-2 font-bold text-lg text-orange-400"><span>🟠</span> Paiement Orange Money</div><div className="text-sm text-muted-foreground">Demandez au client d'envoyer le montant via Orange Money :</div><div className="text-3xl font-display font-black text-orange-400">{formatMGA(cartTotal)}</div><div className="p-3 bg-black/30 rounded-lg mt-2"><div className="text-xs text-muted-foreground mb-0.5">Numéro expéditeur (client)</div><div className="font-mono font-bold text-lg text-orange-300">{venteCustomerPhone}</div></div><div className="text-xs text-orange-300/70">Vérifiez la réception du paiement avant de valider.</div></div>)}
              {ventePaymentMethod === "mvola" && (<div className="p-4 rounded-xl border-2 border-red-500/40 bg-red-950/30 space-y-2"><div className="flex items-center gap-2 font-bold text-lg text-red-400"><span>🔴</span> Paiement MVola</div><div className="text-sm text-muted-foreground">Demandez au client d'envoyer le montant via MVola :</div><div className="text-3xl font-display font-black text-red-400">{formatMGA(cartTotal)}</div><div className="p-3 bg-black/30 rounded-lg mt-2"><div className="text-xs text-muted-foreground mb-0.5">Numéro expéditeur (client)</div><div className="font-mono font-bold text-lg text-red-300">{venteCustomerPhone}</div></div><div className="text-xs text-red-300/70">Vérifiez la réception du paiement avant de valider.</div></div>)}
              <div className="flex gap-3 pt-1">
                <Button variant="outline" onClick={() => setVenteConfirmOpen(false)} className="flex-1">Annuler</Button>
                <button onClick={handleVenteConfirm} className="flex-1 py-3 rounded-xl bg-accent hover:bg-accent/80 text-black font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20"><CheckCircle className="w-5 h-5" /> Valider l'encaissement</button>
              </div>
            </div>
          </Dialog>
        </div>
      )}

      {/* ─── SCAN BILLET ─── */}
      {activeTab === "scan" && (
        <>
          {/* MOBILE */}
          <div className="lg:hidden">
            <style>{`
              @keyframes scanLine { 0%,100%{top:12%;} 50%{top:82%;} }
              @keyframes cornerPulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
              @keyframes resultPop { 0%{transform:scale(0.7);opacity:0;} 80%{transform:scale(1.05);} 100%{transform:scale(1);opacity:1;} }
              #qr-reader-mobile>img,#qr-reader-mobile__header_message,#qr-reader-mobile__dashboard_section_csr,#qr-reader-mobile__dashboard_section_swaplink,#qr-reader-mobile>div>button,#qr-reader-mobile select{display:none!important;}
              #qr-reader-mobile video{width:100%!important;height:100%!important;object-fit:cover!important;}
              #qr-reader-mobile{border:none!important;}
            `}</style>

            {!scanResult && (
              <div className="flex flex-col min-h-[80vh] items-center pt-4 pb-8 space-y-6">
                <div className="relative w-64 h-64 mx-auto overflow-hidden rounded-3xl">
                  {!cameraError ? (
                    <div id="qr-reader-mobile" className="absolute inset-0 rounded-3xl overflow-hidden bg-black" style={{ width: "100%", height: "100%" }} />
                  ) : (
                    <div className="absolute inset-0 rounded-3xl bg-card border-2 border-dashed border-border flex items-center justify-center">
                      <div className="text-center p-4"><ScanLine className="w-12 h-12 text-muted-foreground mx-auto mb-2" /><p className="text-xs text-muted-foreground">{cameraError}</p></div>
                    </div>
                  )}
                  {!cameraError && (
                    <>
                      <div className="absolute inset-0 pointer-events-none" style={{ animation: "cornerPulse 2s ease-in-out infinite" }}>
                        <div className="absolute top-3 left-3 w-8 h-8 border-t-4 border-l-4 border-accent rounded-tl-xl" />
                        <div className="absolute top-3 right-3 w-8 h-8 border-t-4 border-r-4 border-accent rounded-tr-xl" />
                        <div className="absolute bottom-3 left-3 w-8 h-8 border-b-4 border-l-4 border-accent rounded-bl-xl" />
                        <div className="absolute bottom-3 right-3 w-8 h-8 border-b-4 border-r-4 border-accent rounded-br-xl" />
                      </div>
                      <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent opacity-80 rounded-full" style={{ animation: "scanLine 2s linear infinite" }} />
                    </>
                  )}
                </div>
                <div className="text-center"><p className="font-bold text-lg">Scanner un QR code</p><p className="text-sm text-muted-foreground mt-1">ou saisissez manuellement ci-dessous</p></div>
                <Card className="w-full max-w-sm p-4 space-y-3">
                  <div><label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1.5 block">🎟 Clé de billet</label><input value={scanMobileKey} onChange={(e) => setScanMobileKey(e.target.value.toUpperCase())} placeholder="Ex: A1B2C3" maxLength={12} className="w-full px-4 py-3 text-lg font-mono bg-background border-2 border-border rounded-xl focus:outline-none focus:border-accent transition-colors text-center tracking-widest uppercase" /></div>
                  <div><label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1.5 block">📋 Code de confirmation</label><input value={scanMobileCode} onChange={(e) => setScanMobileCode(e.target.value.toUpperCase())} placeholder="Ex: CONF-X7Y2" maxLength={12} className="w-full px-4 py-3 text-lg font-mono bg-background border-2 border-border rounded-xl focus:outline-none focus:border-accent transition-colors text-center tracking-widest uppercase" /></div>
                  <button onClick={() => { const v = (scanMobileKey || scanMobileCode).trim(); if (v) { handleScan(v); setScanMobileKey(""); setScanMobileCode(""); } }} disabled={!scanMobileKey.trim() && !scanMobileCode.trim()} className="w-full py-3 rounded-xl bg-accent text-black font-bold hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"><ScanLine className="w-5 h-5" /> Valider</button>
                </Card>
              </div>
            )}

            {scanResult && (
              <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 text-center px-4" style={{ animation: "resultPop 0.4s ease-out" }}>
                <div className={`w-32 h-32 rounded-full flex items-center justify-center text-7xl shadow-2xl ${scanResult.status === "valid" ? "bg-emerald-500/20 border-4 border-emerald-500" : scanResult.status === "used" ? "bg-orange-500/20 border-4 border-orange-500" : "bg-red-500/20 border-4 border-red-500"}`}>
                  {scanResult.status === "valid" ? "✅" : scanResult.status === "used" ? "⚠️" : "❌"}
                </div>
                <div>
                  <div className={`text-4xl font-display font-black mb-2 ${scanResult.status === "valid" ? "text-emerald-400" : scanResult.status === "used" ? "text-orange-400" : "text-red-400"}`}>{scanResult.status === "valid" ? "VALIDE" : scanResult.status === "used" ? "DÉJÀ UTILISÉ" : "INVALIDE"}</div>
                  {scanResult.order && (
                    <div className="space-y-1">
                      <div className="font-bold text-xl">{scanResult.order.customerName}</div>
                      <div className="text-muted-foreground">{scanResult.order.ticketType.name}</div>
                      <div className="font-mono text-xs text-muted-foreground mt-2">Commande #{String(scanResult.order.id).padStart(5, "0")} · Billet {(scanResult.unitIndex ?? 0) + 1}/{scanResult.order.quantity}</div>
                    </div>
                  )}
                </div>
                {scanResult.status === "valid" && scanResult.ticketId && (
                  <button onClick={() => { handleToggleUsed(scanResult.ticketId!); setScanHistory((prev) => prev.map((h, i) => i === 0 ? { ...h, status: "used" } : h)); setScanResult((prev) => prev ? { ...prev, status: "used" } : null); }} className="w-full max-w-xs py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xl mb-4 transition-all active:scale-95">✓ Marquer comme utilisé</button>
                )}
                <button onClick={() => setScanResult(null)} className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors font-semibold mt-4"><ChevronLeft className="w-5 h-5" /> Scanner un autre billet</button>
              </div>
            )}
          </div>

          {/* DESKTOP */}
          <div className="hidden lg:block">
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center mx-auto mb-3"><ScanLine className="w-8 h-8 text-accent" /></div>
                <h3 className="font-bold font-display text-2xl mb-1">Scanner un billet</h3>
                <p className="text-muted-foreground text-sm">Saisissez la <span className="font-mono font-bold text-accent">clé de billet</span> ou le <span className="font-mono font-bold text-accent">code de confirmation</span> puis validez.</p>
              </div>

              {!scanResult ? (
                <Card className="p-5 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1.5 block">🎟 Clé de billet</label><input value={scanMobileKey} onChange={(e) => setScanMobileKey(e.target.value.toUpperCase())} onKeyDown={(e) => { if (e.key === "Enter") { const v = (scanMobileKey || scanMobileCode).trim(); if (v) { handleScan(v); setScanMobileKey(""); setScanMobileCode(""); } } }} placeholder="Ex: A1B2C3" maxLength={12} autoFocus className="w-full px-4 py-3 text-lg font-mono bg-background border-2 border-border rounded-xl focus:outline-none focus:border-accent transition-colors text-center tracking-widest uppercase" /></div>
                    <div><label className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1.5 block">📋 Code de confirmation</label><input value={scanMobileCode} onChange={(e) => setScanMobileCode(e.target.value.toUpperCase())} onKeyDown={(e) => { if (e.key === "Enter") { const v = (scanMobileCode || scanMobileKey).trim(); if (v) { handleScan(v); setScanMobileKey(""); setScanMobileCode(""); } } }} placeholder="Ex: CONF-X7Y2" maxLength={12} className="w-full px-4 py-3 text-lg font-mono bg-background border-2 border-border rounded-xl focus:outline-none focus:border-accent transition-colors text-center tracking-widest uppercase" /></div>
                  </div>
                  <button onClick={() => { const v = (scanMobileKey || scanMobileCode).trim(); if (v) { handleScan(v); setScanMobileKey(""); setScanMobileCode(""); } }} disabled={!scanMobileKey.trim() && !scanMobileCode.trim()} className="w-full py-3 rounded-xl bg-accent text-black font-bold hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"><ScanLine className="w-5 h-5" /> Valider le billet</button>
                </Card>
              ) : (
                <Card className={`p-8 text-center border-2 transition-all ${scanResult.status === "valid" ? "border-emerald-500/60 bg-emerald-950/30" : scanResult.status === "used" ? "border-orange-500/60 bg-orange-950/30" : "border-red-500/60 bg-red-950/30"}`}>
                  <div className="text-6xl mb-4">{scanResult.status === "valid" ? "✅" : scanResult.status === "used" ? "⚠️" : "❌"}</div>
                  <div className={`text-3xl font-display font-bold mb-2 ${scanResult.status === "valid" ? "text-emerald-400" : scanResult.status === "used" ? "text-orange-400" : "text-red-400"}`}>{scanResult.status === "valid" ? "BILLET VALIDE" : scanResult.status === "used" ? "DÉJÀ UTILISÉ" : "BILLET INVALIDE"}</div>
                  {scanResult.order && (
                    <div className="space-y-1 mt-4 mb-6">
                      <div className="font-bold text-foreground text-lg">{scanResult.order.customerName}</div>
                      <div className="text-muted-foreground">{scanResult.order.ticketType.name}</div>
                      <div className="font-mono text-xs text-muted-foreground mt-2">Commande #{String(scanResult.order.id).padStart(5, "0")} · Billet {(scanResult.unitIndex ?? 0) + 1}/{scanResult.order.quantity}</div>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                    {scanResult.status === "valid" && scanResult.ticketId && (
                      <button onClick={() => { handleToggleUsed(scanResult.ticketId!); setScanHistory((prev) => prev.map((h, i) => i === 0 ? { ...h, status: "used" } : h)); setScanResult((prev) => prev ? { ...prev, status: "used" } : null); }} className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg transition-all">✓ Marquer comme utilisé</button>
                    )}
                    <button onClick={() => setScanResult(null)} className="px-6 py-3 rounded-xl border border-border bg-background hover:bg-card text-foreground font-semibold transition-all flex items-center justify-center gap-2"><ChevronLeft className="w-4 h-4" /> Scanner un autre billet</button>
                  </div>
                </Card>
              )}

              {scanHistory.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold font-display text-lg">Historique ({scanHistory.length})</h4>
                    <button onClick={() => { setScanHistory([]); setScanResult(null); }} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 border border-border rounded-full px-3 py-1 transition-colors"><X className="w-3 h-3" /> Effacer</button>
                  </div>
                  <div className="space-y-2">
                    {scanHistory.map((h, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
                        <div className="text-2xl shrink-0">{h.status === "valid" ? "✅" : h.status === "used" ? "⚠️" : "❌"}</div>
                        <div className="flex-1 min-w-0"><div className="font-mono text-sm font-bold text-accent">{h.input}</div>{h.customerName && <div className="text-xs text-muted-foreground truncate">{h.customerName}</div>}</div>
                        <div className={`text-xs font-bold shrink-0 ${h.status === "valid" ? "text-emerald-400" : h.status === "used" ? "text-orange-400" : "text-red-400"}`}>{h.status === "valid" ? "Valide" : h.status === "used" ? "Utilisé" : "Invalide"}</div>
                        <div className="text-xs text-muted-foreground shrink-0">{format(h.time, "HH:mm:ss", { locale: fr })}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
      {/* ─── STAFF ADD MODAL ─── */}
      <Dialog
        isOpen={isAddStaffOpen}
        onClose={() => setIsAddStaffOpen(false)}
        title="Ajouter un membre staff"
        subtitle="Assignez un agent à l'équipe de cet événement"
        icon={<Users className="w-5 h-5" />}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <Users className="w-3.5 h-3.5 text-accent" /> Nom complet *
            </label>
            <input
              type="text" placeholder="Jean Rakoto" value={staffForm.name}
              onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
              className="flex h-11 w-full rounded-xl px-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none transition-colors"
              style={{ background: "hsl(145 20% 9%)", border: "2px solid hsl(145 40% 16%)", color: "inherit" }}
            />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <Tag className="w-3.5 h-3.5 text-accent" /> Rôle / Poste *
            </label>
            <input
              type="text" placeholder="Ex: Agent de sécurité, Hôte, Technicien..." value={staffForm.role}
              onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
              className="flex h-11 w-full rounded-xl px-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none transition-colors"
              style={{ background: "hsl(145 20% 9%)", border: "2px solid hsl(145 40% 16%)", color: "inherit" }}
            />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <Phone className="w-3.5 h-3.5 text-accent" /> Numéro de téléphone
            </label>
            <input
              type="tel" placeholder="032 XX XXX XX" value={staffForm.phone}
              onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
              className="flex h-11 w-full rounded-xl px-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none transition-colors"
              style={{ background: "hsl(145 20% 9%)", border: "2px solid hsl(145 40% 16%)", color: "inherit" }}
            />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <CheckCircle className="w-3.5 h-3.5 text-accent" /> Statut de confirmation
            </label>
            <select
              value={staffForm.status}
              onChange={(e) => setStaffForm({ ...staffForm, status: e.target.value as "confirmed" | "pending" })}
              className="flex h-11 w-full rounded-xl px-4 text-sm focus-visible:outline-none transition-colors appearance-none"
              style={{ background: "hsl(145 20% 9%)", border: "2px solid hsl(145 40% 16%)", color: "inherit" }}
            >
              <option value="pending">⏳ En attente de confirmation</option>
              <option value="confirmed">✅ Confirmé</option>
            </select>
          </div>
          {staffFormError && (
            <div className="flex items-center gap-2 text-red-400 text-sm rounded-xl px-4 py-3" style={{ background: "hsl(0 60% 10%)", border: "1.5px solid hsl(0 60% 25% / 0.5)" }}>
              <XCircle className="h-4 w-4 shrink-0" /> {staffFormError}
            </div>
          )}
          <div className="pt-3 flex gap-3 border-t" style={{ borderColor: "hsl(145 40% 14%)" }}>
            <button onClick={() => setIsAddStaffOpen(false)} className="flex-1 h-11 rounded-xl text-sm font-semibold transition-all hover:bg-white/5"
              style={{ border: "1.5px solid hsl(145 30% 16%)", color: "hsl(145 20% 70%)" }}>Annuler</button>
            <button
              onClick={() => {
                if (!staffForm.name.trim() || !staffForm.role.trim()) {
                  setStaffFormError("Le nom et le rôle sont obligatoires.");
                  return;
                }
                setStaffFormError("");
                setIsAddStaffOpen(false);
              }}
              className="flex-1 h-11 rounded-xl text-sm font-semibold text-black transition-all hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: "hsl(145 80% 42%)" }}>
              <UserCheck className="w-4 h-4" /> Ajouter au staff
            </button>
          </div>
        </div>
      </Dialog>

    </AdminLayout>
  );
}
