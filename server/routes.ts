import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { insertEventSchema, insertEventReactionSchema, insertIncentiveSchema, insertCheckInSchema, insertEstablishmentSchema } from "@shared/schema";
import { z } from "zod";
import { randomUUID } from "crypto";
import { seedDatabase, promoteUserToAdmin, promoteUserToEstablishmentOwner } from "./seed";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  // Auth routes
  app.get('/api/user', (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  // Event routes
  app.get('/api/events', async (req, res) => {
    try {
      const { city, category } = req.query;
      const events = await storage.getEvents(
        city as string,
        category as string
      );
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get('/api/events/:id', async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const incentives = await storage.getEventIncentives(event.id);
      const stats = await storage.getEventStats(event.id);
      
      res.json({ ...event, incentives, stats });
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.post('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !['SUPER_ADMIN', 'DONO_ESTABELECIMENTO'].includes(user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      res.json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  // Reaction routes
  app.post('/api/events/:id/react', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = req.params.id;
      const { reaction } = req.body;

      if (!['EU_VOU_COMPARECER', 'PENSANDO_EM_IR', 'NAO_VOU_PODER_IR'].includes(reaction)) {
        return res.status(400).json({ message: "Invalid reaction type" });
      }

      const reactionData = insertEventReactionSchema.parse({
        userId,
        eventId,
        reaction,
      });

      const eventReaction = await storage.createOrUpdateReaction(reactionData);
      res.json(eventReaction);
    } catch (error) {
      console.error("Error creating reaction:", error);
      res.status(500).json({ message: "Failed to create reaction" });
    }
  });

  app.get('/api/events/:id/reactions', async (req, res) => {
    try {
      const reactions = await storage.getEventReactions(req.params.id);
      res.json(reactions);
    } catch (error) {
      console.error("Error fetching reactions:", error);
      res.status(500).json({ message: "Failed to fetch reactions" });
    }
  });

  // Check-in routes
  app.post('/api/events/:id/checkin', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = req.params.id;
      const { promoterId } = req.body;

      // Generate QR code
      const qrCode = randomUUID();

      const checkInData = insertCheckInSchema.parse({
        userId,
        eventId,
        promoterId,
        qrCode,
      });

      const checkIn = await storage.createCheckIn(checkInData);
      
      // Update user stats
      const userStats = await storage.getUserStats(userId);
      await storage.updateUserStats(userId, {
        totalCheckIns: (userStats?.totalCheckIns || 0) + 1,
        monthlyCheckIns: (userStats?.monthlyCheckIns || 0) + 1,
        points: (userStats?.points || 0) + 10,
      });

      res.json(checkIn);
    } catch (error) {
      console.error("Error creating check-in:", error);
      res.status(500).json({ message: "Failed to create check-in" });
    }
  });

  app.post('/api/checkins/validate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !['SUPER_ADMIN', 'DONO_ESTABELECIMENTO', 'FUNCIONARIO'].includes(user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const { qrCode } = req.body;
      const checkIn = await storage.getCheckInByQRCode(qrCode);
      
      if (!checkIn) {
        return res.status(404).json({ message: "Check-in not found" });
      }

      if (checkIn.validated) {
        return res.status(400).json({ message: "Check-in already validated" });
      }

      const validatedCheckIn = await storage.validateCheckIn(checkIn.id, userId);
      res.json(validatedCheckIn);
    } catch (error) {
      console.error("Error validating check-in:", error);
      res.status(500).json({ message: "Failed to validate check-in" });
    }
  });

  // User stats routes
  app.get('/api/user/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let stats = await storage.getUserStats(userId);
      
      if (!stats) {
        stats = await storage.updateUserStats(userId, {
          totalCheckIns: 0,
          monthlyCheckIns: 0,
          level: 'BRONZE',
          points: 0,
          availableRewards: 0,
        });
      }
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Dashboard routes for establishments
  app.get('/api/dashboard/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !['SUPER_ADMIN', 'DONO_ESTABELECIMENTO'].includes(user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const establishments = await storage.getEstablishmentsByOwner(userId);
      const allEvents = [];
      
      for (const establishment of establishments) {
        const events = await storage.getEventsByEstablishment(establishment.id);
        allEvents.push(...events);
      }

      res.json(allEvents);
    } catch (error) {
      console.error("Error fetching dashboard events:", error);
      res.status(500).json({ message: "Failed to fetch dashboard events" });
    }
  });

  app.get('/api/dashboard/checkins/:eventId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !['SUPER_ADMIN', 'DONO_ESTABELECIMENTO', 'FUNCIONARIO'].includes(user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const checkIns = await storage.getEventCheckIns(req.params.eventId);
      res.json(checkIns);
    } catch (error) {
      console.error("Error fetching check-ins:", error);
      res.status(500).json({ message: "Failed to fetch check-ins" });
    }
  });

  // Incentive routes
  app.post('/api/events/:id/incentives', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !['SUPER_ADMIN', 'DONO_ESTABELECIMENTO'].includes(user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const incentiveData = insertIncentiveSchema.parse({
        ...req.body,
        eventId: req.params.id,
      });

      const incentive = await storage.createIncentive(incentiveData);
      res.json(incentive);
    } catch (error) {
      console.error("Error creating incentive:", error);
      res.status(500).json({ message: "Failed to create incentive" });
    }
  });

  // Admin routes
  app.post('/api/admin/seed', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: "Only super admins can seed the database" });
      }

      await seedDatabase();
      res.json({ message: "Database seeded successfully!" });
    } catch (error) {
      console.error("Error seeding database:", error);
      res.status(500).json({ message: "Failed to seed database" });
    }
  });

  app.post('/api/admin/promote/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: "Only super admins can promote users" });
      }

      const targetUserId = req.params.userId;
      
      await promoteUserToEstablishmentOwner(targetUserId);
      res.json({ message: `User ${targetUserId} promoted to DONO_ESTABELECIMENTO!` });
    } catch (error) {
      console.error("Error promoting user:", error);
      res.status(500).json({ message: "Failed to promote user" });
    }
  });

  // Route for establishment owners to promote their employees
  app.post('/api/establishment/promote/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'DONO_ESTABELECIMENTO') {
        return res.status(403).json({ message: "Only establishment owners can promote users" });
      }

      const targetUserId = req.params.userId;
      const { role } = req.body;
      
      if (!['FUNCIONARIO', 'PROMOTER'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      await storage.updateUserRole(targetUserId, role);
      
      res.json({ message: `User ${targetUserId} promoted to ${role}!` });
    } catch (error) {
      console.error("Error promoting user:", error);
      res.status(500).json({ message: "Failed to promote user" });
    }
  });

  // Establishment management routes
  app.get('/api/establishment/current', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'DONO_ESTABELECIMENTO') {
        return res.status(403).json({ message: "Access denied" });
      }

      let establishments = await storage.getEstablishmentsByOwner(userId);
      
      // If no establishment exists, create one automatically
      if (establishments.length === 0) {
        const defaultEstablishment = await storage.createEstablishment({
          id: randomUUID(),
          name: `Estabelecimento de ${user.firstName || user.email?.split('@')[0] || 'Usuario'}`,
          description: "Estabelecimento criado automaticamente - configure as informações",
          city: "São Paulo",
          state: "SP",
          ownerId: userId,
          phone: "",
          openingHours: "Segunda a Domingo 18h-04h",
          category: "bar"
        });
        establishments = [defaultEstablishment];
      }
      
      res.json(establishments[0]);
    } catch (error) {
      console.error("Error fetching establishment:", error);
      res.status(500).json({ message: "Failed to fetch establishment" });
    }
  });

  app.get('/api/establishment/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'DONO_ESTABELECIMENTO') {
        return res.status(403).json({ message: "Access denied" });
      }

      const establishments = await storage.getEstablishmentsByOwner(userId);
      if (!establishments.length) {
        return res.json([]);
      }

      const events = await storage.getEventsByEstablishment(establishments[0].id);
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post('/api/establishment/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'DONO_ESTABELECIMENTO') {
        return res.status(403).json({ message: "Access denied" });
      }

      let establishments = await storage.getEstablishmentsByOwner(userId);
      
      // If no establishment exists, create one automatically
      if (establishments.length === 0) {
        const defaultEstablishment = await storage.createEstablishment({
          id: randomUUID(),
          name: `Estabelecimento de ${user.firstName || user.email?.split('@')[0] || 'Usuario'}`,
          description: "Estabelecimento criado automaticamente - configure as informações",
          city: "São Paulo",
          state: "SP",
          ownerId: userId,
          phone: "",
          openingHours: "Segunda a Domingo 18h-04h",
          category: "bar"
        });
        establishments = [defaultEstablishment];
      }

      const eventData = {
        ...req.body,
        establishmentId: establishments[0].id,
        city: establishments[0].city,
        startDatetime: new Date(req.body.startDatetime),
        endDatetime: req.body.endDatetime ? new Date(req.body.endDatetime) : undefined
      };

      const event = await storage.createEvent(eventData);
      res.json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.get('/api/establishment/staff', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'DONO_ESTABELECIMENTO') {
        return res.status(403).json({ message: "Access denied" });
      }

      const establishments = await storage.getEstablishmentsByOwner(userId);
      if (!establishments.length) {
        return res.json([]);
      }

      const staff = await storage.getEstablishmentStaff(establishments[0].id);
      res.json(staff);
    } catch (error) {
      console.error("Error fetching staff:", error);
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  app.get('/api/establishment/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'DONO_ESTABELECIMENTO') {
        return res.status(403).json({ message: "Access denied" });
      }

      const establishments = await storage.getEstablishmentsByOwner(userId);
      if (!establishments.length) {
        return res.json({
          totalViews: 0,
          totalReactions: 0,
          totalCheckIns: 0,
          conversionRate: 0,
          totalEvents: 0,
          totalStaff: 0,
          totalPromoters: 0
        });
      }

      const stats = await storage.getEstablishmentStats(establishments[0].id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.put('/api/establishment/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'DONO_ESTABELECIMENTO') {
        return res.status(403).json({ message: "Access denied" });
      }

      let establishments = await storage.getEstablishmentsByOwner(userId);
      
      // If no establishment exists, create one automatically
      if (establishments.length === 0) {
        const defaultEstablishment = await storage.createEstablishment({
          id: randomUUID(),
          name: `Estabelecimento de ${user.firstName || user.email?.split('@')[0] || 'Usuario'}`,
          description: "Estabelecimento criado automaticamente - configure as informações",
          city: "São Paulo",
          state: "SP",
          ownerId: userId,
          phone: "",
          openingHours: "Segunda a Domingo 18h-04h",
          category: "bar"
        });
        establishments = [defaultEstablishment];
      }

      const updatedEstablishment = await storage.updateEstablishment(establishments[0].id, req.body);
      res.json(updatedEstablishment);
    } catch (error) {
      console.error("Error updating establishment:", error);
      res.status(500).json({ message: "Failed to update establishment" });
    }
  });

  // Auto-promote specific user (luiscpaim@gmail.com only)
  app.post('/api/admin/auto-promote', async (req: any, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // Check if user exists and get their email
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Only allow luiscpaim@gmail.com to become super admin
      if (user.email !== 'luiscpaim@gmail.com') {
        return res.status(403).json({ message: "Only luiscpaim@gmail.com can become Super Admin" });
      }

      await promoteUserToAdmin(userId);
      await seedDatabase();
      res.json({ message: `User ${userId} promoted to SUPER_ADMIN and database seeded!` });
    } catch (error) {
      console.error("Error auto-promoting user:", error);
      res.status(500).json({ message: "Failed to auto-promote user" });
    }
  });

  // Establishment management routes
  app.post('/api/establishments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !['SUPER_ADMIN', 'DONO_ESTABELECIMENTO'].includes(user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const establishmentData = insertEstablishmentSchema.parse({
        ...req.body,
        ownerId: userId,
      });

      const establishment = await storage.createEstablishment(establishmentData);
      res.json(establishment);
    } catch (error) {
      console.error("Error creating establishment:", error);
      res.status(500).json({ message: "Failed to create establishment" });
    }
  });

  app.get('/api/establishments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !['SUPER_ADMIN', 'DONO_ESTABELECIMENTO'].includes(user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const establishments = await storage.getEstablishmentsByOwner(userId);
      res.json(establishments);
    } catch (error) {
      console.error("Error fetching establishments:", error);
      res.status(500).json({ message: "Failed to fetch establishments" });
    }
  });

  // Route to promote user to establishment owner
  app.post('/api/admin/promote-owner', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: "Only super admins can promote users to establishment owner" });
      }

      const { targetUserId, establishmentId } = req.body;
      if (!targetUserId || !establishmentId) {
        return res.status(400).json({ message: "User ID and establishment ID are required" });
      }

      await promoteUserToEstablishmentOwner(targetUserId);
      res.json({ message: `User ${targetUserId} promoted to establishment owner!` });
    } catch (error) {
      console.error("Error promoting user to establishment owner:", error);
      res.status(500).json({ message: "Failed to promote user to establishment owner" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
