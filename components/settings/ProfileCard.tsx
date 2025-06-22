'use client'

import React from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { SettingsCard } from '@/components/ui/SettingsCard'
import { LogOut } from 'lucide-react'

const SettingRow = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div className="flex items-center justify-between py-4">
    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
    <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
      {children}
    </div>
  </div>
)

export function ProfileCard() {
  const { data: session } = useSession()

  return (
    <SettingsCard
      title="Profile & Appearance"
      description="Manage your profile information and customize the application's appearance."
    >
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <SettingRow label="Email">
          <span>{session?.user?.email || '...'}</span>
        </SettingRow>
        <SettingRow label="Theme">
          <ThemeToggle />
        </SettingRow>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
        <Button onClick={() => signOut({ callbackUrl: '/' })} variant="outline">
           <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </SettingsCard>
  )
} 