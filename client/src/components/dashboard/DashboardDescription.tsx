import { type Dashboard } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface DashboardDescriptionProps {
  dashboard: Dashboard;
  onEdit: () => void;
  onDelete: () => void;
}

export default function DashboardDescription({
  dashboard,
  onEdit,
  onDelete
}: DashboardDescriptionProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-semibold text-gray-800">{dashboard.title}</h2>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            onClick={onEdit}
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
      <p className="text-gray-600">{dashboard.description || "No description provided"}</p>
    </div>
  );
}
