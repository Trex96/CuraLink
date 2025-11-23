'use client';

import { ReactNode } from 'react';
import TopNav from '@/components/navigation/TopNav';
import SideNav from '@/components/navigation/SideNav';
import MobileNav from '@/components/navigation/MobileNav';
import Footer from '@/components/navigation/Footer';
import { useNavigation } from '@/contexts/NavigationContext';

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const { isSidebarOpen } = useNavigation();

  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <MobileNav />
      <div className="flex flex-1">
        <SideNav />
        <main 
          className={`flex-1 transition-all duration-300 ${
            isSidebarOpen ? 'ml-0 md:ml-0' : 'ml-0'
          }`}
        >
          <div className="container py-6">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;