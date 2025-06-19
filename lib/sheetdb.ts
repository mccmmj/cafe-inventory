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
