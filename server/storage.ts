import { 
  users, type User, type InsertUser,
  dashboards, type Dashboard, type InsertDashboard, type UpdateDashboard,
  cards, type Card, type InsertCard, type UpdateCard,
  type ReactGridLayout, type ReactGridLayoutItem
} from "@shared/schema";

export interface IStorage {
  // User methods (existing)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Dashboard methods
  getDashboards(): Promise<Dashboard[]>;
  getDashboard(id: number): Promise<Dashboard | undefined>;
  createDashboard(dashboard: InsertDashboard): Promise<Dashboard>;
  updateDashboard(id: number, dashboard: UpdateDashboard): Promise<Dashboard | undefined>;
  deleteDashboard(id: number): Promise<boolean>;
  
  // Card methods
  getCards(dashboardId: number): Promise<Card[]>;
  getCard(id: number): Promise<Card | undefined>;
  createCard(card: InsertCard): Promise<Card>;
  updateCard(id: number, card: UpdateCard): Promise<Card | undefined>;
  deleteCard(id: number): Promise<boolean>;
  
  // Layout methods
  updateCardsLayout(dashboardId: number, layout: ReactGridLayout): Promise<boolean>;
  
  // Demo data
  initializeDefaultData(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private dashboards: Map<number, Dashboard>;
  private cards: Map<number, Card>;
  
  private userCurrentId: number;
  private dashboardCurrentId: number;
  private cardCurrentId: number;
  
  constructor() {
    this.users = new Map();
    this.dashboards = new Map();
    this.cards = new Map();
    
    this.userCurrentId = 1;
    this.dashboardCurrentId = 1;
    this.cardCurrentId = 1;
    
    // Initialize with default data
    this.initializeDefaultData();
  }
  
  // User methods (existing)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Dashboard methods
  async getDashboards(): Promise<Dashboard[]> {
    return Array.from(this.dashboards.values());
  }
  
  async getDashboard(id: number): Promise<Dashboard | undefined> {
    return this.dashboards.get(id);
  }
  
  async createDashboard(dashboard: InsertDashboard): Promise<Dashboard> {
    const id = this.dashboardCurrentId++;
    const newDashboard: Dashboard = { ...dashboard, id };
    this.dashboards.set(id, newDashboard);
    return newDashboard;
  }
  
  async updateDashboard(id: number, dashboard: UpdateDashboard): Promise<Dashboard | undefined> {
    const existingDashboard = this.dashboards.get(id);
    
    if (!existingDashboard) {
      return undefined;
    }
    
    const updatedDashboard: Dashboard = {
      ...existingDashboard,
      ...dashboard,
    };
    
    this.dashboards.set(id, updatedDashboard);
    return updatedDashboard;
  }
  
  async deleteDashboard(id: number): Promise<boolean> {
    // Get all cards for this dashboard to delete them first
    const dashboardCards = Array.from(this.cards.values())
      .filter(card => card.dashboardId === id);
    
    // Delete all cards
    for (const card of dashboardCards) {
      this.cards.delete(card.id);
    }
    
    // Delete the dashboard
    return this.dashboards.delete(id);
  }
  
  // Card methods
  async getCards(dashboardId: number): Promise<Card[]> {
    return Array.from(this.cards.values())
      .filter(card => card.dashboardId === dashboardId);
  }
  
  async getCard(id: number): Promise<Card | undefined> {
    return this.cards.get(id);
  }
  
  async createCard(insertCard: InsertCard): Promise<Card> {
    const id = this.cardCurrentId++;
    
    // Ensure the layout 'i' property matches the card id as string
    const layout: ReactGridLayoutItem = {
      ...insertCard.layout,
      i: id.toString()
    };
    
    const card: Card = {
      ...insertCard,
      id,
      layout
    };
    
    this.cards.set(id, card);
    return card;
  }
  
  async updateCard(id: number, updateCard: UpdateCard): Promise<Card | undefined> {
    const existingCard = this.cards.get(id);
    
    if (!existingCard) {
      return undefined;
    }
    
    // Update layout with the correct id
    const layout: ReactGridLayoutItem = {
      ...updateCard.layout,
      i: id.toString()
    };
    
    const updatedCard: Card = {
      ...existingCard,
      ...updateCard,
      layout
    };
    
    this.cards.set(id, updatedCard);
    return updatedCard;
  }
  
  async deleteCard(id: number): Promise<boolean> {
    return this.cards.delete(id);
  }
  
  // Layout methods
  async updateCardsLayout(dashboardId: number, layout: ReactGridLayout): Promise<boolean> {
    try {
      for (const layoutItem of layout) {
        const cardId = parseInt(layoutItem.i, 10);
        const card = await this.getCard(cardId);
        
        if (card && card.dashboardId === dashboardId) {
          // Update only the layout part of the card
          const updatedCard = { 
            ...card, 
            layout: layoutItem 
          };
          this.cards.set(cardId, updatedCard);
        }
      }
      return true;
    } catch (error) {
      console.error("Error updating layouts:", error);
      return false;
    }
  }
  
  // Initialize demo data
  async initializeDefaultData(): Promise<void> {
    // Create a demo user if none exists
    if (this.users.size === 0) {
      await this.createUser({
        username: "demo",
        password: "demo123"
      });
    }
    
    // Create demo dashboards if none exist
    if (this.dashboards.size === 0) {
      const analyticsDashboard = await this.createDashboard({
        title: "Analytics Dashboard",
        description: "Key performance metrics and analytics for your business",
        userId: 1
      });
      
      await this.createDashboard({
        title: "Project Metrics",
        description: "Track your project progress and KPIs",
        userId: 1
      });
      
      await this.createDashboard({
        title: "Custom Dashboard",
        description: "Your personalized dashboard for custom metrics",
        userId: 1
      });
      
      // Add default cards to the analytics dashboard
      await this.createCard({
        dashboardId: analyticsDashboard.id,
        title: "Monthly Revenue",
        type: "chart",
        config: {
          type: "chart",
          config: {
            chartType: "bar",
            dataSource: "/api/data/monthly-revenue",
            showLegend: true
          }
        },
        layout: {
          i: "1", // Will be overwritten by storage
          x: 0,
          y: 0,
          w: 4,
          h: 2,
          minW: 2,
          minH: 2
        }
      });
      
      await this.createCard({
        dashboardId: analyticsDashboard.id,
        title: "Total Users",
        type: "stats",
        config: {
          type: "stats",
          config: {
            value: "8,492",
            change: 12.5,
            changeType: "increase",
            icon: "users"
          }
        },
        layout: {
          i: "2", // Will be overwritten by storage
          x: 4,
          y: 0,
          w: 3,
          h: 1,
          minW: 2,
          minH: 1
        }
      });
      
      await this.createCard({
        dashboardId: analyticsDashboard.id,
        title: "Conversion Rate",
        type: "stats",
        config: {
          type: "stats",
          config: {
            value: "4.28%",
            change: -1.2,
            changeType: "decrease",
            icon: "badge-check"
          }
        },
        layout: {
          i: "3", // Will be overwritten by storage
          x: 7,
          y: 0,
          w: 3,
          h: 1,
          minW: 2,
          minH: 1
        }
      });
      
      await this.createCard({
        dashboardId: analyticsDashboard.id,
        title: "Top Products",
        type: "table",
        config: {
          type: "table",
          config: {
            columns: [
              { key: "product", label: "Product" },
              { key: "sales", label: "Sales" },
              { key: "revenue", label: "Revenue", type: "currency" },
              { key: "growth", label: "Growth", type: "change" }
            ],
            dataSource: "/api/data/top-products"
          }
        },
        layout: {
          i: "4", // Will be overwritten by storage
          x: 4,
          y: 1,
          w: 6,
          h: 2,
          minW: 4,
          minH: 2
        }
      });
      
      await this.createCard({
        dashboardId: analyticsDashboard.id,
        title: "Recent Activity",
        type: "list",
        config: {
          type: "list",
          config: {
            dataSource: "/api/data/recent-activity",
            showIcons: true,
            maxItems: 10
          }
        },
        layout: {
          i: "5", // Will be overwritten by storage
          x: 0,
          y: 2,
          w: 4,
          h: 2,
          minW: 2,
          minH: 2
        }
      });
      
      await this.createCard({
        dashboardId: analyticsDashboard.id,
        title: "Traffic Sources",
        type: "chart",
        config: {
          type: "chart",
          config: {
            chartType: "pie",
            dataSource: "/api/data/traffic-sources",
            showLegend: true
          }
        },
        layout: {
          i: "6", // Will be overwritten by storage
          x: 4,
          y: 3,
          w: 5,
          h: 2,
          minW: 3,
          minH: 2
        }
      });
    }
  }
}

// Export singleton instance
export const storage = new MemStorage();
