import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useDashboards } from "@/hooks/useDashboards";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Check, LayoutGrid } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface DashboardHeaderProps {
  title: string;
  dashboardId: number;
  isEditMode: boolean;
  toggleEditMode: () => void;
  onAddCard: () => void;
}

export default function DashboardHeader({
  title,
  dashboardId,
  isEditMode,
  toggleEditMode,
  onAddCard,
}: DashboardHeaderProps) {
  const { dashboards, isLoading } = useDashboards();
  const [selectedDashboardId, setSelectedDashboardId] = useState<string>(dashboardId.toString());

  // Update selectedDashboardId when dashboardId prop changes
  useEffect(() => {
    setSelectedDashboardId(dashboardId.toString());
  }, [dashboardId]);

  const handleDashboardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDashboardId(e.target.value);
    // Navigate to the selected dashboard
    window.location.href = `/dashboard/${e.target.value}`;
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/">
            <a className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 bg-primary text-white rounded-lg">
                <LayoutGrid className="h-6 w-6" />
              </div>
              <h1 className="text-xl font-semibold text-gray-800">Dynamic Dashboard</h1>
            </a>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            {isLoading ? (
              <div className="w-52 h-9 flex items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : (
              <select
                className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm min-w-40"
                value={selectedDashboardId}
                onChange={handleDashboardChange}
              >
                {dashboards.map(dashboard => (
                  <option key={dashboard.id} value={dashboard.id}>
                    {dashboard.title}
                  </option>
                ))}
              </select>
            )}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <Button
            variant={isEditMode ? "default" : "outline"}
            className={isEditMode ? "bg-green-500 hover:bg-green-600 text-white" : "text-gray-600"}
            onClick={toggleEditMode}
          >
            {isEditMode ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Done
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </>
            )}
          </Button>
          
          <Button onClick={onAddCard}>
            <Plus className="h-4 w-4 mr-1" />
            Add Card
          </Button>
        </div>
      </div>
    </header>
  );
}
