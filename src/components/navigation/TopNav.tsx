'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import {
  Bell,
  MessageSquare,
  Menu,
  Search,
  User,
  LogOut,
  Settings,
  Home,
  Users,
  BookOpen,
  FlaskConical,
  MessageCircle,
  Heart,
  LayoutDashboard,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useNavigation } from '@/contexts/NavigationContext';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { cn } from '@/lib/utils/utils';

interface UserWithRole {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

const TopNav = () => {
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { toggleSidebar } = useNavigation();
  const user = session?.user as UserWithRole | undefined;
  const { unreadCount } = useUnreadMessages();

  // Navigation items based on user role
  const getNavItems = () => {
    if (!user) {
      return [
        { name: 'Home', href: '/', icon: Home },
      ];
    }

    if (user.role === 'patient') {
      return [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Dashboard', href: '/dashboard/patient', icon: LayoutDashboard },
        { name: 'Network', href: '/dashboard/patient/network', icon: Users },
        { name: 'Trials', href: '/trials', icon: FlaskConical },
        { name: 'Forum', href: '/forum', icon: MessageCircle },
        { name: 'Favorites', href: '/favorites', icon: Heart },
      ];
    }

    if (user.role === 'researcher') {
      return [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Dashboard', href: '/dashboard/researcher', icon: LayoutDashboard },
        { name: 'Network', href: '/dashboard/researcher/network', icon: Users },
        { name: 'Publications', href: '/publications', icon: BookOpen },
        { name: 'Trials', href: '/trials', icon: FlaskConical },
        { name: 'Forum', href: '/forum', icon: MessageCircle },
        { name: 'Collaborations', href: '/collaborations', icon: Users },
        { name: 'Messages', href: '/dashboard/researcher/messages', icon: MessageSquare },
      ];
    }

    return [
      { name: 'Home', href: '/', icon: Home },
      { name: 'Search', href: '/search', icon: Search },
    ];
  };

  const navItems = getNavItems();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 transition-all duration-200">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">

        {/* Mobile Menu & Logo Container */}
        <div className="flex items-center gap-4">
          {/* Mobile menu trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden hover:bg-accent/50">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 border-r-0">
              <div className="flex h-full flex-col bg-background/95 backdrop-blur-xl">
                <SheetHeader className="p-6 border-b text-left">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FlaskConical className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">CuraLink</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex-1 overflow-y-auto py-6 px-4">
                  <div className="space-y-1">
                    {navItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors relative"
                      >
                        <item.icon className="mr-3 h-4 w-4" />
                        {item.name}
                        {item.name === 'Messages' && unreadCount > 0 && (
                          <span className="ml-auto h-5 min-w-[20px] px-1.5 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </nav>
                {user && (
                  <div className="p-4 border-t bg-muted/20">
                    <div className="flex items-center gap-3 mb-4">
                      {user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.image} alt={user.name || 'User'} className="h-10 w-10 rounded-full object-cover border" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20"
                      onClick={() => void signOut({ callbackUrl: '/' })}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <FlaskConical className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:inline-block">CuraLink</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 ml-6">
            {navItems.slice(0, 6).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-3 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-accent/50 hover:text-foreground transition-all"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Mobile Search Trigger */}
          <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground hover:text-foreground">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          {/* Notifications */}
          {user && <NotificationBell />}

          {/* Messages */}
          {user && (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground relative"
              asChild
            >
              <Link href={user.role === 'patient' ? '/dashboard/patient/messages' : '/dashboard/researcher/messages'}>
                <MessageSquare className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full animate-in zoom-in-50">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
                <span className="sr-only">Messages{unreadCount > 0 ? ` (${unreadCount} unread)` : ''}</span>
              </Link>
            </Button>
          )}

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 overflow-hidden border hover:border-primary/50 transition-colors ml-1">
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image}
                      alt={user.name || 'User avatar'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-secondary flex items-center justify-center">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal p-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="p-2 cursor-pointer">
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="p-2 cursor-pointer">
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="p-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50"
                  onClick={() => {
                    void signOut({ callbackUrl: '/' });
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNav;