"use client";

import { useState } from "react";
import { signInWithGoogle } from "@/services/googleAuthService";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  redirectPath?: string;
  className?: string;
  variant?: "default" | "outline";
}

export function GoogleSignInButton({
  onSuccess,
  redirectPath = "/dashboard",
  className = "",
  variant = "default",
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const user = await signInWithGoogle();

      if (onSuccess) {
        onSuccess();
      } else {
        // If the signed in user is the designated admin, send to /admin
        if (user && user.email === "krunalkishortote@gmail.com") {
          router.push("/admin");
        } else {
          // Redirect to dashboard by default
          setTimeout(() => {
            router.push(redirectPath);
          }, 500);
        }
      }
    } catch (err: any) {
      console.error("Google sign-in failed:", err);
      setError(err.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  const buttonClass = `w-full px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed
    ${
      variant === "outline"
        ? "border border-maroon-200 text-maroon-700 hover:bg-maroon-50"
        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
    }
    ${className}
  `;

  return (
    <div className="w-full">
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className={buttonClass}
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          <>
            {/* Google Logo SVG */}
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span>Continue with Google</span>
          </>
        )}
      </button>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
