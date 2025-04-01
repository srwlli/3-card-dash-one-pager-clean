Coding Agent Guide: Precise Build Steps
This guide provides detailed steps for constructing the Dynamic Dashboard application, referencing the provided codebase (dynamic-dash-v3-gemini).

Phase 1: Project Setup & Shared Packages

Initialize Project Structure:

Create the root directory (dynamic-dash-v3-gemini).
Create subdirectories: server, client, shared, attached_assets.
Place the provided configuration files (package.json, tsconfig.json, vite.config.ts, etc.) in the root directory.
Place shared code into shared/, server code into server/, client code into client/, and instruction markdown into attached_assets/.
Define Shared Schemas and Types (shared/schema.ts):

Purpose: Define data structures and validation rules using Zod, shared between backend and frontend.
Implementation:
Install Zod: Ensure zod is listed in package.json dependencies.
Define Drizzle table schemas (e.g., users, dashboards, cards) using pgTable, serial, text, jsonb, etc.
TypeScript

// Example: shared/schema.ts
import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const dashboards = pgTable("dashboards", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  userId: integer("user_id").references(() => users.id), // Assuming users table exists
});

export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  dashboardId: integer("dashboard_id")
    .notNull()
    .references(() => dashboards.id),
  title: text("title").notNull(),
  type: text("type").notNull(), // Consider using an enum type if DB supports it
  config: jsonb("config").notNull(), // Store card-specific config
  layout: jsonb("layout").notNull(), // Store react-grid-layout item data
});
Define Zod schemas for layout items (reactGridLayoutItemSchema).
TypeScript

// Example: shared/schema.ts
export const reactGridLayoutItemSchema = z.object({
  i: z.string(), // Card ID as string
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  minW: z.number().optional(),
  // ... other layout properties
});
export type ReactGridLayoutItem = z.infer<typeof reactGridLayoutItemSchema>;
export type ReactGridLayout = ReactGridLayoutItem[];
Define Zod schemas for specific card configurations (chartConfigSchema, statsConfigSchema, etc.).
TypeScript

// Example: shared/schema.ts
export const chartConfigSchema = z.object({
  chartType: z.enum(["bar", "line", "pie", "area"]),
  dataSource: z.string(),
  showLegend: z.boolean().default(true),
});
// ... other config schemas (stats, list, table, activity)
Create a discriminated union for config validation based on type.
TypeScript

// Example: shared/schema.ts
export const cardConfigSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("chart"), config: chartConfigSchema }),
  z.object({ type: z.literal("stats"), config: statsConfigSchema }),
  // ... other types
]);
Define Zod schemas for API operations (insertDashboardSchema, insertCardSchema, updateCardSchema, updateLayoutSchema). Use .extend() or .pick() as needed.
TypeScript

// Example: shared/schema.ts
 export const insertCardSchema = createInsertSchema(cards).extend({
   config: z.any(), // Validated later based on type
   layout: reactGridLayoutItemSchema, // Expect layout info on creation
 });

 export const updateLayoutSchema = z.array(reactGridLayoutItemSchema);
Export inferred TypeScript types for use in both backend and frontend.
TypeScript

// Example: shared/schema.ts
export type Card = typeof cards.$inferSelect; // Or use a refined Zod schema like cardSchema
export type InsertCard = z.infer<typeof insertCardSchema>;
export type ChartConfig = z.infer<typeof chartConfigSchema>;
export type UpdateLayout = z.infer<typeof updateLayoutSchema>;
Configure TypeScript (tsconfig.json):

Ensure compilerOptions include:
"module": "ESNext" and "moduleResolution": "bundler" to support modern ES modules.
"strict": true for strong type checking.
"jsx": "preserve" (or "react-jsx" depending on Vite/React setup).
"esModuleInterop": true.
"baseUrl": "." and paths for aliases (@/*, @shared/*).
JSON

// Example: tsconfig.json (partial)
{
  "compilerOptions": {
    // ... other options
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "esModuleInterop": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"]
    }
  },
  "include": ["client/src/**/*", "shared/**/*", "server/**/*"]
}
Install Dependencies (package.json, npm install):

Run npm install in the root directory to install all dependencies listed in package.json and package-lock.json. Ensure core dependencies like react, react-dom, express, @tanstack/react-query, react-grid-layout, zod, drizzle-orm, tsx, vite, tailwindcss are present.
Phase 2: Backend Implementation (server/)

Set Up Express Server (server/index.ts):

Import necessary modules (express, createServer, ./routes, ./storage, ./vite).
Create an Express app instance: const app = express();.
Apply core middleware: app.use(express.json());, app.use(express.urlencoded({ extended: false }));.
Implement request logging middleware (as provided).
Register API routes: const server = await registerRoutes(app);.
Implement the centralized error handling middleware after route registration.
TypeScript

// Example: server/index.ts (Error Handler)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error("Error:", err); // Add logging
  res.status(status).json({ message });
  // remove throw err; in production if it prevents graceful shutdown
});
Conditionally set up Vite middleware (dev) or serve static files (prod) using setupVite and serveStatic from server/vite.ts.
Start the HTTP server: server.listen({ port, host: "0.0.0.0", ... }).
Implement Storage Layer (server/storage.ts):

Define the IStorage interface with all required CRUD methods for users, dashboards, and cards.
Implement the MemStorage class implementing IStorage.
Use Map for in-memory storage: private dashboards: Map<number, Dashboard>;.
Manage IDs using counters: this.dashboardCurrentId = 1;.
Implement methods like createCard, ensuring correct ID assignment and data structure.
TypeScript

// Example: server/storage.ts (createCard)
async createCard(insertCard: InsertCard): Promise<Card> {
  const id = this.cardCurrentId++;
  const card: Card = {
    ...insertCard, // Spread incoming data
    id,             // Assign new ID
    layout: {       // Ensure layout object has correct string ID
      ...insertCard.layout,
      i: id.toString()
    }
  };
  this.cards.set(id, card);
  return card;
}
Implement updateCardsLayout to iterate through the layout array and update corresponding cards in the map.
TypeScript

// Example: server/storage.ts (updateCardsLayout)
async updateCardsLayout(dashboardId: number, layout: ReactGridLayout): Promise<boolean> {
  try {
    for (const layoutItem of layout) {
      const cardId = parseInt(layoutItem.i, 10);
      const card = await this.getCard(cardId); // Use existing method

      if (card && card.dashboardId === dashboardId) {
        // Update only the layout part of the card
        const updatedCard = { ...card, layout: layoutItem };
        this.cards.set(cardId, updatedCard); // Update map
      }
    }
    return true;
  } catch (error) {
    console.error("Error updating layouts:", error);
    return false;
  }
}
Implement initializeDefaultData to create initial demo data using the class's own createDashboard and createCard methods.
Export a singleton instance: export const storage = new MemStorage();.
Implement API Routes (server/routes.ts):

Create an Express router: const apiRouter = express.Router();.
Define handlers for each endpoint (e.g., GET /api/dashboards/:id, POST /api/dashboards/:dashboardId/cards).
Inside handlers:
Parse and validate URL parameters (e.g., parseInt(req.params.id)). Return 400 if invalid.
Use try...catch blocks for error handling.
Validate request body using Zod schemas from @shared/schema. Catch ZodError and respond with a formatted 400 error.
TypeScript

// Example: server/routes.ts (POST card validation)
try {
  const dashboardId = parseInt(req.params.dashboardId, 10);
  // ... dashboard existence check ...
  const cardData = insertCardSchema.parse({ // Validate body
    ...req.body,
    dashboardId, // Add dashboardId from param
  });
  const card = await storage.createCard(cardData);
  res.status(201).json(card);
} catch (error) {
  if (error instanceof ZodError) {
    const validationError = fromZodError(error);
    return res.status(400).json({ message: validationError.message });
  }
  // Handle other errors or pass to central handler
  console.error("Error creating card:", error);
  res.status(500).json({ message: "Failed to create card" });
}
Call appropriate storage methods.
Handle cases where data is not found (e.g., getDashboard, getCard) and return 404.
Send JSON responses with correct status codes (200, 201, 204, 400, 404, 500).
Mount the router: app.use("/api", apiRouter);.
Phase 3: Frontend Implementation (client/)

Set Up API Client Layer (client/src/lib/queryClient.ts, client/src/api/*.ts):

queryClient.ts:
Create QueryClient instance with default options (retry: false, staleTime: Infinity, etc.).
Implement apiRequest helper function using Workspace, handling methods, JSON body, and basic error checking (throwIfResNotOk).
Implement getQueryFn to be used as the default query function, handling the API call based on queryKey.
api/dashboard.ts: Implement DashboardAPI object with functions like Workspace(id) and saveLayout(id, layout) that use apiRequest.
api/cards.ts: Implement CardAPI object with functions like create(dashId, card), update(id, card), delete(id) that use apiRequest.
Implement State Management (client/src/hooks/*.ts, client/src/context/*.ts):

React Query Hooks:
useDashboardData.ts: Use useQuery to fetch dashboard data via DashboardAPI.fetch.
TypeScript

// Example: useDashboardData.ts
import { useQuery } from "@tanstack/react-query";
import { DashboardAPI } from "@/api/dashboard"; // Assuming API is structured like this
import type { DashboardData } from "@/types";

export function useDashboardData(dashboardId: number = 1) {
  const queryKey = [`/api/dashboards/${dashboardId}`]; // Matches queryFn convention
  const { data, isLoading, isError, error } = useQuery<DashboardData>({
    queryKey: queryKey,
    // queryFn is likely default, or explicitly: () => DashboardAPI.fetch(dashboardId)
  });
  // ... return values
}
useCards.ts: Use useMutation for createCard, updateCard, deleteCard. Implement onSuccess to invalidate the main dashboard query and show success toasts. Implement onError to show error toasts.
TypeScript

// Example: useCards.ts (createCard mutation)
const createCard = useMutation({
  mutationFn: (card: Omit<InsertCard, "dashboardId">) =>
    CardAPI.create(dashboardId, card),
  onSuccess: () => {
    toast({ title: "Success", description: "Card created" });
    queryClient.invalidateQueries({ queryKey: [`/api/dashboards/${dashboardId}`] });
  },
  onError: (error) => {
    toast({ title: "Error", description: `Failed: ${error.message}`, variant: "destructive" });
  },
});
useLayout.ts: Manage local layout state with useState. Use useMutation for saveLayout. Implement handleLayoutChange to update state. Implement debounced save logic within or called by handleLayoutChange.
TypeScript

// Example: useLayout.ts (debounced save)
const saveLayoutMutation = useMutation({ /* ... mutation options ... */ });

const debouncedSave = debounce((newLayout: ReactGridLayout) => {
  saveLayoutMutation.mutate(newLayout);
}, 1000); // Debounce for 1 second

const handleLayoutChange = (newLayout: ReactGridLayout) => {
  setLayout(newLayout); // Update local state immediately for responsiveness
  debouncedSave(newLayout); // Trigger debounced save
};
UI Context (DashboardUIContext.tsx - Implement based on instructions):
Create a context to hold UI state (isEditMode, cardToEdit, etc.).
Provide state values and updater functions (toggleEditMode, openCardConfig, etc.) through the context provider.
Composition Hook (useDashboard.ts): Combine useDashboardData, useCards, useLayout, and useDashboardUI to provide a single interface for the main view.
Build UI Components (client/src/components/**/*.tsx - Implement based on instructions/hooks):

DashboardView.tsx: Get state and functions from useDashboard. Render DashboardGrid, dialogs, and controls based on isEditMode, isLoading, etc.
DashboardGrid.tsx: Use ResponsiveGridLayout. Map cards to CardWrapper components. Pass layout state and handleLayoutChange callback. Handle loading/empty states.
CardWrapper.tsx: Display title. Conditionally render edit/delete buttons based on isEditMode from useDashboardUI. Implement the Card Renderer Registry pattern:
TypeScript

// Conceptual: CardWrapper.tsx
import { getRenderer } from './renderers/cardRendererRegistry'; // Assuming registry exists

function CardWrapper({ card, isEditMode, onEdit, onDelete }) {
  const CardContent = getRenderer(card.type); // Get specific renderer component

  return (
    <div className="card-base-styles">
      <h3>{card.title}</h3>
      {isEditMode && (
        <div>
          <button onClick={() => onEdit(card)}>Edit</button>
          <button onClick={() => onDelete(card)}>Delete</button>
        </div>
      )}
      {CardContent ? <CardContent card={card} /> : <div>Unknown Card Type</div>}
    </div>
  );
}
renderers/cardRendererRegistry.ts: Create the registry map and getRenderer function.
Individual Renderers (ChartCard.tsx, ListCard.tsx, etc.): Implement components to display data based on card.config.
CardConfigDialog/CardConfigForm.tsx: Use react-hook-form with zodResolver to handle form state and validation based on schemas from shared/schema.ts. Conditionally render specific config fields. Call createCard.mutate or updateCard.mutate on submit.
DeleteConfirmDialog.tsx: Simple dialog triggered by delete button, calls deleteCard.mutate on confirmation.
Phase 4: Cross-Cutting Concerns

Shared Types (shared/schema.ts): Ensure consistent usage of imported types (Card, ChartConfig, etc.) throughout the frontend and backend code.
Error Handling (Client): Use onError callbacks in useMutation hooks to display user-friendly error messages via the useToast hook. Implement React Error Boundaries for rendering errors.
Styling (tailwind.config.ts, client/src/index.css): Apply Tailwind classes for styling. Ensure tailwind.config.ts correctly references theme variables and content paths. Include base styles and Tailwind directives in index.css.