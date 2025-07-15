import { db } from "./db";
import { users, establishments, events, eventReactions, incentives, userStats } from "@shared/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function seedDatabase() {
  console.log("🌱 Seeding database...");

  // Create sample establishments
  const establishment1Id = randomUUID();
  const establishment2Id = randomUUID();
  const establishment3Id = randomUUID();

  const sampleEstablishments = [
    {
      id: establishment1Id,
      name: "Bar do João",
      description: "O melhor bar de pagode da cidade",
      city: "São Paulo",
      state: "SP",
      ownerId: "admin-user", // Will be updated when admin user is created
      createdAt: new Date(),
    },
    {
      id: establishment2Id,
      name: "Clube do Sertanejo",
      description: "Ambiente country com música ao vivo",
      city: "São Paulo",
      state: "SP",
      ownerId: "admin-user",
      createdAt: new Date(),
    },
    {
      id: establishment3Id,
      name: "Techno Club",
      description: "House e techno até amanhecer",
      city: "São Paulo",
      state: "SP",
      ownerId: "admin-user",
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
      id: randomUUID(),
      title: "Noite do Pagode",
      description: "Pagode ao vivo com Grupo Revelação",
      category: "PAGODE",
      startDatetime: tomorrow,
      endDatetime: new Date(tomorrow.getTime() + 4 * 60 * 60 * 1000), // 4 hours later
      city: "São Paulo",
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
      establishmentId: establishment1Id,
      createdAt: new Date(),
    },
    {
      id: randomUUID(),
      title: "Festa Sertaneja",
      description: "Sertanejo universitário com dupla famosa",
      category: "SERTANEJO",
      startDatetime: nextWeek,
      endDatetime: new Date(nextWeek.getTime() + 5 * 60 * 60 * 1000), // 5 hours later
      city: "São Paulo",
      imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400",
      establishmentId: establishment2Id,
      createdAt: new Date(),
    },
    {
      id: randomUUID(),
      title: "Rave Underground",
      description: "Techno e house music com DJs internacionais",
      category: "TECHNO",
      startDatetime: nextWeek,
      endDatetime: new Date(nextWeek.getTime() + 6 * 60 * 60 * 1000), // 6 hours later
      city: "São Paulo",
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
      establishmentId: establishment3Id,
      createdAt: new Date(),
    }
  ];

  // Insert events
  await db.insert(events).values(sampleEvents).onConflictDoNothing();

  // Create sample incentives
  const sampleIncentives = [
    {
      id: randomUUID(),
      eventId: sampleEvents[0].id,
      title: "Desconto de 20% na entrada",
      type: "DESCONTO",
      description: "Válido até 22:00",
      totalQuantity: 50,
      availableQuantity: 50,
      createdAt: new Date(),
    },
    {
      id: randomUUID(),
      eventId: sampleEvents[1].id,
      title: "Drink grátis",
      type: "GRATIS",
      description: "Primeira bebida por conta da casa",
      totalQuantity: 30,
      availableQuantity: 30,
      createdAt: new Date(),
    },
    {
      id: randomUUID(),
      eventId: sampleEvents[2].id,
      title: "Acesso VIP",
      type: "UPGRADE",
      description: "Área VIP com open bar",
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

export async function promoteUserToEstablishmentOwner(userId: string) {
  console.log(`🔧 Promoting user ${userId} to DONO_ESTABELECIMENTO...`);
  
  // Update user role to DONO_ESTABELECIMENTO
  await db.update(users)
    .set({ role: "DONO_ESTABELECIMENTO" })
    .where(eq(users.id, userId));

  // Create a default establishment for this owner
  const [establishment] = await db.insert(establishments)
    .values({
      id: randomUUID(),
      name: "Meu Estabelecimento",
      description: "Estabelecimento padrão - configure as informações",
      city: "São Paulo",
      state: "SP",
      ownerId: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning();

  console.log(`✅ User ${userId} promoted to DONO_ESTABELECIMENTO with establishment ${establishment.id}!`);
}