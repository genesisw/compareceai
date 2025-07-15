import { db } from "./db";
import { users, establishments, events, eventReactions, incentives, userStats } from "@shared/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function seedDatabase() {
  console.log("🌱 Seeding database...");

  // Create sample establishments
  const sampleEstablishments = [
    {
      id: nanoid(),
      name: "Bar do João",
      description: "O melhor bar de pagode da cidade",
      address: "Rua das Flores, 123",
      city: "São Paulo",
      ownerId: "admin-user", // Will be updated when admin user is created
      phone: "(11) 99999-9999",
      openingHours: "18:00-02:00",
      createdAt: new Date(),
    },
    {
      id: nanoid(),
      name: "Clube do Sertanejo",
      description: "Ambiente country com música ao vivo",
      address: "Av. dos Pioneiros, 456",
      city: "São Paulo",
      ownerId: "admin-user",
      phone: "(11) 88888-8888",
      openingHours: "19:00-03:00",
      createdAt: new Date(),
    },
    {
      id: nanoid(),
      name: "Techno Club",
      description: "House e techno até amanhecer",
      address: "Rua da Balada, 789",
      city: "São Paulo",
      ownerId: "admin-user",
      phone: "(11) 77777-7777",
      openingHours: "22:00-06:00",
      createdAt: new Date(),
    }
  ];

  // Insert establishments
  await db.insert(establishments).values(sampleEstablishments).onConflictDoNothing();

  // Create sample events
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const sampleEvents = [
    {
      id: nanoid(),
      title: "Noite do Pagode",
      description: "Pagode ao vivo com Grupo Revelação",
      category: "PAGODE",
      startDatetime: tomorrow,
      endDatetime: new Date(tomorrow.getTime() + 4 * 60 * 60 * 1000), // 4 hours later
      city: "São Paulo",
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
      establishmentId: sampleEstablishments[0].id,
      createdAt: new Date(),
    },
    {
      id: nanoid(),
      title: "Festa Sertaneja",
      description: "Sertanejo universitário com dupla famosa",
      category: "SERTANEJO",
      startDatetime: nextWeek,
      endDatetime: new Date(nextWeek.getTime() + 5 * 60 * 60 * 1000), // 5 hours later
      city: "São Paulo",
      imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400",
      establishmentId: sampleEstablishments[1].id,
      createdAt: new Date(),
    },
    {
      id: nanoid(),
      title: "Rave Underground",
      description: "Techno e house music com DJs internacionais",
      category: "TECHNO",
      startDatetime: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000), // Day after tomorrow
      endDatetime: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), // 8 hours later
      city: "São Paulo",
      imageUrl: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400",
      establishmentId: sampleEstablishments[2].id,
      createdAt: new Date(),
    }
  ];

  // Insert events
  await db.insert(events).values(sampleEvents).onConflictDoNothing();

  // Create sample incentives
  const sampleIncentives = [
    {
      id: nanoid(),
      eventId: sampleEvents[0].id,
      title: "Desconto na Entrada",
      type: "DESCONTO",
      description: "50% de desconto na entrada",
      totalQuantity: 100,
      availableQuantity: 100,
      createdAt: new Date(),
    },
    {
      id: nanoid(),
      eventId: sampleEvents[1].id,
      title: "Drink Grátis",
      type: "BRINDE",
      description: "Uma cerveja grátis para quem chegar antes das 20h",
      totalQuantity: 50,
      availableQuantity: 50,
      createdAt: new Date(),
    },
    {
      id: nanoid(),
      eventId: sampleEvents[2].id,
      title: "VIP Experience",
      type: "UPGRADE",
      description: "Acesso à área VIP com open bar",
      totalQuantity: 20,
      availableQuantity: 20,
      createdAt: new Date(),
    }
  ];

  // Insert incentives
  await db.insert(incentives).values(sampleIncentives).onConflictDoNothing();

  console.log("✅ Database seeded successfully!");
}

export async function promoteUserToAdmin(userId: string) {
  console.log(`🔧 Promoting user ${userId} to SUPER_ADMIN...`);
  
  // Check if user exists and get current data
  const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  
  if (existingUser.length === 0) {
    throw new Error(`User ${userId} not found`);
  }
  
  // Update user role to SUPER_ADMIN
  await db.update(users)
    .set({ role: "SUPER_ADMIN" })
    .where(eq(users.id, userId));

  // Update all establishments to belong to this admin
  await db.update(establishments)
    .set({ ownerId: userId })
    .where(eq(establishments.ownerId, "admin-user"));

  console.log(`✅ User ${userId} promoted to SUPER_ADMIN!`);
}

export async function promoteUserToEstablishmentOwner(userId: string, establishmentId: string) {
  console.log(`🔧 Promoting user ${userId} to DONO_ESTABELECIMENTO...`);
  
  // Update user role to DONO_ESTABELECIMENTO
  await db.update(users)
    .set({ role: "DONO_ESTABELECIMENTO" })
    .where(eq(users.id, userId));

  // Update establishment to belong to this owner
  await db.update(establishments)
    .set({ ownerId: userId })
    .where(eq(establishments.id, establishmentId));

  console.log(`✅ User ${userId} promoted to DONO_ESTABELECIMENTO!`);
}