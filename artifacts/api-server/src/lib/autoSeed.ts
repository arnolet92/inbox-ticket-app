import { db, eventsTable, ticketTypesTable, ordersTable, paymentsTable } from "@workspace/db";

export async function autoSeedIfEmpty() {
  const existing = await db.select().from(eventsTable);
  if (existing.length > 0) return;

  console.log("Production database empty — auto-seeding demo data...");

  const events = await db.insert(eventsTable).values([
    {
      title: "Dîner Gala des Stars 2026",
      description: "Une soirée inoubliable avec les plus grandes stars de la musique malgache et africaine. Venez vivre une expérience unique au cœur de la capitale.",
      category: "Soirée",
      location: "Hôtel Colbert, Salle Panorama",
      city: "Antananarivo",
      startDate: new Date("2026-04-15T19:00:00"),
      endDate: new Date("2026-04-15T23:59:00"),
      imageUrl: "/images/event-soiree.png",
      status: "upcoming",
      totalCapacity: 500,
      soldTickets: 287,
    },
    {
      title: "Festival Jazz de Madagascar",
      description: "Le plus grand festival de jazz de Madagascar réunit des artistes locaux et internationaux pour 3 jours de musique exceptionnelle.",
      category: "Festival",
      location: "Palais des Sports, Mahamasina",
      city: "Antananarivo",
      startDate: new Date("2026-05-10T16:00:00"),
      endDate: new Date("2026-05-12T23:00:00"),
      imageUrl: "/images/event-festival.png",
      status: "upcoming",
      totalCapacity: 2000,
      soldTickets: 1450,
    },
    {
      title: "Concert Mahaleo Tribute",
      description: "Un hommage exceptionnel aux légendaires Mahaleo avec les meilleurs artistes de la scène malgache.",
      category: "Concert",
      location: "Arena Barea",
      city: "Antananarivo",
      startDate: new Date("2026-03-28T20:00:00"),
      endDate: new Date("2026-03-28T23:00:00"),
      imageUrl: "/images/event-concert.png",
      status: "upcoming",
      totalCapacity: 8000,
      soldTickets: 5600,
    },
    {
      title: "Finale Liga Malagasy Football",
      description: "La grande finale du championnat de football malgache. Supportez votre équipe favorite dans cette rencontre exceptionnelle.",
      category: "Sport",
      location: "Stade Municipal",
      city: "Toamasina",
      startDate: new Date("2026-04-05T15:00:00"),
      endDate: new Date("2026-04-05T17:30:00"),
      imageUrl: "/images/event-sport.png",
      status: "upcoming",
      totalCapacity: 15000,
      soldTickets: 12000,
    },
    {
      title: "Conférence Tech Africa 2026",
      description: "La plus grande conférence technologique d'Afrique de l'Est. 50 speakers, 30 ateliers, et des opportunités de networking uniques.",
      category: "Conférence",
      location: "Centre de Conférences d'Ivato",
      city: "Antananarivo",
      startDate: new Date("2026-06-20T08:00:00"),
      endDate: new Date("2026-06-22T18:00:00"),
      imageUrl: "/images/event-conference.png",
      status: "upcoming",
      totalCapacity: 1000,
      soldTickets: 650,
    },
    {
      title: "Soirée Afrobeat Fianarantsoa",
      description: "Une nuit de musique afrobeat avec les meilleurs DJs de la région. Dansez jusqu'au petit matin au rythme de l'Afrique.",
      category: "Soirée",
      location: "Club Le Zanzibar",
      city: "Fianarantsoa",
      startDate: new Date("2026-04-19T22:00:00"),
      endDate: new Date("2026-04-20T06:00:00"),
      imageUrl: "/images/event-soiree.png",
      status: "upcoming",
      totalCapacity: 300,
      soldTickets: 180,
    },
  ]).returning();

  for (const event of events) {
    await db.insert(ticketTypesTable).values([
      {
        eventId: event.id,
        name: "VIP",
        description: "Accès prioritaire, lounge exclusif, boissons incluses",
        price: event.category === "Conférence" ? "250000" : "150000",
        currency: "MGA",
        quantity: Math.floor(event.totalCapacity * 0.1),
        soldCount: Math.floor(Math.floor(event.totalCapacity * 0.1) * 0.7),
      },
      {
        eventId: event.id,
        name: "Standard",
        description: "Accès général à l'événement",
        price: event.category === "Conférence" ? "80000" : "50000",
        currency: "MGA",
        quantity: Math.floor(event.totalCapacity * 0.6),
        soldCount: Math.floor(Math.floor(event.totalCapacity * 0.6) * 0.75),
      },
      {
        eventId: event.id,
        name: "Économique",
        description: "Places debout ou vue partielle",
        price: event.category === "Conférence" ? "30000" : "20000",
        currency: "MGA",
        quantity: Math.floor(event.totalCapacity * 0.3),
        soldCount: Math.floor(Math.floor(event.totalCapacity * 0.3) * 0.9),
      },
    ]);
  }

  const names = ["Rakoto Jean", "Rasoa Marie", "Andry Paul", "Fanja Claire", "Hery Luc"];
  const methods = ["orange_money", "mvola", "mastercard"] as const;
  const allTicketTypes = await db.select().from(ticketTypesTable);

  for (let i = 0; i < 20; i++) {
    const ticketType = allTicketTypes[Math.floor(Math.random() * allTicketTypes.length)];
    const quantity = Math.floor(Math.random() * 3) + 1;
    const totalAmount = parseFloat(ticketType.price) * quantity;
    const name = names[Math.floor(Math.random() * names.length)];
    const daysAgo = Math.floor(Math.random() * 60);
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    const [order] = await db.insert(ordersTable).values({
      customerName: name,
      customerEmail: `${name.toLowerCase().replace(" ", ".")}${i}@example.mg`,
      customerPhone: `032${Math.floor(Math.random() * 10000000).toString().padStart(7, "0")}`,
      ticketTypeId: ticketType.id,
      eventId: ticketType.eventId,
      quantity,
      totalAmount: totalAmount.toFixed(2),
      currency: "MGA",
      status: "confirmed",
      createdAt,
    }).returning();

    const method = methods[Math.floor(Math.random() * methods.length)];
    await db.insert(paymentsTable).values({
      orderId: order.id,
      method,
      amount: order.totalAmount,
      currency: "MGA",
      status: "success",
      transactionRef: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      phoneNumber: method !== "mastercard" ? `032${Math.floor(Math.random() * 10000000).toString().padStart(7, "0")}` : null,
      cardLast4: method === "mastercard" ? String(Math.floor(Math.random() * 9000) + 1000) : null,
      createdAt: order.createdAt,
    });
  }

  console.log("Auto-seed complete.");
}
