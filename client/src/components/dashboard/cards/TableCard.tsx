import { Card } from "@shared/schema";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TableCardProps {
  card: Card;
}

// Mock data for tables based on card title
const getMockTableData = (title: string) => {
  if (title.includes("Product")) {
    return [
      {
        product: { name: "Premium Headphones", category: "Electronics" },
        sales: "1,245",
        revenue: "$124,500",
        growth: { value: 23.5, type: "increase" }
      },
      {
        product: { name: "Wireless Keyboard", category: "Accessories" },
        sales: "987",
        revenue: "$59,220",
        growth: { value: 18.2, type: "increase" }
      },
      {
        product: { name: "Smart Watch", category: "Wearables" },
        sales: "768",
        revenue: "$92,160",
        growth: { value: 5.3, type: "decrease" }
      },
      {
        product: { name: "Bluetooth Speaker", category: "Audio" },
        sales: "542",
        revenue: "$48,780",
        growth: { value: 12.8, type: "increase" }
      }
    ];
  }
  
  // Default table data
  return [
    {
      product: { name: "Item 1", category: "Category A" },
      sales: "521",
      revenue: "$52,100",
      growth: { value: 10.5, type: "increase" }
    },
    {
      product: { name: "Item 2", category: "Category B" },
      sales: "349",
      revenue: "$34,900",
      growth: { value: 8.2, type: "increase" }
    },
    {
      product: { name: "Item 3", category: "Category C" },
      sales: "278",
      revenue: "$27,800",
      growth: { value: 3.7, type: "decrease" }
    }
  ];
};

export default function TableCard({ card }: TableCardProps) {
  const config = card.config as any;
  const tableConfig = config.config || { columns: [] };
  
  // Get mock data based on card title
  const tableData = getMockTableData(card.title);

  return (
    <div className="flex-1 p-2 overflow-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tableData.map((item, index) => (
            <tr key={index}>
              <td className="px-4 py-2 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-8 w-8 flex-shrink-0 bg-gray-200 rounded mr-3"></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
                    <div className="text-xs text-gray-500">{item.product.category}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.sales}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.revenue}</td>
              <td className="px-4 py-2 whitespace-nowrap">
                <div className={`flex items-center text-sm ${item.growth.type === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                  {item.growth.type === 'increase' ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {item.growth.value}%
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
