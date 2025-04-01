import { apiRequest } from "@/lib/queryClient";
import { type Card, type InsertCard, type UpdateCard } from "@shared/schema";

export const CardAPI = {
  /**
   * Create a new card in a dashboard
   * @param dashboardId Dashboard ID where the card will be created
   * @param card Card data to create
   * @returns Promise with created card
   */
  async create(dashboardId: number, card: InsertCard): Promise<Card> {
    const response = await apiRequest(
      "POST", 
      `/api/dashboards/${dashboardId}/cards`, 
      card
    );
    return response.json();
  },

  /**
   * Update an existing card
   * @param id Card ID to update
   * @param card Card data to update
   * @returns Promise with updated card
   */
  async update(id: number, card: UpdateCard): Promise<Card> {
    const response = await apiRequest(
      "PATCH", 
      `/api/cards/${id}`, 
      card
    );
    return response.json();
  },

  /**
   * Delete a card
   * @param id Card ID to delete
   * @returns Promise with success status
   */
  async delete(id: number): Promise<void> {
    await apiRequest("DELETE", `/api/cards/${id}`);
  }
};
