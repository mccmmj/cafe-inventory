'use client'

import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { InventoryItem } from '@/types/inventory'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'

const schema = yup.object().shape({
  adjustmentType: yup.string().oneOf(['Record Usage', 'Receive Stock']).required(),
  quantity: yup.number().positive('Quantity must be positive').required('Quantity is required'),
  notes: yup.string(),
})

interface AdjustStockModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    adjustment: number;
    reason: 'Record Usage' | 'Receive Stock';
    notes: string;
  }) => void,
  item: InventoryItem | null,
  isSubmitting: boolean,
}

export function AdjustStockModal({ isOpen, onClose, item, onSubmit, isSubmitting }: AdjustStockModalProps) {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { adjustmentType: 'Record Usage', quantity: 1, notes: '' },
  })

  const handleFormSubmit = (data: {
    adjustmentType: 'Record Usage' | 'Receive Stock';
    quantity: number;
    notes?: string;
  }) => {
    const adjustment = data.adjustmentType === 'Record Usage' ? -data.quantity : data.quantity;
    onSubmit({ adjustment, reason: data.adjustmentType, notes: data.notes || '' });
  };

  if (!item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Adjust Stock for ${item.Product_Name}`}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label htmlFor="adjustment-reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason for Adjustment</label>
          <Controller
            name="adjustmentType"
            control={control}
            render={({ field }) => (
              <Select {...field} id="adjustment-reason" className="mt-1">
                <option value="Record Usage">Record Usage (Decrease Stock)</option>
                <option value="Receive Stock">Receive Stock (Increase Stock)</option>
              </Select>
            )}
          />
        </div>
        <div>
          <label htmlFor="adjustment-quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
          <Controller
            name="quantity"
            control={control}
            render={({ field }) => <input type="number" {...field} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />}
          />
          {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes (Optional)</label>
          <Controller
            name="notes"
            control={control}
            render={({ field }) => <textarea {...field} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />}
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Adjustment'}
          </Button>
        </div>
      </form>
    </Modal>
  )
} 