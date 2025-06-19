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
