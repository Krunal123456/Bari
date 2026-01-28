"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, AlertCircle, CheckCircle, Info } from "lucide-react";
import Link from "next/link";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "success" | "error" | "info" | "notification";
  duration?: number;
  postId?: string;
  postTitle?: string;
  imageUrl?: string;
}

interface NotificationToastProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export function NotificationToast({
  notifications,
  onDismiss,
}: NotificationToastProps) {
  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "notification":
        return <Bell className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "notification":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  useEffect(() => {
    notifications.forEach((notif) => {
      if (notif.duration) {
        const timer = setTimeout(() => {
          onDismiss(notif.id);
        }, notif.duration);
        return () => clearTimeout(timer);
      }
    });
  }, [notifications, onDismiss]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className={`rounded-lg border p-4 shadow-lg ${getBackgroundColor(
              notif.type
            )}`}
          >
            <div className="flex gap-3">
              <div className="flex-shrink-0">{getIcon(notif.type)}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {notif.title}
                </h3>
                <p className="text-sm text-gray-700 mt-1">
                  {notif.message}
                </p>
                {notif.postId && (
                  <Link
                    href={`/matrimony/${notif.postId}`}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block"
                  >
                    View Post →
                  </Link>
                )}
              </div>
              <button
                onClick={() => onDismiss(notif.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
