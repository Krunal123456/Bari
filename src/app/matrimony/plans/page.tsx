"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { initiateCheckout, getActiveSubscriptionByUser } from '@/services/subscriptionService';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PlansPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activePlan, setActivePlan] = useState<any>(null);

  useEffect(() => {
    async function fetch() {
      if (!user) return;
      const sub = await getActiveSubscriptionByUser(user.uid);
      setActivePlan(sub);
    }
    fetch();
  }, [user]);

  const handleUpgrade = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setLoading(true);
    try {
      const res = await initiateCheckout(user.uid, 'paid');
      if (res?.url) {
        window.location.href = res.url;
      } else {
        throw new Error('Failed to initiate checkout');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12">
      <h1 className="text-2xl font-serif font-bold mb-6">Membership Plans</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow">
          <h2 className="text-xl font-bold mb-2">Free</h2>
          <p className="text-sm text-maroon-600 mb-4">Limited browsing, basic filters, masked contacts, limited shortlists and interests.</p>

          <ul className="space-y-2 text-sm mb-4">
            <li>Browse limited profiles</li>
            <li>Basic filters (age, gender, location)</li>
            <li>Masked contact details</li>
            <li>Shortlist (limited)</li>
            <li>Limited interests/day</li>
          </ul>

          <button className="px-4 py-2 bg-maroon-900 text-ivory-50 rounded">Register Free</button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow ring-4 ring-gold-100 transform md:scale-105">
          <h2 className="text-xl font-bold mb-2">Paid</h2>
          <p className="text-sm text-maroon-600 mb-4">Unlimited browsing, advanced filters, full profile access, Kundli reports, spotlight, premium badge.</p>

          <ul className="space-y-2 text-sm mb-4">
            <li>Unlimited browsing</li>
            <li>Advanced filters: height, education, profession, income, kundli compatibility</li>
            <li>View full contact details</li>
            <li>Unlimited shortlists & interests</li>
            <li>Full Kundli report + PDF download</li>
            <li>Priority visibility & premium badge</li>
          </ul>

          <button onClick={handleUpgrade} disabled={loading} className="px-4 py-2 bg-gold-500 text-maroon-900 rounded font-semibold">Upgrade to Premium</button>
        </div>
      </div>

      {activePlan && (
        <div className="mt-6 bg-ivory-100 p-4 rounded">
          <strong>Active Plan:</strong> {activePlan.plan} (expires {new Date(activePlan.expiryDate).toLocaleDateString()})
        </div>
      )}
    </div>
  );
}