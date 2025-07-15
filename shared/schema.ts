import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  uuid,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: text("role").notNull().default("USUARIO"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Establishments table
export const establishments = pgTable("establishments", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  ownerId: varchar("owner_id").references(() => users.id),
  description: text("description"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Events table
export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  establishmentId: uuid("establishment_id").references(() => establishments.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  startDatetime: timestamp("start_datetime").notNull(),
  endDatetime: timestamp("end_datetime"),
  city: text("city").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Event reactions table
export const eventReactions = pgTable("event_reactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").references(() => users.id),
  eventId: uuid("event_id").references(() => events.id),
  reaction: text("reaction").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Incentives table
export const incentives = pgTable("incentives", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").references(() => events.id),
  title: text("title").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  totalQuantity: integer("total_quantity"),
  availableQuantity: integer("available_quantity"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Redemptions table
export const redemptions = pgTable("redemptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").references(() => users.id),
  incentiveId: uuid("incentive_id").references(() => incentives.id),
  redeemedAt: timestamp("redeemed_at").defaultNow(),
  status: text("status").notNull().default("PENDENTE"),
});

// Check-ins table
export const checkIns = pgTable("check_ins", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").references(() => users.id),
  eventId: uuid("event_id").references(() => events.id),
  promoterId: varchar("promoter_id").references(() => users.id),
  checkinTime: timestamp("checkin_time").defaultNow(),
  qrCode: text("qr_code"),
  validated: boolean("validated").default(false),
  validatedBy: varchar("validated_by").references(() => users.id),
  validatedAt: timestamp("validated_at"),
});

// Promoter links table
export const promoterLinks = pgTable("promoter_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  promoterId: varchar("promoter_id").references(() => users.id),
  eventId: uuid("event_id").references(() => events.id),
  uniqueCode: text("unique_code").unique().notNull(),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// User stats table for gamification
export const userStats = pgTable("user_stats", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").references(() => users.id),
  totalCheckIns: integer("total_check_ins").default(0),
  monthlyCheckIns: integer("monthly_check_ins").default(0),
  level: text("level").default("BRONZE"),
  points: integer("points").default(0),
  availableRewards: integer("available_rewards").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  establishments: many(establishments),
  eventReactions: many(eventReactions),
  checkIns: many(checkIns),
  promoterLinks: many(promoterLinks),
  redemptions: many(redemptions),
  userStats: one(userStats),
}));

export const establishmentsRelations = relations(establishments, ({ one, many }) => ({
  owner: one(users, { fields: [establishments.ownerId], references: [users.id] }),
  events: many(events),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  establishment: one(establishments, { fields: [events.establishmentId], references: [establishments.id] }),
  reactions: many(eventReactions),
  incentives: many(incentives),
  checkIns: many(checkIns),
  promoterLinks: many(promoterLinks),
}));

export const eventReactionsRelations = relations(eventReactions, ({ one }) => ({
  user: one(users, { fields: [eventReactions.userId], references: [users.id] }),
  event: one(events, { fields: [eventReactions.eventId], references: [events.id] }),
}));

export const incentivesRelations = relations(incentives, ({ one, many }) => ({
  event: one(events, { fields: [incentives.eventId], references: [events.id] }),
  redemptions: many(redemptions),
}));

export const redemptionsRelations = relations(redemptions, ({ one }) => ({
  user: one(users, { fields: [redemptions.userId], references: [users.id] }),
  incentive: one(incentives, { fields: [redemptions.incentiveId], references: [incentives.id] }),
}));

export const checkInsRelations = relations(checkIns, ({ one }) => ({
  user: one(users, { fields: [checkIns.userId], references: [users.id] }),
  event: one(events, { fields: [checkIns.eventId], references: [events.id] }),
  promoter: one(users, { fields: [checkIns.promoterId], references: [users.id] }),
  validator: one(users, { fields: [checkIns.validatedBy], references: [users.id] }),
}));

export const promoterLinksRelations = relations(promoterLinks, ({ one }) => ({
  promoter: one(users, { fields: [promoterLinks.promoterId], references: [users.id] }),
  event: one(events, { fields: [promoterLinks.eventId], references: [events.id] }),
}));

export const userStatsRelations = relations(userStats, ({ one }) => ({
  user: one(users, { fields: [userStats.userId], references: [users.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertEstablishmentSchema = createInsertSchema(establishments);
export const insertEventSchema = createInsertSchema(events);
export const insertEventReactionSchema = createInsertSchema(eventReactions);
export const insertIncentiveSchema = createInsertSchema(incentives);
export const insertRedemptionSchema = createInsertSchema(redemptions);
export const insertCheckInSchema = createInsertSchema(checkIns);
export const insertPromoterLinkSchema = createInsertSchema(promoterLinks);
export const insertUserStatsSchema = createInsertSchema(userStats);

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Establishment = typeof establishments.$inferSelect;
export type Event = typeof events.$inferSelect;
export type EventReaction = typeof eventReactions.$inferSelect;
export type Incentive = typeof incentives.$inferSelect;
export type Redemption = typeof redemptions.$inferSelect;
export type CheckIn = typeof checkIns.$inferSelect;
export type PromoterLink = typeof promoterLinks.$inferSelect;
export type UserStats = typeof userStats.$inferSelect;

export type InsertEstablishment = z.infer<typeof insertEstablishmentSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertEventReaction = z.infer<typeof insertEventReactionSchema>;
export type InsertIncentive = z.infer<typeof insertIncentiveSchema>;
export type InsertRedemption = z.infer<typeof insertRedemptionSchema>;
export type InsertCheckIn = z.infer<typeof insertCheckInSchema>;
export type InsertPromoterLink = z.infer<typeof insertPromoterLinkSchema>;
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
