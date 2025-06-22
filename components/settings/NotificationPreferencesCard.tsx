'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Switch } from '@/components/ui/Switch'
import { SettingsCard } from '@/components/ui/SettingsCard'
import { useSession } from 'next-auth/react'
import { SheetDBService } from '@/lib/sheetdb'
import { Loader2 } from 'lucide-react'

export function NotificationPreferencesCard() {
  const { data: session } = useSession()
  const [isEnabled, setIsEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchAndEnsurePreference = useCallback(async () => {
    if (!session?.user?.email) {
      if (session !== undefined) setIsLoading(false);
      return;
    }

    setIsLoading(true)
    try {
      let prefs = await SheetDBService.getUserPreferences(session.user.email)
      
      if (!prefs) {
        const defaultPrefs = { email_notifications_enabled: false };
        await SheetDBService.createUserPreferences(session.user.email, defaultPrefs);
        prefs = defaultPrefs;
      }
      
      setIsEnabled(prefs.email_notifications_enabled)

    } catch (error) {
      console.error("Could not fetch or create user preferences:", error)
      setIsEnabled(false)
    } finally {
      setIsLoading(false)
    }
  }, [session]);

  useEffect(() => {
    fetchAndEnsurePreference();
  }, [fetchAndEnsurePreference]);

  const handleToggle = async (checked: boolean) => {
    if (session?.user?.email) {
      setIsEnabled(checked)
      try {
        await SheetDBService.updateUserPreferences(session.user.email, {
          email_notifications_enabled: checked,
        })
      } catch (error) {
        console.error("Failed to update preferences:", error)
        setIsEnabled(!checked) 
      }
    }
  }

  return (
    <SettingsCard
      title="Notification Preferences"
      description="Configure how you receive alerts and summaries from the application."
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Daily Summary Email
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Receive a daily email with low and out-of-stock items.
          </p>
        </div>
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Switch
            id="email-notifications"
            checked={isEnabled}
            onCheckedChange={handleToggle}
            disabled={!session?.user?.email || isLoading}
          />
        )}
      </div>
    </SettingsCard>
  )
} 