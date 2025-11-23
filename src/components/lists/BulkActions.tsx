'use client';

import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Download, Share, MoreHorizontal } from 'lucide-react';

interface BulkActionsProps {
  selectedCount: number;
  actions?: {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
  }[];
  onClearSelection: () => void;
}

export function BulkActions({
  selectedCount,
  actions = [],
  onClearSelection
}: BulkActionsProps) {
  // Default actions
  const defaultActions = [
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => console.log('Delete selected items')
    },
    {
      label: 'Export',
      icon: <Download className="h-4 w-4" />,
      onClick: () => console.log('Export selected items')
    },
    {
      label: 'Share',
      icon: <Share className="h-4 w-4" />,
      onClick: () => console.log('Share selected items')
    }
  ];

  const allActions = [...defaultActions, ...actions];

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-background border rounded-lg shadow-lg p-3 flex items-center space-x-4">
            <div className="text-sm font-medium">
              {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
            </div>
            
            <div className="flex space-x-2">
              {allActions.slice(0, 3).map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={action.onClick}
                >
                  {action.icon}
                  <span className="ml-2 hidden sm:inline">{action.label}</span>
                </Button>
              ))}
              
              {allActions.length > 3 && (
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
            >
              Clear
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}