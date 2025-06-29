import { InventoryItem } from '@/types/inventory'
import { AlertTriangle } from 'lucide-react'

interface LowStockAlertsProps {
  items: InventoryItem[]
}

export function LowStockAlerts({ items }: LowStockAlertsProps) {
  const lowStockItems = items.filter(item => item.Status === 'LOW' || item.Status === 'OUT_OF_STOCK');

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <AlertTriangle className="text-yellow-500 mr-2" />
        Low Stock Alerts
      </h3>
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {lowStockItems.length > 0 ? (
          lowStockItems.map((item, idx) => (
            <div key={item.Product_ID && item.Product_ID !== '#NAME?' ? item.Product_ID : `lowstock-${idx}`}
              className="flex justify-between items-center p-2 rounded bg-gray-50 dark:bg-gray-700">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{item.Product_Name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Current: {item.Current_Stock} | Min: {item.Min_Level}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                item.Status === 'LOW' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {item.Status === 'LOW' ? 'Low Stock' : 'Out of Stock'}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No items are currently low on stock.</p>
        )}
      </div>
    </div>
  )
} 