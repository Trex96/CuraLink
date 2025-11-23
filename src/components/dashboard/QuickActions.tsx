'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

interface QuickActionsProps {
  actions: QuickAction[];
  loading?: boolean;
  title?: string;
  description?: string;
}

export function QuickActions({ 
  actions, 
  loading = false,
  title = "Quick Actions",
  description = "Common tasks you can perform"
}: QuickActionsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action) => (
            <motion.div
              key={action.id}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outline"
                className="h-auto w-full p-4 flex flex-col items-center justify-center text-center hover:shadow-md transition-all"
                onClick={action.onClick}
                disabled={action.disabled}
              >
                <div className="mb-2 text-primary">
                  {action.icon}
                </div>
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {action.description}
                </div>
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}