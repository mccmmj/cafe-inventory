import React, { useState, useEffect } from 'react';
import { Vendor } from '@/types/vendor';
import { Button } from '@/components/ui/button';

interface VendorFormModalProps {
  open: boolean;
  initialVendor?: Vendor;
  onSubmit: (vendor: Vendor) => void;
  onCancel: () => void;
}

export function VendorFormModal({ open, initialVendor, onSubmit, onCancel }: VendorFormModalProps) {
  const [form, setForm] = useState<Vendor>({
    name: '',
    moq: undefined,
    contactName: '',
    contactInfo: '',
    notes: '',
    pluginKey: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialVendor) {
      setForm({ ...initialVendor });
    } else {
      setForm({ name: '', moq: undefined, contactName: '', contactInfo: '', notes: '', pluginKey: '' });
    }
    setError(null);
  }, [open, initialVendor]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'moq' ? (value ? Number(value) : undefined) : value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Vendor name is required.');
      return;
    }
    onSubmit({ ...form, name: form.name.trim() });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">{initialVendor ? 'Edit Vendor' : 'Add Vendor'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-2 py-1" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">MOQ</label>
            <input name="moq" type="number" value={form.moq ?? ''} onChange={handleChange} className="w-full border rounded px-2 py-1" min={0} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contact Name</label>
            <input name="contactName" value={form.contactName ?? ''} onChange={handleChange} className="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contact Info</label>
            <input name="contactInfo" value={form.contactInfo ?? ''} onChange={handleChange} className="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea name="notes" value={form.notes ?? ''} onChange={handleChange} className="w-full border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Plugin Key</label>
            <input name="pluginKey" value={form.pluginKey ?? ''} onChange={handleChange} className="w-full border rounded px-2 py-1" />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit" variant="primary">{initialVendor ? 'Save Changes' : 'Add Vendor'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
} 