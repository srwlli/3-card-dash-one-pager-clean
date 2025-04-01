import { Pencil, Trash2 } from "lucide-react";
import { type Card } from "@shared/schema";
import ChartCard from "./cards/ChartCard";
import StatsCard from "./cards/StatsCard";
import TableCard from "./cards/TableCard";
import ListCard from "./cards/ListCard";

interface CardComponentProps {
  card: Card;
  isEditMode: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export default function CardComponent({
  card,
  isEditMode,
  onEdit,
  onDelete,
}: CardComponentProps) {
  // Render specific card component based on type
  const renderCardContent = () => {
    switch (card.type) {
      case "chart":
        return <ChartCard card={card} />;
      case "stats":
        return <StatsCard card={card} />;
      case "table":
        return <TableCard card={card} />;
      case "list":
        return <ListCard card={card} />;
      default:
        return <div className="p-4">Unsupported card type</div>;
    }
  };

  return (
    <div className="card h-full bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="card-content h-full flex flex-col">
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h3 className="font-medium text-gray-800">{card.title}</h3>
          {isEditMode && (
            <div className="flex gap-1">
              <button 
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
                onClick={onEdit}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button 
                className="text-gray-400 hover:text-red-500 p-1 rounded"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
        
        {/* Card Body */}
        <div className="flex-1 overflow-hidden">
          {renderCardContent()}
        </div>
      </div>
    </div>
  );
}
