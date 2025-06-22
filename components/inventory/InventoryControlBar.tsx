'use client'

import { SearchBar } from '@/components/SearchBar'
import { ViewToggle } from './ViewToggle'
import { Select } from '@/components/ui/Select'

interface InventoryControlBarProps {
  view: 'list' | 'grid'
  onViewChange: (view: 'list' | 'grid') => void
  onSearch: (query: string) => void
  categories: string[]
  statuses: string[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
  selectedStatus: string
  onStatusChange: (status: string) => void
}

export function InventoryControlBar({
  view,
  onViewChange,
  onSearch,
  categories,
  statuses,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
}: InventoryControlBarProps) {
  return (
    <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
      <div className="flex items-center space-x-4">
        <SearchBar onSearch={onSearch} placeholder="Search by product name..." />
        <Select
          id="category-filter"
          value={selectedCategory}
          onChange={e => onCategoryChange(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </Select>
        <Select
          id="status-filter"
          value={selectedStatus}
          onChange={e => onStatusChange(e.target.value)}
        >
          <option value="">All Statuses</option>
          {statuses.map(stat => (
            <option key={stat} value={stat}>{stat}</option>
          ))}
        </Select>
      </div>
      <ViewToggle view={view} onViewChange={onViewChange} />
    </div>
  )
} 