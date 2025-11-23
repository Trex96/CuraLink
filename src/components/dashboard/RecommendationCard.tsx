'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  matchPercentage?: number;
  type: 'researcher' | 'publication' | 'trial';
  icon: React.ReactNode;
  onClick: () => void;
}

interface RecommendationCardProps {
  recommendations: Recommendation[];
  loading?: boolean;
  title?: string;
  description?: string;
  onViewAll?: () => void;
  emptyState?: {
    title: string;
    description: string;
    icon: React.ReactNode;
  };
}

export function RecommendationCard({ 
  recommendations, 
  loading = false,
  title = "Recommendations",
  description = "Suggested based on your interests",
  onViewAll,
  emptyState
}: RecommendationCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'researcher': return 'bg-blue-100 text-blue-800';
      case 'publication': return 'bg-green-100 text-green-800';
      case 'trial': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'researcher': return 'Researcher';
      case 'publication': return 'Publication';
      case 'trial': return 'Trial';
      default: return 'Recommendation';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {onViewAll && (
            <Button variant="outline" size="sm" onClick={onViewAll}>
              View All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            {emptyState?.icon && (
              <div className="mx-auto h-12 w-12 text-muted-foreground">
                {emptyState.icon}
              </div>
            )}
            <h3 className="mt-2 text-sm font-medium">{emptyState?.title || "No recommendations"}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {emptyState?.description || "We don't have any recommendations for you right now."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((recommendation, index) => (
              <motion.div
                key={recommendation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                  onClick={recommendation.onClick}>
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    {recommendation.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium">{recommendation.title}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(recommendation.type)}`}>
                        {getTypeLabel(recommendation.type)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {recommendation.description}
                    </p>
                    {recommendation.matchPercentage !== undefined && (
                      <div className="mt-2 flex items-center">
                        <div className="w-full bg-secondary rounded-full h-1.5">
                          <div 
                            className="bg-primary h-1.5 rounded-full" 
                            style={{ width: `${recommendation.matchPercentage}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs font-medium text-muted-foreground">
                          {recommendation.matchPercentage}%
                        </span>
                      </div>
                    )}
                  </div>
                  <Button size="sm" variant="outline" onClick={(e) => {
                    e.stopPropagation();
                    recommendation.onClick();
                  }}>
                    View
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}