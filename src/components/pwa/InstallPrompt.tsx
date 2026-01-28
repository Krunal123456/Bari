"use client";

import { useState, useEffect } from "react";
import { X, Download, Bell } from "lucide-react";
import { requestNotificationPermission } from "@/services/notificationService";

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener("beforeinstallprompt", handler);
        setNotificationPermission(Notification.permission);

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            setDeferredPrompt(null);
            // Show notification prompt after app is installed
            setTimeout(() => {
                if (Notification.permission === "default") {
                    setShowNotificationPrompt(true);
                }
            }, 1000);
        }
    };

    const handleEnableNotifications = async () => {
        const token = await requestNotificationPermission();
        if (token) {
            setNotificationPermission("granted");
            setShowNotificationPrompt(false);
        }
    };

    // Show notification prompt first if permission not granted
    if (showNotificationPrompt && Notification.permission === "default") {
        return (
            <div className="fixed bottom-20 left-4 right-4 z-40 md:hidden">
                <div className="bg-blue-600 text-white p-4 rounded-xl shadow-2xl flex items-center justify-between border border-blue-400/30 animate-in slide-in-from-bottom-5">
                    <div className="flex-1 flex items-center gap-3">
                        <Bell size={20} className="flex-shrink-0" />
                        <div>
                            <h3 className="font-bold text-lg">Enable Notifications</h3>
                            <p className="text-sm text-blue-100">
                                Get instant updates about new posts and events.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleEnableNotifications}
                            className="px-4 py-2 bg-white text-blue-600 text-sm font-bold rounded-lg hover:bg-blue-50 transition-colors"
                        >
                            Enable
                        </button>
                        <button
                            onClick={() => setShowNotificationPrompt(false)}
                            className="p-2 text-blue-200 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 z-40 md:hidden">
            <div className="bg-maroon-900 text-ivory-50 p-4 rounded-xl shadow-2xl flex items-center justify-between border border-gold-500/30 animate-in slide-in-from-bottom-5">
                <div className="flex-1">
                    <h3 className="font-bold text-lg text-gold-400">Install App</h3>
                    <p className="text-sm text-maroon-100 text-balance">
                        Get the full experience on your home screen.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleInstallClick}
                        className="px-4 py-2 bg-gold-500 text-maroon-950 text-sm font-bold rounded-lg hover:bg-gold-400 transition-colors flex items-center gap-2"
                    >
                        <Download size={16} /> Install
                    </button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-2 text-maroon-200 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
