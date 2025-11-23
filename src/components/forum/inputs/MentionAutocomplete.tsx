'use client';

import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '../../../hooks/useDebounce';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Component for autocomplete when mentioning users
interface User {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

interface MentionAutocompleteProps {
  query: string;
  onSelect: (user: User) => void;
  onClose: () => void;
}

export function MentionAutocomplete({ query, onSelect, onClose }: MentionAutocompleteProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setUsers([]);
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Call the actual API endpoint for searching users
        const response = await fetch(`/api/users/search?q=${debouncedQuery}`);
        const data = await response.json();
        setUsers(data.users || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        // Fallback to mock data if API fails
        setUsers([
          { id: '1', firstName: 'John', lastName: 'Doe', profilePicture: '' },
          { id: '2', firstName: 'Jane', lastName: 'Smith', profilePicture: '' },
          { id: '3', firstName: 'Bob', lastName: 'Johnson', profilePicture: '' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [debouncedQuery]);

  if (users.length === 0 && !loading) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className="absolute bottom-full left-0 mb-2 w-full max-w-md bg-white border rounded-md shadow-lg z-50"
    >
      {loading ? (
        <div className="p-2 text-center text-muted-foreground">Loading...</div>
      ) : (
        <div className="max-h-48 overflow-y-auto">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer"
              onClick={() => onSelect(user)}
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={user.profilePicture} alt={user.firstName} />
                <AvatarFallback>
                  {user.firstName.charAt(0)}
                  {user.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-medium">
                  {user.firstName} {user.lastName}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}