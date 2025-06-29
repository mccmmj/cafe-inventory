"use client";

import React, { useEffect, useState, useRef } from "react";
import { InventoryItem } from "@/types/inventory";
import { OrderItem } from "@/types/orders";
import { Button } from "@/components/ui/button";
import { SheetDBService } from "@/lib/sheetdb";
import { Plus, Minus } from "lucide-react";
import { Modal } from '@/components/ui/Modal';
import { useSession } from "next-auth/react";

function toOrderItem(item: InventoryItem, vendor: string): OrderItem {
  return {
    productId: item.Product_ID,
    name: item.Product_Name,
    quantity: Math.max(item.Min_Level - item.Current_Stock, 1),
    unit: item.Unit_Size || "unit",
    currentStock: item.Current_Stock,
    pricePerUnit: parseFloat((item.Cost_Per_Unit || "0").replace(/[^0-9.]/g, "")) || 0,
    isSuggestedPadding: false,
    vendorOptions: item.vendors,
    selectedVendor: vendor,
    selected: true,
  };
}

export default function OrdersPage() {
  const { data: session } = useSession();
  const [selectedVendor, setSelectedVendor] = useState<string>("");
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [vendors, setVendors] = useState<string[]>([]);
  const [orders, setOrders] = useState<Record<string, OrderItem[]>>({});
  const [loading, setLoading] = useState(true);
  // Modal state stubs
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // --- FIX: refs for select-all checkboxes ---
  const selectAllRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Add state for modal selection and search
  const [addModalVendor, setAddModalVendor] = useState<string | null>(null);
  const [addModalSearch, setAddModalSearch] = useState('');
  const [addModalSelections, setAddModalSelections] = useState<Record<string, { qty: number; selected: boolean }>>({});

  // Add state for review modal
  const [reviewOrderNotes, setReviewOrderNotes] = useState('');
  const [reviewOrderSubmitting, setReviewOrderSubmitting] = useState(false);
  const [reviewOrderSuccess, setReviewOrderSuccess] = useState(false);
  const [reviewOrderError, setReviewOrderError] = useState<string | null>(null);

  useEffect(() => {
    vendors.forEach(vendor => {
      const order = orders[vendor] || [];
      const ref = selectAllRefs.current[vendor];
      if (ref) {
        ref.indeterminate = order.some(item => item.selected) && !order.every(item => item.selected);
      }
    });
  }, [orders, vendors]);

  useEffect(() => {
    async function fetchInventory() {
      setLoading(true);
      const data = await SheetDBService.getInventory();
      setInventory(data);
      // Extract unique vendors from all items
      const vendorSet = new Set<string>();
      data.forEach(item => item.vendors.forEach(v => vendorSet.add(v)));
      const vendorList = Array.from(vendorSet).sort();
      setVendors(vendorList);
      setSelectedVendor(vendorList[0] || "");
      // Build initial orders for each vendor
      const initialOrders: Record<string, OrderItem[]> = {};
      vendorList.forEach((vendor) => {
        const items = data.filter(
          (item) =>
            item.vendors.includes(vendor) &&
            (item.Status === "LOW" || item.Status === "OUT_OF_STOCK")
        ).map(item => ({ ...toOrderItem(item, vendor), selected: false }));
        initialOrders[vendor] = items;
      });
      setOrders(initialOrders);
      setLoading(false);
    }
    fetchInventory();
  }, []);

  function handleQtyChange(vendor: string, productId: string, qty: number) {
    setOrders((prev) => ({
      ...prev,
      [vendor]: prev[vendor].map((item) =>
        item.productId === productId ? { ...item, quantity: qty } : item
      ),
    }));
  }

  function handleVendorChange(vendor: string, productId: string, newVendor: string) {
    setOrders((prev) => ({
      ...prev,
      [vendor]: prev[vendor].map((item) =>
        item.productId === productId ? { ...item, selectedVendor: newVendor } : item
      ),
    }));
  }

  function handleSelectItem(vendor: string, productId: string, checked: boolean) {
    setOrders((prev) => ({
      ...prev,
      [vendor]: prev[vendor].map((item) =>
        item.productId === productId ? { ...item, selected: checked } : item
      ),
    }));
  }

  function handleSelectAll(vendor: string, checked: boolean) {
    setOrders((prev) => ({
      ...prev,
      [vendor]: prev[vendor].map((item) => ({ ...item, selected: checked })),
    }));
  }

  function getOrderSubtotal(order: OrderItem[]) {
    return order.filter(item => item.selected).reduce((sum, item) => sum + item.quantity * item.pricePerUnit, 0);
  }

  function openAddModal(vendor: string) {
    setAddModalVendor(vendor);
    setAddModalSearch('');
    setAddModalSelections({});
    setShowAddModal(true);
  }

  function closeAddModal() {
    setShowAddModal(false);
    setAddModalVendor(null);
    setAddModalSearch('');
    setAddModalSelections({});
  }

  function handleAddModalSelect(productId: string, checked: boolean) {
    setAddModalSelections(prev => ({
      ...prev,
      [productId]: { qty: prev[productId]?.qty || 1, selected: checked },
    }));
  }

  function handleAddModalQty(productId: string, qty: number) {
    setAddModalSelections(prev => ({
      ...prev,
      [productId]: { qty, selected: prev[productId]?.selected ?? true },
    }));
  }

  function handleAddModalConfirm() {
    if (!addModalVendor) return;
    const itemsToAdd = Object.entries(addModalSelections)
      .filter(([, value]) => value.selected)
      .map(([productId]) => {
        const item = inventory.find(i => i.Product_ID === productId);
        if (!item) return null;
        return { ...toOrderItem(item, addModalVendor), selected: true };
      })
      .filter(Boolean) as OrderItem[];
    setOrders(prev => ({
      ...prev,
      [addModalVendor]: [
        ...prev[addModalVendor],
        ...itemsToAdd.map((item) => ({ ...item, quantity: addModalSelections[item.productId].qty })),
      ],
    }));
    closeAddModal();
  }

  async function handleReviewOrderSubmit(vendor: string) {
    setReviewOrderSubmitting(true);
    setReviewOrderError(null);
    try {
      const orderItems = (orders[vendor] || []).filter(item => item.selected);
      const now = new Date().toISOString();
      const userName = session?.user?.name || session?.user?.email || "Unknown User";
      const order = {
        id: `order_${Date.now()}`,
        vendorId: vendor,
        vendorName: vendor,
        items: orderItems,
        status: 'submitted' as const,
        createdAt: now,
        updatedAt: now,
        submittedAt: now,
        submittedBy: userName,
        updatedBy: userName,
        inProcess: false,
        rejected: false,
        moqMet: true, // TODO: Add MOQ logic if needed
        notes: reviewOrderNotes,
      };
      await SheetDBService.createOrder(order);
      setReviewOrderSuccess(true);
      setShowReviewModal(false);
    } catch {
      setReviewOrderError('Failed to submit order.');
    } finally {
      setReviewOrderSubmitting(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      <div className="flex gap-4 mb-4">
        {vendors.map((vendor) => (
          <Button
            key={vendor}
            variant={selectedVendor === vendor ? "primary" : "outline"}
            onClick={() => setSelectedVendor(vendor)}
          >
            {vendor}
          </Button>
        ))}
      </div>
      {loading ? (
        <div>Loading inventory...</div>
      ) : (
        vendors.map((vendor) => {
          const order = orders[vendor] || [];
          const subtotal = getOrderSubtotal(order);
          return (
            <section
              key={vendor}
              className={selectedVendor === vendor ? "block" : "hidden"}
            >
              <h2 className="text-xl font-semibold mb-2">{vendor} Order</h2>
              {/* Order Table */}
              <table className="w-full mb-4">
                <thead>
                  <tr>
                    <th className="text-left w-8">
                      <input
                        ref={el => {
                          selectAllRefs.current[vendor] = el;
                        }}
                        type="checkbox"
                        checked={order.length > 0 && order.every(item => item.selected)}
                        onChange={e => handleSelectAll(vendor, e.target.checked)}
                        className="w-5 h-5 border-4 border-gray-700 dark:border-gray-200 bg-gray-100 dark:bg-gray-700 rounded accent-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                    </th>
                    <th className="text-left">Item</th>
                    <th className="text-left">Current Stock</th>
                    <th className="text-center">Qty</th>
                    <th className="text-left">Unit</th>
                    <th className="text-left">Vendor</th>
                  </tr>
                </thead>
                <tbody>
                  {order.map((item) => (
                    <tr key={item.productId}>
                      <td>
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={e => handleSelectItem(vendor, item.productId, e.target.checked)}
                          className="w-5 h-5 border-4 border-gray-700 dark:border-gray-200 bg-gray-100 dark:bg-gray-700 rounded accent-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td>{item.name}</td>
                      <td>{item.currentStock}</td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button type="button" aria-label="Decrease" onClick={() => handleQtyChange(vendor, item.productId, Math.max(1, item.quantity - 1))} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              handleQtyChange(
                                vendor,
                                item.productId,
                                Math.max(1, parseInt(e.target.value) || 1)
                              )
                            }
                            className="w-12 bg-transparent focus:outline-none text-center hide-spin"
                            style={{ appearance: 'textfield', border: 'none', boxShadow: 'none' }}
                          />
                          <button type="button" aria-label="Increase" onClick={() => handleQtyChange(vendor, item.productId, item.quantity + 1)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td>{item.unit}</td>
                      <td>
                        {item.vendorOptions && item.vendorOptions.length > 1 ? (
                          <select
                            value={item.selectedVendor}
                            onChange={e => handleVendorChange(vendor, item.productId, e.target.value)}
                            className="border rounded px-2 py-1"
                          >
                            {item.vendorOptions.map(v => (
                              <option key={v} value={v}>{v}</option>
                            ))}
                          </select>
                        ) : (
                          item.selectedVendor
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Order Summary & Actions */}
              <div className="flex items-center gap-4 mb-4">
                <span>Subtotal: ${subtotal.toFixed(2)}</span>
                <Button variant="outline" onClick={() => openAddModal(vendor)}>Add More Items</Button>
                <Button variant="primary" onClick={() => setShowReviewModal(true)}>Review & Submit Order</Button>
              </div>
              {/* TODO: Modals for Add Items, Review Order */}
              <Modal isOpen={showAddModal} onClose={closeAddModal} title="Add More Items">
                {addModalVendor && (
                  <>
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={addModalSearch}
                      onChange={e => setAddModalSearch(e.target.value)}
                      className="mb-4 w-full border rounded px-2 py-1"
                    />
                    <div className="max-h-64 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr>
                            <th></th>
                            <th className="text-left">Item</th>
                            <th className="text-center">Current Stock</th>
                            <th className="text-center">Qty</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inventory
                            .filter(item => item.vendors.includes(addModalVendor))
                            .filter(item => !orders[addModalVendor]?.some(o => o.productId === item.Product_ID))
                            .filter(item => item.Product_Name.toLowerCase().includes(addModalSearch.toLowerCase()))
                            .map(item => (
                              <tr key={item.Product_ID}>
                                <td>
                                  <input
                                    type="checkbox"
                                    checked={addModalSelections[item.Product_ID]?.selected || false}
                                    onChange={e => handleAddModalSelect(item.Product_ID, e.target.checked)}
                                    className="w-5 h-5 border-4 border-gray-700 dark:border-gray-200 bg-gray-100 dark:bg-gray-700 rounded accent-blue-600 focus:ring-2 focus:ring-blue-500"
                                  />
                                </td>
                                <td>{item.Product_Name}</td>
                                <td className="text-center">{item.Current_Stock}</td>
                                <td className="text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <button type="button" aria-label="Decrease" onClick={() => handleAddModalQty(item.Product_ID, Math.max(1, (addModalSelections[item.Product_ID]?.qty || 1) - 1))} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ml-1" disabled={!addModalSelections[item.Product_ID]?.selected}>
                                      <Minus className="w-4 h-4" />
                                    </button>
                                    <input
                                      type="number"
                                      min={1}
                                      value={addModalSelections[item.Product_ID]?.qty || 1}
                                      onChange={e => handleAddModalQty(item.Product_ID, Math.max(1, parseInt(e.target.value) || 1))}
                                      className="w-12 bg-transparent focus:outline-none text-center hide-spin"
                                      style={{ appearance: 'textfield', border: 'none', boxShadow: 'none' }}
                                      disabled={!addModalSelections[item.Product_ID]?.selected}
                                    />
                                    <button type="button" aria-label="Increase" onClick={() => handleAddModalQty(item.Product_ID, (addModalSelections[item.Product_ID]?.qty || 1) + 1)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ml-1" disabled={!addModalSelections[item.Product_ID]?.selected}>
                                      <Plus className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={closeAddModal}>Cancel</Button>
                      <Button variant="primary" onClick={handleAddModalConfirm} disabled={Object.values(addModalSelections).every(v => !v.selected)}>Add Selected</Button>
                    </div>
                  </>
                )}
              </Modal>
              <Modal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} title="Review & Submit Order">
                {reviewOrderSuccess ? (
                  <div className="text-green-600 font-semibold">Order submitted successfully!</div>
                ) : (
                  <>
                    <table className="w-full text-sm mb-4">
                      <thead>
                        <tr>
                          <th className="text-left">Item</th>
                          <th className="text-center">Qty</th>
                          <th className="text-center">Unit</th>
                          <th className="text-right px-4">Price</th>
                          <th className="text-right px-4">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(orders[selectedVendor] || []).filter(item => item.selected).map(item => (
                          <tr key={item.productId}>
                            <td>{item.name}</td>
                            <td className="text-center">{item.quantity}</td>
                            <td className="text-center">{item.unit}</td>
                            <td className="text-right px-4">${item.pricePerUnit.toFixed(2)}</td>
                            <td className="text-right px-4">${(item.pricePerUnit * item.quantity).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mb-4 text-right font-semibold">
                      Subtotal: $
                      {((orders[selectedVendor] || []).filter(item => item.selected).reduce((sum, item) => sum + item.pricePerUnit * item.quantity, 0)).toFixed(2)}
                    </div>
                    <textarea
                      className="w-full border rounded p-2 mb-4"
                      placeholder="Add notes or special instructions (optional)"
                      value={reviewOrderNotes}
                      onChange={e => setReviewOrderNotes(e.target.value)}
                      rows={3}
                    />
                    {reviewOrderError && <div className="text-red-600 mb-2">{reviewOrderError}</div>}
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowReviewModal(false)} disabled={reviewOrderSubmitting}>Cancel</Button>
                      <Button variant="primary" onClick={() => handleReviewOrderSubmit(selectedVendor)} disabled={reviewOrderSubmitting}>
                        {reviewOrderSubmitting ? 'Submitting...' : 'Submit Order'}
                      </Button>
                    </div>
                  </>
                )}
              </Modal>
            </section>
          );
        })
      )}
    </div>
  );
} 