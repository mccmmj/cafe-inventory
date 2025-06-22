'use client'

import { signOut } from 'next-auth/react'
import { User } from 'next-auth'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'

interface NavbarProps {
  user: User
}

export function Navbar({ user }: NavbarProps) {
  const { data: session } = useSession()

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">Cafe Inventory</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <p className="text-gray-800 dark:text-gray-200 mr-4">
                Welcome, {session?.user?.name || 'User'}
              </p>
              <Button variant="ghost" onClick={() => signOut()}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
} 