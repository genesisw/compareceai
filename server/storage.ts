import {
  users,
  establishments,
  events,
  eventReactions,
  incentives,
  redemptions,
  checkIns,
  promoterLinks,
  userStats,
  type User,
  type UpsertUser,
  type Establishment,
  type Event,
  type EventReaction,
  type Incentive,
  type Redemption,
  type CheckIn,
  type PromoterLink,
  type UserStats,
  type InsertEstablishment,
  type InsertEvent,
  type InsertEventReaction,
  type InsertIncentive,
  type InsertRedemption,
  type InsertCheckIn,
  type InsertPromoterLink,
  type InsertUserStats,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count, sql, or, update } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Establishment operations
  createEstablishment(establishment: InsertEstablishment): Promise<Establishment>;
  getEstablishmentsByOwner(ownerId: string): Promise<Establishment[]>;
  getEstablishment(id: string): Promise<Establishment | undefined>;
  
  // Event operations
  createEvent(event: InsertEvent): Promise<Event>;
  getEvents(city?: string, category?: string): Promise<Event[]>;
  getEvent(id: string): Promise<Event | undefined>;
  getEventsByEstablishment(establishmentId: string): Promise<Event[]>;
  
  // Reaction operations
  createOrUpdateReaction(reaction: InsertEventReaction): Promise<EventReaction>;
  getEventReactions(eventId: string): Promise<EventReaction[]>;
  getUserReaction(userId: string, eventId: string): Promise<EventReaction | undefined>;
  
  // Incentive operations
  createIncentive(incentive: InsertIncentive): Promise<Incentive>;
  getEventIncentives(eventId: string): Promise<Incentive[]>;
  
  // Redemption operations
  createRedemption(redemption: InsertRedemption): Promise<Redemption>;
  getUserRedemptions(userId: string): Promise<Redemption[]>;
  
  // Check-in operations
  createCheckIn(checkIn: InsertCheckIn): Promise<CheckIn>;
  validateCheckIn(checkInId: string, validatedBy: string): Promise<CheckIn | undefined>;
  getEventCheckIns(eventId: string): Promise<CheckIn[]>;
  getUserCheckIns(userId: string): Promise<CheckIn[]>;
  getCheckInByQRCode(qrCode: string): Promise<CheckIn | undefined>;
  
  // Promoter operations
  createPromoterLink(link: InsertPromoterLink): Promise<PromoterLink>;
  getPromoterLinks(promoterId: string): Promise<PromoterLink[]>;
  updatePromoterLinkClicks(linkId: string): Promise<void>;
  
  // User stats operations
  getUserStats(userId: string): Promise<UserStats | undefined>;
  updateUserStats(userId: string, stats: Partial<InsertUserStats>): Promise<UserStats>;
  
  // Analytics
  getEventStats(eventId: string): Promise<{
    totalInterested: number;
    totalCheckedIn: number;
    reactionCounts: Record<string, number>;
  }>;
  
  // Additional methods for establishment management
  getEstablishmentStaff(establishmentId: string): Promise<User[]>;
  updateUserRole(userId: string, role: string): Promise<void>;
  updateEstablishment(establishmentId: string, data: any): Promise<Establishment>;
  getEstablishmentStats(establishmentId: string): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createEstablishment(establishment: InsertEstablishment): Promise<Establishment> {
    const [newEstablishment] = await db
      .insert(establishments)
      .values(establishment)
      .returning();
    return newEstablishment;
  }

  async getEstablishmentsByOwner(ownerId: string): Promise<Establishment[]> {
    return await db
      .select()
      .from(establishments)
      .where(eq(establishments.ownerId, ownerId));
  }

  async getEstablishment(id: string): Promise<Establishment | undefined> {
    const [establishment] = await db
      .select()
      .from(establishments)
      .where(eq(establishments.id, id));
    return establishment;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db
      .insert(events)
      .values(event)
      .returning();
    return newEvent;
  }

  async getEvents(city?: string, category?: string): Promise<Event[]> {
    let query = db.select().from(events);
    
    if (city) {
      query = query.where(eq(events.city, city));
    }
    
    if (category) {
      query = query.where(eq(events.category, category));
    }
    
    return await query.orderBy(desc(events.startDatetime));
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, id));
    return event;
  }

  async getEventsByEstablishment(establishmentId: string): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.establishmentId, establishmentId))
      .orderBy(desc(events.startDatetime));
  }

  async createOrUpdateReaction(reaction: InsertEventReaction): Promise<EventReaction> {
    // Check if reaction already exists
    const existingReaction = await this.getUserReaction(reaction.userId!, reaction.eventId!);
    
    if (existingReaction) {
      // Update existing reaction
      const [updatedReaction] = await db
        .update(eventReactions)
        .set({
          reaction: reaction.reaction,
          createdAt: new Date(),
        })
        .where(
          and(
            eq(eventReactions.userId, reaction.userId!),
            eq(eventReactions.eventId, reaction.eventId!)
          )
        )
        .returning();
      return updatedReaction;
    } else {
      // Create new reaction
      const [newReaction] = await db
        .insert(eventReactions)
        .values(reaction)
        .returning();
      return newReaction;
    }
  }

  async getEventReactions(eventId: string): Promise<EventReaction[]> {
    return await db
      .select()
      .from(eventReactions)
      .where(eq(eventReactions.eventId, eventId));
  }

  async getUserReaction(userId: string, eventId: string): Promise<EventReaction | undefined> {
    const [reaction] = await db
      .select()
      .from(eventReactions)
      .where(
        and(
          eq(eventReactions.userId, userId),
          eq(eventReactions.eventId, eventId)
        )
      );
    return reaction;
  }

  async createIncentive(incentive: InsertIncentive): Promise<Incentive> {
    const [newIncentive] = await db
      .insert(incentives)
      .values(incentive)
      .returning();
    return newIncentive;
  }

  async getEventIncentives(eventId: string): Promise<Incentive[]> {
    return await db
      .select()
      .from(incentives)
      .where(eq(incentives.eventId, eventId));
  }

  async createRedemption(redemption: InsertRedemption): Promise<Redemption> {
    const [newRedemption] = await db
      .insert(redemptions)
      .values(redemption)
      .returning();
    return newRedemption;
  }

  async getUserRedemptions(userId: string): Promise<Redemption[]> {
    return await db
      .select()
      .from(redemptions)
      .where(eq(redemptions.userId, userId))
      .orderBy(desc(redemptions.redeemedAt));
  }

  async createCheckIn(checkIn: InsertCheckIn): Promise<CheckIn> {
    const [newCheckIn] = await db
      .insert(checkIns)
      .values(checkIn)
      .returning();
    return newCheckIn;
  }

  async validateCheckIn(checkInId: string, validatedBy: string): Promise<CheckIn | undefined> {
    const [validatedCheckIn] = await db
      .update(checkIns)
      .set({
        validated: true,
        validatedBy,
        validatedAt: new Date(),
      })
      .where(eq(checkIns.id, checkInId))
      .returning();
    return validatedCheckIn;
  }

  async getEventCheckIns(eventId: string): Promise<CheckIn[]> {
    return await db
      .select()
      .from(checkIns)
      .where(eq(checkIns.eventId, eventId))
      .orderBy(desc(checkIns.checkinTime));
  }

  async getUserCheckIns(userId: string): Promise<CheckIn[]> {
    return await db
      .select()
      .from(checkIns)
      .where(eq(checkIns.userId, userId))
      .orderBy(desc(checkIns.checkinTime));
  }

  async getCheckInByQRCode(qrCode: string): Promise<CheckIn | undefined> {
    const [checkIn] = await db
      .select()
      .from(checkIns)
      .where(eq(checkIns.qrCode, qrCode));
    return checkIn;
  }

  async createPromoterLink(link: InsertPromoterLink): Promise<PromoterLink> {
    const [newLink] = await db
      .insert(promoterLinks)
      .values(link)
      .returning();
    return newLink;
  }

  async getPromoterLinks(promoterId: string): Promise<PromoterLink[]> {
    return await db
      .select()
      .from(promoterLinks)
      .where(eq(promoterLinks.promoterId, promoterId));
  }

  async updatePromoterLinkClicks(linkId: string): Promise<void> {
    await db
      .update(promoterLinks)
      .set({
        clicks: sql`${promoterLinks.clicks} + 1`,
      })
      .where(eq(promoterLinks.id, linkId));
  }

  async getUserStats(userId: string): Promise<UserStats | undefined> {
    const [stats] = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId));
    return stats;
  }

  async updateUserStats(userId: string, stats: Partial<InsertUserStats>): Promise<UserStats> {
    // First try to get existing stats
    const existingStats = await this.getUserStats(userId);
    
    if (existingStats) {
      // Update existing record
      const [updatedStats] = await db
        .update(userStats)
        .set({
          ...stats,
          updatedAt: new Date(),
        })
        .where(eq(userStats.userId, userId))
        .returning();
      return updatedStats;
    } else {
      // Create new record
      const [newStats] = await db
        .insert(userStats)
        .values({
          userId,
          ...stats,
          updatedAt: new Date(),
        })
        .returning();
      return newStats;
    }
  }

  async getEventStats(eventId: string): Promise<{
    totalInterested: number;
    totalCheckedIn: number;
    reactionCounts: Record<string, number>;
  }> {
    const [reactionsCount] = await db
      .select({ count: count() })
      .from(eventReactions)
      .where(eq(eventReactions.eventId, eventId));

    const [checkInsCount] = await db
      .select({ count: count() })
      .from(checkIns)
      .where(eq(checkIns.eventId, eventId));

    const reactionCounts = await db
      .select({
        reaction: eventReactions.reaction,
        count: count(),
      })
      .from(eventReactions)
      .where(eq(eventReactions.eventId, eventId))
      .groupBy(eventReactions.reaction);

    const reactionCountsMap = reactionCounts.reduce((acc, { reaction, count }) => {
      acc[reaction] = count;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalInterested: reactionsCount?.count || 0,
      totalCheckedIn: checkInsCount?.count || 0,
      reactionCounts: reactionCountsMap,
    };
  }

  async getEstablishmentStaff(establishmentId: string): Promise<User[]> {
    // Get all users with roles FUNCIONARIO or PROMOTER
    const staff = await db.select().from(users).where(
      or(
        eq(users.role, 'FUNCIONARIO'),
        eq(users.role, 'PROMOTER')
      )
    );
    
    return staff;
  }

  async updateUserRole(userId: string, role: string): Promise<void> {
    await db.update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async updateEstablishment(establishmentId: string, data: any): Promise<Establishment> {
    const [establishment] = await db.update(establishments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(establishments.id, establishmentId))
      .returning();
    
    return establishment;
  }

  async getEstablishmentStats(establishmentId: string): Promise<any> {
    const establishment = await this.getEstablishment(establishmentId);
    if (!establishment) {
      return {
        totalViews: 0,
        totalReactions: 0,
        totalCheckIns: 0,
        conversionRate: 0,
        totalEvents: 0,
        totalStaff: 0,
        totalPromoters: 0
      };
    }

    const events = await this.getEventsByEstablishment(establishmentId);
    const staff = await this.getEstablishmentStaff(establishmentId);
    
    // Calculate totals from all events
    let totalReactions = 0;
    let totalCheckIns = 0;
    
    for (const event of events) {
      const stats = await this.getEventStats(event.id);
      totalReactions += Object.values(stats.reactionCounts).reduce((a, b) => a + b, 0);
      totalCheckIns += stats.totalCheckedIn;
    }
    
    const conversionRate = totalReactions > 0 ? Math.round((totalCheckIns / totalReactions) * 100) : 0;
    
    return {
      totalViews: totalReactions * 8.9, // Approximate views based on interactions
      totalReactions,
      totalCheckIns,
      conversionRate,
      totalEvents: events.length,
      totalStaff: staff.filter(s => s.role === 'FUNCIONARIO').length,
      totalPromoters: staff.filter(s => s.role === 'PROMOTER').length
    };
  }
}

export const storage = new DatabaseStorage();
