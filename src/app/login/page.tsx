"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { motion } from "framer-motion";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/dashboard");
        } catch (err: any) {
            setError("Invalid email or password");
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
                        <h1 className="font-serif text-3xl font-bold text-maroon-900">Welcome Back</h1>
                        <p className="text-maroon-500">Sign in to access the community</p>
                    </div>

                    {error && <p className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</p>}

                    {/* Google Sign In Button */}
                    <div className="mb-6">
                        <GoogleSignInButton redirectPath="/dashboard" />
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-px bg-maroon-200"></div>
                        <span className="text-sm text-maroon-500">or</span>
                        <div className="flex-1 h-px bg-maroon-200"></div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-maroon-800 mb-1">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-2 border border-maroon-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <label className="block text-sm font-medium text-maroon-800">Password</label>
                            <Link href="/forgot-password" className="text-sm text-maroon-600 hover:text-maroon-700 font-medium">
                                Forgot?
                            </Link>
                        </div>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-2 border border-maroon-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-maroon-900 text-ivory-50 rounded-lg font-medium hover:bg-maroon-800 transition-colors disabled:opacity-50"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-maroon-600">
                        Don't have an account? <Link href="/register" className="text-gold-600 font-semibold hover:underline">Register</Link>
                    </p>
                </motion.div>
            </div>
        </main>
    );
}
