'use client'

import { useInventory, useUsageRecords } from '@/hooks/useInventory'
import { InventoryStats } from '@/components/inventory/InventoryStats'
import { TopUsageChart } from '@/components/inventory/TopUsageChart'
import { LowStockAlerts } from '@/components/inventory/LowStockAlerts'

export default function DashboardPage() {
  const { data: inventory, isLoading: inventoryLoading } = useInventory()
  const { data: usageRecords, isLoading: usageLoading } = useUsageRecords()

  if (inventoryLoading || usageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const lowStockItems = inventory?.filter(item => 
    item.Current_Stock <= item.Min_Level
  ) || []

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage your cafe inventory in real-time
        </p>
      </div>

      {/* Stats Overview */}
      <InventoryStats inventory={inventory || []} />

      {/* Alerts */}
      {lowStockItems.length > 0 && (
        <div className="mb-8">
          <LowStockAlerts items={lowStockItems} />
        </div>
      )}

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 gap-8">
        <TopUsageChart usageRecords={usageRecords || []} />
        {/* Add more charts/widgets as needed */}
      </div>
    </div>
  )
}
