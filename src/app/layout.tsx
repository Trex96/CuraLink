import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import ClientProvidersWrapper from '@/components/providers/ClientProviders';
import TopNav from '@/components/navigation/TopNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CuraLink - Connecting Patients with Medical Research',
  description: 'A platform connecting patients with researchers, clinical trials, and publications',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientProvidersWrapper>
          <TopNav />
          {children}
          <Toaster />
        </ClientProvidersWrapper>
      </body>
    </html>
  );
}
