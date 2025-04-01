import { Card } from "@shared/schema";
import { User, ShoppingCart, MessageSquare, Tag } from "lucide-react";

interface ListCardProps {
  card: Card;
}

// Mock data for activity list based on card title
const getMockActivityData = () => {
  return [
    {
      type: "user",
      name: "John Doe",
      action: "created a new account",
      time: "3 minutes ago",
      icon: "user",
      color: "blue"
    },
    {
      type: "purchase",
      name: "Sarah Smith",
      action: "completed a purchase",
      time: "15 minutes ago",
      icon: "shopping",
      color: "green"
    },
    {
      type: "review",
      name: "Mark Johnson",
      action: "left a review",
      time: "1 hour ago",
      icon: "tag",
      color: "yellow"
    },
    {
      type: "message",
      name: "Kate Williams",
      action: "sent a message",
      time: "2 hours ago",
      icon: "message",
      color: "purple"
    }
  ];
};

export default function ListCard({ card }: ListCardProps) {
  const config = card.config as any;
  const listConfig = config.config || { showIcons: true };
  
  // Get mock activity data
  const activityItems = getMockActivityData();
  
  const getIcon = (type: string, color: string) => {
    const colorClasses = {
      blue: "bg-blue-100 text-blue-500",
      green: "bg-green-100 text-green-500",
      yellow: "bg-yellow-100 text-yellow-500",
      purple: "bg-purple-100 text-purple-500",
      red: "bg-red-100 text-red-500",
    };
    
    const iconClass = `h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses] || 'bg-gray-100 text-gray-500'}`;
    
    switch (type) {
      case "user":
        return (
          <div className={iconClass}>
            <User className="h-4 w-4" />
          </div>
        );
      case "shopping":
        return (
          <div className={iconClass}>
            <ShoppingCart className="h-4 w-4" />
          </div>
        );
      case "message":
        return (
          <div className={iconClass}>
            <MessageSquare className="h-4 w-4" />
          </div>
        );
      case "tag":
        return (
          <div className={iconClass}>
            <Tag className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className={iconClass}>
            <User className="h-4 w-4" />
          </div>
        );
    }
  };

  return (
    <div className="flex-1 p-2 overflow-y-auto">
      <ul className="divide-y divide-gray-100">
        {activityItems.map((item, index) => (
          <li key={index} className="py-3 px-2">
            <div className="flex">
              {listConfig.showIcons && (
                <div className="mr-3">
                  {getIcon(item.icon, item.color)}
                </div>
              )}
              <div>
                <p className="text-sm text-gray-800">
                  <span className="font-medium">{item.name}</span> {item.action}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{item.time}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
