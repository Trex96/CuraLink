import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { forwardRef } from 'react';

export interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, onSearch, ...props }, ref) => {
    return (
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={ref}
          className={cn('pl-10', className)}
          {...props}
          onChange={(e) => {
            props.onChange?.(e);
            onSearch?.(e.target.value);
          }}
        />
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';