"use client";

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const { user, loading, onboardingRequired } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (!loading && user && onboardingRequired) {
      router.push('/onboarding');
    }
  }, [user, loading, onboardingRequired, router]);

  if (!user || loading || onboardingRequired) return null;

  return <>{children}</>;
}