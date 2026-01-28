"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Check, X, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getMatrimonyProfiles,
  approveMatrimonyProfile,
  rejectMatrimonyProfile,
  requestChanges,
} from "@/services/adminService";
import { MatrimonyProfile } from "@/lib/admin-types";

export default function MatrimonyApprovalsPage() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<MatrimonyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<MatrimonyProfile | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [changeRequests, setChangeRequests] = useState("");
  const [action, setAction] = useState<"approve" | "reject" | "changes" | null>(null);

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const data = await getMatrimonyProfiles({ status: "pending" });
        setProfiles(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profiles");
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
  }, []);

  const handleApprove = async () => {
    if (!selectedProfile || !user) return;
    try {
      await approveMatrimonyProfile(selectedProfile.id, user.uid, user.displayName || "Admin");
      setProfiles(profiles.filter((p) => p.id !== selectedProfile.id));
      setSelectedProfile(null);
      setAction(null);
    } catch (err) {
      alert("Failed to approve profile");
    }
  };

  const handleReject = async () => {
    if (!selectedProfile || !user || !rejectionReason) return;
    try {
      await rejectMatrimonyProfile(
        selectedProfile.id,
        rejectionReason,
        user.uid,
        user.displayName || "Admin"
      );
      setProfiles(profiles.filter((p) => p.id !== selectedProfile.id));
      setSelectedProfile(null);
      setAction(null);
      setRejectionReason("");
    } catch (err) {
      alert("Failed to reject profile");
    }
  };

  const handleRequestChanges = async () => {
    if (!selectedProfile || !user || !changeRequests) return;
    try {
      await requestChanges(
        selectedProfile.id,
        changeRequests,
        user.uid,
        user.displayName || "Admin"
      );
      setProfiles(profiles.filter((p) => p.id !== selectedProfile.id));
      setSelectedProfile(null);
      setAction(null);
      setChangeRequests("");
    } catch (err) {
      alert("Failed to request changes");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-maroon-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-maroon-900">Matrimony Profile Reviews</h1>
        <p className="text-maroon-600 mt-1">
          {profiles.length} profiles pending approval
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-red-900">{error}</p>
        </div>
      )}

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profiles.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-lg border border-maroon-200">
            <p className="text-maroon-600 text-lg">No pending profiles to review!</p>
          </div>
        ) : (
          profiles.map((profile) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedProfile(profile)}
              className="bg-white rounded-lg shadow border border-maroon-200 p-6 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-maroon-900">{profile.fullName}</h3>
                  <p className="text-sm text-maroon-600">
                    {profile.age} • {profile.gender} • {profile.location}
                  </p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                  {profile.status || "Pending"}
                </span>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <p>
                  <span className="font-medium text-maroon-900">Education:</span>
                  <span className="text-maroon-600 ml-2">{profile.education}</span>
                </p>
                <p>
                  <span className="font-medium text-maroon-900">Occupation:</span>
                  <span className="text-maroon-600 ml-2">{profile.occupation}</span>
                </p>
                <p>
                  <span className="font-medium text-maroon-900">Height:</span>
                  <span className="text-maroon-600 ml-2">{profile.height}</span>
                </p>
              </div>

              <p className="text-sm text-maroon-700 line-clamp-2 mb-4">
                {profile.about}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProfile(profile);
                    setAction("approve");
                  }}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors font-medium text-sm"
                >
                  <Check size={16} />
                  Approve
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProfile(profile);
                    setAction("changes");
                  }}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors font-medium text-sm"
                >
                  <MessageSquare size={16} />
                  Request Changes
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProfile(profile);
                    setAction("reject");
                  }}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors font-medium text-sm"
                >
                  <X size={16} />
                  Reject
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Action Modal */}
      {selectedProfile && action && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => {
            setSelectedProfile(null);
            setAction(null);
          }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg max-w-md w-full p-6"
          >
            {action === "approve" && (
              <>
                <h2 className="text-xl font-bold text-maroon-900 mb-4">
                  Approve Profile?
                </h2>
                <p className="text-maroon-600 mb-6">
                  Are you sure you want to approve {selectedProfile.fullName}'s matrimony
                  profile? They will be able to see it on the matrimony page.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedProfile(null);
                      setAction(null);
                    }}
                    className="flex-1 px-4 py-2 border border-maroon-300 text-maroon-900 rounded-lg hover:bg-maroon-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApprove}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                  >
                    Approve
                  </button>
                </div>
              </>
            )}

            {action === "reject" && (
              <>
                <h2 className="text-xl font-bold text-maroon-900 mb-4">
                  Reject Profile
                </h2>
                <p className="text-maroon-600 mb-4">
                  Provide a reason for rejection (visible to user):
                </p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  className="w-full px-3 py-2 border-2 border-maroon-300 rounded-lg focus:border-maroon-600 focus:outline-none mb-4"
                  rows={4}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedProfile(null);
                      setAction(null);
                      setRejectionReason("");
                    }}
                    className="flex-1 px-4 py-2 border border-maroon-300 text-maroon-900 rounded-lg hover:bg-maroon-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={!rejectionReason}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </>
            )}

            {action === "changes" && (
              <>
                <h2 className="text-xl font-bold text-maroon-900 mb-4">
                  Request Changes
                </h2>
                <p className="text-maroon-600 mb-4">
                  Specify what changes are needed (visible to user):
                </p>
                <textarea
                  value={changeRequests}
                  onChange={(e) => setChangeRequests(e.target.value)}
                  placeholder="Enter requested changes..."
                  className="w-full px-3 py-2 border-2 border-maroon-300 rounded-lg focus:border-maroon-600 focus:outline-none mb-4"
                  rows={4}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedProfile(null);
                      setAction(null);
                      setChangeRequests("");
                    }}
                    className="flex-1 px-4 py-2 border border-maroon-300 text-maroon-900 rounded-lg hover:bg-maroon-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestChanges}
                    disabled={!changeRequests}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                  >
                    Send Request
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
