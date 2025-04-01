import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dashboard, InsertDashboard, UpdateDashboard } from "@shared/schema";

interface DashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InsertDashboard | UpdateDashboard) => Promise<unknown>;
  mode: "create" | "edit";
  dashboard?: Dashboard;
}

export default function DashboardModal({
  isOpen,
  onClose,
  onSubmit,
  mode,
  dashboard
}: DashboardModalProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form with dashboard data if in edit mode
  useEffect(() => {
    if (mode === "edit" && dashboard) {
      setTitle(dashboard.title);
      setDescription(dashboard.description || "");
    } else if (mode === "create") {
      setTitle("");
      setDescription("");
    }
  }, [mode, dashboard, isOpen]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Dashboard title is required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const data: InsertDashboard | UpdateDashboard = {
        title,
        description: description.trim() ? description : undefined,
        ...(mode === "create" ? { userId: 1 } : {})
      };
      
      await onSubmit(data);
      
      toast({
        title: "Success",
        description: `Dashboard ${mode === "create" ? "created" : "updated"} successfully`
      });
      
      handleClose();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${mode} dashboard: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleClose = () => {
    if (!isSubmitting) {
      setTitle("");
      setDescription("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Dashboard" : "Edit Dashboard"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title"
              placeholder="Dashboard title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea 
              id="description"
              placeholder="Brief description of this dashboard"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (mode === "create" ? "Creating..." : "Saving...") 
                : (mode === "create" ? "Create Dashboard" : "Save Changes")
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
