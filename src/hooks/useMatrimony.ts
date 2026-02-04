"use client";

import { useEffect, useState } from 'react';
import { MatrimonyProfile } from '@/lib/matrimony-types';
import { getUserProfile, searchProfiles } from '@/services/matrimonyService';
import { useAuth } from '@/contexts/AuthContext';

export function useUserMatrimonyProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<MatrimonyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    getUserProfile(user.uid).then((p) => {
      if (mounted) setProfile(p);
    }).catch(console.error).finally(() => mounted && setLoading(false));

    return () => { mounted = false };
  }, [user]);

  return { profile, loading };
}

export function useMatrimonySearch(filters = {}, pageSize = 20) {
  const [results, setResults] = useState<MatrimonyProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);

  async function loadMore() {
    if (!hasMore) return;
    setLoading(true);
    try {
      const res = await searchProfiles(filters, pageSize, lastDoc);
      if (res.length < pageSize) setHasMore(false);
      setResults((r) => [...r, ...res]);
      if (res.length) setLastDoc(res[res.length - 1]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // initial load
    setResults([]);
    setHasMore(true);
    setLastDoc(null);
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  return { results, loading, hasMore, loadMore };
}
