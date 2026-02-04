"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { setOnboardingComplete } from '@/services/userService';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const finishOnboarding = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setOnboardingComplete(user.uid);
      // Redirect to matrimony profile creation by default
      router.push('/matrimony/create');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-20">
      <div className="max-w-2xl bg-white rounded-2xl p-8 shadow">
        <h1 className="text-2xl font-bold mb-4">Welcome — Quick Onboarding</h1>
        <p className="mb-6 text-sm text-maroon-600">Complete a few quick steps to unlock Matrimony and other personalized features.</p>

        <div className="space-y-4">
          <div className={`p-4 border rounded ${step === 1 ? 'border-gold-300' : 'border-maroon-100'}`}>
            <h3 className="font-semibold">1. Basic Info</h3>
            <p className="text-sm text-maroon-500">Name, gender, birth date — minimal info to personalize the experience.</p>
          </div>

          <div className={`p-4 border rounded ${step === 2 ? 'border-gold-300' : 'border-maroon-100'}`}>
            <h3 className="font-semibold">2. Preferences</h3>
            <p className="text-sm text-maroon-500">Tell us what you're looking for (age range, location).</p>
          </div>

          <div className={`p-4 border rounded ${step === 3 ? 'border-gold-300' : 'border-maroon-100'}`}>
            <h3 className="font-semibold">3. Add Photo</h3>
            <p className="text-sm text-maroon-500">Add a profile photo to increase responses.</p>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-maroon-500">Step {step} of 3</div>
          <div className="flex items-center gap-3">
            {step < 3 && (
              <button onClick={() => setStep(s => s+1)} className="px-3 py-2 bg-maroon-900 text-ivory-50 rounded">Next</button>
            )}
            {step === 3 ? (
              <button onClick={finishOnboarding} disabled={saving} className="px-4 py-2 bg-gold-500 text-maroon-900 rounded font-semibold">Finish & Create Profile</button>
            ) : (
              <button onClick={finishOnboarding} disabled={saving} className="px-4 py-2 bg-ivory-100 text-maroon-700 rounded">Skip & Continue</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}