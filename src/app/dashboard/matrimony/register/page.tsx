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
                    <h3 className="text-lg font-bold text-maroon-800 border-b border-maroon-100 pb-2 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="label">Profile For</label>
                            <select {...register("profileFor", { required: true })} className="input-field">
                                <option value="Self">Self</option>
                                <option value="Son">Son</option>
                                <option value="Daughter">Daughter</option>
                                <option value="Sibling">Sibling</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Full Name Of Candidate</label>
                            <input {...register("fullName", { required: true })} className="input-field" />
                        </div>
                        <div>
                            <label className="label">Date of Birth</label>
                            <input type="date" {...register("dob", { required: true })} className="input-field" />
                        </div>
                        <div>
                            <label className="label">Gender</label>
                            <select {...register("gender", { required: true })} className="input-field">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Height</label>
                            <input placeholder="e.g. 5' 10''" {...register("height", { required: true })} className="input-field" />
                        </div>
                        <div>
                            <label className="label">Marital Status</label>
                            <select {...register("maritalStatus", { required: true })} className="input-field">
                                <option value="Never Married">Never Married</option>
                                <option value="Divorced">Divorced</option>
                                <option value="Widowed">Widowed</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Section 2: Education & Career */}
                <div>
                    <h3 className="text-lg font-bold text-maroon-800 border-b border-maroon-100 pb-2 mb-4">Education & Career</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="label">Highest Qualification</label>
                            <input {...register("education", { required: true })} className="input-field" />
                        </div>
                        <div>
                            <label className="label">Occupation</label>
                            <input {...register("occupation", { required: true })} className="input-field" />
                        </div>
                        <div>
                            <label className="label">Annual Income</label>
                            <input {...register("income")} className="input-field" />
                        </div>
                    </div>
                </div>

                {/* Section 3: Family & Culture */}
                <div>
                    <h3 className="text-lg font-bold text-maroon-800 border-b border-maroon-100 pb-2 mb-4">Family & Culture</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="label">Gotra (if applicable)</label>
                            <input placeholder="Optional" {...register("gotra")} className="input-field" />
                        </div>
                        <div>
                            <label className="label">Religion</label>
                            <input placeholder="e.g. Hindu" {...register("religion")} className="input-field" />
                        </div>
                        <div>
                            <label className="label">Caste</label>
                            <input placeholder="Optional" {...register("caste")} className="input-field" />
                        </div>
                        <div>
                            <label className="label">City / Location</label>
                            <input {...register("location")} className="input-field" />
                        </div>
                    </div>
                </div>

                {/* Section 4: Additional Information */}
                <div>
                    <h3 className="text-lg font-bold text-maroon-800 border-b border-maroon-100 pb-2 mb-4">About You</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="label">About Yourself (Hobbies, Interests, etc.)</label>
                            <textarea
                                placeholder="Tell us about yourself..."
                                rows={4}
                                {...register("about")}
                                className="w-full px-4 py-2 border border-maroon-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none bg-ivory-50"
                            />
                        </div>
                        <div>
                            <label className="label">What are you looking for?</label>
                            <textarea
                                placeholder="Describe your ideal partner..."
                                rows={4}
                                {...register("lookingFor")}
                                className="w-full px-4 py-2 border border-maroon-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none bg-ivory-50"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 5: Contact Information */}
                <div>
                    <h3 className="text-lg font-bold text-maroon-800 border-b border-maroon-100 pb-2 mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="label">Phone Number</label>
                            <input type="tel" {...register("phone", { required: true })} placeholder="+91 XXXXXXXXXX" className="input-field" />
                        </div>
                        <div>
                            <label className="label">Preferred Contact Time</label>
                            <select {...register("preferredContactTime")} className="input-field">
                                <option value="Morning">Morning (9 AM - 12 PM)</option>
                                <option value="Afternoon">Afternoon (12 PM - 5 PM)</option>
                                <option value="Evening">Evening (5 PM - 9 PM)</option>
                                <option value="Night">Night (9 PM - 11 PM)</option>
                                <option value="Any">Any Time</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-maroon-50 border border-maroon-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-maroon-700">
                        <strong>Note:</strong> Your profile will be reviewed by the admin team before being published. You will receive an email notification once it's approved.
                    </p>
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={submitting || success}
                        className="flex-1 py-3 bg-maroon-900 text-ivory-50 rounded-lg font-bold hover:bg-maroon-800 transition-colors shadow-md disabled:opacity-70"
                    >
                        {submitting ? "Submitting..." : success ? "Profile Created!" : "Submit Profile"}
                    </button>
                    <Link
                        href="/matrimony"
                        className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg font-bold hover:bg-gray-300 transition-colors text-center"
                    >
                        Cancel
                    </Link>
                </div>
            </form>

            <style jsx>{`
                .label {
                    @apply block text-sm font-medium text-maroon-700 mb-2;
                }
                .input-field {
                    @apply w-full px-4 py-2.5 border border-maroon-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none bg-ivory-50 text-maroon-900 placeholder-maroon-400;
                }
            `}</style>
            </div>
        </div>
    );
}
