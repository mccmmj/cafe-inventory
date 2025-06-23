import { InventoryItem } from '@/types/inventory'
import { DollarSign, Package, PackageCheck, PackageX } from 'lucide-react'

interface InventoryStatsProps {
  inventory: InventoryItem[]
}

const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center">
    <div className={`p-3 rounded-full mr-4 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

export function InventoryStats({ inventory }: InventoryStatsProps) {
  const totalValue = inventory.reduce((sum, item) => {
    const costString = (item.Cost_Per_Unit || '').toString().replace(/[^0-9.]/g, '')
    const cost = parseFloat(costString) || 0
    return sum + (cost * item.Current_Stock)
  }, 0)

  const stats = [
    {
      label: 'Total Items',
      value: inventory.length,
      icon: <Package className="h-6 w-6 text-white" />,
      color: 'bg-blue-500'
    },
    {
      label: 'Items In Stock',
      value: inventory.filter(
        (item) => item.Status === 'GOOD' || item.Status === 'MEDIUM'
      ).length,
      icon: <PackageCheck className="h-6 w-6 text-white" />,
      color: 'bg-green-500'
    },
    {
      label: 'Items Low Stock',
      value: inventory.filter((item) => item.Status === 'LOW').length,
      icon: <PackageX className="h-6 w-6 text-white" />,
      color: 'bg-yellow-500'
    },
    {
      label: 'Total Value',
      value: `$${totalValue.toFixed(2)}`,
      icon: <DollarSign className="h-6 w-6 text-white" />,
      color: 'bg-indigo-500'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <StatCard key={index} title={stat.label} value={stat.value} icon={stat.icon} color={stat.color} />
      ))}
    </div>
  )
} 