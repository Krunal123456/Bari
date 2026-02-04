"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
    isAdmin: boolean;
    onboardingRequired: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, logout: async () => {}, isAdmin: false, onboardingRequired: false });

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [onboardingRequired, setOnboardingRequired] = useState(false);

    useEffect(() => {
        let mounted = true;

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!mounted) return;
            setUser(user);

            if (!user) {
                setIsAdmin(false);
                setLoading(false);
                setOnboardingRequired(false);
                return;
            }

            try {
                // Try to read role and onboarding flag from Firestore `users/{uid}` document
                const userRef = doc(db, "users", user.uid);
                const snap = await getDoc(userRef);
                const docData = snap.exists() ? (snap.data() as any) : null;

                const adminEmails = ["krunalkishortote@gmail.com"];
                const hasAdminRole = docData?.role === "admin" || (user.email && adminEmails.includes(user.email));

                setIsAdmin(Boolean(hasAdminRole));

                // Determine if onboarding is required
                const onboardingComplete = !!docData?.onboardingComplete;
                setOnboardingRequired(!onboardingComplete);
            } catch (err) {
                console.error("Error checking admin role:", err);
                // fallback to email-based check if Firestore fails
                const adminEmails = ["krunalkishortote@gmail.com"];
                setIsAdmin(!!(user.email && adminEmails.includes(user.email)));
                setOnboardingRequired(false);
            } finally {
                if (mounted) setLoading(false);
            }
        });

        return () => {
            mounted = false;
            unsubscribe();
        };
    }, []);

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
        } catch (error) {
            console.error("Error logging out:", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, isAdmin, onboardingRequired }}>
            {children}
        </AuthContext.Provider>
    );
}
