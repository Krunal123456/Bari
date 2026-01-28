"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { CheckCircle2, Mail, Home } from "lucide-react";

export default function RegistrationSuccess() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-ivory-50 flex items-center justify-center px-4 py-12">
            <div className="max-w-md bg-white rounded-xl shadow-xl border border-green-200 p-8 text-center">
                <div className="mb-6 flex justify-center">
                    <div className="p-4 bg-green-100 rounded-full">
                        <CheckCircle2 size={64} className="text-green-600" />
                    </div>
                </div>

                <h1 className="text-3xl font-serif font-bold text-green-900 mb-3">Profile Created!</h1>

                <p className="text-gray-700 mb-6">
                    Your matrimony profile has been submitted successfully. Our team will review it and notify you via email once it's approved.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                    <div className="flex items-start gap-3">
                        <Mail size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-left">
                            <p className="text-sm font-medium text-blue-900">Confirmation Email</p>
                            <p className="text-xs text-blue-700">Check your email ({user?.email}) for updates</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <Link
                        href="/matrimony"
                        className="block w-full py-3 bg-maroon-900 text-white rounded-lg font-bold hover:bg-maroon-800 transition-colors flex items-center justify-center gap-2"
                    >
                        Browse Profiles
                    </Link>
                    <Link
                        href="/dashboard"
                        className="block w-full py-3 bg-gray-200 text-gray-800 rounded-lg font-bold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                    >
                        <Home size={18} />
                        Go to Dashboard
                    </Link>
                </div>

                <p className="text-xs text-gray-500 mt-6">
                    Typically profiles are approved within 24-48 hours
                </p>
            </div>
        </div>
    );
}
