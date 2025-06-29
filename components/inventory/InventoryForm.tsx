'use client'

import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { InventoryItem } from '@/types/inventory'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/Select'

interface InventoryFormValues {
  Product_Name: string;
  Category: string;
  Current_Stock: number;
  Min_Level: number;
  Max_Level: number;
  Unit_Size: string;
  Storage_Location: string;
  Primary_Vendor?: string;
  Cost_Per_Unit: string;
  Vendors: string;
}

const schema: yup.ObjectSchema<InventoryFormValues> = yup.object().shape({
  Product_Name: yup.string().required('Product name is required'),
  Category: yup.string().required('Category is required'),
  Current_Stock: yup.number().min(0).required(),
  Min_Level: yup.number().min(0).required('Minimum level is required'),
  Max_Level: yup.number().min(0).required('Maximum level is required'),
  Unit_Size: yup.string().required('Unit size is required'),
  Storage_Location: yup.string().required('Storage location is required'),
  Primary_Vendor: yup.string().optional(),
  Cost_Per_Unit: yup.string().required('Cost per unit is required'),
  Vendors: yup.string().required('Vendors are required'),
})

interface InventoryFormProps {
  initialData?: InventoryItem | null
  onSubmit: (data: InventoryFormValues) => void
  onCancel: () => void
  isSubmitting: boolean
  isEditMode: boolean
}

type FieldConfig = {
  [key: string]: {
    label: string;
    type: 'text' | 'number' | 'select';
    options?: string[];
  }
}

export function InventoryForm({ initialData, onSubmit, onCancel, isSubmitting, isEditMode }: InventoryFormProps) {
  const { control, handleSubmit, formState: { errors } } = useForm<InventoryFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      Product_Name: initialData?.Product_Name || '',
      Category: initialData?.Category || '',
      Current_Stock: initialData?.Current_Stock || 0,
      Min_Level: initialData?.Min_Level || 10,
      Max_Level: initialData?.Max_Level || 100,
      Unit_Size: initialData?.Unit_Size || '',
      Storage_Location: initialData?.Storage_Location || '',
      Primary_Vendor: initialData?.Primary_Vendor,
      Cost_Per_Unit: initialData?.Cost_Per_Unit || '',
      Vendors: initialData?.vendors ? initialData.vendors.join(', ') : (initialData?.Primary_Vendor || ''),
    },
  })

  const fields: FieldConfig = {
    Product_Name: { label: 'Product Name', type: 'text' },
    Category: { 
      label: 'Category', 
      type: 'select',
      options: ['Coffee', 'Tea', 'Pastries', 'Syrups', 'Other']
    },
    Current_Stock: { label: 'Current Stock', type: 'number' },
    Min_Level: { label: 'Minimum Stock Level', type: 'number' },
    Max_Level: { label: 'Maximum Stock Level', type: 'number' },
    Unit_Size: { label: 'Unit Size (e.g., 1kg, 500ml)', type: 'text' },
    Storage_Location: { label: 'Storage Location', type: 'text' },
    Primary_Vendor: { label: 'Primary Vendor', type: 'text' },
    Cost_Per_Unit: { label: 'Cost Per Unit', type: 'text' },
    Vendors: { label: 'Vendors (comma-separated)', type: 'text' },
  }

  return (
    <form onSubmit={handleSubmit((data) => {
      const vendorsArr = data.Vendors.split(',').map(v => v.trim()).filter(Boolean);
      onSubmit({
        ...data,
        vendors: vendorsArr,
        Primary_Vendor: vendorsArr[0] || '',
      } as InventoryFormValues);
    })} className="space-y-6 p-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.keys(fields).map((key) => (
          <div key={key}>
            <label htmlFor={key} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {fields[key as keyof typeof fields].label}
            </label>
            <Controller
              name={key as keyof InventoryFormValues}
              control={control}
              render={({ field: controllerField }) => (
                fields[key as keyof typeof fields].type === 'select' ? (
                  <Select
                    {...controllerField}
                    id={key}
                    className="mt-1"
                  >
                    {fields[key as keyof typeof fields].options?.map((option: string) => <option key={option} value={option}>{option}</option>)}
                  </Select>
                ) : (
                  <input
                    {...controllerField}
                    type={fields[key as keyof typeof fields].type}
                    id={key}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                )
              )}
            />
            {errors[key as keyof InventoryFormValues] && (
              <p className="mt-1 text-sm text-red-600">{errors[key as keyof InventoryFormValues]?.message}</p>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Item' : 'Create Item')}
        </Button>
      </div>
    </form>
  )
} 