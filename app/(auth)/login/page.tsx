'use client'

import { signIn, getProviders } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const [providers, setProviders] = useState<any>(null)

  useEffect(() => {
    const setUpProviders = async () => {
      const response = await getProviders()
      setProviders(response)
    }
    setUpProviders()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Cafe Inventory System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access your inventory dashboard
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          {providers && Object.values(providers).map((provider: any) => (
            <Button
              key={provider.name}
              onClick={() => signIn(provider.id, { callbackUrl: '/dashboard' })}
              className="w-full flex justify-center py-2 px-4"
            >
              Sign in with {provider.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
