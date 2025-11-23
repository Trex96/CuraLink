import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/utils';

interface MatchBadgeProps {
  percentage: number;
  className?: string;
}

export function MatchBadge({ percentage, className }: MatchBadgeProps) {
  // Determine color based on percentage
  const getColor = () => {
    if (percentage >= 80) return 'bg-green-500 hover:bg-green-600';
    if (percentage >= 60) return 'bg-blue-500 hover:bg-blue-600';
    if (percentage >= 40) return 'bg-yellow-500 hover:bg-yellow-600';
    return 'bg-red-500 hover:bg-red-600';
  };

  return (
    <Badge className={cn('text-white', getColor(), className)}>
      {percentage}% match
    </Badge>
  );
}