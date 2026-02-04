"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  FileText,
  Heart,
  Users,
  FileCode,
  Download,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface SidebarLink {
  label: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

const ADMIN_LINKS: SidebarLink[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard size={20} />,
    description: "Overview & Analytics",
  },
  {
    label: "Posts & Notifications",
    href: "/admin/posts",
    icon: <FileText size={20} />,
    description: "Manage announcements",
  },
  {
    label: "Matrimony Approvals",
    href: "/admin/matrimony",
    icon: <Heart size={20} />,
    description: "Review profiles",
  },
  {
    label: "User Directory",
    href: "/admin/directory",
    icon: <Users size={20} />,
    description: "Manage members",
  },
  {
    label: "Samaj Content",
    href: "/admin/content",
    icon: <FileCode size={20} />,
    description: "CMS Management",
  },
  {
    label: "Data Export",
    href: "/admin/export",
    icon: <Download size={20} />,
    description: "Export reports",
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: <Settings size={20} />,
    description: "Admin settings",
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Wait for auth to initialize
  if (loading) {
    return null;
  }

  // Only allow admin users to access admin routes
  if (!user || !isAdmin) {
    router.replace("/login");
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-ivory-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-64 bg-maroon-900 text-white transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo section */}
          <div className="border-b border-maroon-800 p-4">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gold-400 rounded-lg flex items-center justify-center font-bold text-maroon-900">
                B
              </div>
              <div>
                <div className="font-bold text-sm">Bari Samaj</div>
                <div className="text-xs text-maroon-200">Admin Panel</div>
              </div>
            </Link>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-1">
              {ADMIN_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-maroon-800 group"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="text-maroon-200 group-hover:text-gold-400">
                    {link.icon}
                  </span>
                  <div>
                    <div className="text-sm font-medium">{link.label}</div>
                    <div className="text-xs text-maroon-300">{link.description}</div>
                  </div>
                </Link>
              ))}
            </div>
          </nav>

          {/* User section */}
          <div className="border-t border-maroon-800 p-4 space-y-3">
            <div className="bg-maroon-800 rounded-lg p-3">
              <div className="text-xs text-maroon-300">Logged in as</div>
              <div className="font-semibold text-sm truncate">{user?.displayName || "Admin"}</div>
              <div className="text-xs text-maroon-300 truncate">{user?.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-maroon-800 hover:bg-maroon-700 transition-colors text-sm font-medium"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-maroon-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-ivory-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right">
              <div className="text-sm font-semibold text-maroon-900">{user?.displayName}</div>
              <div className="text-xs text-maroon-600">Administrator</div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-maroon-600 to-maroon-800 rounded-full flex items-center justify-center text-white font-bold">
              {user?.displayName?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-ivory-50">
          <div className="max-w-7xl mx-auto p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
