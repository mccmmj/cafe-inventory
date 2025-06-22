'use client'

import React from 'react'

export const SettingsCard = ({ title, description, children }: { title: string, description: string, children: React.ReactNode }) => (
  <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
    <div className="bg-gray-50 dark:bg-gray-900/50 p-6">
      {children}
    </div>
  </div>
) 