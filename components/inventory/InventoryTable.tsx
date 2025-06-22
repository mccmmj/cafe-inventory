'use client'

import React from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { InventoryItem } from '@/types/inventory'
import { Button } from '@/components/ui/button'
import { StatusBadge } from './StatusBadge'
import { Pencil, Trash2, Diff } from 'lucide-react'

interface InventoryTableProps {
  inventory: InventoryItem[]
  onEdit: (item: InventoryItem) => void
  onDelete: (item: InventoryItem) => void
  onAdjustStock: (item: InventoryItem) => void
}

export function InventoryTable({ inventory, onEdit, onDelete, onAdjustStock }: InventoryTableProps) {
  const parentRef = React.useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: inventory.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 65, // Row height in pixels + border
    overscan: 5,
  })

  const gridTemplateColumns = '3fr 2fr 1fr 1fr 2fr 150px';

  const headers = [
    'Product Name', 'Category', 'Current Stock', 'Min Level', 'Status', 'Actions'
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Sticky Header */}
      <div 
        style={{ display: 'grid', gridTemplateColumns }}
        className="gap-4 px-6 py-4 font-bold bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-sm border-b dark:border-gray-600"
      >
        {headers.map(header => (
          <div key={header} className={header === 'Actions' ? 'text-center' : ''}>
            {header}
          </div>
        ))}
      </div>

      {/* Virtualized Body */}
      <div
        ref={parentRef}
        className="overflow-y-auto"
        style={{ height: 'calc(100vh - 250px)' }} // Adjust height as needed
      >
        <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
          {rowVirtualizer.getVirtualItems().map(virtualRow => {
            const item = inventory[virtualRow.index]
            return (
              <div
                key={virtualRow.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  display: 'grid',
                  gridTemplateColumns,
                }}
                className="gap-4 items-center px-6 border-b dark:border-gray-700/50"
              >
                <div className="font-medium text-gray-900 dark:text-white truncate">{item.Product_Name}</div>
                <div className="text-gray-500 dark:text-gray-400">{item.Category}</div>
                <div className="text-gray-500 dark:text-gray-400">{item.Current_Stock}</div>
                <div className="text-gray-500 dark:text-gray-400">{item.Min_Level}</div>
                <div><StatusBadge status={item.Status} /></div>
                <div className="flex items-center justify-center space-x-1">
                  <Button onClick={() => onAdjustStock(item)} variant="ghost" size="icon" aria-label="Adjust Stock">
                    <Diff className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => onEdit(item)} variant="ghost" size="icon" aria-label="Edit Item">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => onDelete(item)} variant="ghost" size="icon" aria-label="Delete Item">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
} 