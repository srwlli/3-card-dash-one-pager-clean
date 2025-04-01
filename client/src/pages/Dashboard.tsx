import { useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useLayout } from "@/hooks/useLayout";
import { useDashboardUI } from "@/context/DashboardUIContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardDescription from "@/components/dashboard/DashboardDescription";
import DashboardGrid from "@/components/dashboard/DashboardGrid";
import AddCardModal from "@/components/modals/AddCardModal";
import EditCardModal from "@/components/modals/EditCardModal";
import DashboardModal from "@/components/modals/DashboardModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/dashboard/:id");
  const { toast } = useToast();
  
  const dashboardId = match ? parseInt(params.id, 10) : undefined;
  
  // State hooks
  const {
    dashboardData,
    isLoading,
    isError,
    error,
    updateDashboard,
    deleteDashboard
  } = useDashboardData(dashboardId);
  
  const { isEditMode, toggleEditMode, cardModals, dashboardModals } = useDashboardUI();
  const { layout, handleLayoutChange } = useLayout(dashboardData?.cards || [], dashboardId);
  
  useEffect(() => {
    if (dashboardData?.dashboard) {
      document.title = `${dashboardData.dashboard.title} | Dynamic Dashboard`;
    } else {
      document.title = "Loading Dashboard | Dynamic Dashboard";
    }
  }, [dashboardData?.dashboard]);
  
  if (!dashboardId || isNaN(dashboardId)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-red-500 mb-4">
              Invalid dashboard ID. Please select a valid dashboard.
            </div>
            <Button onClick={() => setLocation("/")}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError || !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-red-500 mb-4">
              Error loading dashboard: {error instanceof Error ? error.message : "Dashboard not found"}
            </div>
            <Button onClick={() => setLocation("/")}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { dashboard, cards } = dashboardData;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader 
        title={dashboard.title}
        dashboardId={dashboard.id}
        isEditMode={isEditMode}
        toggleEditMode={toggleEditMode}
        onAddCard={cardModals.add.onOpen}
      />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <DashboardDescription
          dashboard={dashboard}
          onEdit={() => dashboardModals.edit.onOpen(dashboard)}
          onDelete={() => dashboardModals.delete.onOpen(dashboard.id, dashboard.title)}
        />
        
        <DashboardGrid
          cards={cards}
          layout={layout}
          isEditMode={isEditMode}
          onLayoutChange={handleLayoutChange}
          onEditCard={cardModals.edit.onOpen}
          onDeleteCard={cardModals.delete.onOpen}
        />
      </main>
      
      {/* Modals */}
      <AddCardModal
        isOpen={cardModals.add.isOpen}
        onClose={cardModals.add.onClose}
        dashboardId={dashboardId}
      />
      
      <EditCardModal
        isOpen={cardModals.edit.isOpen}
        onClose={cardModals.edit.onClose}
        card={cardModals.edit.card}
      />
      
      <DashboardModal
        isOpen={dashboardModals.edit.isOpen}
        onClose={dashboardModals.edit.onClose}
        onSubmit={(data) => updateDashboard(dashboard.id, data)}
        mode="edit"
        dashboard={dashboard}
      />
      
      <DeleteConfirmModal
        isOpen={cardModals.delete.isOpen}
        onClose={cardModals.delete.onClose}
        onConfirm={() => {
          if (cardModals.delete.itemId) {
            cardModals.delete.onConfirm(cardModals.delete.itemId);
          }
        }}
        title="Delete Card"
        description={`Are you sure you want to delete "${cardModals.delete.itemName}" card? This action cannot be undone.`}
        isDeleting={false}
      />
      
      <DeleteConfirmModal
        isOpen={dashboardModals.delete.isOpen}
        onClose={dashboardModals.delete.onClose}
        onConfirm={() => {
          if (dashboardModals.delete.itemId) {
            deleteDashboard(dashboardModals.delete.itemId)
              .then(() => {
                setLocation("/");
                toast({
                  title: "Dashboard deleted",
                  description: "Dashboard has been successfully deleted",
                });
              });
          }
        }}
        title="Delete Dashboard"
        description={`Are you sure you want to delete "${dashboardModals.delete.itemName}" dashboard? All associated cards will also be deleted. This action cannot be undone.`}
        isDeleting={deleteDashboard.isPending}
      />
    </div>
  );
}
