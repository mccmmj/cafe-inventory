# Cafe Inventory Management System: React/Next.js + SheetDB Implementation Guide

## **Project Overview**

This guide will walk you through building a modern, real-time inventory management system for your cafe using React/Next.js and SheetDB. The system will provide instant search capabilities, authentication, and seamless integration with your existing Google Sheets data.

## **Architecture Overview**

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Next.js App   │───▶│   SheetDB    │───▶│  Google Sheets  │
│   (Frontend)    │    │   (API)      │    │   (Database)    │
└─────────────────┘    └──────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐
│  NextAuth.js    │
│ (Authentication)│
└─────────────────┘
```

## **Key Features**

- 🔍 **Real-time Search**: Instant product search with autocomplete
- 🔐 **Authentication**: Secure login system with NextAuth.js
- 📱 **Responsive Design**: Mobile-first design with Tailwind CSS
- ⚡ **Fast Performance**: Optimized with React Query for caching
- 🔄 **Real-time Updates**: Live data synchronization with Google Sheets
- 📊 **Dashboard**: Inventory overview with alerts and metrics

---

## **Step 1: Prerequisites and Setup**

### **1.1 Required Accounts & Services**

1. **Google Account** (for Sheets)
2. **SheetDB Account** (free tier available)
3. **Vercel Account** (for deployment, free tier)
4. **GitHub Account** (for code repository)

### **1.2 Development Environment**

```bash
# Required software
Node.js 18.x or later
npm or yarn package manager
Git
VS Code (recommended)
```

---

## **Step 2: SheetDB Configuration**

### **2.1 Create SheetDB API**

1. Go to [SheetDB.io](https://sheetdb.io)
2. Sign up/login to your account
3. Click "Create New API"
4. Connect your Google Sheets document:
   - **Spreadsheet URL**: Your cafe inventory Google Sheet URL
   - **Sheet Name**: "Master_Inventory"
5. Note down your **API ID** (e.g., `58f61be4dda40`)

### **2.2 Configure API Permissions**

```bash
# In SheetDB Dashboard
1. Go to API Settings
2. Enable CORS for your domain
3. Set permissions: Read/Write
4. Generate API Key for authentication
```

### **2.3 Test Your API**

Test the API endpoint:
```bash
curl https://sheetdb.io/api/v1/YOUR_API_ID
```

Expected response format based on your data:
```json
[
  {
    "Product_ID": "P001",
    "Category": "Coffee",
    "Product_Name": "Starbucks Frappuccino Espresso",
    "Unit_Size": "32x5oz",
    "Current_Stock": "10",
    "Min_Level": "1",
    "Max_Level": "4",
    "Storage_Location": "Storage-A",
    "Primary_Vendor": "Starbucks",
    "Cost_Per_Unit": "$45.00",
    "Status": "GOOD"
  }
]
```

---

## **Step 3: Next.js Project Setup**

### **3.1 Initialize Project**

```bash
# Create new Next.js project
npx create-next-app@latest cafe-inventory --typescript --tailwind --eslint --app
cd cafe-inventory

# Install required dependencies
npm install next-auth @auth/prisma-adapter
npm install axios react-query @tanstack/react-query
npm install typeahead-standalone
npm install lucide-react
npm install @hookform/resolvers yup react-hook-form
```

### **3.2 Environment Variables**

Create `.env.local`:
```bash
# SheetDB Configuration
NEXT_PUBLIC_SHEETDB_API_ID=your_sheetdb_api_id
SHEETDB_API_KEY=your_sheetdb_api_key

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_super_secret_key_here

# Google OAuth (for authentication)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### **3.3 Project Structure**

```
cafe-inventory/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── search/
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/
│   │   └── inventory/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── auth/
│   ├── inventory/
│   └── layout/
├── lib/
│   ├── auth.ts
│   ├── sheetdb.ts
│   └── utils.ts
├── types/
│   └── inventory.ts
└── hooks/
    └── useInventory.ts
```

---

## **Step 4: Authentication Setup**

### **4.1 Configure Google OAuth**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URLs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-domain.com/api/auth/callback/google`

### **4.2 NextAuth Configuration**

Create `lib/auth.ts`:
```typescript
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      return session
    },
    async jwt({ token, account }) {
      return token
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      
      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl))
      }
      
      return true
    },
  },
})
```

### **4.3 API Route Handler**

Create `app/api/auth/[...nextauth]/route.ts`:
```typescript
import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers
```

---

## **Step 5: Data Layer & Types**

### **5.1 TypeScript Definitions**

Create `types/inventory.ts`:
```typescript
export interface InventoryItem {
  Product_ID: string
  Category: string
  Product_Name: string
  Unit_Size: string
  Current_Stock: number
  Min_Level: number
  Max_Level: number
  Storage_Location: string
  Primary_Vendor: string
  Cost_Per_Unit: string
  Last_Updated: string
  Status: 'GOOD' | 'LOW' | 'OUT_OF_STOCK'
  Days_Supply?: number
  Weekly_Usage?: number
  Reorder_Qty?: number
}

export interface SearchFilters {
  category?: string
  vendor?: string
  status?: string
  location?: string
}

export interface UsageRecord {
  Date: string
  Time: string
  Product_Name: string
  Quantity_Used: number
  Staff_Member: string
  Storage_Location: string
  Notes?: string
  Product_ID?: string
}
```

### **5.2 SheetDB Service**

Create `lib/sheetdb.ts`:
```typescript
import axios from 'axios'
import { InventoryItem, UsageRecord } from '@/types/inventory'

const SHEETDB_BASE_URL = 'https://sheetdb.io/api/v1'
const API_ID = process.env.NEXT_PUBLIC_SHEETDB_API_ID
const API_KEY = process.env.SHEETDB_API_KEY

const sheetDBClient = axios.create({
  baseURL: `${SHEETDB_BASE_URL}/${API_ID}`,
  headers: {
    'Authorization': `Basic ${Buffer.from(`api:${API_KEY}`).toString('base64')}`,
    'Content-Type': 'application/json',
  },
})

export class SheetDBService {
  // Get all inventory items
  static async getInventory(): Promise<InventoryItem[]> {
    try {
      const response = await sheetDBClient.get('/sheet/Master_Inventory')
      return response.data.map((item: any) => ({
        ...item,
        Current_Stock: parseInt(item.Current_Stock) || 0,
        Min_Level: parseInt(item.Min_Level) || 0,
        Max_Level: parseInt(item.Max_Level) || 0,
      }))
    } catch (error) {
      console.error('Error fetching inventory:', error)
      throw new Error('Failed to fetch inventory data')
    }
  }

  // Search inventory items
  static async searchInventory(query: string): Promise<InventoryItem[]> {
    try {
      const response = await sheetDBClient.get('/search', {
        params: {
          Product_Name: `*${query}*`,
          casesensitive: false
        }
      })
      return response.data
    } catch (error) {
      console.error('Error searching inventory:', error)
      throw new Error('Failed to search inventory')
    }
  }

  // Get usage records
  static async getUsageRecords(): Promise<UsageRecord[]> {
    try {
      const response = await sheetDBClient.get('/sheet/Usage_Log')
      return response.data
    } catch (error) {
      console.error('Error fetching usage records:', error)
      throw new Error('Failed to fetch usage records')
    }
  }

  // Add usage record
  static async addUsageRecord(record: Omit<UsageRecord, 'Date' | 'Time'>): Promise<void> {
    try {
      const now = new Date()
      const newRecord = {
        ...record,
        Date: now.toLocaleDateString(),
        Time: now.toLocaleTimeString(),
      }
      
      await sheetDBClient.post('/sheet/Usage_Log', newRecord)
    } catch (error) {
      console.error('Error adding usage record:', error)
      throw new Error('Failed to add usage record')
    }
  }

  // Update inventory item
  static async updateInventoryItem(productId: string, updates: Partial<InventoryItem>): Promise<void> {
    try {
      await sheetDBClient.patch(`/Product_ID/${productId}`, updates)
    } catch (error) {
      console.error('Error updating inventory item:', error)
      throw new Error('Failed to update inventory item')
    }
  }
}
```

---

## **Step 6: Custom Hooks & State Management**

### **6.1 React Query Setup**

Create `app/providers.tsx`:
```typescript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
      },
    },
  }))

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </SessionProvider>
  )
}
```

### **6.2 Inventory Hook**

Create `hooks/useInventory.ts`:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SheetDBService } from '@/lib/sheetdb'
import { InventoryItem, UsageRecord } from '@/types/inventory'

export function useInventory() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: SheetDBService.getInventory,
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

export function useSearchInventory(query: string) {
  return useQuery({
    queryKey: ['inventory', 'search', query],
    queryFn: () => SheetDBService.searchInventory(query),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export function useUsageRecords() {
  return useQuery({
    queryKey: ['usage-records'],
    queryFn: SheetDBService.getUsageRecords,
  })
}

export function useAddUsageRecord() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: SheetDBService.addUsageRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usage-records'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
  })
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ productId, updates }: { productId: string; updates: Partial<InventoryItem> }) =>
      SheetDBService.updateInventoryItem(productId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
  })
}
```

---

## **Step 7: User Interface Components**

### **7.1 Login Page**

Create `app/(auth)/login/page.tsx`:
```typescript
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
```

### **7.2 Search Component with Autocomplete**

Create `components/inventory/SearchBar.tsx`:
```typescript
'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { useSearchInventory } from '@/hooks/useInventory'
import { InventoryItem } from '@/types/inventory'

interface SearchBarProps {
  onSelectItem: (item: InventoryItem) => void
  placeholder?: string
}

export function SearchBar({ onSelectItem, placeholder = "Search products..." }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const { data: searchResults, isLoading } = useSearchInventory(query)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setIsOpen(value.length > 0)
  }

  const handleSelectItem = (item: InventoryItem) => {
    onSelectItem(item)
    setQuery('')
    setIsOpen(false)
    inputRef.current?.blur()
  }

  const clearSearch = () => {
    setQuery('')
    setIsOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(query.length > 0)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          ref={resultsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : searchResults && searchResults.length > 0 ? (
            <ul className="py-1">
              {searchResults.map((item) => (
                <li key={item.Product_ID}>
                  <button
                    onClick={() => handleSelectItem(item)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  >
                    <div className="font-medium text-gray-900">{item.Product_Name}</div>
                    <div className="text-sm text-gray-500">
                      {item.Category} • {item.Storage_Location} • Stock: {item.Current_Stock}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : query ? (
            <div className="p-4 text-center text-gray-500">No products found</div>
          ) : null}
        </div>
      )}
    </div>
  )
}
```

### **7.3 Dashboard Layout**

Create `app/(dashboard)/layout.tsx`:
```typescript
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      <Sidebar />
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Navbar user={session.user} />
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
```

### **7.4 Main Dashboard**

Create `app/(dashboard)/dashboard/page.tsx`:
```typescript
'use client'

import { useInventory, useUsageRecords } from '@/hooks/useInventory'
import { SearchBar } from '@/components/inventory/SearchBar'
import { InventoryStats } from '@/components/inventory/InventoryStats'
import { TopUsageChart } from '@/components/inventory/TopUsageChart'
import { LowStockAlerts } from '@/components/inventory/LowStockAlerts'
import { InventoryItem } from '@/types/inventory'
import { useState } from 'react'

export default function DashboardPage() {
  const { data: inventory, isLoading: inventoryLoading } = useInventory()
  const { data: usageRecords, isLoading: usageLoading } = useUsageRecords()
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

  if (inventoryLoading || usageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const lowStockItems = inventory?.filter(item => 
    item.Current_Stock <= item.Min_Level
  ) || []

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your cafe inventory in real-time
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <SearchBar 
          onSelectItem={setSelectedItem}
          placeholder="Search for products..."
        />
      </div>

      {/* Stats Overview */}
      <InventoryStats inventory={inventory || []} />

      {/* Alerts */}
      {lowStockItems.length > 0 && (
        <div className="mb-8">
          <LowStockAlerts items={lowStockItems} />
        </div>
      )}

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TopUsageChart usageRecords={usageRecords || []} />
        {/* Add more charts/widgets as needed */}
      </div>

      {/* Selected Item Details */}
      {selectedItem && (
        <div className="mt-8">
          <ItemDetailsModal 
            item={selectedItem} 
            onClose={() => setSelectedItem(null)}
          />
        </div>
      )}
    </div>
  )
}
```

---

## **Step 8: Deployment**

### **8.1 Deploy to Vercel**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
vercel env add NEXTAUTH_SECRET
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add NEXT_PUBLIC_SHEETDB_API_ID
vercel env add SHEETDB_API_KEY
```

### **8.2 Production Checklist**

- [ ] Environment variables configured
- [ ] Google OAuth redirect URLs updated
- [ ] SheetDB CORS settings updated
- [ ] SSL/HTTPS enabled
- [ ] Error monitoring setup (optional)

---

## **Step 9: Testing & Optimization**

### **9.1 Testing Checklist**

- [ ] Authentication flow works
- [ ] Search functionality returns correct results
- [ ] Real-time updates reflect in UI
- [ ] Mobile responsiveness verified
- [ ] Error handling for API failures

### **9.2 Performance Optimizations**

1. **Implement caching strategies**
2. **Add loading states for better UX**
3. **Optimize bundle size**
4. **Add error boundaries**
5. **Implement offline support** (optional)

---

## **Benefits vs. Google Forms**

| Feature | Google Forms | This Solution |
|---------|--------------|---------------|
| Real-time search | ❌ | ✅ Instant autocomplete |
| User feedback | ❌ Submit to see results | ✅ Immediate validation |
| Data visualization | ❌ | ✅ Live dashboards |
| Mobile experience | ⚠️ Basic | ✅ Optimized |
| Customization | ❌ Limited | ✅ Fully customizable |
| Authentication | ❌ | ✅ Secure Google OAuth |
| Offline capability | ❌ | ✅ Possible with PWA |

---

## **Next Steps & Enhancements**

1. **Add barcode scanning** for mobile devices
2. **Implement push notifications** for low stock alerts
3. **Add reporting and analytics** features
4. **Create vendor management** system
5. **Implement order automation** based on stock levels
6. **Add data export/import** functionality
7. **Create mobile app** using React Native

This implementation provides a solid foundation that can be extended based on your specific needs while maintaining the simplicity and cost-effectiveness you're looking for.