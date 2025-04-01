import { apiRequest } from "@/lib/queryClient";
import { type Dashboard, type InsertDashboard, type UpdateDashboard, type ReactGridLayout } from "@shared/schema";

export const DashboardAPI = {
  /**
   * Fetch all dashboards
   * @returns Promise with all dashboards
   */
  async getAll(): Promise<Dashboard[]> {
    const response = await apiRequest("GET", "/api/dashboards");
    return response.json();
  },

  /**
   * Fetch a single dashboard with its cards
   * @param id Dashboard ID
   * @returns Promise with dashboard and associated cards
   */
  async fetch(id: number) {
    const response = await apiRequest("GET", `/api/dashboards/${id}`);
    return response.json();
  },

  /**
   * Create a new dashboard
   * @param dashboard Dashboard data to create
   * @returns Promise with created dashboard
   */
  async create(dashboard: InsertDashboard): Promise<Dashboard> {
    const response = await apiRequest("POST", "/api/dashboards", dashboard);
    return response.json();
  },

  /**
   * Update an existing dashboard
   * @param id Dashboard ID to update
   * @param dashboard Dashboard data to update
   * @returns Promise with updated dashboard
   */
  async update(id: number, dashboard: UpdateDashboard): Promise<Dashboard> {
    const response = await apiRequest("PATCH", `/api/dashboards/${id}`, dashboard);
    return response.json();
  },

  /**
   * Delete a dashboard
   * @param id Dashboard ID to delete
   * @returns Promise with successful status
   */
  async delete(id: number): Promise<void> {
    await apiRequest("DELETE", `/api/dashboards/${id}`);
  },

  /**
   * Save the layout for a dashboard's cards
   * @param dashboardId Dashboard ID
   * @param layout Layout data for the cards
   * @returns Promise with success status
   */
  async saveLayout(dashboardId: number, layout: ReactGridLayout): Promise<{ success: boolean }> {
    const response = await apiRequest(
      "PATCH", 
      `/api/dashboards/${dashboardId}/layout`, 
      layout
    );
    return response.json();
  }
};
