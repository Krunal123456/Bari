"use client";

import { useState } from 'react';
import RequireOnboarding from '@/components/matrimony/RequireOnboarding';
import { useAuth } from '@/contexts/AuthContext';
import { createDraftProfile, updateProfile, uploadPhoto, submitProfileForApproval, getUserProfile } from '@/services/matrimonyService';
import { useRouter } from 'next/navigation';

export default function CreateMatrimonyProfile() {
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<any>({
    profileFor: 'self',
    fullName: '',
    gender: 'male',
    dob: '',
    tob: '',
    pob: '',
    height: '',
    complexion: '',
    education: '',
    occupation: '',
    income: '',
    familyDetails: '',
    about: '',
    photos: [],
  });

  const [saving, setSaving] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  async function handleNext() {
    if (!user) return;
    setSaving(true);
    try {
      // If no draft exists, create draft
      if (!profileId) {
        const created = await createDraftProfile({ userId: user.uid, ...form });
        setProfileId(created.id as string);
      } else {
        await updateProfile(profileId, form);
      }
      setStep(s => Math.min(4, s+1));
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit() {
    if (!profileId) return;
    setSaving(true);
    try {
      await submitProfileForApproval(profileId);
      // Redirect to matrimony page after submission
      router.push('/matrimony');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoUpload(e: any) {
    if (!user || !profileId) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    try {
      const url = await uploadPhoto(user.uid, profileId, file);
      setForm((f: any) => ({ ...f, photos: [...(f.photos || []), url] }));
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <RequireOnboarding>
      <div className="py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow">
          <h1 className="text-2xl font-bold mb-4">Create Matrimony Profile</h1>

          <div className="mb-6">
            <div className="flex gap-2">
              <div className={`px-3 py-2 rounded ${step === 1 ? 'bg-gold-500 text-maroon-900' : 'bg-ivory-100'}`}>Personal</div>
              <div className={`px-3 py-2 rounded ${step === 2 ? 'bg-gold-500 text-maroon-900' : 'bg-ivory-100'}`}>Physical</div>
              <div className={`px-3 py-2 rounded ${step === 3 ? 'bg-gold-500 text-maroon-900' : 'bg-ivory-100'}`}>Education</div>
              <div className={`px-3 py-2 rounded ${step === 4 ? 'bg-gold-500 text-maroon-900' : 'bg-ivory-100'}`}>Photos</div>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-semibold">Full name</span>
                <input value={form.fullName} onChange={(e) => setForm((f:any) => ({...f, fullName: e.target.value}))} className="mt-1 w-full border rounded px-3 py-2" />
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-semibold">Gender</span>
                  <select value={form.gender} onChange={(e) => setForm((f:any) => ({...f, gender: e.target.value}))} className="mt-1 w-full border rounded px-3 py-2">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-semibold">Date of Birth</span>
                  <input type="date" value={form.dob} onChange={(e) => setForm((f:any) => ({...f, dob: e.target.value}))} className="mt-1 w-full border rounded px-3 py-2" />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label>
                  <span className="text-sm font-semibold">Time of Birth (optional)</span>
                  <input type="time" value={form.tob} onChange={(e) => setForm((f:any) => ({...f, tob: e.target.value}))} className="mt-1 w-full border rounded px-3 py-2" />
                </label>

                <label>
                  <span className="text-sm font-semibold">Place of Birth</span>
                  <input value={form.pob} onChange={(e) => setForm((f:any) => ({...f, pob: e.target.value}))} className="mt-1 w-full border rounded px-3 py-2" />
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button onClick={handleNext} disabled={saving} className="px-4 py-2 bg-maroon-900 text-ivory-50 rounded">Save & Continue</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label>
                  <span className="text-sm font-semibold">Height</span>
                  <input value={form.height} onChange={(e) => setForm((f:any) => ({...f, height: e.target.value}))} className="mt-1 w-full border rounded px-3 py-2" />
                </label>

                <label>
                  <span className="text-sm font-semibold">Complexion (optional)</span>
                  <input value={form.complexion} onChange={(e) => setForm((f:any) => ({...f, complexion: e.target.value}))} className="mt-1 w-full border rounded px-3 py-2" />
                </label>
              </div>

              <div className="flex justify-between mt-4">
                <button onClick={() => setStep(1)} className="px-4 py-2 bg-ivory-100 rounded">Back</button>
                <button onClick={handleNext} disabled={saving} className="px-4 py-2 bg-maroon-900 text-ivory-50 rounded">Save & Continue</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <label>
                <span className="text-sm font-semibold">Education</span>
                <input value={form.education} onChange={(e) => setForm((f:any) => ({...f, education: e.target.value}))} className="mt-1 w-full border rounded px-3 py-2" />
              </label>

              <label>
                <span className="text-sm font-semibold">Occupation</span>
                <input value={form.occupation} onChange={(e) => setForm((f:any) => ({...f, occupation: e.target.value}))} className="mt-1 w-full border rounded px-3 py-2" />
              </label>

              <label>
                <span className="text-sm font-semibold">Income (optional)</span>
                <input value={form.income} onChange={(e) => setForm((f:any) => ({...f, income: e.target.value}))} className="mt-1 w-full border rounded px-3 py-2" />
              </label>

              <div className="flex justify-between mt-4">
                <button onClick={() => setStep(2)} className="px-4 py-2 bg-ivory-100 rounded">Back</button>
                <button onClick={handleNext} disabled={saving} className="px-4 py-2 bg-maroon-900 text-ivory-50 rounded">Save & Continue</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-semibold">Photos</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="mt-2" />
              </label>

              <div className="flex gap-2 flex-wrap">
                {form.photos?.map((p: string, i: number) => (
                  <img key={i} src={p} className="w-24 h-24 object-cover rounded" alt="photo" />
                ))}
              </div>

              <div className="flex justify-between mt-4">
                <button onClick={() => setStep(3)} className="px-4 py-2 bg-ivory-100 rounded">Back</button>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="px-4 py-2 bg-ivory-100 rounded">Save Draft</button>
                  <button onClick={handleSubmit} disabled={saving} className="px-4 py-2 bg-gold-500 text-maroon-900 rounded">Submit for Approval</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </RequireOnboarding>
  );
}
