import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SheetDBService } from '@/lib/sheetdb'
import { InventoryItem, UsageRecord } from '@/types/inventory'

export function useInventory() {
  return useQuery<InventoryItem[]>({
    queryKey: ['inventory'],
    queryFn: async () => {
      const inventory = await SheetDBService.getInventory();
      // Filter out items that don't have a product name
      return inventory.filter(item => item.Product_Name && item.Product_Name.trim() !== '');
    },
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

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ originalItem, updates }: { originalItem: InventoryItem; updates: Partial<InventoryItem> }) =>
      SheetDBService.updateInventoryItem(originalItem, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
  })
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (item: Partial<InventoryItem>) => SheetDBService.createInventoryItem(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
  })
}

export function useAdjustStock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      item: InventoryItem;
      adjustment: number;
      reason: 'Record Usage' | 'Receive Stock';
      notes: string;
    }) => SheetDBService.adjustStock(data.item, data.adjustment, data.reason, data.notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['usage-records'] }) // Also refresh dashboard
    },
  })
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { item: InventoryItem; reason: string; notes: string }) =>
      SheetDBService.deleteInventoryItem(data.item, data.reason, data.notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
  })
}
