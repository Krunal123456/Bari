"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, TrendingUp, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardStats, getActivityLogs } from "@/services/adminService";
import { DashboardStats, ActivityLog } from "@/lib/admin-types";

const statCards = [
  {
    key: "totalUsers",
    label: "Total Members",
    color: "from-blue-500 to-blue-600",
    icon: "👥",
  },
  {
    key: "approvedMatrimonyProfiles",
    label: "Matrimony Profiles",
    color: "from-red-500 to-red-600",
    icon: "💑",
  },
  {
    key: "pendingApprovals",
    label: "Pending Reviews",
    color: "from-orange-500 to-orange-600",
    icon: "⏳",
  },
  {
    key: "activePosts",
    label: "Active Posts",
    color: "from-green-500 to-green-600",
    icon: "📰",
  },
  {
    key: "directoryEntries",
    label: "Directory Entries",
    color: "from-purple-500 to-purple-600",
    icon: "📋",
  },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dashboardStats, activityLogs] = await Promise.all([
          getDashboardStats(),
          getActivityLogs(10),
        ]);
        setStats(dashboardStats);
        setActivities(activityLogs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-maroon-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold text-maroon-900">
          Welcome back, {user?.displayName?.split(" ")[0]}!
        </h1>
        <p className="text-maroon-600">
          Here's your community dashboard overview
        </p>
      </motion.div>

      {/* Error state */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex gap-3"
        >
          <AlertCircle className="text-red-500 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900">Error loading dashboard</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, index) => {
          const value = stats?.[card.key as keyof DashboardStats] || 0;
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br ${card.color} text-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{card.icon}</span>
                <TrendingUp size={16} className="opacity-70" />
              </div>
              <div className="text-3xl font-bold">{value}</div>
              <div className="text-sm opacity-90">{card.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow p-6 border border-maroon-200"
        >
          <h2 className="text-lg font-bold text-maroon-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <a
              href="/admin/posts"
              className="block p-3 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg transition-colors font-medium"
            >
              Create New Post
            </a>
            <a
              href="/admin/matrimony"
              className="block p-3 bg-red-50 hover:bg-red-100 text-red-900 rounded-lg transition-colors font-medium"
            >
              Review Matrimony Profiles
            </a>
            <a
              href="/admin/directory"
              className="block p-3 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-lg transition-colors font-medium"
            >
              Manage Directory
            </a>
            <a
              href="/admin/export"
              className="block p-3 bg-green-50 hover:bg-green-100 text-green-900 rounded-lg transition-colors font-medium"
            >
              Export Data
            </a>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow p-6 border border-maroon-200"
        >
          <h2 className="text-lg font-bold text-maroon-900 mb-4">Recent Activity</h2>
          {activities.length === 0 ? (
            <p className="text-maroon-600 text-center py-4">No recent activities</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-l-2 border-maroon-300 pl-3 py-2"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-maroon-900">
                        {activity.adminName}
                      </p>
                      <p className="text-xs text-maroon-600 capitalize">
                        {activity.action.replace(/_/g, " ")}
                      </p>
                    </div>
                    <span className="text-xs text-maroon-500">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Statistics Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-maroon-50 to-gold-50 rounded-lg p-6 border border-maroon-200"
      >
        <h2 className="text-lg font-bold text-maroon-900 mb-4">Community Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-3xl font-bold text-maroon-900">
              {stats?.totalUsers || 0}
            </p>
            <p className="text-sm text-maroon-600">Total Community Members</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-red-600">
              {stats?.pendingApprovals || 0}
            </p>
            <p className="text-sm text-red-600">Pending Approvals</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-600">
              {stats?.activePosts || 0}
            </p>
            <p className="text-sm text-green-600">Active Announcements</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
