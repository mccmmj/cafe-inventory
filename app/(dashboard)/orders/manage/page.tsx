"use client";

import React, { useEffect, useState } from "react";
import { SheetDBService } from "@/lib/sheetdb";
import { Order } from "@/types/orders";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/Modal";
import { useSession } from "next-auth/react";

const STATUS_OPTIONS = [
  { label: "Submitted", value: "submitted" },
  { label: "In Process", value: "in_process" },
  { label: "Fulfillment", value: "fulfillment" },
  { label: "Complete", value: "complete" },
  { label: "Rejected", value: "rejected" },
];

export default function ManageOrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("submitted");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFulfillmentModal, setShowFulfillmentModal] = useState(false);
  const [fulfillmentItems, setFulfillmentItems] = useState<any[]>([]);
  const [receivedItems, setReceivedItems] = useState<any[]>([]);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        let allOrders;
        if (statusFilter === "complete" || statusFilter === "rejected") {
          allOrders = await SheetDBService.getOrderHistory();
        } else {
          allOrders = await SheetDBService.getOrders();
        }
        setOrders(allOrders);
      } catch (err) {
        setError("Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [statusFilter]);

  const filteredOrders = orders.filter((order) => {
    return (order.status as string) === statusFilter;
  });

  async function handleStatusChange(order: Order, newStatus: Order["status"]) {
    setActionLoading(true);
    try {
      const userName = session?.user?.name || session?.user?.email || "Unknown User";
      if (newStatus === "rejected") {
        await SheetDBService.moveOrderToHistory({ ...order, status: "rejected", updatedBy: userName });
        await SheetDBService.deleteOrder(order.id);
        setOrders((prev) => prev.filter((o) => o.id !== order.id));
        setSelectedOrder(null);
      } else {
        await SheetDBService.updateOrder(order.id, {
          status: newStatus,
          inProcess: newStatus === "in_process",
          rejected: newStatus === "rejected",
          updatedAt: new Date().toISOString(),
          updatedBy: userName,
        });
        setOrders((prev) =>
          prev.map((o) =>
            o.id === order.id
              ? { ...o, status: newStatus, inProcess: newStatus === "in_process", rejected: newStatus === "rejected" }
              : o
          )
        );
        setSelectedOrder((prev) =>
          prev && prev.id === order.id
            ? { ...prev, status: newStatus, inProcess: newStatus === "in_process", rejected: newStatus === "rejected" }
            : prev
        );
      }
    } catch (err) {
      setError("Failed to update order status.");
    } finally {
      setActionLoading(false);
    }
  }

  function openFulfillmentModal(order: Order) {
    let received = [];
    try {
      received = order.receivedItems ? JSON.parse(order.receivedItems) : order.items.map(item => ({ ...item, receivedQty: 0 }));
    } catch {
      received = order.items.map(item => ({ ...item, receivedQty: 0 }));
    }
    setFulfillmentItems(order.items.map((item, idx) => ({
      ...item,
      receivedQty: received[idx]?.receivedQty || 0,
      costPerUnit: item.pricePerUnit,
      purchaseCost: item.pricePerUnit * item.quantity,
    })));
    setReceivedItems(received);
    setShowFulfillmentModal(true);
  }

  async function handleFulfillmentSubmit(order: Order) {
    setActionLoading(true);
    try {
      const userName = session?.user?.name || session?.user?.email || "Unknown User";
      let allFulfilled = true;
      const inventory = await SheetDBService.getInventory();
      const newReceivedItems = fulfillmentItems.map((item, idx) => {
        const prevReceived = receivedItems[idx]?.receivedQty || 0;
        const newReceived = Number(item.receivedQty);
        if (newReceived < item.quantity) allFulfilled = false;
        return { ...item, receivedQty: newReceived };
      });
      for (const item of fulfillmentItems) {
        const fullItem = inventory.find(i => i.Product_ID === item.productId);
        if (fullItem) {
          await SheetDBService.updateInventoryItem(
            fullItem,
            {
              Current_Stock: fullItem.Current_Stock + Number(item.receivedQty),
              Cost_Per_Unit: item.costPerUnit,
              Purchase_Cost: item.purchaseCost,
              Last_Updated: new Date().toISOString(),
            }
          );
        }
      }
      if (allFulfilled) {
        await SheetDBService.moveOrderToHistory({ ...order, status: "complete", updatedBy: userName, receivedItems: JSON.stringify(newReceivedItems) });
        await SheetDBService.deleteOrder(order.id);
        setOrders(prev => prev.filter(o => o.id !== order.id));
      } else {
        await SheetDBService.updateOrder(order.id, {
          status: "fulfillment",
          updatedAt: new Date().toISOString(),
          updatedBy: userName,
          receivedItems: JSON.stringify(newReceivedItems),
        });
        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: "fulfillment", receivedItems: JSON.stringify(newReceivedItems) } : o));
      }
      setShowFulfillmentModal(false);
      setSelectedOrder(null);
    } catch (err) {
      setError("Failed to fulfill order.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Orders</h1>
      <div className="flex gap-4 mb-4">
        {STATUS_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            variant={statusFilter === opt.value ? "primary" : "outline"}
            onClick={() => setStatusFilter(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>
      {loading ? (
        <div>Loading orders...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <table className="w-full mb-4 text-sm">
          <thead>
            <tr>
              <th className="text-left">Order ID</th>
              <th className="text-left">Vendor</th>
              <th className="text-left">Status</th>
              <th className="text-left">Submitted By</th>
              <th className="text-left">Submitted At</th>
              <th className="text-left">Updated At</th>
              <th className="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td>
                  <button
                    className="text-blue-600 hover:underline cursor-pointer font-mono"
                    onClick={() => setSelectedOrder(order)}
                    style={{ background: 'none', border: 'none', padding: 0 }}
                    type="button"
                  >
                    {order.id}
                  </button>
                </td>
                <td>{order.vendorName}</td>
                <td className="capitalize">{
                  order.status === "in_process" ? "In Process" :
                  order.status === "fulfillment" ? "Fulfillment" :
                  order.status === "complete" ? "Complete" :
                  order.status.charAt(0).toUpperCase() + order.status.slice(1)
                }</td>
                <td>{order.submittedBy}</td>
                <td>{order.submittedAt ? new Date(order.submittedAt).toLocaleString() : ""}</td>
                <td>{order.updatedAt ? new Date(order.updatedAt).toLocaleString() : ""}</td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Order Details Modal */}
      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title="Order Details">
        {selectedOrder && (
          <div>
            <div className="mb-4">
              <div className="font-semibold">Order ID: {selectedOrder.id}</div>
              <div>Vendor: {selectedOrder.vendorName}</div>
              <div>Status: <span className="capitalize">{selectedOrder.status.replace("_", " ")}</span></div>
              <div>Submitted By: {selectedOrder.submittedBy}</div>
              <div>Submitted At: {selectedOrder.submittedAt ? new Date(selectedOrder.submittedAt).toLocaleString() : ""}</div>
              <div>Updated At: {selectedOrder.updatedAt ? new Date(selectedOrder.updatedAt).toLocaleString() : ""}</div>
              <div>Notes: {selectedOrder.notes || <span className="italic text-gray-400">None</span>}</div>
            </div>
            <div className="mb-4">
              <div className="font-semibold mb-2">Items</div>
              <table className="w-full text-sm">
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
                  {Array.isArray(selectedOrder.items)
                    ? selectedOrder.items.map((item) => (
                        <tr key={item.productId}>
                          <td>{item.name}</td>
                          <td className="text-center">{item.quantity}</td>
                          <td className="text-center">{item.unit}</td>
                          <td className="text-right px-4">${item.pricePerUnit.toFixed(2)}</td>
                          <td className="text-right px-4">${(item.pricePerUnit * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))
                    : null}
                </tbody>
              </table>
            </div>
            <div className="text-right font-semibold">
              Subtotal: $
              {Array.isArray(selectedOrder.items)
                ? selectedOrder.items.reduce((sum, item) => sum + item.pricePerUnit * item.quantity, 0).toFixed(2)
                : "0.00"}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              {selectedOrder.status === "submitted" && (
                <>
                  <Button size="sm" variant="secondary" onClick={() => handleStatusChange(selectedOrder, "in_process")} disabled={actionLoading}>
                    Mark In Process
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleStatusChange(selectedOrder, "rejected")} disabled={actionLoading}>
                    Reject
                  </Button>
                </>
              )}
              {selectedOrder.status === "in_process" && (
                <Button size="sm" variant="primary" onClick={() => handleStatusChange(selectedOrder, "fulfillment")} disabled={actionLoading}>
                  Fulfill
                </Button>
              )}
            </div>
            {selectedOrder && (selectedOrder.status === "in_process" || selectedOrder.status === "fulfillment") && (
              <Button size="sm" variant="primary" onClick={() => openFulfillmentModal(selectedOrder)} disabled={actionLoading}>
                {selectedOrder.status === "in_process" ? "Start Fulfillment" : "Continue Fulfillment"}
              </Button>
            )}
          </div>
        )}
      </Modal>
      {/* Fulfillment Modal */}
      <Modal isOpen={showFulfillmentModal} onClose={() => setShowFulfillmentModal(false)} title="Order Fulfillment">
        <form onSubmit={e => { e.preventDefault(); if (selectedOrder) handleFulfillmentSubmit(selectedOrder); }}>
          <table className="w-full text-sm mb-4">
            <thead>
              <tr>
                <th className="text-left">Item</th>
                <th className="text-center">Ordered</th>
                <th className="text-center">Received</th>
                <th className="text-center">Unit</th>
                <th className="text-right">Cost/Unit</th>
                <th className="text-right">Purchase Cost</th>
              </tr>
            </thead>
            <tbody>
              {fulfillmentItems.map((item, idx) => (
                <tr key={item.productId}>
                  <td>{item.name}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-center">
                    <input
                      type="number"
                      min={receivedItems[idx]?.receivedQty || 0}
                      max={item.quantity}
                      value={item.receivedQty}
                      onChange={e => setFulfillmentItems(items => items.map((it, i) => i === idx ? { ...it, receivedQty: Number(e.target.value) } : it))}
                      className="w-16 text-center border rounded"
                    />
                  </td>
                  <td className="text-center">{item.unit}</td>
                  <td className="text-right">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={item.costPerUnit}
                      onChange={e => setFulfillmentItems(items => items.map((it, i) => i === idx ? { ...it, costPerUnit: e.target.value } : it))}
                      className="w-20 text-right border rounded"
                    />
                  </td>
                  <td className="text-right">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={item.purchaseCost}
                      onChange={e => setFulfillmentItems(items => items.map((it, i) => i === idx ? { ...it, purchaseCost: e.target.value } : it))}
                      className="w-24 text-right border rounded"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowFulfillmentModal(false)} disabled={actionLoading}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={actionLoading}>Submit Fulfillment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
} 