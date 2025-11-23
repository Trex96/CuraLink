'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ForumCategoryCardProps {
  category: {
    _id: string;
    name: string;
    description: string;
    diseaseCategory: string;
  };
}

export function ForumCategoryCard({ category }: ForumCategoryCardProps) {
  const router = useRouter();
  
  const handleClick = () => {
    router.push(`/forum/${category.name}`);
  };
  
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleClick}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{category.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
        <Button variant="outline" size="sm" onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}>
          View Posts
        </Button>
      </CardContent>
    </Card>
  );
}