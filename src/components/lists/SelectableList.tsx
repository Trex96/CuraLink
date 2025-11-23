'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface SelectableListProps<T> {
  items: T[];
  itemId: (item: T) => string;
  children: (item: T, isSelected: boolean, onSelect: (id: string) => void) => React.ReactNode;
  onSelectionChange?: (selectedIds: string[]) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
}

export function SelectableList<T>({
  items,
  itemId,
  children,
  onSelectionChange,
  onSelectAll,
  onDeselectAll
}: SelectableListProps<T>) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelect = (id: string) => {
    const newSelectedIds = selectedIds.includes(id)
      ? selectedIds.filter(selectedId => selectedId !== id)
      : [...selectedIds, id];

    setSelectedIds(newSelectedIds);
    onSelectionChange?.(newSelectedIds);
  };

  const handleSelectAll = () => {
    const allIds = items.map(itemId);
    setSelectedIds(allIds);
    onSelectionChange?.(allIds);
    onSelectAll?.();
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
    onSelectionChange?.([]);
    onDeselectAll?.();
  };

  const isAllSelected = selectedIds.length === items.length && items.length > 0;


  return (
    <div className="space-y-2">
      {items.length > 0 && (
        <div className="flex items-center p-2 border-b">
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={(checked) => {
              if (checked) {
                handleSelectAll();
              } else {
                handleDeselectAll();
              }
            }}
            className="mr-2"
          />
          <span className="text-sm font-medium">
            {selectedIds.length} of {items.length} selected
          </span>
          <AnimatePresence>
            {selectedIds.length > 0 && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="ml-auto flex space-x-2"
              >
                <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                  Deselect All
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="space-y-1">
        {items.map((item) => {
          const id = itemId(item);
          const isSelected = selectedIds.includes(id);
          return children(item, isSelected, handleSelect);
        })}
      </div>
    </div>
  );
}