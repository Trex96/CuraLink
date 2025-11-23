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
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigation } from '@/contexts/NavigationContext';
import { useSession } from 'next-auth/react';

interface UserWithRole {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

const MobileNav = () => {
  const pathname = usePathname();
  const { isSidebarOpen, closeSidebar } = useNavigation();
  const { data: session } = useSession();
  const user = session?.user as UserWithRole | undefined;

  // Navigation items based on user role
  const getNavItems = () => {
    if (!user) {
      return [
        { name: 'Home', href: '/', icon: LayoutDashboard },
        { name: 'Search', href: '/search', icon: Search },
      ];
    }

    if (user.role === 'patient') {
      return [
        { name: 'Home', href: '/', icon: LayoutDashboard },
        { name: 'Dashboard', href: '/dashboard/patient', icon: LayoutDashboard },
        { name: 'Search', href: '/search', icon: Search },
        { name: 'Trials', href: '/trials', icon: FlaskConical },
        { name: 'Forum', href: '/forum', icon: MessageCircle },
        { name: 'Favorites', href: '/favorites', icon: Heart },
      ];
    }

    if (user.role === 'researcher') {
      return [
        { name: 'Home', href: '/', icon: LayoutDashboard },
        { name: 'Dashboard', href: '/dashboard/researcher', icon: LayoutDashboard },
        { name: 'Search', href: '/search', icon: Search },
        { name: 'Publications', href: '/publications', icon: BookOpen },
        { name: 'Trials', href: '/trials', icon: FlaskConical },
        { name: 'Forum', href: '/forum', icon: MessageCircle },
        { name: 'Collaborations', href: '/collaborations', icon: Users2 },
        { name: 'Messages', href: '/messages', icon: MessageSquare },
      ];
    }

    return [
      { name: 'Home', href: '/', icon: LayoutDashboard },
      { name: 'Search', href: '/search', icon: Search },
    ];
  };

  const navItems = getNavItems();

  return (
    <div
      className={`fixed inset-0 z-50 bg-background md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">CuraLink</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={closeSidebar}>
            <X className="h-6 w-6" />
            <span className="sr-only">Close menu</span>
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeSidebar}
                className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${pathname === item.href
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
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

export default MobileNav;