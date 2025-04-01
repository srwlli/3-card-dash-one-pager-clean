import express, { Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import {
  insertDashboardSchema,
  updateDashboardSchema,
  insertCardSchema,
  updateCardSchema,
  updateLayoutSchema
} from "@shared/schema";

export async function registerRoutes(app: express.Express): Promise<Server> {
  const apiRouter = express.Router();
  
  // Dashboard Routes
  
  // GET /api/dashboards - Get all dashboards
  apiRouter.get("/dashboards", async (_req: Request, res: Response) => {
    try {
      const dashboards = await storage.getDashboards();
      res.status(200).json(dashboards);
    } catch (error) {
      console.error("Error fetching dashboards:", error);
      res.status(500).json({ message: "Failed to fetch dashboards" });
    }
  });
  
  // GET /api/dashboards/:id - Get a specific dashboard with its cards
  apiRouter.get("/dashboards/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid dashboard ID" });
      }
      
      const dashboard = await storage.getDashboard(id);
      
      if (!dashboard) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      
      const cards = await storage.getCards(id);
      
      res.status(200).json({ dashboard, cards });
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      res.status(500).json({ message: "Failed to fetch dashboard" });
    }
  });
  
  // POST /api/dashboards - Create a new dashboard
  apiRouter.post("/dashboards", async (req: Request, res: Response) => {
    try {
      const dashboardData = insertDashboardSchema.parse(req.body);
      const dashboard = await storage.createDashboard(dashboardData);
      res.status(201).json(dashboard);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating dashboard:", error);
      res.status(500).json({ message: "Failed to create dashboard" });
    }
  });
  
  // PATCH /api/dashboards/:id - Update a dashboard
  apiRouter.patch("/dashboards/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid dashboard ID" });
      }
      
      const dashboardData = updateDashboardSchema.parse(req.body);
      const dashboard = await storage.updateDashboard(id, dashboardData);
      
      if (!dashboard) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      
      res.status(200).json(dashboard);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error updating dashboard:", error);
      res.status(500).json({ message: "Failed to update dashboard" });
    }
  });
  
  // DELETE /api/dashboards/:id - Delete a dashboard
  apiRouter.delete("/dashboards/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid dashboard ID" });
      }
      
      const dashboard = await storage.getDashboard(id);
      
      if (!dashboard) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      
      const deleted = await storage.deleteDashboard(id);
      
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete dashboard" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting dashboard:", error);
      res.status(500).json({ message: "Failed to delete dashboard" });
    }
  });
  
  // Card Routes
  
  // POST /api/dashboards/:dashboardId/cards - Create a new card
  apiRouter.post("/dashboards/:dashboardId/cards", async (req: Request, res: Response) => {
    try {
      const dashboardId = parseInt(req.params.dashboardId, 10);
      
      if (isNaN(dashboardId)) {
        return res.status(400).json({ message: "Invalid dashboard ID" });
      }
      
      // Check if dashboard exists
      const dashboard = await storage.getDashboard(dashboardId);
      
      if (!dashboard) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      
      // Add dashboardId to card data and validate
      const cardData = insertCardSchema.parse({
        ...req.body,
        dashboardId,
      });
      
      const card = await storage.createCard(cardData);
      res.status(201).json(card);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating card:", error);
      res.status(500).json({ message: "Failed to create card" });
    }
  });
  
  // PATCH /api/cards/:id - Update a card
  apiRouter.patch("/cards/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid card ID" });
      }
      
      const card = await storage.getCard(id);
      
      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }
      
      const cardData = updateCardSchema.parse(req.body);
      const updatedCard = await storage.updateCard(id, cardData);
      
      if (!updatedCard) {
        return res.status(500).json({ message: "Failed to update card" });
      }
      
      res.status(200).json(updatedCard);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error updating card:", error);
      res.status(500).json({ message: "Failed to update card" });
    }
  });
  
  // DELETE /api/cards/:id - Delete a card
  apiRouter.delete("/cards/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid card ID" });
      }
      
      const card = await storage.getCard(id);
      
      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }
      
      const deleted = await storage.deleteCard(id);
      
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete card" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting card:", error);
      res.status(500).json({ message: "Failed to delete card" });
    }
  });
  
  // Layout Routes
  
  // PATCH /api/dashboards/:dashboardId/layout - Update layout for all cards in a dashboard
  apiRouter.patch("/dashboards/:dashboardId/layout", async (req: Request, res: Response) => {
    try {
      const dashboardId = parseInt(req.params.dashboardId, 10);
      
      if (isNaN(dashboardId)) {
        return res.status(400).json({ message: "Invalid dashboard ID" });
      }
      
      // Check if dashboard exists
      const dashboard = await storage.getDashboard(dashboardId);
      
      if (!dashboard) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      
      const layoutData = updateLayoutSchema.parse(req.body);
      const updated = await storage.updateCardsLayout(dashboardId, layoutData);
      
      if (!updated) {
        return res.status(500).json({ message: "Failed to update layout" });
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error updating layout:", error);
      res.status(500).json({ message: "Failed to update layout" });
    }
  });
  
  // Mount API router
  app.use("/api", apiRouter);
  
  const httpServer = createServer(app);
  return httpServer;
}
