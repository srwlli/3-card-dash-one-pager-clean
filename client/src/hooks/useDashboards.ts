import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dashboard, InsertDashboard } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { DashboardAPI } from "@/api/dashboard";
import { useToast } from "@/hooks/use-toast";

export function useDashboards() {
  const { toast } = useToast();
  
  // Modal state for dashboard creation
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);
  
  // Modal state for dashboard deletion
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [dashboardToDeleteId, setDashboardToDeleteId] = useState<number | undefined>(undefined);
  const [dashboardToDeleteName, setDashboardToDeleteName] = useState("");
  
  const openDeleteModal = (id: number, name: string) => {
    setDashboardToDeleteId(id);
    setDashboardToDeleteName(name);
    setIsDeleteModalOpen(true);
  };
  
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDashboardToDeleteId(undefined);
    setDashboardToDeleteName("");
  };
  
  // Get all dashboards
  const dashboardsQuery = useQuery<Dashboard[]>({
    queryKey: ["/api/dashboards"],
  });
  
  // Create dashboard mutation
  const createDashboardMutation = useMutation({
    mutationFn: (dashboard: InsertDashboard) => {
      return DashboardAPI.create(dashboard);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboards"] });
      toast({
        title: "Success",
        description: "Dashboard created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create dashboard: ${error instanceof Error ? error.message : "Unknown error"}`,
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
      closeDeleteModal();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete dashboard: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    },
  });
  
  return {
    dashboards: dashboardsQuery.data || [],
    isLoading: dashboardsQuery.isLoading,
    isError: dashboardsQuery.isError,
    error: dashboardsQuery.error,
    
    // Modal state and handlers for create
    createDashboardModal: {
      isOpen: isCreateModalOpen,
      onOpen: openCreateModal,
      onClose: closeCreateModal,
    },
    
    // Modal state and handlers for delete
    deleteDashboardModal: {
      isOpen: isDeleteModalOpen,
      itemId: dashboardToDeleteId,
      itemName: dashboardToDeleteName,
      onOpen: openDeleteModal,
      onClose: closeDeleteModal,
    },
    
    // Mutations
    createDashboard: createDashboardMutation.mutate,
    deleteDashboard: deleteDashboardMutation.mutate,
  };
}
