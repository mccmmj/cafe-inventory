'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { SheetDBService } from '@/lib/sheetdb'
import { Vendor } from '@/types/vendor'
import { InventoryItem } from '@/types/inventory'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Phone, Settings, FileText } from 'lucide-react'
import Link from 'next/link'

export default function VendorDetailsPage() {
  const params = useParams()
  const vendorName = decodeURIComponent(params.vendorName as string)
  
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadVendorData() {
      setLoading(true)
      try {
        const vendors = await SheetDBService.getVendors()
        const foundVendor = vendors.find(v => v.name === vendorName)
        
        if (!foundVendor) {
          setError('Vendor not found')
          setLoading(false)
          return
        }
        
        setVendor(foundVendor)
        
        const allInventory = await SheetDBService.getInventory()
        const vendorItems = allInventory.filter(item => {
          const itemVendors = item.vendors || []
          return itemVendors.includes(vendorName)
        })
        
        setInventoryItems(vendorItems)
      } catch (err) {
        setError('Failed to load vendor data')
      } finally {
        setLoading(false)
      }
    }

    if (vendorName) {
      loadVendorData()
    }
  }, [vendorName])

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  if (error || !vendor) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Vendor Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error || 'The requested vendor could not be found.'}</p>
          <Link href="/vendors">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Vendors
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Link href="/vendors">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Vendors
        </Button>
      </Link>
      
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{vendor.name}</h1>

      {/* Vendor Details Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Vendor Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <Phone className="h-5 w-5 mr-2 text-gray-500" />
              Contact Information
            </h3>
            <div className="space-y-2">
              {vendor.contactName && (
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Name:</span>
                  <p className="text-gray-900 dark:text-white">{vendor.contactName}</p>
                </div>
              )}
              {vendor.contactInfo && (
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Info:</span>
                  <p className="text-gray-900 dark:text-white">{vendor.contactInfo}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <Settings className="h-5 w-5 mr-2 text-gray-500" />
              Business Details
            </h3>
            <div className="space-y-2">
              {vendor.moq && (
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Minimum Order Quantity:</span>
                  <p className="text-gray-900 dark:text-white">{vendor.moq}</p>
                </div>
              )}
              {vendor.pluginKey && (
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Plugin Key:</span>
                  <p className="text-gray-900 dark:text-white font-mono text-sm">{vendor.pluginKey}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {vendor.notes && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-gray-500" />
              Notes
            </h3>
            <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
              {vendor.notes}
            </p>
          </div>
        )}
      </div>

      {/* Inventory Items */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Inventory Items ({inventoryItems.length})
          </h2>
        </div>
        
        {inventoryItems.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No inventory items are currently associated with this vendor.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Min Level
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {inventoryItems.map((item) => (
                  <tr key={item.Product_ID} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {item.Product_Name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {item.Category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {item.Current_Stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {item.Min_Level}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.Status === 'GOOD' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : item.Status === 'MEDIUM' || item.Status === 'LOW'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {item.Status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
} 