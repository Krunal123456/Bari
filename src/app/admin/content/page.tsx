"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Edit, Save, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getCMSContent, updateCMSContent } from "@/services/adminService";
import { CMSContent } from "@/lib/admin-types";

export default function CMSPage() {
  const { user } = useAuth();
  const [content, setContent] = useState<CMSContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await getCMSContent();
        setContent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load content");
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  const handleEdit = (item: CMSContent) => {
    setEditingId(item.id);
    setEditText(item.content);
  };

  const handleSave = async (id: string) => {
    if (!user) return;
    try {
      await updateCMSContent(
        id,
        { content: editText },
        user.uid,
        user.displayName || "Admin"
      );
      setContent(
        content.map((c) =>
          c.id === id ? { ...c, content: editText } : c
        )
      );
      setEditingId(null);
    } catch (err) {
      alert("Failed to save content");
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
        <h1 className="text-3xl font-bold text-maroon-900">Samaj Content Management</h1>
        <p className="text-maroon-600 mt-1">Manage community website content</p>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-red-900">{error}</p>
        </div>
      )}

      {/* Content Sections */}
      <div className="space-y-4">
        {content.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-lg border border-maroon-200">
            <p className="text-maroon-600 text-lg">No content sections found</p>
          </div>
        ) : (
          content.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow border border-maroon-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-maroon-900">{item.title}</h3>
                  <div className="flex gap-2 mt-2 text-xs">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {item.type}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">
                      v{item.version}
                    </span>
                    <span className="text-maroon-600">
                      Updated {new Date(item.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {editingId === item.id ? (
                    <>
                      <button
                        onClick={() => handleSave(item.id)}
                        className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                      >
                        <Save size={16} />
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex items-center gap-1 px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg transition-colors font-medium"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex items-center gap-1 px-3 py-2 bg-maroon-600 hover:bg-maroon-700 text-white rounded-lg transition-colors font-medium"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                  )}
                </div>
              </div>

              {editingId === item.id ? (
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-maroon-300 rounded-lg focus:border-maroon-600 focus:outline-none font-mono text-sm"
                  rows={8}
                />
              ) : (
                <div className="bg-ivory-50 rounded p-4 text-maroon-700 whitespace-pre-wrap font-mono text-sm max-h-96 overflow-y-auto">
                  {item.content}
                </div>
              )}

              {item.updatedByName && (
                <p className="text-xs text-maroon-500 mt-4">
                  Last edited by {item.updatedByName}
                </p>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
