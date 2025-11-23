'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';


interface ResultNotFoundCardProps {
  title?: string;
  description?: string;

}

export function ResultNotFoundCard({
  title = 'No Results Found',
  description = 'Try adjusting filters or search terms to find what you need.',
}: ResultNotFoundCardProps) {
  return (
    <Card className="border-dashed">
      <CardHeader className="flex flex-row items-center gap-3">
        <Search className="h-5 w-5 text-muted-foreground" />
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">{description}</p>

      </CardContent>
    </Card>
  );
}