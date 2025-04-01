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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useCards } from "@/hooks/useCards";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@shared/schema";

interface EditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card?: Card;
}

export default function EditCardModal({
  isOpen,
  onClose,
  card
}: EditCardModalProps) {
  const { updateCard } = useCards(card?.dashboardId);
  const { toast } = useToast();
  
  // Card basic properties
  const [title, setTitle] = useState("");
  const [cardType, setCardType] = useState("chart");
  
  // Chart specific properties
  const [chartType, setChartType] = useState("bar");
  const [dataSource, setDataSource] = useState("");
  const [showLegend, setShowLegend] = useState(true);
  
  // Stats specific properties
  const [statsValue, setStatsValue] = useState("");
  const [statsChange, setStatsChange] = useState("0");
  const [statsIcon, setStatsIcon] = useState("users");
  
  // Table specific properties
  const [tableColumns, setTableColumns] = useState("");
  const [tableDataSource, setTableDataSource] = useState("");
  
  // List specific properties
  const [listDataSource, setListDataSource] = useState("");
  const [showIcons, setShowIcons] = useState(true);
  const [maxItems, setMaxItems] = useState("10");
  
  // Load current card data when card changes
  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setCardType(card.type);
      
      const config = card.config as any;
      
      if (card.type === "chart") {
        setChartType(config.config?.chartType || "bar");
        setDataSource(config.config?.dataSource || "");
        setShowLegend(config.config?.showLegend !== false);
      } 
      else if (card.type === "stats") {
        setStatsValue(config.config?.value || "");
        setStatsChange(String(config.config?.change || 0));
        setStatsIcon(config.config?.icon || "users");
      } 
      else if (card.type === "table") {
        setTableColumns((config.config?.columns || [])
          .map((col: any) => col.key || col.label)
          .join(","));
        setTableDataSource(config.config?.dataSource || "");
      } 
      else if (card.type === "list") {
        setListDataSource(config.config?.dataSource || "");
        setShowIcons(config.config?.showIcons !== false);
        setMaxItems(String(config.config?.maxItems || 10));
      }
    }
  }, [card]);
  
  const handleClose = () => {
    onClose();
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!card) return;
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Card title is required",
        variant: "destructive"
      });
      return;
    }
    
    let config;
    
    switch (cardType) {
      case "chart":
        config = {
          type: "chart",
          config: {
            chartType,
            dataSource: dataSource || `/api/data/${title.toLowerCase().replace(/\s+/g, '-')}`,
            showLegend
          }
        };
        break;
      case "stats":
        config = {
          type: "stats",
          config: {
            value: statsValue,
            change: parseFloat(statsChange),
            changeType: parseFloat(statsChange) >= 0 ? "increase" : "decrease",
            icon: statsIcon
          }
        };
        break;
      case "table":
        config = {
          type: "table",
          config: {
            columns: tableColumns.split(',').map(col => ({ key: col.trim(), label: col.trim() })),
            dataSource: tableDataSource || `/api/data/${title.toLowerCase().replace(/\s+/g, '-')}`
          }
        };
        break;
      case "list":
        config = {
          type: "list",
          config: {
            dataSource: listDataSource || `/api/data/${title.toLowerCase().replace(/\s+/g, '-')}`,
            showIcons,
            maxItems: parseInt(maxItems, 10)
          }
        };
        break;
      default:
        config = { type: "chart", config: { chartType: "bar", showLegend: true } };
    }
    
    const updatedCard = {
      title,
      type: cardType,
      config,
      layout: card.layout // Keep the existing layout
    };
    
    updateCard(card.id, updatedCard)
      .then(() => {
        toast({
          title: "Success",
          description: "Card updated successfully"
        });
        handleClose();
      })
      .catch(error => {
        toast({
          title: "Error",
          description: `Failed to update card: ${error.message}`,
          variant: "destructive"
        });
      });
  };
  
  const renderCardTypeOptions = () => {
    switch (cardType) {
      case "chart":
        return (
          <div className="space-y-4">
            <div>
              <Label>Chart Type</Label>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                  <SelectItem value="area">Area Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Data Source (optional)</Label>
              <Input 
                placeholder="API endpoint for data (leave empty for demo data)"
                value={dataSource}
                onChange={(e) => setDataSource(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="edit-show-legend" 
                checked={showLegend}
                onCheckedChange={(checked) => setShowLegend(checked === true)}
              />
              <Label htmlFor="edit-show-legend">Show Legend</Label>
            </div>
          </div>
        );
      
      case "stats":
        return (
          <div className="space-y-4">
            <div>
              <Label>Display Value</Label>
              <Input 
                placeholder="Value to display (e.g. 8,492)"
                value={statsValue}
                onChange={(e) => setStatsValue(e.target.value)}
              />
            </div>
            
            <div>
              <Label>Change Percentage</Label>
              <Input 
                type="number"
                placeholder="Change percentage (e.g. 12.5)"
                value={statsChange}
                onChange={(e) => setStatsChange(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Use negative values to show a decrease
              </p>
            </div>
            
            <div>
              <Label>Icon</Label>
              <Select value={statsIcon} onValueChange={setStatsIcon}>
                <SelectTrigger>
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="users">Users</SelectItem>
                  <SelectItem value="badge-check">Badge Check</SelectItem>
                  <SelectItem value="trending-up">Trending Up</SelectItem>
                  <SelectItem value="dollar">Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      
      case "table":
        return (
          <div className="space-y-4">
            <div>
              <Label>Table Columns</Label>
              <Input 
                placeholder="Comma-separated column names (e.g. product,sales,revenue,growth)"
                value={tableColumns}
                onChange={(e) => setTableColumns(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter column names separated by commas
              </p>
            </div>
            
            <div>
              <Label>Data Source (optional)</Label>
              <Input 
                placeholder="API endpoint for data (leave empty for demo data)"
                value={tableDataSource}
                onChange={(e) => setTableDataSource(e.target.value)}
              />
            </div>
          </div>
        );
      
      case "list":
        return (
          <div className="space-y-4">
            <div>
              <Label>Data Source (optional)</Label>
              <Input 
                placeholder="API endpoint for data (leave empty for demo data)"
                value={listDataSource}
                onChange={(e) => setListDataSource(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="edit-show-icons" 
                checked={showIcons}
                onCheckedChange={(checked) => setShowIcons(checked === true)}
              />
              <Label htmlFor="edit-show-icons">Show Icons</Label>
            </div>
            
            <div>
              <Label>Max Items</Label>
              <Input 
                type="number"
                placeholder="Maximum number of items to display"
                value={maxItems}
                onChange={(e) => setMaxItems(e.target.value)}
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (!card) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Card</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <Label>Title</Label>
            <Input 
              placeholder="Card title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          {/* Render type-specific options */}
          {renderCardTypeOptions()}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateCard.isPending}>
              {updateCard.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
