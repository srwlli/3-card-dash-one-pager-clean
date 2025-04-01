import { pgTable, text, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (existing)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Dashboards table
export const dashboards = pgTable("dashboards", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  userId: integer("user_id").references(() => users.id),
});

export const insertDashboardSchema = createInsertSchema(dashboards).omit({
  id: true,
});

export const updateDashboardSchema = createInsertSchema(dashboards).omit({
  id: true,
  userId: true,
});

// React Grid Layout item schema
export const reactGridLayoutItemSchema = z.object({
  i: z.string(), // Card ID as string
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  minW: z.number().optional(),
  minH: z.number().optional(),
  maxW: z.number().optional(),
  maxH: z.number().optional(),
  isDraggable: z.boolean().optional(),
  isResizable: z.boolean().optional(),
  static: z.boolean().optional(),
});

export type ReactGridLayoutItem = z.infer<typeof reactGridLayoutItemSchema>;
export type ReactGridLayout = ReactGridLayoutItem[];

// Card configuration schemas
export const chartConfigSchema = z.object({
  chartType: z.enum(["bar", "line", "pie", "area"]),
  dataSource: z.string(),
  showLegend: z.boolean().default(true),
});

export const statsConfigSchema = z.object({
  value: z.string(),
  previousValue: z.string().optional(),
  change: z.number().optional(),
  changeType: z.enum(["increase", "decrease"]).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export const tableConfigSchema = z.object({
  columns: z.array(z.object({
    key: z.string(),
    label: z.string(),
    type: z.enum(["text", "number", "percent", "currency", "change"]).optional(),
  })),
  dataSource: z.string(),
});

export const listConfigSchema = z.object({
  dataSource: z.string(),
  showIcons: z.boolean().default(true),
  maxItems: z.number().optional(),
});

// Discriminated union for card configs
export const cardConfigSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("chart"), config: chartConfigSchema }),
  z.object({ type: z.literal("stats"), config: statsConfigSchema }),
  z.object({ type: z.literal("table"), config: tableConfigSchema }),
  z.object({ type: z.literal("list"), config: listConfigSchema }),
]);

export type CardConfig = z.infer<typeof cardConfigSchema>;
export type ChartConfig = z.infer<typeof chartConfigSchema>;
export type StatsConfig = z.infer<typeof statsConfigSchema>;
export type TableConfig = z.infer<typeof tableConfigSchema>;
export type ListConfig = z.infer<typeof listConfigSchema>;

// Cards table
export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  dashboardId: integer("dashboard_id")
    .notNull()
    .references(() => dashboards.id),
  title: text("title").notNull(),
  type: text("type").notNull(), // chart, stats, table, list
  config: jsonb("config").notNull(),
  layout: jsonb("layout").notNull(),
});

// Insert/update schemas
export const insertCardSchema = createInsertSchema(cards).extend({
  config: cardConfigSchema,
  layout: reactGridLayoutItemSchema,
}).omit({ id: true });

export const updateCardSchema = createInsertSchema(cards).extend({
  config: cardConfigSchema,
  layout: reactGridLayoutItemSchema,
}).omit({ id: true, dashboardId: true });

export const updateLayoutSchema = z.array(reactGridLayoutItemSchema);

// Types
export type Dashboard = typeof dashboards.$inferSelect;
export type InsertDashboard = z.infer<typeof insertDashboardSchema>;
export type UpdateDashboard = z.infer<typeof updateDashboardSchema>;

export type Card = typeof cards.$inferSelect;
export type InsertCard = z.infer<typeof insertCardSchema>;
export type UpdateCard = z.infer<typeof updateCardSchema>;
export type UpdateLayout = z.infer<typeof updateLayoutSchema>;
