"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { setDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // Create user profile in Firestore
            await setDoc(doc(db, "users", userCredential.user.uid), {
                name,
                email,
                role: "member",
                createdAt: new Date().toISOString()
            });

            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <main className="min-h-screen bg-ivory-50 flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center px-4 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gold-200"
                >
                    <div className="text-center mb-8">
                        <h1 className="font-serif text-3xl font-bold text-maroon-900">Join Community</h1>
                        <p className="text-maroon-500">Create your profile to connect</p>
                    </div>

                    {error && <p className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</p>}

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-maroon-800 mb-1">Full Name</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 border border-maroon-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-maroon-800 mb-1">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-2 border border-maroon-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-maroon-800 mb-1">Password</label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-2 border border-maroon-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 bg-gold-500 text-maroon-900 rounded-lg font-bold hover:bg-gold-400 transition-colors shadow-md"
                        >
                            Create Account
                        </button>
                    </form>

                    <p className="mt-6 text-center text-maroon-600">
                        Already a member? <Link href="/login" className="text-maroon-800 font-semibold hover:underline">Log In</Link>
                    </p>
                </motion.div>
            </div>
        </main>
    );
}
