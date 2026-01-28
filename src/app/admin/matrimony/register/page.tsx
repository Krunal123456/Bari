"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export default function MatrimonyRegister() {
    const { user } = useAuth();
    const router = useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [submitting, setSubmitting] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onSubmit = async (data: any) => {
        if (!user) return;
        setSubmitting(true);
        try {
            await addDoc(collection(db, "matrimony_profiles"), {
                ...data,
                userId: user.uid,
                status: "pending", // Maker-checker flow
                createdAt: new Date().toISOString()
            });
            router.push("/dashboard/matrimony?success=true");
        } catch (e) {
            console.error("Error adding profile: ", e);
        }
        setSubmitting(false);
    };

    return (
        <div className="max-w-3xl bg-white p-8 rounded-xl shadow-lg border border-gold-200 mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-serif font-bold text-maroon-900">Create Matrimony Profile</h1>
                <p className="text-maroon-600">Enter details to find your perfect match</p>
            </div>

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

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-maroon-900 text-ivory-50 rounded-lg font-bold hover:bg-maroon-800 transition-colors shadow-md disabled:opacity-70"
                >
                    {submitting ? "Submitting for Approval..." : "Submit Profile"}
                </button>
            </form>

            <style jsx>{`
        .label {
          @apply block text-sm font-medium text-maroon-700 mb-1;
        }
        .input-field {
          @apply w-full px-4 py-2 border border-maroon-200 rounded-lg focus:ring-2 focus:ring-maroon-500 outline-none bg-ivory-50;
        }
      `}</style>
        </div>
    );
}
