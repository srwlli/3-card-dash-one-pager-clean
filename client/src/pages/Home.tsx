import { useEffect } from "react";
import { useLocation } from "wouter";
import { useDashboards } from "@/hooks/useDashboards";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, LayoutGrid, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DashboardModal from "@/components/modals/DashboardModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";

export default function Home() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { 
    dashboards, 
    isLoading, 
    isError, 
    error,
    createDashboardModal,
    deleteDashboardModal,
    createDashboard, 
    deleteDashboard
  } = useDashboards();

  useEffect(() => {
    document.title = "Dynamic Dashboard - Home";
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-red-500 mb-4">
              Error loading dashboards: {error instanceof Error ? error.message : "Unknown error"}
            </div>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Dashboards</h1>
            <p className="text-muted-foreground mt-1">
              Select a dashboard to view or create a new one
            </p>
          </div>
          <Button 
            onClick={() => createDashboardModal.onOpen()} 
            className="flex items-center gap-1.5"
          >
            <PlusCircle className="h-4 w-4" />
            New Dashboard
          </Button>
        </div>
        
        <Separator className="mb-8" />

        {dashboards.length === 0 ? (
          <div className="text-center py-12">
            <LayoutGrid className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2">No dashboards yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first dashboard to get started
            </p>
            <Button 
              onClick={() => createDashboardModal.onOpen()}
              className="flex items-center gap-1.5 mx-auto"
            >
              <PlusCircle className="h-4 w-4" />
              Create Dashboard
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboards.map((dashboard) => (
              <Card key={dashboard.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="flex justify-between items-center">
                    <span className="truncate">{dashboard.title}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDashboardModal.onOpen(dashboard.id, dashboard.title);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    {dashboard.description || "No description provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent></CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => setLocation(`/dashboard/${dashboard.id}`)}
                  >
                    Open Dashboard
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      {/* Modals */}
      <DashboardModal
        isOpen={createDashboardModal.isOpen}
        onClose={createDashboardModal.onClose}
        onSubmit={createDashboard}
        mode="create"
      />
      
      <DeleteConfirmModal
        isOpen={deleteDashboardModal.isOpen}
        onClose={deleteDashboardModal.onClose}
        onConfirm={() => {
          if (deleteDashboardModal.itemId) {
            deleteDashboard(deleteDashboardModal.itemId);
          }
        }}
        title="Delete Dashboard"
        description={`Are you sure you want to delete "${deleteDashboardModal.itemName}"? This action cannot be undone.`}
        isDeleting={deleteDashboard.isPending}
      />
    </div>
  );
}
