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
  <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 px-4">

    {/* Soft background blobs */}
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-black/10 blur-3xl" />
    </div>

    {/* Login Card */}
    
      <div
  className="
    relative w-full max-w-md
    -translate-y-8
    rounded-2xl p-8

    bg-white/90 backdrop-blur-xl
    border border-white/40 ring-1 ring-white/30

    shadow-[0_35px_80px_rgba(0,0,0,0.45)]
    transition-all duration-300 ease-out

    hover:-translate-y-10
    hover:shadow-[0_45px_100px_rgba(0,0,0,0.55)]
  "
>
 
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-4xl font-extrabold text-transparent">
          InPactAI
        </h1>
        <p className="text-gray-600">
          Welcome back! Please login to your account
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <XCircle className="mt-0.5 h-5 w-5 text-red-600" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Email */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            type="email"
            placeholder="Enter a email"
            {...register("email")}
            disabled={isLoading}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter a Password"
              {...register("password")}
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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

        {/* Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="
  relative overflow-hidden
  flex w-full items-center justify-center gap-2
  rounded-lg py-3 font-semibold text-white

  bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600
  shadow-lg transition-all duration-300

  hover:from-indigo-500 hover:via-purple-500 hover:to-blue-500
  hover:shadow-xl hover:scale-[1.02]

  disabled:opacity-70
"
        >
          {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
          {isLoading ? "Logging in..." : "Log In"}
        </button>
      </form>

      {/* Footer */}
      <p className="mt-6 text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-indigo-600 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  </div>
);


}