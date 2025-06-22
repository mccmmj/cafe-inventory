'use client'

import React from 'react'
import { ProfileCard } from '@/components/settings/ProfileCard'
import { DataExportCard } from '@/components/settings/DataExportCard'
import { NotificationPreferencesCard } from '@/components/settings/NotificationPreferencesCard'

export default function SettingsPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Manage your account, preferences, and data.
        </p>
      </header>
      
      <div className="space-y-8">
        <ProfileCard />
        <NotificationPreferencesCard />
        <DataExportCard />
      </div>
    </div>
  )
} 