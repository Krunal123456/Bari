"use client";

import { motion } from "framer-motion";
import { Shield, Bell, Database, Lock, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-maroon-900">Admin Settings</h1>
        <p className="text-maroon-600 mt-1">Manage your admin account and preferences</p>
      </div>

      {/* Account Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow border border-maroon-200 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-maroon-600 to-maroon-800 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {user?.displayName?.charAt(0).toUpperCase() || "A"}
          </div>
          <div>
            <h3 className="text-lg font-bold text-maroon-900">{user?.displayName}</h3>
            <p className="text-sm text-maroon-600">{user?.email}</p>
            <p className="text-xs text-maroon-500 mt-1">Administrator Account</p>
          </div>
        </div>

        <div className="border-t border-maroon-200 pt-6">
          <h4 className="font-bold text-maroon-900 mb-4">Account Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-maroon-600">Full Name</p>
              <p className="font-medium text-maroon-900">{user?.displayName || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-maroon-600">Email Address</p>
              <p className="font-medium text-maroon-900">{user?.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-maroon-600">User ID</p>
              <p className="font-medium text-maroon-900 font-mono text-sm">{user?.uid || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-maroon-600">Role</p>
              <p className="font-medium text-maroon-900">Administrator</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </motion.div>

      {/* Admin Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow border border-maroon-200 p-6"
      >
        <h3 className="text-lg font-bold text-maroon-900 mb-6">Admin Capabilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              icon: <Shield size={20} />,
              title: "Full Access",
              description: "Complete access to all admin features",
            },
            {
              icon: <Database size={20} />,
              title: "Data Management",
              description: "Create, edit, and delete community data",
            },
            {
              icon: <Bell size={20} />,
              title: "Notifications",
              description: "Send announcements and notifications",
            },
            {
              icon: <Lock size={20} />,
              title: "Approval Workflow",
              description: "Review and approve user submissions",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="p-4 bg-ivory-50 rounded-lg border border-maroon-200 flex gap-3"
            >
              <div className="text-maroon-600 flex-shrink-0">{feature.icon}</div>
              <div>
                <p className="font-medium text-maroon-900">{feature.title}</p>
                <p className="text-sm text-maroon-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow border border-maroon-200 p-6"
      >
        <h3 className="text-lg font-bold text-maroon-900 mb-6">Security</h3>
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200 flex items-start gap-3">
            <Shield className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-medium text-green-900">Secure Authentication</p>
              <p className="text-sm text-green-700">
                Your account is protected with Firebase Authentication
              </p>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-start gap-3">
            <Lock className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-medium text-blue-900">Role-Based Access</p>
              <p className="text-sm text-blue-700">
                Admin access is restricted to verified administrators only
              </p>
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 flex items-start gap-3">
            <Database className="text-purple-600 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-medium text-purple-900">Audit Logging</p>
              <p className="text-sm text-purple-700">
                All admin actions are logged for security and compliance
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-maroon-50 to-gold-50 rounded-lg border border-maroon-200 p-6"
      >
        <h3 className="text-lg font-bold text-maroon-900 mb-4">Need Help?</h3>
        <p className="text-maroon-700 mb-4">
          For admin support, documentation, or to report issues, please contact the development
          team.
        </p>
        <button className="flex items-center gap-2 px-4 py-2 bg-maroon-600 hover:bg-maroon-700 text-white rounded-lg transition-colors font-medium">
          Contact Support
        </button>
      </motion.div>
    </div>
  );
}
