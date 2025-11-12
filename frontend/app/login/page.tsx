"use client";

import { getAuthErrorMessage } from "@/lib/auth-helpers";
import { supabase } from "@/lib/supabaseClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log(data)
      // Step 1: Sign in with Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("Failed to authenticate");
      }

      // Step 2: Fetch user's profile to get their role and onboarding status
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, name, onboarding_completed")
        .eq("id", authData.user.id)
        .single();

      if (profileError) throw profileError;

      if (!profile) {
        throw new Error("User profile not found");
      }

      // Step 3: Redirect based on onboarding status and role
      if (!profile.onboarding_completed) {
        // User hasn't completed onboarding, redirect to onboarding flow
        if (profile.role === "Creator") {
          router.push("/creator/onboarding");
        } else if (profile.role === "Brand") {
          router.push("/brand/onboarding");
        } else {
          throw new Error("Invalid user role");
        }
      } else {
        // User has completed onboarding, redirect to home
        if (profile.role === "Creator") {
          router.push("/creator/home");
        } else if (profile.role === "Brand") {
          router.push("/brand/home");
        } else {
          throw new Error("Invalid user role");
        }
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(getAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-purple-50 via-white to-blue-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-4xl font-bold text-transparent">
            InPactAI
          </h1>
          <p className="text-gray-600">
            Welcome back! Please login to your account
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition outline-none focus:border-transparent focus:ring-2 focus:ring-purple-500 text-gray-800"
                placeholder="you@example.com"
                disabled={isLoading}
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 transition outline-none focus:border-transparent focus:ring-2 focus:ring-purple-500 text-gray-800"
                  placeholder="••••••••"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-purple-600 to-blue-600 py-3 font-medium text-white transition-all hover:from-purple-700 hover:to-blue-700 focus:ring-4 focus:ring-purple-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
              {isLoading ? "Logging in..." : "Log In"}
            </button>
          </form>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-purple-600 hover:text-purple-700"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to InPactAI's Terms of Service and Privacy
            Policy
          </p>
        </div>
      </div>
    </div>
  );
}
