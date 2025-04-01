import { Card } from "@shared/schema";
import { TrendingUp, TrendingDown, Users, BadgeCheck } from "lucide-react";

interface StatsCardProps {
  card: Card;
}

export default function StatsCard({ card }: StatsCardProps) {
  const config = card.config as any;
  const statsConfig = config.config || {};
  
  // Default values in case config is incomplete
  const value = statsConfig.value || "0";
  const change = statsConfig.change || 0;
  const changeType = statsConfig.changeType || (change >= 0 ? "increase" : "decrease");
  const icon = statsConfig.icon || "default";
  
  const renderIcon = () => {
    switch (icon) {
      case "users":
        return (
          <div className="bg-blue-50 p-2 rounded-full">
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        );
      case "badge-check":
        return (
          <div className="bg-green-50 p-2 rounded-full">
            <BadgeCheck className="h-8 w-8 text-green-500" />
          </div>
        );
      default:
        return (
          <div className="bg-gray-50 p-2 rounded-full">
            <Users className="h-8 w-8 text-gray-500" />
          </div>
        );
    }
  };

  return (
    <div className="flex-1 p-4 flex items-center">
      <div className="flex items-center justify-between w-full">
        <div>
          <p className="text-3xl font-semibold text-gray-800">{value}</p>
          <div className="flex items-center mt-1 text-sm">
            <span className={`flex items-center ${changeType === "increase" ? "text-green-600" : "text-red-600"}`}>
              {changeType === "increase" ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              {Math.abs(change)}%
            </span>
            <span className="text-gray-500 ml-1">vs last month</span>
          </div>
        </div>
        {renderIcon()}
      </div>
    </div>
  );
}
