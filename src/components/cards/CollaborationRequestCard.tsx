'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

interface CollaborationRequest {
  id: string;
  requester: {
    name: string;
    avatar?: string;
    institution: string;
    expertise: string[];
  };
  context: string;
  researchArea: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  expectedOutcome?: string;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
}

interface CollaborationRequestCardProps {
  request: CollaborationRequest;
  onClick?: () => void;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
};

const statusLabels = {
  pending: 'Pending',
  accepted: 'Accepted',
  declined: 'Declined',
};

export function CollaborationRequestCard({ request, onClick }: CollaborationRequestCardProps) {
  const {
    id,
    requester,
    context,
    researchArea,
    status,
    createdAt,
    expectedOutcome,
    onAccept,
    onDecline
  } = request;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={requester.avatar} alt={requester.name} />
                <AvatarFallback>{requester.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">{requester.name}</CardTitle>
                <CardDescription>{requester.institution}</CardDescription>
              </div>
            </div>
            <Badge className={statusColors[status]}>{statusLabels[status]}</Badge>
          </div>
          <div className="flex items-center text-xs text-muted-foreground mt-2">
            <Calendar className="h-3 w-3 mr-1" />
            {createdAt.toLocaleDateString()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h3 className="font-medium text-sm mb-1">Research Area</h3>
              <Badge variant="secondary">{researchArea}</Badge>
            </div>
            
            <div>
              <h3 className="font-medium text-sm mb-1">Request Context</h3>
              <p className="text-sm">{context}</p>
            </div>
            
            {expectedOutcome && (
              <div>
                <h3 className="font-medium text-sm mb-1">Expected Outcome</h3>
                <p className="text-sm text-muted-foreground">{expectedOutcome}</p>
              </div>
            )}
            
            <div>
              <h3 className="font-medium text-sm mb-1">Expertise</h3>
              <div className="flex flex-wrap gap-1">
                {requester.expertise.slice(0, 4).map((item, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {item}
                  </Badge>
                ))}
                {requester.expertise.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{requester.expertise.length - 4}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        {status === 'pending' && (
          <CardFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                if (onDecline) onDecline(id);
              }}
            >
              Decline
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                if (onAccept) onAccept(id);
              }}
            >
              Accept
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}