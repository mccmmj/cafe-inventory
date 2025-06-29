'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Package, BarChart3, Settings, ShoppingCart, Store, ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

export function Sidebar() {
  const pathname = usePathname()
  const [ordersOpen, setOrdersOpen] = useState(false)

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-gray-800 text-white dark:bg-gray-900">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-white text-lg font-semibold">Cafe Inventory</h1>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              <ul>
                <li>
                  <Link
                    href="/dashboard"
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${pathname === '/dashboard' ? 'bg-blue-600 dark:bg-blue-700 text-white' : 'text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-800 hover:text-white'}`}
                  >
                    <BarChart3 className="mr-3 h-6 w-6" />
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/inventory"
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${pathname === '/inventory' ? 'bg-blue-600 dark:bg-blue-700 text-white' : 'text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-800 hover:text-white'}`}
                  >
                    <Package className="mr-3 h-6 w-6" />
                    Inventory
                  </Link>
                </li>
                <li>
                  <button
                    className="flex items-center w-full px-2 py-2 text-left rounded-md text-white dark:text-white hover:text-gray-800 hover:bg-blue-50 dark:hover:text-white dark:hover:bg-blue-900 focus:outline-none text-sm font-medium"
                    onClick={() => setOrdersOpen(o => !o)}
                    aria-expanded={ordersOpen}
                  >
                    <ShoppingCart className="mr-3 h-6 w-6" />
                    Orders
                    {ordersOpen ? <ChevronDown className="ml-auto w-4 h-4" /> : <ChevronRight className="ml-auto w-4 h-4" />}
                  </button>
                  {ordersOpen && (
                    <ul className="ml-8 mt-1 space-y-1">
                      <li>
                        <Link href="/orders" className="block px-4 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium">Place Order</Link>
                      </li>
                      <li>
                        <Link href="/orders/manage" className="block px-4 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium">Manage Orders</Link>
                      </li>
                    </ul>
                  )}
                </li>
                <li>
                  <Link
                    href="/vendors"
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${pathname === '/vendors' ? 'bg-blue-600 dark:bg-blue-700 text-white' : 'text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-800 hover:text-white'}`}
                  >
                    <Store className="mr-3 h-6 w-6" />
                    Vendors
                  </Link>
                </li>
                <li>
                  <Link
                    href="/settings"
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${pathname === '/settings' ? 'bg-blue-600 dark:bg-blue-700 text-white' : 'text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-800 hover:text-white'}`}
                  >
                    <Settings className="mr-3 h-6 w-6" />
                    Settings
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
} 