"use client";

import React, { useEffect, useState } from "react";
import { SheetDBService } from "@/lib/sheetdb";
import { Vendor } from "@/types/vendor";
import { Button } from "@/components/ui/button";
import { VendorFormModal } from '@/components/vendors/VendorFormModal';
import { Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<{ open: boolean; vendor?: Vendor }>({ open: false });
  const [deleteTarget, setDeleteTarget] = useState<Vendor | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refreshVendors() {
    setLoading(true);
    const data = await SheetDBService.getVendors();
    setVendors(data);
    setLoading(false);
  }

  useEffect(() => { refreshVendors(); }, []);

  async function handleAdd(vendor: Vendor) {
    try {
      await SheetDBService.createVendor(vendor);
      setShowAddModal(false);
      await refreshVendors();
    } catch (e) {
      setError('Failed to add vendor.');
    }
  }

  async function handleEdit(vendor: Vendor) {
    try {
      await SheetDBService.updateVendor(vendor.name, vendor);
      setShowEditModal({ open: false });
      await refreshVendors();
    } catch (e) {
      setError('Failed to update vendor.');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await SheetDBService.deleteVendor(deleteTarget.name);
      setDeleteTarget(null);
      await refreshVendors();
    } catch (e) {
      setError('Failed to delete vendor.');
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Vendors</h1>
      <Button variant="primary" onClick={() => setShowAddModal(true)} className="mb-4">Add Vendor</Button>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {loading ? (
        <div>Loading vendors...</div>
      ) : (
        <table className="w-full mb-4">
          <thead>
            <tr>
              <th className="text-left">Name</th>
              <th className="text-left">MOQ</th>
              <th className="text-left">Contact Name</th>
              <th className="text-left">Contact Info</th>
              <th className="text-left">Notes</th>
              <th className="text-left">Plugin Key</th>
              <th className="text-left"></th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => (
              <tr key={vendor.name}>
                <td>
                  <Link href={`/vendors/${encodeURIComponent(vendor.name)}`} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                    {vendor.name}
                  </Link>
                </td>
                <td>{vendor.moq ?? ""}</td>
                <td>{vendor.contactName ?? ""}</td>
                <td>{vendor.contactInfo ?? ""}</td>
                <td>{vendor.notes ?? ""}</td>
                <td>{vendor.pluginKey ?? ""}</td>
                <td>
                  <Button size="icon" variant="ghost" onClick={() => setShowEditModal({ open: true, vendor })} aria-label="Edit Vendor">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="ml-2" onClick={() => setDeleteTarget(vendor)} aria-label="Delete Vendor">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <VendorFormModal open={showAddModal} onSubmit={handleAdd} onCancel={() => setShowAddModal(false)} />
      <VendorFormModal open={showEditModal.open} initialVendor={showEditModal.vendor} onSubmit={handleEdit} onCancel={() => setShowEditModal({ open: false })} />
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Delete Vendor</h2>
            <p>Are you sure you want to delete <b>{deleteTarget.name}</b>?</p>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button variant="danger" onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 