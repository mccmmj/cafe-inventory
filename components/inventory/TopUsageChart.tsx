import { UsageRecord } from '@/types/inventory'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface TopUsageChartProps {
  usageRecords: UsageRecord[]
}

export function TopUsageChart({ usageRecords }: TopUsageChartProps) {
  // Group usage by product and calculate total quantity
  const productUsage = usageRecords.reduce((acc, record) => {
    const productName = record.Product_Name
    if (!acc[productName]) {
      acc[productName] = 0
    }
    acc[productName] += record.Quantity_Used
    return acc
  }, {} as Record<string, number>)

  // Get top 5 most used products
  const topProducts = Object.entries(productUsage)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const chartHeight = 60 + topProducts.length * 40; // Base height + height per bar

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top 5 Used Items</h3>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          layout="vertical"
          data={topProducts}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="0" width={150} tick={{ fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(31, 41, 55, 0.8)',
              borderColor: 'rgba(55, 65, 81, 1)'
            }}
            labelStyle={{ color: '#f9fafb' }}
            formatter={(value: number) => `${value} units`}
          />
          <Legend />
          <Bar dataKey="1" fill="#8884d8" name="Quantity Used" barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
} 