"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Eye, EyeOff, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Validation schema
const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    accountType: z.enum(["Creator", "Brand"], {
      message: "Please select an account type",
    }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^a-zA-Z0-9]/, "Password must contain a special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Allow error to be string or array of error objects
  const [error, setError] = useState<
    string | { msg?: string; detail?: string }[] | null
  >(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const password = watch("password", "");

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

    if (strength <= 2) return { strength, label: "Weak", color: "bg-red-500" };
    if (strength <= 3)
      return { strength, label: "Fair", color: "bg-yellow-500" };
    if (strength <= 4) return { strength, label: "Good", color: "bg-blue-500" };
    return { strength, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(password);

  const onSubmit = async (data: SignupFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // POST to FastAPI backend for atomic signup
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.accountType, // Send as 'Creator' or 'Brand' (case-sensitive)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // If errorData is an array (Pydantic validation error), set as array, else as string
        if (Array.isArray(errorData)) {
          setError(errorData);
        } else {
          setError(errorData?.detail || "Signup failed. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      // Success!
      setSuccess(true);
      setIsLoading(false);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      console.error("Signup error:", err);
      setError("Signup failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
  <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 px-4 py-12">
    {/* soft background blobs */}
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-black/10 blur-3xl" />
    </div>

    <div className="relative w-full max-w-md">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 bg-gradient-to-r from-indigo-400 to-blue-200 bg-clip-text text-4xl font-extrabold text-transparent">
          InPactAI
        </h1>
        <p className="text-gray-100">Create your account</p>
      </div>

      {/* Success */}
      {success && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium text-green-800">
              Account created successfully!
            </p>
            <p className="mt-1 text-sm text-green-700">
              Redirecting to login page...
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <XCircle className="mt-0.5 h-5 w-5 text-red-600" />
          <div className="text-sm text-red-800">
            {Array.isArray(error)
              ? error.map((e, i) => (
                  <div key={i}>{e.msg || e.detail || JSON.stringify(e)}</div>
                ))
              : error}
          </div>
        </div>
      )}

      {/* Signup Card */}
      <div
        className="
          relative rounded-2xl p-8
          -translate-y-8
          bg-white/90 backdrop-blur-xl
          border border-white/40 ring-1 ring-white/30
          text-gray-900
          shadow-[0_35px_80px_rgba(0,0,0,0.45)]
          transition-all duration-300 ease-out
          hover:-translate-y-10
          hover:shadow-[0_45px_100px_rgba(0,0,0,0.55)]
        "
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              {...register("name")}
              placeholder="Enter a Name"
              disabled={isLoading || success}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-all duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:scale-[1.01] focus:shadow-md"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter a email"
              {...register("email")}
              disabled={isLoading || success}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-all duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:scale-[1.01] focus:shadow-md"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Account Type */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              I am a…
            </label>
            <select
              {...register("accountType")}
              disabled={isLoading || success}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-all duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:scale-[1.01] focus:shadow-md"
            >
              <option value="">Select account type</option>
              <option value="Creator">Creator</option>
              <option value="Brand">Brand</option>
            </select>
            {errors.accountType && (
              <p className="mt-1 text-sm text-red-600">
                {errors.accountType.message}
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
                placeholder="Enter a Strong Password"
                {...register("password")}
                disabled={isLoading || success}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-gray-900 transition-all duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:scale-[1.01] focus:shadow-md"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Enter  Confirm Password"
                {...register("confirmPassword")}
                disabled={isLoading || success}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-gray-900 transition-all duration-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:scale-[1.01] focus:shadow-md"
              />
              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || success}
            className="
              relative overflow-hidden
              flex w-full items-center justify-center gap-2
              rounded-lg py-3 font-semibold text-white
              bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600
              shadow-lg transition-all duration-300
              hover:from-indigo-500 hover:via-purple-500 hover:to-blue-500
              hover:shadow-xl hover:scale-[1.02]
              disabled:opacity-50
            "
          >
            {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  </div>
);

}
