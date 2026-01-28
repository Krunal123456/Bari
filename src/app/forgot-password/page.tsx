"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            await sendPasswordResetEmail(auth, email);
            setSuccess(true);
            setEmail("");
        } catch (err: any) {
            if (err.code === "auth/user-not-found") {
                setError("No account found with this email address.");
            } else if (err.code === "auth/invalid-email") {
                setError("Please enter a valid email address.");
            } else {
                setError("Failed to send reset email. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-ivory-50 flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-maroon-100"
                >
                    <div className="text-center mb-8">
                        <h1 className="font-serif text-3xl font-bold text-maroon-900">Reset Password</h1>
                        <p className="text-maroon-500 mt-2">Enter your email to receive a reset link</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-200">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm border border-green-200">
                            ✓ Password reset email sent! Check your inbox for instructions.
                        </div>
                    )}

                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-maroon-800 mb-1">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-2 border border-maroon-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none disabled:bg-gray-100"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading || success}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || success}
                            className="w-full py-3 bg-maroon-900 text-ivory-50 rounded-lg font-medium hover:bg-maroon-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Sending..." : success ? "Email Sent!" : "Send Reset Email"}
                        </button>
                    </form>

                    <Link
                        href="/login"
                        className="flex items-center gap-2 text-maroon-600 hover:text-maroon-700 font-medium mt-6 justify-center"
                    >
                        <ArrowLeft size={18} />
                        Back to Login
                    </Link>
                </motion.div>
            </div>
        </main>
    );
}
