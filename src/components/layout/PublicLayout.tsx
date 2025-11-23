'use client';

import { ReactNode } from 'react';
import TopNav from '@/components/navigation/TopNav';
import MobileNav from '@/components/navigation/MobileNav';
import Footer from '@/components/navigation/Footer';
import { useNavigation } from '@/contexts/NavigationContext';

const PublicLayout = ({ children }: { children: ReactNode }) => {
  const { isSidebarOpen } = useNavigation();

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <MobileNav />
      <main 
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? 'ml-0' : 'ml-0'
        }`}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;