export type Event = {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  city: string;
  startDate: string;
  endDate: string;
  imageUrl: string | null;
  status: "upcoming" | "ongoing" | "past" | "cancelled";
  totalCapacity: number;
  soldTickets: number;
  organizerId: number;
  ticketTypes: TicketType[];
};

export type TicketType = {
  id: number;
  eventId: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  quantity: number;
  soldCount: number;
};

export type Order = {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  ticketTypeId: number;
  eventId: number;
  quantity: number;
  totalAmount: number;
  currency: string;
  status: "pending" | "confirmed" | "cancelled" | "refunded";
  paymentMethod: "orange_money" | "mvola" | "especes";
  createdAt: string;
  event?: Event;
  ticketType?: TicketType;
};

export type Organizer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "organisateur" | "agent_vente" | "agent_scan";
  eventId?: number;
};

export type AdminStats = {
  totalRevenue: number;
  totalOrders: number;
  totalTicketsSold: number;
  totalEvents: number;
  activeEvents: number;
  pendingOrders: number;
  revenueGrowth: number;
  ordersGrowth: number;
};

export const EVENTS: Event[] = [
  {
    id: 1,
    title: "Dîner Gala des Stars 2026",
    description: "Une soirée d'exception réunissant les plus grandes célébrités de Madagascar dans un cadre luxueux. Au programme : gastronomie raffinée, performances artistiques exclusives et networking haut de gamme.",
    category: "Soirée",
    location: "Hôtel Carlton Anosy",
    city: "Antananarivo",
    startDate: "2026-04-15T19:00:00.000Z",
    endDate: "2026-04-15T23:59:00.000Z",
    imageUrl: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80",
    status: "upcoming",
    totalCapacity: 400,
    soldTickets: 287,
    organizerId: 1,
    ticketTypes: [
      { id: 1, eventId: 1, name: "Table VIP", description: "Table ronde de 8 personnes, menu gastronomique complet, champagne offert", price: 850000, currency: "MGA", quantity: 20, soldCount: 16 },
      { id: 2, eventId: 1, name: "Place assise Premium", description: "Siège numéroté, accès à la soirée complète, menu inclus", price: 320000, currency: "MGA", quantity: 200, soldCount: 143 },
      { id: 3, eventId: 1, name: "Entrée Cocktail", description: "Accès cocktail 19h-21h uniquement, sans menu", price: 120000, currency: "MGA", quantity: 180, soldCount: 128 },
    ],
  },
  {
    id: 2,
    title: "Festival Afro Beats Antananarivo",
    description: "Le plus grand festival de musique africaine de Madagascar. Trois jours de concerts non-stop avec les meilleurs artistes locaux et internationaux. Ambiance festive garantie !",
    category: "Festival",
    location: "Stade Municipal de Mahamasina",
    city: "Antananarivo",
    startDate: "2026-05-01T16:00:00.000Z",
    endDate: "2026-05-03T23:00:00.000Z",
    imageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
    status: "upcoming",
    totalCapacity: 5000,
    soldTickets: 3847,
    organizerId: 2,
    ticketTypes: [
      { id: 4, eventId: 2, name: "Pass 3 Jours VIP", description: "Accès VIP 3 jours, carré or, boissons incluses", price: 180000, currency: "MGA", quantity: 500, soldCount: 412 },
      { id: 5, eventId: 2, name: "Pass 3 Jours", description: "Accès complet 3 jours dans la fosse principale", price: 75000, currency: "MGA", quantity: 3000, soldCount: 2541 },
      { id: 6, eventId: 2, name: "Pass Journée", description: "Accès pour une journée au choix", price: 35000, currency: "MGA", quantity: 1500, soldCount: 894 },
    ],
  },
  {
    id: 3,
    title: "Concert Jazz & Blues Classique",
    description: "Une soirée intime dédiée au jazz et aux blues dans la salle historique du Palais de la Culture. Dress code élégant requis.",
    category: "Concert",
    location: "Palais de la Culture",
    city: "Antananarivo",
    startDate: "2026-03-20T20:30:00.000Z",
    endDate: "2026-03-20T23:30:00.000Z",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
    status: "past",
    totalCapacity: 800,
    soldTickets: 756,
    organizerId: 1,
    ticketTypes: [
      { id: 7, eventId: 3, name: "Loge Privée", description: "Loge pour 4 personnes, vue imprenable sur la scène", price: 560000, currency: "MGA", quantity: 20, soldCount: 20 },
      { id: 8, eventId: 3, name: "Orchestre", description: "Places numérotées en orchestre, excellent son", price: 95000, currency: "MGA", quantity: 500, soldCount: 487 },
      { id: 9, eventId: 3, name: "Balcon", description: "Places balcon, vue panoramique sur toute la salle", price: 45000, currency: "MGA", quantity: 280, soldCount: 249 },
    ],
  },
  {
    id: 4,
    title: "Sommet Business Africa Madagascar",
    description: "Conférence internationale réunissant entrepreneurs, investisseurs et décideurs africains. Panels, networking et ateliers thématiques sur l'économie africaine.",
    category: "Conférence",
    location: "Centre de Conférences Ivato",
    city: "Antananarivo",
    startDate: "2026-06-10T08:00:00.000Z",
    endDate: "2026-06-11T18:00:00.000Z",
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    status: "upcoming",
    totalCapacity: 1200,
    soldTickets: 543,
    organizerId: 3,
    ticketTypes: [
      { id: 10, eventId: 4, name: "Pass Executive", description: "Accès VIP, déjeuners inclus, accès aux ateliers privés", price: 950000, currency: "MGA", quantity: 100, soldCount: 67 },
      { id: 11, eventId: 4, name: "Pass Professionnel", description: "Accès conférences et networking, pause-café incluse", price: 350000, currency: "MGA", quantity: 700, soldCount: 312 },
      { id: 12, eventId: 4, name: "Pass Étudiant", description: "Accès aux conférences publiques uniquement", price: 45000, currency: "MGA", quantity: 400, soldCount: 164 },
    ],
  },
  {
    id: 5,
    title: "Nuit de la Mode Malgache",
    description: "Défilé de mode célébrant les créateurs malgaches. Une nuit haute en couleurs mettant à l'honneur le lamba, le raphia et les tissus traditionnels revisités par des designers contemporains.",
    category: "Mode",
    location: "Alliance Française",
    city: "Antananarivo",
    startDate: "2026-07-05T18:00:00.000Z",
    endDate: "2026-07-05T22:00:00.000Z",
    imageUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80",
    status: "upcoming",
    totalCapacity: 600,
    soldTickets: 198,
    organizerId: 2,
    ticketTypes: [
      { id: 13, eventId: 5, name: "Front Row VIP", description: "Premier rang, champagne, accès backstage après le défilé", price: 420000, currency: "MGA", quantity: 60, soldCount: 38 },
      { id: 14, eventId: 5, name: "Tribune", description: "Vue dégagée sur le podium, programme du défilé offert", price: 150000, currency: "MGA", quantity: 340, soldCount: 112 },
      { id: 15, eventId: 5, name: "Debout", description: "Accès general, standing debout", price: 60000, currency: "MGA", quantity: 200, soldCount: 48 },
    ],
  },
  {
    id: 6,
    title: "Soirée Électro Underground",
    description: "La soirée électronique la plus attendue de l'année. DJ sets internationaux jusqu'au lever du soleil dans un lieu secret dévoilé 48h avant l'événement.",
    category: "Club",
    location: "Lieu secret (révélé J-2)",
    city: "Antananarivo",
    startDate: "2026-08-15T23:00:00.000Z",
    endDate: "2026-08-16T06:00:00.000Z",
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
    status: "upcoming",
    totalCapacity: 2000,
    soldTickets: 1247,
    organizerId: 1,
    ticketTypes: [
      { id: 16, eventId: 6, name: "Table Privée", description: "Table réservée pour 6 personnes, bouteilles incluses", price: 1200000, currency: "MGA", quantity: 50, soldCount: 41 },
      { id: 17, eventId: 6, name: "Early Bird", description: "Accès dès 23h, prix préférentiel", price: 45000, currency: "MGA", quantity: 800, soldCount: 764 },
      { id: 18, eventId: 6, name: "Standard", description: "Accès général", price: 75000, currency: "MGA", quantity: 1150, soldCount: 442 },
    ],
  },
];

export const ORDERS: Order[] = [
  { id: 1, customerName: "Rakoto Jean", customerEmail: "rakoto@example.com", customerPhone: "+261340000001", ticketTypeId: 2, eventId: 1, quantity: 2, totalAmount: 640000, currency: "MGA", status: "confirmed", paymentMethod: "orange_money", createdAt: "2026-03-10T14:23:00.000Z" },
  { id: 2, customerName: "Rasoa Marie", customerEmail: "rasoa@example.com", customerPhone: "+261340000002", ticketTypeId: 5, eventId: 2, quantity: 4, totalAmount: 300000, currency: "MGA", status: "confirmed", paymentMethod: "mvola", createdAt: "2026-03-11T09:15:00.000Z" },
  { id: 3, customerName: "Rabe Pierre", customerEmail: "rabe@example.com", customerPhone: "+261340000003", ticketTypeId: 8, eventId: 3, quantity: 2, totalAmount: 190000, currency: "MGA", status: "confirmed", paymentMethod: "especes", createdAt: "2026-02-20T11:00:00.000Z" },
  { id: 4, customerName: "Razafy Aina", customerEmail: "razafy@example.com", customerPhone: "+261340000004", ticketTypeId: 1, eventId: 1, quantity: 1, totalAmount: 850000, currency: "MGA", status: "confirmed", paymentMethod: "orange_money", createdAt: "2026-03-12T16:45:00.000Z" },
  { id: 5, customerName: "Andriantsoa Lova", customerEmail: "andriantsoa@example.com", customerPhone: "+261340000005", ticketTypeId: 4, eventId: 2, quantity: 2, totalAmount: 360000, currency: "MGA", status: "confirmed", paymentMethod: "mvola", createdAt: "2026-03-15T10:30:00.000Z" },
  { id: 6, customerName: "Ranaivo Hery", customerEmail: "ranaivo@example.com", customerPhone: "+261340000006", ticketTypeId: 11, eventId: 4, quantity: 1, totalAmount: 350000, currency: "MGA", status: "pending", paymentMethod: "orange_money", createdAt: "2026-03-18T08:22:00.000Z" },
  { id: 7, customerName: "Rakotondrabe Tiana", customerEmail: "tiana@example.com", customerPhone: "+261340000007", ticketTypeId: 13, eventId: 5, quantity: 2, totalAmount: 840000, currency: "MGA", status: "confirmed", paymentMethod: "especes", createdAt: "2026-03-19T14:00:00.000Z" },
  { id: 8, customerName: "Razanatsoa Clara", customerEmail: "clara@example.com", customerPhone: "+261340000008", ticketTypeId: 17, eventId: 6, quantity: 3, totalAmount: 135000, currency: "MGA", status: "confirmed", paymentMethod: "mvola", createdAt: "2026-03-20T20:10:00.000Z" },
  { id: 9, customerName: "Andriamampionona Solo", customerEmail: "solo@example.com", customerPhone: "+261340000009", ticketTypeId: 6, eventId: 2, quantity: 5, totalAmount: 175000, currency: "MGA", status: "cancelled", paymentMethod: "orange_money", createdAt: "2026-03-05T12:00:00.000Z" },
  { id: 10, customerName: "Randriamanana Fidy", customerEmail: "fidy@example.com", customerPhone: "+261340000010", ticketTypeId: 16, eventId: 6, quantity: 1, totalAmount: 1200000, currency: "MGA", status: "confirmed", paymentMethod: "especes", createdAt: "2026-03-22T18:30:00.000Z" },
];

export const ORGANIZERS: Organizer[] = [
  { id: 1, name: "Ratsimba Events", email: "ratsimba@inbox.mg", phone: "+261320000001", role: "organisateur", eventId: 1 },
  { id: 2, name: "Rakoto Andriantsoa", email: "rka@inbox.mg", phone: "+261320000002", role: "organisateur", eventId: 2 },
  { id: 3, name: "Solofo Andry", email: "solofo@inbox.mg", phone: "+261320000003", role: "agent_vente", eventId: 1 },
  { id: 4, name: "Miora Rasoa", email: "miora@inbox.mg", phone: "+261320000004", role: "agent_scan", eventId: 1 },
  { id: 5, name: "Tahiry Ravelo", email: "tahiry@inbox.mg", phone: "+261320000005", role: "agent_vente", eventId: 2 },
  { id: 6, name: "Maeva Randria", email: "maeva@inbox.mg", phone: "+261320000006", role: "agent_scan", eventId: 2 },
];

export const ADMIN_STATS: AdminStats = {
  totalRevenue: 47_820_000,
  totalOrders: 40,
  totalTicketsSold: 89,
  totalEvents: 6,
  activeEvents: 4,
  pendingOrders: 3,
  revenueGrowth: 23.5,
  ordersGrowth: 18.2,
};

export const MONTHLY_REVENUE = [
  { month: "Nov", revenue: 3_200_000, orders: 8 },
  { month: "Déc", revenue: 5_800_000, orders: 14 },
  { month: "Jan", revenue: 4_100_000, orders: 10 },
  { month: "Fév", revenue: 7_600_000, orders: 18 },
  { month: "Mar", revenue: 9_200_000, orders: 22 },
  { month: "Avr", revenue: 12_400_000, orders: 29 },
  { month: "Mai", revenue: 5_520_000, orders: 13 },
];

export const PAYMENT_STATS = [
  { method: "Orange Money", count: 18, amount: 22_400_000, percentage: 46.8 },
  { method: "MVola", count: 14, amount: 15_200_000, percentage: 31.8 },
  { method: "Espèces", count: 8, amount: 10_220_000, percentage: 21.4 },
];

export function getEvent(id: number): Event | undefined {
  return EVENTS.find((e) => e.id === id);
}

export function getOrdersForEvent(eventId: number): Order[] {
  const event = getEvent(eventId);
  if (!event) return [];
  return ORDERS.filter((o) => o.eventId === eventId).map((o) => ({
    ...o,
    event,
    ticketType: event.ticketTypes.find((t) => t.id === o.ticketTypeId),
  }));
}

export function getOrdersForCustomer(phone: string): Order[] {
  return ORDERS.filter((o) => o.customerPhone === phone).map((o) => ({
    ...o,
    event: getEvent(o.eventId),
    ticketType: getEvent(o.eventId)?.ticketTypes.find((t) => t.id === o.ticketTypeId),
  }));
}
