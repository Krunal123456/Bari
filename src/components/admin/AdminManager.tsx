"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

type UserRecord = {
  uid: string;
  name?: string;
  email?: string;
  role?: string;
};

export function AdminManager() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    fetchUsers();
  }, [isAdmin]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, "users"));
      const snap = await getDocs(q);
      const list: UserRecord[] = snap.docs.map(d => ({ uid: d.id, ...(d.data() as any) }));
      setUsers(list);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const promote = async (u: UserRecord) => {
    setError(null);
    try {
      const ref = doc(db, "users", u.uid);
      await updateDoc(ref, { role: "admin", updatedAt: new Date() });
      setUsers(prev => prev.map(x => (x.uid === u.uid ? { ...x, role: "admin" } : x)));
    } catch (err) {
      console.error("Promote error:", err);
      setError("Failed to promote user");
    }
  };

  const demote = async (u: UserRecord) => {
    setError(null);
    try {
      const ref = doc(db, "users", u.uid);
      await updateDoc(ref, { role: "member", updatedAt: new Date() });
      setUsers(prev => prev.map(x => (x.uid === u.uid ? { ...x, role: "member" } : x)));
    } catch (err) {
      console.error("Demote error:", err);
      setError("Failed to demote user");
    }
  };

  const filtered = users.filter(u => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (u.email || "").toLowerCase().includes(s) || (u.name || "").toLowerCase().includes(s);
  });

  if (!isAdmin) return null;

  return (
    <div className="bg-white rounded-lg shadow border border-maroon-200 p-6">
      <h3 className="text-lg font-bold text-maroon-900 mb-4">Manage Admins</h3>

      <div className="mb-4">
        <input
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-maroon-200 rounded"
        />
      </div>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <div className="space-y-2 max-h-64 overflow-auto">
        {loading && <div className="text-maroon-600">Loading users…</div>}
        {!loading && filtered.length === 0 && <div className="text-maroon-600">No users found.</div>}
        {!loading && filtered.map(u => (
          <div key={u.uid} className="flex items-center justify-between gap-4 p-2 border rounded">
            <div>
              <div className="font-medium text-maroon-900">{u.name || "—"}</div>
              <div className="text-sm text-maroon-600">{u.email}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-maroon-600">Role: <span className="font-semibold text-maroon-900">{u.role || 'member'}</span></div>
              {u.role === "admin" ? (
                <button onClick={() => demote(u)} className="px-3 py-1 bg-red-100 text-red-700 rounded">Demote</button>
              ) : (
                <button onClick={() => promote(u)} className="px-3 py-1 bg-gold-100 text-maroon-900 rounded">Promote</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
