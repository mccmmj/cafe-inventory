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
  Status: 'GOOD' | 'MEDIUM' | 'LOW' | 'OUT_OF_STOCK'
  Days_Supply?: number
  Weekly_Usage?: number
  Reorder_Qty?: number
  Notes?: string
  Reason?: string
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
