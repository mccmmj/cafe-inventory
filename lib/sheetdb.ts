import axios from 'axios'
import { InventoryItem, UsageRecord } from '@/types/inventory'
import { Vendor } from '@/types/vendor'
import { Order } from '@/types/orders'

const SHEETDB_BASE_URL = 'https://sheetdb.io/api/v1'
const API_ID = process.env.NEXT_PUBLIC_SHEETDB_API_ID
const API_KEY = process.env.NEXT_PUBLIC_SHEETDB_API_KEY

const sheetDBClient = axios.create({
  baseURL: `${SHEETDB_BASE_URL}/${API_ID}`,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
})

// Helper to log actions to the Activity_Log sheet
async function logActivity(logData: Record<string, string | number | undefined | null>, staffMember?: string) {
  try {
    await sheetDBClient.post('/', { data: { ...logData, Staff_Member: staffMember, Timestamp: new Date().toISOString() } }, { params: { sheet: 'Activity_Log' } });
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't re-throw, as the primary action might have succeeded
  }
}

export class SheetDBService {
  // Get all inventory items
  static async getInventory(): Promise<InventoryItem[]> {
    try {
      const response = await sheetDBClient.get('/', { params: { sheet: 'Master_Inventory' } })
      return response.data.map((item: Record<string, string>) => {
        const currentStock = parseInt(item.Current_Stock, 10) || 0;
        const minLevel = parseInt(item.Min_Level, 10) || 0;

        let status: 'GOOD' | 'MEDIUM' | 'LOW' | 'OUT_OF_STOCK';

        if (currentStock === 0) {
          status = 'OUT_OF_STOCK';
        } else if (currentStock <= minLevel) {
          status = 'LOW';
        } else if (currentStock <= minLevel * 1.5) {
          status = 'MEDIUM';
        } else {
          status = 'GOOD';
        }

        // Parse vendors column (comma or semicolon separated)
        const vendorRaw = item.Primary_Vendor || '';
        const vendors = vendorRaw.split(/[,;]/).map(v => v.trim()).filter(Boolean);

        return {
          ...item,
          Current_Stock: currentStock,
          Min_Level: minLevel,
          Max_Level: parseInt(item.Max_Level, 10) || 0,
          Status: status,
          vendors,
        }
      })
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
          sheet: 'Master_Inventory',
          Product_Name: `*${query}*`,
          casesensitive: false,
        },
      })
      return response.data
    } catch (error) {
      console.error('Error searching inventory:', error)
      throw new Error('Failed to search inventory')
    }
  }

  // Get usage records for the dashboard chart
  static async getUsageRecords(): Promise<UsageRecord[]> {
    try {
      // Fetch all logs and filter for usage records
      const response = await sheetDBClient.get('/', { params: { sheet: 'Activity_Log' } })
      const allLogs = response.data || [];
      const usageLogs = allLogs.filter((log: Record<string, string>) => 
        log.Action_Type === 'UPDATE_STOCK' && log.Reason === 'Record Usage'
      );
      
      return usageLogs.map((record: Record<string, string>) => {
        const match = (record.Details || '').match(/-(\d+)/);
        return {
          ...record,
          Quantity_Used: match && match[1] ? parseInt(match[1], 10) : 0,
        } as UsageRecord;
      });
    } catch (error) {
      console.error('Error fetching usage records:', error)
      throw new Error('Failed to fetch usage records')
    }
  }

  // Create inventory item and log the action
  static async createInventoryItem(item: Partial<InventoryItem>, staffMember?: string): Promise<void> {
    try {
      await sheetDBClient.post('/', { data: item }, { params: { sheet: 'Master_Inventory' } });
      await logActivity({
        Product_ID: item.Product_ID,
        Product_Name: item.Product_Name,
        Action_Type: 'CREATE',
        Details: `Item created with stock of ${item.Current_Stock}`,
      }, staffMember);
    } catch (error) {
      console.error('Error creating inventory item:', error);
      throw new Error('Failed to create inventory item');
    }
  }

  // A new dedicated function for stock adjustments
  static async adjustStock(item: InventoryItem, adjustment: number, reason: 'Record Usage' | 'Receive Stock', notes: string, staffMember?: string): Promise<void> {
    const newStock = item.Current_Stock + adjustment;
    try {
      await this.updateInventoryItem(
        item,
        { Current_Stock: newStock, Notes: notes, Reason: reason },
        staffMember
      );
    } catch (error) {
      console.error('Error adjusting stock:', error);
      throw new Error('Failed to adjust stock');
    }
  }
  
  // Update inventory item and log the changes
  static async updateInventoryItem(originalItem: InventoryItem, updates: Partial<InventoryItem>, staffMember?: string): Promise<void> {
    try {
      const { Notes, Reason, ...itemUpdates } = updates;
      if (Object.keys(itemUpdates).length > 0) {
        await sheetDBClient.patch(`/Product_ID/${originalItem.Product_ID}`, { data: itemUpdates }, { params: { sheet: 'Master_Inventory' } });
      }
      let logDetails = '';
      let actionType = 'UPDATE_ITEM';
      if ('Current_Stock' in updates && Reason) {
        actionType = 'UPDATE_STOCK';
        const oldStock = originalItem.Current_Stock;
        const newStock = updates.Current_Stock!;
        const adjustment = newStock - oldStock;
        logDetails = `Stock changed from ${oldStock} to ${newStock} (${adjustment > 0 ? '+' : ''}${adjustment})`;
      } else {
        logDetails = Object.keys(itemUpdates)
          .filter(key => key !== 'Product_ID')
          .map(key => {
            const typedKey = key as keyof typeof itemUpdates;
            const oldValue = originalItem[typedKey];
            const newValue = itemUpdates[typedKey];
            if (String(oldValue) !== String(newValue)) {
              return `${key.replace(/_/g, ' ')} changed from '${oldValue}' to '${newValue}'`;
            }
            return null;
          })
          .filter(Boolean)
          .join(', ');
      }
      if (logDetails) {
        await logActivity({
          Product_ID: originalItem.Product_ID,
          Product_Name: updates.Product_Name || originalItem.Product_Name,
          Action_Type: actionType,
          Reason: Reason,
          Details: logDetails,
          Notes: Notes,
        }, staffMember);
      }
    } catch (error) {
      console.error('Error updating inventory item:', error);
      throw new Error('Failed to update inventory item');
    }
  }

  // Delete inventory item and log the action
  static async deleteInventoryItem(item: InventoryItem, reason: string, notes: string, staffMember?: string): Promise<void> {
    try {
      await logActivity({
        Product_ID: item.Product_ID,
        Product_Name: item.Product_Name,
        Action_Type: 'DELETE',
        Reason: reason,
        Details: `Item deleted from inventory`,
        Notes: notes,
      }, staffMember);
      await sheetDBClient.delete(`/Product_ID/${item.Product_ID}`, { params: { sheet: 'Master_Inventory' } });
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      throw new Error('Failed to delete inventory item');
    }
  }

  // ---- Methods for Data Export ----

  static async getRawInventory(): Promise<Omit<InventoryItem, 'Status'>[]> {
    try {
      const response = await sheetDBClient.get('/', { params: { sheet: 'Master_Inventory' } });
      return response.data;
    } catch (error) {
      console.error('Error fetching raw inventory:', error);
      throw new Error('Failed to fetch raw inventory data for export');
    }
  }

  static async getFullActivityLog(): Promise<Record<string, string>[]> {
    try {
      const response = await sheetDBClient.get('/', { params: { sheet: 'Activity_Log' } });
      return response.data;
    } catch (error) {
      console.error('Error fetching activity log:', error);
      throw new Error('Failed to fetch activity log data for export');
    }
  }

  // ---- Methods for User Preferences ----

  static async getUserPreferences(email: string): Promise<{ email_notifications_enabled: boolean } | null> {
    try {
      const response = await sheetDBClient.get(`/search?sheet=User_Preferences&user_email=${email}`);
      const prefs = response.data[0];
      if (prefs) {
        return {
          ...prefs,
          email_notifications_enabled: String(prefs.email_notifications_enabled).toUpperCase() === 'TRUE',
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }
  }

  static async createUserPreferences(email: string, prefs: { email_notifications_enabled: boolean }): Promise<void> {
    try {
        await sheetDBClient.post('/', { data: { ...prefs, user_email: email } }, { params: { sheet: 'User_Preferences' } });
    } catch (error) {
        console.error('Error creating user preferences:', error);
        throw new Error('Failed to create user preferences');
    }
  }

  static async updateUserPreferences(email: string, prefs: { email_notifications_enabled: boolean }): Promise<void> {
    try {
      await sheetDBClient.patch(`/user_email/${email}`, { data: prefs }, { params: { sheet: 'User_Preferences' } });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw new Error('Failed to update user preferences');
    }
  }

  // ---- Vendor CRUD ----
  static async getVendors(): Promise<Vendor[]> {
    try {
      const response = await sheetDBClient.get('/', { params: { sheet: 'Vendors' } });
      return response.data;
    } catch (error) {
      console.error('Error fetching vendors:', error);
      throw new Error('Failed to fetch vendors');
    }
  }

  static async createVendor(vendor: Vendor): Promise<void> {
    try {
      await sheetDBClient.post('/', { data: vendor }, { params: { sheet: 'Vendors' } });
    } catch (error) {
      console.error('Error creating vendor:', error);
      throw new Error('Failed to create vendor');
    }
  }

  static async updateVendor(name: string, vendor: Partial<Vendor>): Promise<void> {
    try {
      await sheetDBClient.patch(`/name/${encodeURIComponent(name)}`, { data: vendor }, { params: { sheet: 'Vendors' } });
    } catch (error) {
      console.error('Error updating vendor:', error);
      throw new Error('Failed to update vendor');
    }
  }

  static async deleteVendor(name: string): Promise<void> {
    try {
      await sheetDBClient.delete(`/name/${encodeURIComponent(name)}`, { params: { sheet: 'Vendors' } });
    } catch (error) {
      console.error('Error deleting vendor:', error);
      throw new Error('Failed to delete vendor');
    }
  }

  // Orders CRUD
  static async createOrder(order: Order): Promise<void> {
    try {
      const orderData = {
        ...order,
        items: JSON.stringify(order.items),
        inProcess: order.inProcess ? 'TRUE' : 'FALSE',
        rejected: order.rejected ? 'TRUE' : 'FALSE',
        moqMet: order.moqMet ? 'TRUE' : 'FALSE',
      };
      await sheetDBClient.post('/', { data: orderData }, { params: { sheet: 'Orders' } });
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }

  static async updateOrder(id: string, updates: Partial<Order>): Promise<void> {
    try {
      // Patch the order by id in Orders sheet
      await sheetDBClient.patch(`/id/${id}`, { data: updates }, { params: { sheet: 'Orders' } });
    } catch (error) {
      console.error('Error updating order:', error);
      throw new Error('Failed to update order');
    }
  }

  static async getOrders(): Promise<Order[]> {
    try {
      const response = await sheetDBClient.get('/', { params: { sheet: 'Orders' } });
      return response.data
        .map((row: Record<string, unknown>) => ({
          ...row,
          items: typeof row.items === 'string' ? JSON.parse(row.items as string) : row.items,
          inProcess: String(row.inProcess).toUpperCase() === 'TRUE',
          rejected: String(row.rejected).toUpperCase() === 'TRUE',
          moqMet: String(row.moqMet).toUpperCase() === 'TRUE',
        }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new Error('Failed to fetch orders');
    }
  }

  static async moveOrderToHistory(order: Order): Promise<void> {
    try {
      // Copy order to Order_History, removing receivedItems
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { receivedItems, ...orderData } = order;
      await sheetDBClient.post('/', { data: orderData }, { params: { sheet: 'Order_History' } });
    } catch (error) {
      console.error('Error moving order to history:', error);
      throw new Error('Failed to move order to history');
    }
  }

  static async deleteOrder(id: string): Promise<void> {
    try {
      await sheetDBClient.delete(`/id/${id}`, { params: { sheet: 'Orders' } });
    } catch (error) {
      console.error('Error deleting order:', error);
      throw new Error('Failed to delete order');
    }
  }

  static async getOrderHistory(): Promise<Order[]> {
    try {
      const response = await sheetDBClient.get('/', { params: { sheet: 'Order_History' } });
      return response.data.map((row: Record<string, unknown>) => ({
        ...row,
        items: typeof row.items === 'string' ? JSON.parse(row.items as string) : row.items,
        inProcess: String(row.inProcess).toUpperCase() === 'TRUE',
        rejected: String(row.rejected).toUpperCase() === 'TRUE',
        moqMet: String(row.moqMet).toUpperCase() === 'TRUE',
      }));
    } catch (error) {
      console.error('Error fetching order history:', error);
      throw new Error('Failed to fetch order history');
    }
  }
}
