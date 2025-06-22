'use client'

import React from 'react';
import { InventoryItem } from '@/types/inventory';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import { MoreVertical, Diff, Pencil, Trash2 } from 'lucide-react';

interface InventoryCardGridProps {
  inventory: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onAdjustStock: (item: InventoryItem) => void;
}

export function InventoryCardGrid({ inventory, onEdit, onDelete, onAdjustStock }: InventoryCardGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {inventory.map(item => (
        <div key={item.Product_ID} className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
          <div className="p-6 flex-grow">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.Product_Name}</h3>
              <StatusBadge status={item.Status} />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{item.Category}</p>
            
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex justify-between">
                <span>Current Stock:</span>
                <span className="font-semibold">{item.Current_Stock}</span>
              </div>
              <div className="flex justify-between">
                <span>Min:</span>
                <span className="font-semibold">{item.Min_Level}</span>
              </div>
              <div className="flex justify-between">
                <span>Location:</span>
                <span className="font-semibold">{item.Storage_Location}</span>
              </div>
              <div className="flex justify-between">
                <span>Vendor:</span>
                <span className="font-semibold">{item.Primary_Vendor}</span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t dark:border-gray-700 flex items-center justify-end gap-2">
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
      ))}
    </div>
  );
} 