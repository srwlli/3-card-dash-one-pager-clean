import { useMemo } from "react";
import { Card } from "@shared/schema";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  AreaChart,
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell
} from "recharts";

interface ChartCardProps {
  card: Card;
}

// Mock data factory for different chart types
const getChartData = (chartType: string, title: string) => {
  if (chartType === "pie") {
    return [
      { name: "Direct", value: 35 },
      { name: "Social", value: 25 },
      { name: "Email", value: 20 },
      { name: "Organic", value: 15 },
      { name: "Referral", value: 5 },
    ];
  }
  
  // For bar, line, area charts
  if (title.includes("Revenue")) {
    return [
      { name: "Jan", value: 70 },
      { name: "Feb", value: 60 },
      { name: "Mar", value: 80 },
      { name: "Apr", value: 70 },
      { name: "May", value: 90 },
    ];
  }
  
  return [
    { name: "Item 1", value: 45 },
    { name: "Item 2", value: 72 },
    { name: "Item 3", value: 38 },
    { name: "Item 4", value: 59 },
    { name: "Item 5", value: 65 },
  ];
};

// Colors for different charts
const COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444"];

export default function ChartCard({ card }: ChartCardProps) {
  const config = card.config as any;
  const chartType = config.config?.chartType || "bar";
  const showLegend = config.config?.showLegend !== false;
  
  const data = useMemo(() => {
    return getChartData(chartType, card.title);
  }, [chartType, card.title]);

  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            {showLegend && <Legend />}
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        );
      case "line":
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            {showLegend && <Legend />}
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#3b82f6" />
          </LineChart>
        );
      case "area":
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            {showLegend && <Legend />}
            <Tooltip />
            <Area type="monotone" dataKey="value" fill="#3b82f6" fillOpacity={0.6} stroke="#3b82f6" />
          </AreaChart>
        );
      case "pie":
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            {showLegend && <Legend />}
            <Tooltip />
          </PieChart>
        );
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div className="p-4 h-full">
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
