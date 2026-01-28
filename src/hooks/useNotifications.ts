import { useEffect, useCallback, useState } from "react";
import { listenForMessages, requestNotificationPermission } from "@/services/notificationService";
import { Notification } from "@/components/notifications/NotificationToast";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Request permission on mount
  useEffect(() => {
    const setupNotifications = async () => {
      const token = await requestNotificationPermission();
      if (!token) {
        console.log("Notifications not enabled for this user");
      }
    };

    setupNotifications();
  }, []);

  // Listen for incoming messages
  useEffect(() => {
    const unsubscribe = listenForMessages((payload: any) => {
      const notificationData = payload.notification || {};
      const newNotif: Notification = {
        id: Date.now().toString(),
        title: notificationData.title || "New Notification",
        message: notificationData.body || "You have a new message",
        type: "notification",
        duration: 5000,
        postId: payload.data?.postId,
        postTitle: notificationData.title,
      };

      setNotifications((prev) => [...prev, newNotif]);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [...prev, notification]);
  }, []);

  return {
    notifications,
    dismissNotification,
    addNotification,
  };
}
