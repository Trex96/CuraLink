'use client';

import { useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  onScrollEnd?: () => void;
  hasNextPage?: boolean;
  isFetching?: boolean;
  overscan?: number;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  renderItem,
  onScrollEnd,
  hasNextPage,
  isFetching,
  overscan = 5
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? items.length + 1 : items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan,
  });

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
    
    if (!lastItem) return;
    
    if (
      lastItem.index >= items.length - 1 &&
      hasNextPage &&
      !isFetching
    ) {
      onScrollEnd?.();
    }
  }, [
    hasNextPage,
    items.length,
    isFetching,
    onScrollEnd,
    rowVirtualizer,
  ]);

  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const isLoaderRow = virtualItem.index > items.length - 1;
          
          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {isLoaderRow ? (
                hasNextPage ? (
                  <div className="flex items-center justify-center p-4">
                    Loading more...
                  </div>
                ) : null
              ) : (
                renderItem(items[virtualItem.index], virtualItem.index)
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}