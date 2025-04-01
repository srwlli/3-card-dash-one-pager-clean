import { useState } from "react";
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

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardId: number;
}

const DEFAULT_SIZES = {
  chart: { w: 4, h: 2 },
  stats: { w: 3, h: 1 },
  table: { w: 6, h: 2 },
  list: { w: 4, h: 2 }
};

export default function AddCardModal({
  isOpen,
  onClose,
  dashboardId
}: AddCardModalProps) {
  const { createCard } = useCards(dashboardId);
  const { toast } = useToast();
  
  // Card basic properties
  const [title, setTitle] = useState("");
  const [cardType, setCardType] = useState("chart");
  
  // Size properties
  const [width, setWidth] = useState(4);
  const [height, setHeight] = useState(2);
  
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
  
  // Update size when card type changes
  const handleCardTypeChange = (type: string) => {
    setCardType(type);
    const defaultSize = DEFAULT_SIZES[type as keyof typeof DEFAULT_SIZES];
    setWidth(defaultSize.w);
    setHeight(defaultSize.h);
  };
  
  // Reset form state
  const resetForm = () => {
    setTitle("");
    setCardType("chart");
    setWidth(4);
    setHeight(2);
    setChartType("bar");
    setDataSource("");
    setShowLegend(true);
    setStatsValue("");
    setStatsChange("0");
    setStatsIcon("users");
    setTableColumns("");
    setTableDataSource("");
    setListDataSource("");
    setShowIcons(true);
    setMaxItems("10");
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
    
    const newCard = {
      dashboardId,
      title,
      type: cardType,
      config,
      layout: {
        i: "new", // Will be replaced by the server
        x: 0, // We'll place it at the top left, server should handle preventing overlaps
        y: 0,
        w: width,
        h: height,
        minW: Math.min(2, width),
        minH: 1
      }
    };
    
    createCard(newCard)
      .then(() => {
        toast({
          title: "Success",
          description: "Card created successfully"
        });
        handleClose();
      })
      .catch(error => {
        toast({
          title: "Error",
          description: `Failed to create card: ${error.message}`,
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
                id="show-legend" 
                checked={showLegend}
                onCheckedChange={(checked) => setShowLegend(checked === true)}
              />
              <Label htmlFor="show-legend">Show Legend</Label>
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
                id="show-icons" 
                checked={showIcons}
                onCheckedChange={(checked) => setShowIcons(checked === true)}
              />
              <Label htmlFor="show-icons">Show Icons</Label>
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Card</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <Label>Card Type</Label>
            <Select value={cardType} onValueChange={handleCardTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select card type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chart">Chart</SelectItem>
                <SelectItem value="stats">Stats</SelectItem>
                <SelectItem value="table">Table</SelectItem>
                <SelectItem value="list">List</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
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
          
          <div>
            <Label>Initial Size</Label>
            <div className="grid grid-cols-2 gap-4 mt-1">
              <div>
                <Label className="text-xs text-gray-500">Width (columns)</Label>
                <Input 
                  type="number"
                  min={1}
                  max={12}
                  value={width}
                  onChange={(e) => setWidth(parseInt(e.target.value, 10) || 1)}
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500">Height (rows)</Label>
                <Input 
                  type="number"
                  min={1}
                  max={6}
                  value={height}
                  onChange={(e) => setHeight(parseInt(e.target.value, 10) || 1)}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createCard.isPending}>
              {createCard.isPending ? "Adding..." : "Add Card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
