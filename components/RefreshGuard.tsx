'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function RefreshGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const entries = performance.getEntriesByType('navigation');
    if (entries.length > 0) {
      const nav = entries[0] as PerformanceNavigationTiming;
      if (nav.type === 'reload' && pathname !== '/') {
        router.replace('/');
      }
    }
  }, []);

  return null;
}
