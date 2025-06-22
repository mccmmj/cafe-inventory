'use client'

import React from 'react';
import { List, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ViewToggleProps {
  view: 'list' | 'grid';
  onViewChange: (view: 'list' | 'grid') => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-gray-200 rounded-lg">
      <Button
        variant={view === 'list' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('list')}
        className={`px-2 ${view === 'list' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'}`}
      >
        <List size={18} />
      </Button>
      <Button
        variant={view === 'grid' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('grid')}
        className={`px-2 ${view === 'grid' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'}`}
      >
        <LayoutGrid size={18} />
      </Button>
    </div>
  );
} 