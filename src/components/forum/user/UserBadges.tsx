'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserBadges } from '@/lib/services/forum';
import { Skeleton } from '@/components/ui/skeleton';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
}

export function UserBadges() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUserBadges();
  }, []);
  
  const fetchUserBadges = async () => {
    try {
      setLoading(true);
      const userBadges = await getUserBadges();
      setBadges(userBadges);
    } catch (error) {
      console.error('Error fetching user badges:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Badges</CardTitle>
      </CardHeader>
      <CardContent>
        {badges.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {badges.map((badge) => (
              <div 
                key={badge.id} 
                className="flex flex-col items-center p-3 bg-muted rounded-lg border"
              >
                <span className="text-2xl mb-1">{badge.icon}</span>
                <span className="text-xs font-medium text-center">{badge.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm text-center py-4">
            You have not earned any badges yet. Start participating to earn badges!
          </p>
        )}
      </CardContent>
    </Card>
  );
}