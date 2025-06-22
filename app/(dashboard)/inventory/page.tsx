'use client'

import React, { useState, useMemo } from 'react'
import {
  useInventory,
  useCreateInventoryItem,
  useUpdateInventoryItem,
  useDeleteInventoryItem,
  useAdjustStock,
} from '@/hooks/useInventory'
import { InventoryItem } from '@/types/inventory'
import { InventoryControlBar } from '@/components/inventory/InventoryControlBar'
import { InventoryTable } from '@/components/inventory/InventoryTable'
import { InventoryCardGrid } from '@/components/inventory/InventoryCardGrid'
import { Modal } from '@/components/ui/Modal'
import { InventoryForm } from '@/components/inventory/InventoryForm'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'
import { AdjustStockModal } from '@/components/inventory/AdjustStockModal'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

type View = 'list' | 'grid'

export default function InventoryPage() {
  const { data: inventory = [], isLoading, error } = useInventory()
  const createItemMutation = useCreateInventoryItem()
  const updateItemMutation = useUpdateInventoryItem()
  const deleteItemMutation = useDeleteInventoryItem()
  const adjustStockMutation = useAdjustStock()

  const [view, setView] = useState<View>('list')
  const [searchTerm, setSearchTerm] = useState('')
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false)
  const [isAdjustStockModalOpen, setIsAdjustStockModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null)
  const [itemToAdjust, setItemToAdjust] = useState<InventoryItem | null>(null)
  const [deleteReason, setDeleteReason] = useState('')
  const [deleteNotes, setDeleteNotes] = useState('')
  const [filters, setFilters] = useState({ category: '', status: '' })

  const { uniqueCategories, uniqueStatuses } = useMemo(() => {
    const categories = new Set(inventory.map(item => item.Category));
    const statuses = new Set(inventory.map(item => item.Status));
    return {
      uniqueCategories: Array.from(categories),
      uniqueStatuses: Array.from(statuses),
    };
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const searchMatch = item.Product_Name.toLowerCase().includes(searchTerm.toLowerCase())
      const categoryMatch = filters.category ? item.Category === filters.category : true
      const statusMatch = filters.status ? item.Status === filters.status : true
      return searchMatch && categoryMatch && statusMatch
    })
  }, [inventory, searchTerm, filters])

  const handleOpenCreateForm = () => {
    setEditingItem(null)
    setIsFormModalOpen(true)
  }

  const handleOpenEditForm = (item: InventoryItem) => {
    setEditingItem(item)
    setIsFormModalOpen(true)
  }
  
  const handleOpenAdjustStockModal = (item: InventoryItem) => {
    setItemToAdjust(item)
    setIsAdjustStockModalOpen(true)
  }

  const handleOpenDeleteConfirm = (item: InventoryItem) => {
    setItemToDelete(item)
    setIsConfirmDeleteModalOpen(true)
  }

  const handleCloseModals = () => {
    setIsFormModalOpen(false)
    setIsConfirmDeleteModalOpen(false)
    setIsAdjustStockModalOpen(false)
    setEditingItem(null)
    setItemToDelete(null)
    setItemToAdjust(null)
    setDeleteReason('')
    setDeleteNotes('')
  }

  const handleFormSubmit = (data: Partial<InventoryItem>) => {
    if (editingItem) {
      updateItemMutation.mutate({ originalItem: editingItem, updates: data }, {
        onSuccess: handleCloseModals,
      })
    } else {
      createItemMutation.mutate({ ...data, Product_ID: `P${Date.now()}` }, {
        onSuccess: handleCloseModals,
      })
    }
  }

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      deleteItemMutation.mutate({ item: itemToDelete, reason: deleteReason, notes: deleteNotes }, {
        onSuccess: handleCloseModals,
      })
    }
  }

  const handleAdjustStockSubmit = (data: {
    adjustment: number;
    reason: 'Record Usage' | 'Receive Stock';
    notes: string;
  }) => {
    if (itemToAdjust) {
      adjustStockMutation.mutate({ item: itemToAdjust, ...data }, {
        onSuccess: handleCloseModals,
      });
    }
  };

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading inventory.</div>

  const isSubmitting = createItemMutation.isPending || updateItemMutation.isPending;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Search, filter, and manage your inventory items.
          </p>
        </div>
        <div>
          <Button onClick={() => handleOpenCreateForm()}>
            <Plus size={18} className="mr-2" />
            Add New Item
          </Button>
        </div>
      </header>

      <main>
        <InventoryControlBar
          view={view}
          onViewChange={setView}
          onSearch={setSearchTerm}
          categories={uniqueCategories}
          statuses={uniqueStatuses}
          selectedCategory={filters.category}
          onCategoryChange={category => setFilters(prev => ({ ...prev, category }))}
          selectedStatus={filters.status}
          onStatusChange={status => setFilters(prev => ({ ...prev, status }))}
        />
        <div className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            </div>
          ) : view === 'list' ? (
            <InventoryTable
              inventory={filteredInventory}
              onEdit={handleOpenEditForm}
              onDelete={handleOpenDeleteConfirm}
              onAdjustStock={handleOpenAdjustStockModal}
            />
          ) : (
            <InventoryCardGrid
              inventory={filteredInventory}
              onEdit={handleOpenEditForm}
              onDelete={handleOpenDeleteConfirm}
              onAdjustStock={handleOpenAdjustStockModal}
            />
          )}
        </div>
      </main>

      <Modal
        isOpen={isFormModalOpen}
        onClose={handleCloseModals}
        title={editingItem ? 'Edit Item' : 'Create New Item'}
      >
        <InventoryForm
          initialData={editingItem}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModals}
          isSubmitting={isSubmitting}
          isEditMode={!!editingItem}
        />
      </Modal>

      <AdjustStockModal
        isOpen={isAdjustStockModalOpen}
        onClose={handleCloseModals}
        item={itemToAdjust}
        onSubmit={handleAdjustStockSubmit}
        isSubmitting={adjustStockMutation.isPending}
      />

      <ConfirmationModal
        isOpen={isConfirmDeleteModalOpen}
        onClose={handleCloseModals}
        onConfirm={handleDeleteConfirm}
        title="Confirm Deletion"
        confirmButtonText="Delete"
        isConfirming={deleteItemMutation.isPending}
      >
        <div className="space-y-4">
            <p>
              Are you sure you want to delete <strong>{itemToDelete?.Product_Name}</strong>? This action cannot be undone.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reason for Deletion</label>
              <select
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              >
                <option value="">Select a reason...</option>
                <option value="Spoilage">Spoilage</option>
                <option value="Theft">Theft</option>
                <option value="Obsolete">Obsolete</option>
                <option value="Other">Other</option>
              </select>
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
              <textarea
                value={deleteNotes}
                onChange={(e) => setDeleteNotes(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
        </div>
      </ConfirmationModal>
    </div>
  )
} 