'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { SettingsCard } from '@/components/ui/SettingsCard'
import { SheetDBService } from '@/lib/sheetdb'
import { downloadAsCsv } from '@/lib/csv'
import { Loader2, Download } from 'lucide-react'

const ExportRow = ({ label, onExport, isExporting }: { label: string, onExport: () => void, isExporting: boolean }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4">
    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
    <Button
      onClick={onExport}
      disabled={isExporting}
      variant="outline"
      className="mt-2 sm:mt-0"
    >
      {isExporting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      Export
    </Button>
  </div>
)

export function DataExportCard() {
  const [isExportingInventory, setIsExportingInventory] = useState(false)
  const [isExportingLog, setIsExportingLog] = useState(false)

  const handleExportInventory = async () => {
    setIsExportingInventory(true)
    try {
      const inventory = await SheetDBService.getRawInventory()
      downloadAsCsv(
        inventory.map(row => ({
          ...row,
          vendors: Array.isArray(row.vendors) ? row.vendors.join(', ') : row.vendors
        })),
        'inventory_export'
      )
    } catch (error) {
      console.error('Failed to export inventory:', error)
    } finally {
      setIsExportingInventory(false)
    }
  }

  const handleExportLog = async () => {
    setIsExportingLog(true)
    try {
      const log = await SheetDBService.getFullActivityLog()
      downloadAsCsv(log, 'activity_log_export')
    } catch (error) {
      console.error('Failed to export activity log:', error)
    } finally {
      setIsExportingLog(false)
    }
  }

  return (
    <SettingsCard
      title="Data Export"
      description="Download your inventory and activity data in CSV format."
    >
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <ExportRow 
          label="Export the master inventory list."
          onExport={handleExportInventory}
          isExporting={isExportingInventory}
        />
        <ExportRow 
          label="Export the full activity and event log."
          onExport={handleExportLog}
          isExporting={isExportingLog}
        />
      </div>
    </SettingsCard>
  )
} 