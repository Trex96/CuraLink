'use client';

import { Mail, Phone, MapPin } from 'lucide-react';
import { Researcher } from './types';

interface ContactSectionProps {
  researcher: Researcher;
}

export function ContactSection({ researcher }: ContactSectionProps) {
  return (
    <div className="space-y-3">
      {researcher.email && (
        <div className="flex items-center">
          <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
          <a href={`mailto:${researcher.email}`} className="hover:underline">
            {researcher.email}
          </a>
        </div>
      )}
      
      {researcher.phone && (
        <div className="flex items-center">
          <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{researcher.phone}</span>
        </div>
      )}
      
      {researcher.location?.address && (
        <div className="flex items-start">
          <MapPin className="mr-2 h-4 w-4 text-muted-foreground mt-0.5" />
          <span>{researcher.location.address}</span>
        </div>
      )}
    </div>
  );
}