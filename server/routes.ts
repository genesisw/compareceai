import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertEventSchema, insertEventReactionSchema, insertIncentiveSchema, insertCheckInSchema } from "@shared/schema";
import { z } from "zod";
import { nanoid } from "nanoid";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
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
      const qrCode = nanoid(16);

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

  const httpServer = createServer(app);
  return httpServer;
}
