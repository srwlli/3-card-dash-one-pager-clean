import { useMemo } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { type Card, type ReactGridLayout, type ReactGridLayoutItem } from "@shared/schema";
import CardComponent from "./CardComponent";
import { cn } from "@/lib/utils";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardGridProps {
  cards: Card[];
  layout: ReactGridLayout;
  isEditMode: boolean;
  onLayoutChange: (layout: ReactGridLayout) => void;
  onEditCard: (card: Card) => void;
  onDeleteCard: (id: number, title: string) => void;
}

export default function DashboardGrid({
  cards,
  layout,
  isEditMode,
  onLayoutChange,
  onEditCard,
  onDeleteCard,
}: DashboardGridProps) {
  // Convert layout for react-grid-layout
  const layouts = useMemo(() => {
    return {
      lg: layout,
      md: layout.map(item => ({ ...item, w: Math.min(item.w, 6) })),
      sm: layout.map(item => ({ ...item, w: Math.min(item.w, 4), x: 0 })),
      xs: layout.map(item => ({ ...item, w: 2, x: 0 })),
    };
  }, [layout]);

  return (
    <div 
      className={cn(
        "w-full relative rounded-lg p-0 min-h-[600px]",
        isEditMode && "bg-gray-50 border border-dashed border-gray-300 p-4"
      )}
    >
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
        cols={{ lg: 12, md: 8, sm: 6, xs: 2 }}
        rowHeight={100}
        containerPadding={isEditMode ? [10, 10] : [0, 0]}
        margin={[16, 16]}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        onLayoutChange={(currentLayout) => onLayoutChange(currentLayout)}
        resizeHandles={["se"]}
      >
        {cards.map(card => (
          <div key={card.id.toString()}>
            <CardComponent
              card={card}
              isEditMode={isEditMode}
              onEdit={() => onEditCard(card)}
              onDelete={() => onDeleteCard(card.id, card.title)}
            />
          </div>
        ))}
      </ResponsiveGridLayout>
      
      {cards.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          {isEditMode 
            ? "Click 'Add Card' to add your first card to this dashboard" 
            : "This dashboard is empty. Switch to edit mode to add cards."
          }
        </div>
      )}
    </div>
  );
}
