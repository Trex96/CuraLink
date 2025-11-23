'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the researcher network page
    router.replace('/dashboard/researcher/network');
  }, [router]);

  // Render nothing while redirecting
  return null;
}