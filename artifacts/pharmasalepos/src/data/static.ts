export type TicketType = {
  id: number;
  eventId: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  soldCount: number;
};

export type Event = {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  city: string;
  startDate: string;
  endDate: string;
  totalCapacity: number;
  soldTickets: number;
  status: "upcoming" | "ongoing" | "past";
  imageUrl?: string | null;
  ticketTypes: TicketType[];
  organizerId?: string;
};

export type Order = {
  id: number;
  customerPhone: string;
  customerName: string;
  customerAddress: string;
  paymentMethod: string;
  status: "pending" | "confirmed" | "cancelled";
  quantity: number;
  totalAmount: number;
  event: Event;
  ticketType: TicketType;
  createdAt: string;
};

export type AdminUser = {
  id: number;
  name: string;
  phone: string;
  address: string;
  createdAt: string;
  orderCount: number;
};

export type Organizer = {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  status: "active" | "suspended" | "pending";
  password?: string;
  createdAt: string;
};

export const STATIC_EVENTS: Event[] = [
  {
    id: 1,
    title: "Malagasy Music Night — Les Légendes Reviennent",
    description:
      "Une nuit inoubliable dédiée aux légendes de la musique malgache. Retrouvez les plus grands artistes de l'île sur une même scène pour un concert exceptionnel au Palais des Sports de Mahamasina. Ambiance garantie, son cristallin, lumières époustouflantes.",
    category: "Concert",
    location: "Palais des Sports Mahamasina",
    city: "Antananarivo",
    startDate: "2026-05-15T19:00:00.000Z",
    endDate: "2026-05-15T23:00:00.000Z",
    totalCapacity: 5000,
    soldTickets: 3200,
    status: "upcoming",
    imageUrl: null,
    organizerId: "org-1",
    ticketTypes: [
      { id: 101, eventId: 1, name: "Standard", description: "Accès tribune générale", price: 15000, quantity: 3000, soldCount: 2100 },
      { id: 102, eventId: 1, name: "VIP", description: "Accès loges, boissons offertes", price: 50000, quantity: 500, soldCount: 480 },
      { id: 103, eventId: 1, name: "Carré Or", description: "Première rangée, meet & greet après concert", price: 120000, quantity: 200, soldCount: 180 },
      { id: 104, eventId: 1, name: "Tarif Réduit", description: "Étudiants et enfants (-15 ans)", price: 8000, quantity: 1300, soldCount: 440 },
    ],
  },
  {
    id: 2,
    title: "Festival de Jazz de Nosy Be",
    description:
      "Le festival de jazz le plus attendu de l'océan Indien fait son retour à Nosy Be. Trois jours de musique live, de cuisine fusion et de couchers de soleil magiques sur la plage d'Ambatoloaka. Artistes locaux et internationaux se réuniront pour célébrer le jazz sous les étoiles.",
    category: "Festival",
    location: "Plage d'Ambatoloaka",
    city: "Nosy Be",
    startDate: "2026-06-20T16:00:00.000Z",
    endDate: "2026-06-22T23:59:00.000Z",
    totalCapacity: 2000,
    soldTickets: 1500,
    status: "upcoming",
    imageUrl: null,
    organizerId: "org-2",
    ticketTypes: [
      { id: 201, eventId: 2, name: "Pass 1 jour", description: "Accès 1 journée au choix", price: 25000, quantity: 600, soldCount: 420 },
      { id: 202, eventId: 2, name: "Pass 3 jours", description: "Accès aux 3 jours + camping", price: 60000, quantity: 800, soldCount: 750 },
      { id: 203, eventId: 2, name: "VIP Weekend", description: "Accès VIP, dîner gala inclus", price: 150000, quantity: 200, soldCount: 180 },
      { id: 204, eventId: 2, name: "Étudiant", description: "Sur présentation de carte étudiante", price: 12000, quantity: 400, soldCount: 150 },
    ],
  },
  {
    id: 3,
    title: "Derby Football — Barea vs Fosa Juniors",
    description:
      "Le choc des titans du football malgache ! Le derby le plus attendu de la saison oppose les Barea au Fosa Juniors au Stade Barea de Mahamasina. Une atmosphère électrique, des tribunes combles, et un match au sommet pour les amateurs de ballon rond.",
    category: "Sport",
    location: "Stade Barea de Mahamasina",
    city: "Antananarivo",
    startDate: "2026-05-30T14:00:00.000Z",
    endDate: "2026-05-30T16:30:00.000Z",
    totalCapacity: 20000,
    soldTickets: 18500,
    status: "upcoming",
    imageUrl: null,
    organizerId: "org-1",
    ticketTypes: [
      { id: 301, eventId: 3, name: "Tribune Populaire", description: "Accès tribune nord ou sud", price: 5000, quantity: 12000, soldCount: 11200 },
      { id: 302, eventId: 3, name: "Tribune Couverte", description: "Place assise couverte", price: 15000, quantity: 6000, soldCount: 5800 },
      { id: 303, eventId: 3, name: "Loge VIP", description: "Loge privée, catering inclus", price: 80000, quantity: 500, soldCount: 480 },
      { id: 304, eventId: 3, name: "Pack Famille", description: "2 adultes + 2 enfants tribune couverte", price: 25000, quantity: 1500, soldCount: 1020 },
    ],
  },
  {
    id: 4,
    title: "Tech & Innovation Summit Madagascar 2026",
    description:
      "Le plus grand rassemblement tech de Madagascar réunit entrepreneurs, développeurs, investisseurs et acteurs de l'écosystème numérique africain. Keynotes, ateliers pratiques, networking, hackathon et présentation des startups les plus prometteuses de l'île.",
    category: "Conférence",
    location: "Hôtel Carlton Anosy",
    city: "Antananarivo",
    startDate: "2026-07-10T08:00:00.000Z",
    endDate: "2026-07-11T18:00:00.000Z",
    totalCapacity: 800,
    soldTickets: 420,
    status: "upcoming",
    imageUrl: null,
    organizerId: "org-3",
    ticketTypes: [
      { id: 401, eventId: 4, name: "Standard", description: "Accès conférences et networking", price: 45000, quantity: 500, soldCount: 280 },
      { id: 402, eventId: 4, name: "Premium", description: "Accès ateliers exclusifs + repas", price: 120000, quantity: 200, soldCount: 110 },
      { id: 403, eventId: 4, name: "Startup Pack", description: "Stand exposition inclus, pitch session", price: 250000, quantity: 100, soldCount: 30 },
    ],
  },
  {
    id: 5,
    title: "Soirée Électro — Pulse Beach Club",
    description:
      "La soirée électronique la plus hot du moment débarque au Pulse Beach Club de Toamasina ! DJs internationaux, light show futuriste, piscine ouverte toute la nuit, et une playlist qui traverse house, techno et deep électro. Une nuit qui restera dans les mémoires.",
    category: "Soirée",
    location: "Pulse Beach Club",
    city: "Toamasina",
    startDate: "2026-05-24T21:00:00.000Z",
    endDate: "2026-05-25T05:00:00.000Z",
    totalCapacity: 1000,
    soldTickets: 780,
    status: "upcoming",
    imageUrl: null,
    organizerId: "org-2",
    ticketTypes: [
      { id: 501, eventId: 5, name: "Early Bird", description: "Tarif réduit avant 23h", price: 20000, quantity: 300, soldCount: 300 },
      { id: 502, eventId: 5, name: "Standard", description: "Entrée après 23h", price: 35000, quantity: 500, soldCount: 380 },
      { id: 503, eventId: 5, name: "Table VIP", description: "Table réservée, bouteille offerte", price: 200000, quantity: 200, soldCount: 100 },
    ],
  },
  {
    id: 6,
    title: "Hira Gasy Grande Nuit — Troupe Manalandy",
    description:
      "La troupe Manalandy vous invite à une soirée Hira Gasy authentique. Danses traditionnelles, poésie en prose, chants polyphoniques et costumes d'époque vous transporteront dans l'univers culturel malgache le plus pur. Un moment de partage et de célébration des racines.",
    category: "Concert",
    location: "Palais de la Reine Manjakamiadana",
    city: "Antananarivo",
    startDate: "2026-06-05T17:00:00.000Z",
    endDate: "2026-06-05T22:00:00.000Z",
    totalCapacity: 1200,
    soldTickets: 950,
    status: "upcoming",
    imageUrl: null,
    organizerId: "org-1",
    ticketTypes: [
      { id: 601, eventId: 6, name: "Standard", price: 10000, quantity: 800, soldCount: 680 },
      { id: 602, eventId: 6, name: "VIP", description: "Tribune d'honneur, place assise", price: 30000, quantity: 400, soldCount: 270 },
    ],
  },
  {
    id: 7,
    title: "Marathon des Rova — Édition 2026",
    description:
      "Le marathon emblématique d'Antananarivo traverse les plus beaux sites historiques de la capitale. 42 km à travers les collines sacrées, passant devant les rova (palais royaux), les marchés colorés et les rizières en terrasse. Catégories 5 km, 21 km et 42 km.",
    category: "Sport",
    location: "Place du 13 mai",
    city: "Antananarivo",
    startDate: "2026-09-06T05:30:00.000Z",
    endDate: "2026-09-06T14:00:00.000Z",
    totalCapacity: 3000,
    soldTickets: 1200,
    status: "upcoming",
    imageUrl: null,
    organizerId: "org-3",
    ticketTypes: [
      { id: 701, eventId: 7, name: "5 km", price: 8000, quantity: 1000, soldCount: 480 },
      { id: 702, eventId: 7, name: "21 km", price: 15000, quantity: 1200, soldCount: 520 },
      { id: 703, eventId: 7, name: "42 km (Marathon)", price: 25000, quantity: 800, soldCount: 200 },
    ],
  },
  {
    id: 8,
    title: "Fashion Week Antananarivo — Saison 3",
    description:
      "La scène mode de Madagascar s'invite au Grand Palais de Tsimbazaza pour trois jours de défilés, collections et expositions. Couturiers locaux, designers émergents et créateurs internationaux présenteront leurs dernières collections inspirées des tissus et motifs malgaches.",
    category: "Conférence",
    location: "Grand Palais de Tsimbazaza",
    city: "Antananarivo",
    startDate: "2025-12-10T10:00:00.000Z",
    endDate: "2025-12-12T20:00:00.000Z",
    totalCapacity: 600,
    soldTickets: 600,
    status: "past",
    imageUrl: null,
    organizerId: "org-2",
    ticketTypes: [
      { id: 801, eventId: 8, name: "Jour 1", price: 20000, quantity: 200, soldCount: 200 },
      { id: 802, eventId: 8, name: "Pass 3 jours", price: 50000, quantity: 400, soldCount: 400 },
    ],
  },
];

export const STATIC_ORDERS: Order[] = [
  {
    id: 1001,
    customerPhone: "+261341234567",
    customerName: "Jean Rakoto",
    customerAddress: "Antananarivo, Analamanga",
    paymentMethod: "orange_money",
    status: "confirmed",
    quantity: 2,
    totalAmount: 30000,
    event: STATIC_EVENTS[0],
    ticketType: STATIC_EVENTS[0].ticketTypes[0],
    createdAt: "2026-04-01T10:00:00.000Z",
  },
  {
    id: 1002,
    customerPhone: "+261321234567",
    customerName: "Marie Rasoa",
    customerAddress: "Toamasina, Atsinanana",
    paymentMethod: "mvola",
    status: "confirmed",
    quantity: 1,
    totalAmount: 50000,
    event: STATIC_EVENTS[0],
    ticketType: STATIC_EVENTS[0].ticketTypes[1],
    createdAt: "2026-04-02T14:30:00.000Z",
  },
  {
    id: 1003,
    customerPhone: "+261381234567",
    customerName: "Hery Rasoamanarivo",
    customerAddress: "Fianarantsoa, Haute Matsiatra",
    paymentMethod: "mastercard",
    status: "confirmed",
    quantity: 3,
    totalAmount: 75000,
    event: STATIC_EVENTS[1],
    ticketType: STATIC_EVENTS[1].ticketTypes[0],
    createdAt: "2026-04-03T09:15:00.000Z",
  },
  {
    id: 1004,
    customerPhone: "+261341234568",
    customerName: "Noro Andriamahaly",
    customerAddress: "Antananarivo, Analamanga",
    paymentMethod: "orange_money",
    status: "pending",
    quantity: 1,
    totalAmount: 15000,
    event: STATIC_EVENTS[2],
    ticketType: STATIC_EVENTS[2].ticketTypes[0],
    createdAt: "2026-04-04T16:00:00.000Z",
  },
  {
    id: 1005,
    customerPhone: "+261331234567",
    customerName: "Tiana Ratsimbazafy",
    customerAddress: "Mahajanga, Boeny",
    paymentMethod: "mvola",
    status: "confirmed",
    quantity: 2,
    totalAmount: 90000,
    event: STATIC_EVENTS[3],
    ticketType: STATIC_EVENTS[3].ticketTypes[1],
    createdAt: "2026-04-05T11:00:00.000Z",
  },
  {
    id: 1006,
    customerPhone: "+261341234569",
    customerName: "Lalao Rabezandrina",
    customerAddress: "Antananarivo, Analamanga",
    paymentMethod: "orange_money",
    status: "cancelled",
    quantity: 1,
    totalAmount: 20000,
    event: STATIC_EVENTS[4],
    ticketType: STATIC_EVENTS[4].ticketTypes[0],
    createdAt: "2026-04-06T08:00:00.000Z",
  },
  {
    id: 1007,
    customerPhone: "+261341234570",
    customerName: "Fanja Andriamanana",
    customerAddress: "Antananarivo, Analamanga",
    paymentMethod: "especes",
    status: "confirmed",
    quantity: 2,
    totalAmount: 30000,
    event: STATIC_EVENTS[0],
    ticketType: STATIC_EVENTS[0].ticketTypes[0],
    createdAt: "2026-04-07T10:30:00.000Z",
  },
  {
    id: 1008,
    customerPhone: "+261331234570",
    customerName: "Mamy Rakotoarison",
    customerAddress: "Toamasina, Atsinanana",
    paymentMethod: "especes",
    status: "confirmed",
    quantity: 1,
    totalAmount: 50000,
    event: STATIC_EVENTS[1],
    ticketType: STATIC_EVENTS[1].ticketTypes[1],
    createdAt: "2026-04-07T14:00:00.000Z",
  },
];

export const STATIC_USERS: AdminUser[] = [
  { id: 1, name: "Jean Rakoto", phone: "+261341234567", address: "Antananarivo", createdAt: "2026-03-01T10:00:00.000Z", orderCount: 3 },
  { id: 2, name: "Marie Rasoa", phone: "+261321234567", address: "Toamasina", createdAt: "2026-03-05T14:00:00.000Z", orderCount: 1 },
  { id: 3, name: "Hery Rasoamanarivo", phone: "+261381234567", address: "Fianarantsoa", createdAt: "2026-03-10T09:00:00.000Z", orderCount: 2 },
  { id: 4, name: "Noro Andriamahaly", phone: "+261341234568", address: "Antananarivo", createdAt: "2026-03-15T16:00:00.000Z", orderCount: 1 },
  { id: 5, name: "Tiana Ratsimbazafy", phone: "+261331234567", address: "Mahajanga", createdAt: "2026-03-20T11:00:00.000Z", orderCount: 4 },
  { id: 6, name: "Lalao Rabezandrina", phone: "+261341234569", address: "Antananarivo", createdAt: "2026-03-25T08:00:00.000Z", orderCount: 2 },
  { id: 7, name: "Fara Andrianambinina", phone: "+261321234568", address: "Antsiranana", createdAt: "2026-04-01T10:00:00.000Z", orderCount: 0 },
];

export const STATIC_ORGANIZERS: Organizer[] = [
  { id: "org-1", name: "Andry Rakotondrabe", company: "AEvent Production", phone: "+261341111111", email: "andry@aevent.mg", website: "www.aevent.mg", status: "active", password: "organizer123", createdAt: "2026-01-10T10:00:00.000Z" },
  { id: "org-2", name: "Soa Randriamampionona", company: "Île de Fête Events", phone: "+261322222222", email: "soa@ilefete.mg", website: "www.ilefete.mg", status: "active", password: "organizer123", createdAt: "2026-01-15T14:00:00.000Z" },
  { id: "org-3", name: "Mamy Razafindrakoto", company: "ProConf Madagascar", phone: "+261383333333", email: "mamy@proconf.mg", website: "www.proconf.mg", status: "suspended", password: "organizer123", createdAt: "2026-02-01T09:00:00.000Z" },
];

export const STATIC_ADMIN_STATS = {
  totalRevenue: 12450000,
  totalOrders: 6,
  totalTicketsSold: 10,
  totalEvents: STATIC_EVENTS.length,
  revenueGrowth: 12,
  ordersGrowth: 8,
};

export const STATIC_REVENUE_BY_MONTH = [
  { month: "Nov", revenue: 800000 },
  { month: "Déc", revenue: 1200000 },
  { month: "Jan", revenue: 950000 },
  { month: "Fév", revenue: 1500000 },
  { month: "Mar", revenue: 1800000 },
  { month: "Avr", revenue: 2200000 },
];

export const STATIC_SALES_BY_EVENT = STATIC_EVENTS.slice(0, 5).map(e => ({
  name: e.title.substring(0, 20) + "…",
  sales: e.soldTickets,
}));

export const STATIC_PAYMENT_STATS = [
  { method: "Orange Money", count: 45 },
  { method: "MVola", count: 30 },
  { method: "Mastercard", count: 25 },
];

export function useListEvents(opts?: { category?: string; search?: string; status?: string }) {
  let events = [...STATIC_EVENTS];
  if (opts?.category) events = events.filter(e => e.category === opts.category);
  if (opts?.search) {
    const q = opts.search.toLowerCase();
    events = events.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.city.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q)
    );
  }
  if (opts?.status) events = events.filter(e => e.status === opts.status);
  return { data: events, isLoading: false };
}

export function useGetEvent(id: number) {
  const event = STATIC_EVENTS.find(e => e.id === id) ?? null;
  return { data: event, isLoading: false };
}

export function useListOrders(opts?: { status?: string; userId?: number }) {
  let orders = [...STATIC_ORDERS];
  if (opts?.status) orders = orders.filter(o => o.status === opts.status);
  return { data: orders, isLoading: false };
}

export function useGetOrder(id: number) {
  const order = STATIC_ORDERS.find(o => o.id === id) ?? null;
  return { data: order, isLoading: false };
}

const ORDERS_KEY = "inbox_ticket_static_orders";

function getSavedOrders(): Order[] {
  try { return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]"); } catch { return []; }
}

export function useCreateOrderSimulated() {
  return async (params: {
    eventId: number;
    ticketTypeId: number;
    quantity: number;
    paymentMethod: string;
    customerPhone: string;
    customerName: string;
    customerAddress: string;
  }): Promise<Order> => {
    await new Promise(r => setTimeout(r, 3500));
    const event = STATIC_EVENTS.find(e => e.id === params.eventId)!;
    const ticketType = event.ticketTypes.find(t => t.id === params.ticketTypeId)!;
    const existingOrders = getSavedOrders();
    const newId = 2000 + existingOrders.length + 1;
    const order: Order = {
      id: newId,
      customerPhone: params.customerPhone,
      customerName: params.customerName,
      customerAddress: params.customerAddress,
      paymentMethod: params.paymentMethod,
      status: "confirmed",
      quantity: params.quantity,
      totalAmount: ticketType.price * params.quantity,
      event,
      ticketType,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(ORDERS_KEY, JSON.stringify([...existingOrders, order]));
    return order;
  };
}

export function useMyOrders(customerPhone?: string): Order[] {
  const saved = getSavedOrders();
  const all = [...STATIC_ORDERS, ...saved];
  if (!customerPhone) return all;
  return all.filter(o => o.customerPhone.replace(/\s/g, "") === customerPhone.replace(/\s/g, ""));
}

export function getOrderById(id: number): Order | null {
  const all = [...STATIC_ORDERS, ...getSavedOrders()];
  return all.find(o => o.id === id) ?? null;
}
