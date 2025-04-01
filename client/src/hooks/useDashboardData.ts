import { useQuery, useMutation } from "@tanstack/react-query";
import { Dashboard, Card, UpdateDashboard } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { DashboardAPI } from "@/api/dashboard";
import { useToast } from "@/hooks/use-toast";

interface DashboardData {
  dashboard: Dashboard;
  cards: Card[];
}

export function useDashboardData(dashboardId?: number) {
  const { toast } = useToast();
  
  // Query for dashboard with its cards
  const dashboardDataQuery = useQuery<DashboardData>({
    queryKey: dashboardId ? [`/api/dashboards/${dashboardId}`] : [],
    enabled: !!dashboardId,
  });
  
  // Update dashboard mutation
  const updateDashboardMutation = useMutation({
    mutationFn: (data: { id: number; dashboard: UpdateDashboard }) => {
      return DashboardAPI.update(data.id, data.dashboard);
    },
    onSuccess: () => {
      if (dashboardId) {
        queryClient.invalidateQueries({ queryKey: [`/api/dashboards/${dashboardId}`] });
        queryClient.invalidateQueries({ queryKey: ["/api/dashboards"] });
      }
      toast({
        title: "Success",
        description: "Dashboard updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update dashboard: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });
  
  // Delete dashboard mutation
  const deleteDashboardMutation = useMutation({
    mutationFn: (id: number) => {
      return DashboardAPI.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboards"] });
      toast({
        title: "Success",
        description: "Dashboard deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete dashboard: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });
  
  // Helper function to update dashboard
  const updateDashboard = (id: number, dashboard: UpdateDashboard) => {
    return updateDashboardMutation.mutateAsync({ id, dashboard });
  };
  
  // Helper function to delete dashboard
  const deleteDashboard = (id: number) => {
    return deleteDashboardMutation.mutateAsync(id);
  };
  
  return {
    dashboardData: dashboardDataQuery.data,
    isLoading: dashboardDataQuery.isLoading,
    isError: dashboardDataQuery.isError,
    error: dashboardDataQuery.error,
    updateDashboard,
    deleteDashboard
  };
}
