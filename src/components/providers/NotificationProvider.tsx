"use client";

import { useNotifications } from "@/hooks/useNotifications";
import { NotificationToast } from "@/components/notifications/NotificationToast";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { notifications, dismissNotification } = useNotifications();

  return (
    <>
      {children}
      <NotificationToast
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </>
  );
}
