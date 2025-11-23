'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  BookOpen,
  FlaskConical,
  MessageCircle,
  Heart,
  Users2,
  MessageSquare,
  LayoutDashboard,
  Settings,
  User,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { useSession } from 'next-auth/react';

interface UserWithRole {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

const SideNav = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as UserWithRole | undefined;

  // Navigation items based on user role
  const getNavItems = () => {
    if (!user) {
      return [];
    }

    if (user.role === 'patient') {
      return [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Dashboard', href: '/dashboard/patient', icon: LayoutDashboard },
        { name: 'Search', href: '/search', icon: Search },
        { name: 'Trials', href: '/trials', icon: FlaskConical },
        { name: 'Forum', href: '/forum', icon: MessageCircle },
        { name: 'Favorites', href: '/favorites', icon: Heart },
        { name: 'Profile', href: '/profile', icon: User },
        { name: 'Settings', href: '/settings', icon: Settings },
      ];
    }

    if (user.role === 'researcher') {
      return [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Dashboard', href: '/dashboard/researcher', icon: LayoutDashboard },
        { name: 'Search', href: '/search', icon: Search },
        { name: 'Publications', href: '/publications', icon: BookOpen },
        { name: 'Trials', href: '/trials', icon: FlaskConical },
        { name: 'Forum', href: '/forum', icon: MessageCircle },
        { name: 'Collaborations', href: '/collaborations', icon: Users2 },
        { name: 'Messages', href: '/messages', icon: MessageSquare },
        { name: 'Profile', href: '/profile', icon: User },
        { name: 'Settings', href: '/settings', icon: Settings },
      ];
    }

    return [];
  };

  const navItems = getNavItems();

  if (navItems.length === 0) {
    return null;
  }

  return (
    <div className="hidden border-r bg-muted/20 md:block w-64">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b px-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold">CuraLink</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                  pathname === item.href
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground'
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default SideNav;