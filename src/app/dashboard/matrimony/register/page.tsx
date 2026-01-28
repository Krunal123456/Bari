"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function MatrimonyRegister() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Redirect if not authenticated
    if (authLoading) {
        return (
            <div className="min-h-screen bg-ivory-50 flex items-center justify-center">
                <p className="text-maroon-600 font-medium">Loading...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-ivory-50 flex flex-col items-center justify-center">
                <div className="text-center">
                    <p className="text-lg text-maroon-600 mb-6">Please log in to create a matrimony profile</p>
                    <Link href="/login" className="inline-block px-6 py-3 bg-maroon-900 text-white rounded-lg font-medium hover:bg-maroon-800 transition-colors">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onSubmit = async (data: any) => {
        setSubmitting(true);
        setError(null);
        try {
            await addDoc(collection(db, "matrimony_profiles"), {
                ...data,
                userId: user.uid,
                userEmail: user.email,
                status: "pending",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            setSuccess(true);
            reset();
            setTimeout(() => {
                router.push("/dashboard/matrimony/success");
            }, 2000);
        } catch (e: any) {
            console.error("Error adding profile: ", e);
            setError(e.message || "Failed to create profile. Please try again.");
        }
        setSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-maroon-50 to-ivory-50 py-12 px-4">
            <div className="max-w-4xl bg-white p-8 rounded-xl shadow-lg border border-gold-200 mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-serif font-bold text-maroon-900 mb-2">Create Matrimony Profile</h1>
                    <p className="text-maroon-600">Enter your details to find your perfect match. Your profile will be reviewed before going live.</p>
                </div>

                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                        <CheckCircle2 size={24} className="text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-green-900">Profile Created Successfully!</h3>
                            <p className="text-green-700 text-sm">Your profile is pending approval. Redirecting...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-red-900">Error</h3>
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Section 1: Basic Details */}
                <div>
                    <h3 className="text-lg font-bold text-maroon-800 border-b-2 border-maroon-300 pb-3 mb-6">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-maroon-700 mb-2">Profile For <span className="text-red-600">*</span></label>
                            <select 
                                {...register("profileFor", { required: true })} 
                                className="w-full px-4 py-3 border-2 border-maroon-300 rounded-lg focus:border-maroon-600 focus:ring-2 focus:ring-maroon-200 outline-none bg-white text-maroon-900 font-medium"
                            >
                                <option value="">Select Profile For...</option>
                                <option value="Self">Self</option>
                                <option value="Son">Son</option>
                                <option value="Daughter">Daughter</option>
                                <option value="Sibling">Sibling</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-maroon-700 mb-2">Full Name Of Candidate <span className="text-red-600">*</span></label>
                            <input 
                                {...register("fullName", { required: true })} 
                                placeholder="Enter full name"
                                className="w-full px-4 py-3 border-2 border-maroon-300 rounded-lg focus:border-maroon-600 focus:ring-2 focus:ring-maroon-200 outline-none bg-white text-maroon-900 placeholder-maroon-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-maroon-700 mb-2">Date of Birth <span className="text-red-600">*</span></label>
                            <input 
                                type="date" 
                                {...register("dob", { required: true })} 
                                className="w-full px-4 py-3 border-2 border-maroon-300 rounded-lg focus:border-maroon-600 focus:ring-2 focus:ring-maroon-200 outline-none bg-white text-maroon-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-maroon-700 mb-2">Gender <span className="text-red-600">*</span></label>
                            <select 
                                {...register("gender", { required: true })} 
                                className="w-full px-4 py-3 border-2 border-maroon-300 rounded-lg focus:border-maroon-600 focus:ring-2 focus:ring-maroon-200 outline-none bg-white text-maroon-900 font-medium"
                            >
                                <option value="">Select Gender...</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-maroon-700 mb-2">Height <span className="text-red-600">*</span></label>
                            <input 
                                placeholder="e.g. 5' 10''"
                                {...register("height", { required: true })} 
                                className="w-full px-4 py-3 border-2 border-maroon-300 rounded-lg focus:border-maroon-600 focus:ring-2 focus:ring-maroon-200 outline-none bg-white text-maroon-900 placeholder-maroon-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-maroon-700 mb-2">Marital Status <span className="text-red-600">*</span></label>
                            <select 
                                {...register("maritalStatus", { required: true })} 
                                className="w-full px-4 py-3 border-2 border-maroon-300 rounded-lg focus:border-maroon-600 focus:ring-2 focus:ring-maroon-200 outline-none bg-white text-maroon-900 font-medium"
                            >
                                <option value="">Select Status...</option>
                                <option value="Never Married">Never Married</option>
                                <option value="Divorced">Divorced</option>
                                <option value="Widowed">Widowed</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Section 2: Education & Career */}
                <div>
                    <h3 className="text-lg font-bold text-maroon-800 border-b-2 border-maroon-300 pb-3 mb-6">Education & Career</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-maroon-700 mb-2">Highest Qualification <span className="text-red-600">*</span></label>
                            <input 
                                placeholder="e.g. Bachelor's Degree"
                                {...register("education", { required: true })} 
                                className="w-full px-4 py-3 border-2 border-maroon-300 rounded-lg focus:border-maroon-600 focus:ring-2 focus:ring-maroon-200 outline-none bg-white text-maroon-900 placeholder-maroon-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-maroon-700 mb-2">Occupation <span className="text-red-600">*</span></label>
                            <input 
                                placeholder="e.g. Software Engineer"
                                {...register("occupation", { required: true })} 
                                className="w-full px-4 py-3 border-2 border-maroon-300 rounded-lg focus:border-maroon-600 focus:ring-2 focus:ring-maroon-200 outline-none bg-white text-maroon-900 placeholder-maroon-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-maroon-700 mb-2">Annual Income</label>
                            <input 
                                placeholder="e.g. 50 Lac - 1 Crore"
                                {...register("income")} 
                                className="w-full px-4 py-3 border-2 border-maroon-300 rounded-lg focus:border-maroon-600 focus:ring-2 focus:ring-maroon-200 outline-none bg-white text-maroon-900 placeholder-maroon-400"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 3: Family & Culture */}
                <div>
                    <h3 className="text-lg font-bold text-maroon-800 border-b-2 border-maroon-300 pb-3 mb-6">Family & Culture</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-maroon-700 mb-2">Gotra (if applicable)</label>
                            <input 
                                placeholder="e.g. Bharadwaj"
                                {...register("gotra")} 
                                className="w-full px-4 py-3 border-2 border-maroon-300 rounded-lg focus:border-maroon-600 focus:ring-2 focus:ring-maroon-200 outline-none bg-white text-maroon-900 placeholder-maroon-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-maroon-700 mb-2">Religion</label>
                            <input 
                                placeholder="e.g. Hindu"
                                {...register("religion")} 
                                className="w-full px-4 py-3 border-2 border-maroon-300 rounded-lg focus:border-maroon-600 focus:ring-2 focus:ring-maroon-200 outline-none bg-white text-maroon-900 placeholder-maroon-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-maroon-700 mb-2">Caste</label>
                            <input 
                                placeholder="Optional"
                                {...register("caste")} 
                                className="w-full px-4 py-3 border-2 border-maroon-300 rounded-lg focus:border-maroon-600 focus:ring-2 focus:ring-maroon-200 outline-none bg-white text-maroon-900 placeholder-maroon-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-maroon-700 mb-2">City / Location <span className="text-red-600">*</span></label>
                            <input 
                                placeholder="e.g. Mumbai, Maharashtra"
                                {...register("location")} 
                                className="w-full px-4 py-3 border-2 border-maroon-300 rounded-lg focus:border-maroon-600 focus:ring-2 focus:ring-maroon-200 outline-none bg-white text-maroon-900 placeholder-maroon-400"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 4: Additional Information */}
                <div>
                    <h3 className="text-lg font-bold text-maroon-800 border-b-2 border-maroon-300 pb-3 mb-6">About You</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-maroon-700 mb-2">About Yourself (Hobbies, Interests, etc.)</label>
                            <textarea
                                placeholder="Tell us about yourself, your hobbies, interests, and lifestyle..."
                                rows={4}
                                {...register("about")}
                                className="w-full px-4 py-3 border-2 border-maroon-300 rounded-lg focus:border-maroon-600 focus:ring-2 focus:ring-maroon-200 outline-none bg-white text-maroon-900 placeholder-maroon-400 font-normal resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-maroon-700 mb-2">What are you looking for?</label>
                            <textarea
                                placeholder="Describe your ideal partner, what qualities you value most..."
                                rows={4}
                                {...register("lookingFor")}
                                className="w-full px-4 py-3 border-2 border-maroon-300 rounded-lg focus:border-maroon-600 focus:ring-2 focus:ring-maroon-200 outline-none bg-white text-maroon-900 placeholder-maroon-400 font-normal resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 5: Contact Information */}
                <div>
                    <h3 className="text-lg font-bold text-maroon-800 border-b-2 border-maroon-300 pb-3 mb-6">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-maroon-700 mb-2">Phone Number <span className="text-red-600">*</span></label>
                            <input 
                                type="tel" 
                                {...register("phone", { required: true })} 
                                placeholder="+91 XXXXXXXXXX"
                                className="w-full px-4 py-3 border-2 border-maroon-300 rounded-lg focus:border-maroon-600 focus:ring-2 focus:ring-maroon-200 outline-none bg-white text-maroon-900 placeholder-maroon-400"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-maroon-700 mb-2">Preferred Contact Time</label>
                            <select 
                                {...register("preferredContactTime")} 
                                className="w-full px-4 py-3 border-2 border-maroon-300 rounded-lg focus:border-maroon-600 focus:ring-2 focus:ring-maroon-200 outline-none bg-white text-maroon-900 font-medium"
                            >
                                <option value="">Select preferred time...</option>
                                <option value="Morning">Morning (9 AM - 12 PM)</option>
                                <option value="Afternoon">Afternoon (12 PM - 5 PM)</option>
                                <option value="Evening">Evening (5 PM - 9 PM)</option>
                                <option value="Night">Night (9 PM - 11 PM)</option>
                                <option value="Any">Any Time</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-maroon-50 border-2 border-maroon-200 rounded-lg p-5 mb-8">
                    <p className="text-sm text-maroon-800 font-medium">
                        <strong className="text-maroon-900">📋 Note:</strong> Your profile will be reviewed by the admin team before being published. You will receive an email notification once it's approved.
                    </p>
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={submitting || success}
                        className="flex-1 py-4 bg-maroon-900 text-ivory-50 rounded-lg font-bold hover:bg-maroon-800 transition-colors shadow-md disabled:opacity-70 text-lg"
                    >
                        {submitting ? "Submitting..." : success ? "Profile Created!" : "Submit Profile"}
                    </button>
                    <Link
                        href="/matrimony"
                        className="flex-1 py-4 bg-gray-300 text-gray-800 rounded-lg font-bold hover:bg-gray-400 transition-colors text-center text-lg"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
            </div>
        </div>
    );
}
