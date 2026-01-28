"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Check, Trash2, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getDirectoryEntries,
  approveDirectoryEntry,
  deleteDirectoryEntry,
} from "@/services/adminService";
import { DirectoryEntry } from "@/lib/admin-types";

export default function DirectoryPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DirectoryEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<DirectoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterApproved, setFilterApproved] = useState<boolean | null>(null);

  useEffect(() => {
    const loadEntries = async () => {
      try {
        const data = await getDirectoryEntries();
        setEntries(data);
        setFilteredEntries(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load directory");
      } finally {
        setLoading(false);
      }
    };

    loadEntries();
  }, []);

  // Filter entries based on search and approval status
  useEffect(() => {
    let result = entries;

    if (searchTerm) {
      result = result.filter(
        (entry) =>
          entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.profession?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterApproved !== null) {
      result = result.filter((entry) => entry.isApproved === filterApproved);
    }

    setFilteredEntries(result);
  }, [searchTerm, filterApproved, entries]);

  const handleApprove = async (id: string) => {
    if (!user) return;
    try {
      await approveDirectoryEntry(id, user.uid, user.displayName || "Admin");
      setEntries(
        entries.map((e) =>
          e.id === id ? { ...e, isApproved: true } : e
        )
      );
    } catch (err) {
      alert("Failed to approve entry");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?") || !user) return;
    try {
      await deleteDirectoryEntry(id, user.uid, user.displayName || "Admin");
      setEntries(entries.filter((e) => e.id !== id));
    } catch (err) {
      alert("Failed to delete entry");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-maroon-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-maroon-900">Community Directory</h1>
        <p className="text-maroon-600 mt-1">
          {filteredEntries.length} of {entries.length} members
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-red-900">{error}</p>
        </div>
      )}

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-maroon-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, profession, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-maroon-200 rounded-lg focus:border-maroon-600 focus:outline-none"
          />
        </div>
        <button
          onClick={() => setFilterApproved(filterApproved === true ? null : true)}
          className={`px-4 py-2 rounded-lg transition-colors font-medium ${
            filterApproved === true
              ? "bg-green-600 text-white"
              : "bg-white border-2 border-maroon-200 text-maroon-900 hover:bg-maroon-50"
          }`}
        >
          Approved Only
        </button>
        <button
          onClick={() => setFilterApproved(filterApproved === false ? null : false)}
          className={`px-4 py-2 rounded-lg transition-colors font-medium ${
            filterApproved === false
              ? "bg-yellow-600 text-white"
              : "bg-white border-2 border-maroon-200 text-maroon-900 hover:bg-maroon-50"
          }`}
        >
          Pending Approval
        </button>
      </div>

      {/* Directory Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-lg shadow border border-maroon-200 overflow-hidden"
      >
        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-maroon-600 text-lg">No directory entries found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-maroon-50 border-b border-maroon-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-maroon-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-maroon-900">Profession</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-maroon-900">Location</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-maroon-900">Contact</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-maroon-900">Status</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-maroon-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-maroon-100">
                {filteredEntries.map((entry) => (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-ivory-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-maroon-900">{entry.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-maroon-600">
                      {entry.profession || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-maroon-600">
                      {entry.location || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-maroon-600">
                      {entry.phone ? (
                        <a
                          href={`tel:${entry.phone}`}
                          className="text-blue-600 hover:underline"
                        >
                          {entry.phone}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                          entry.isApproved
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {entry.isApproved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {!entry.isApproved && (
                          <button
                            onClick={() => handleApprove(entry.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Approve"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
