'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getForumLeaderboard } from '@/lib/services/forum';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy } from 'lucide-react';

interface LeaderboardUser {
  userId: string;
  name: string;
  count: number;
  types: ('poster' | 'commenter')[];
}

export function ForumLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchForumLeaderboard();
  }, []);
  
  const fetchForumLeaderboard = async () => {
    try {
      setLoading(true);
      const forumLeaderboard = await getForumLeaderboard();
      setLeaderboard(forumLeaderboard);
    } catch (error) {
      console.error('Error fetching forum leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Community Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Community Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.length > 0 ? (
            leaderboard.map((user, index) => (
              <div key={user.userId} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 flex items-center justify-center rounded-full ${
                    index === 0 ? 'bg-yellow-500 text-white' : 
                    index === 1 ? 'bg-gray-400 text-white' : 
                    index === 2 ? 'bg-amber-700 text-white' : 'bg-muted'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="font-medium">{user.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{user.count} contributions</span>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm text-center py-4">
              No leaderboard data available
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}