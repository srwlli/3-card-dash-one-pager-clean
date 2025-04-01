import { useMutation } from "@tanstack/react-query";
import { InsertCard, UpdateCard } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { CardAPI } from "@/api/cards";
import { useToast } from "@/hooks/use-toast";

export function useCards(dashboardId?: number) {
  const { toast } = useToast();
  
  // Create card mutation
  const createCardMutation = useMutation({
    mutationFn: (card: Omit<InsertCard, "dashboardId">) => {
      if (!dashboardId) throw new Error("Dashboard ID is required");
      return CardAPI.create(dashboardId, card as InsertCard);
    },
    onSuccess: () => {
      if (dashboardId) {
        queryClient.invalidateQueries({ queryKey: [`/api/dashboards/${dashboardId}`] });
      }
      toast({
        title: "Success",
        description: "Card created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create card: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });
  
  // Update card mutation
  const updateCardMutation = useMutation({
    mutationFn: (data: { id: number; card: UpdateCard }) => {
      return CardAPI.update(data.id, data.card);
    },
    onSuccess: () => {
      if (dashboardId) {
        queryClient.invalidateQueries({ queryKey: [`/api/dashboards/${dashboardId}`] });
      }
      toast({
        title: "Success",
        description: "Card updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update card: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });
  
  // Delete card mutation
  const deleteCardMutation = useMutation({
    mutationFn: (id: number) => {
      return CardAPI.delete(id);
    },
    onSuccess: () => {
      if (dashboardId) {
        queryClient.invalidateQueries({ queryKey: [`/api/dashboards/${dashboardId}`] });
      }
      toast({
        title: "Success",
        description: "Card deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete card: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });
  
  return {
    createCard: createCardMutation.mutate,
    updateCard: (id: number, card: UpdateCard) => updateCardMutation.mutate({ id, card }),
    deleteCard: deleteCardMutation.mutate,
  };
}
