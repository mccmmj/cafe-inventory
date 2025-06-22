import React from 'react';

interface StatusBadgeProps {
  status: 'GOOD' | 'MEDIUM' | 'LOW' | 'OUT_OF_STOCK';
}

const statusStyles = {
  GOOD: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  LOW: 'bg-red-100 text-red-800',
  OUT_OF_STOCK: 'bg-gray-200 text-gray-800 border border-gray-300',
};

const statusText = {
    GOOD: 'Good',
    MEDIUM: 'Medium',
    LOW: 'Low',
    OUT_OF_STOCK: 'Out of Stock',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const text = statusText[status] || 'Unknown';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        statusStyles[status] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {text}
    </span>
  );
} 