import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useNavigate, useParams } from "react-router-dom";
import { Check, Eye, EyeOff, Rocket } from "lucide-react";
import { supabase } from "../utils/supabase";

export default function ResetPasswordPage() {
  const router = useNavigate();
  const searchParams = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Supabase will automatically handle the session if the user comes from the reset link
    // No need to manually extract token
  }, []);

  useEffect(() => {
    if (isSuccess) {
      setProgress(0);
      progressRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            if (progressRef.current) clearInterval(progressRef.current);
            router("/dashboard");
            return 100;
          }
          return prev + (100 / 30); // 3 seconds, 100ms interval
        });
      }, 100);
    }
    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [isSuccess, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Update the user's password using Supabase Auth
      // Supabase automatically authenticates the user from the reset link
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setIsSuccess(true);
      // After success,redirect to dashboard
    } catch (err: any) {
      
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = () => {
    if (!password)
      return { strength: 0, text: "", color: "bg-gray-200 dark:bg-gray-700" };

    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    const strengthMap = [
      { text: "Weak", color: "bg-red-500" },
      { text: "Fair", color: "bg-orange-500" },
      { text: "Good", color: "bg-yellow-500" },
      { text: "Strong", color: "bg-green-500" },
    ];

    return {
      strength,
      text: strengthMap[strength - 1]?.text || "",
      color: strengthMap[strength - 1]?.color || "bg-gray-200 dark:bg-gray-700",
    };
  };

  const { strength, text, color } = passwordStrength();

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="flex justify-between items-center p-6">
          <Link
            to="/"
            className="flex items-center space-x-2 transition-transform duration-200 hover:scale-105"
          >
            <Rocket className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            <span className="font-bold text-xl text-gray-900 dark:text-white">
              Inpact
            </span>
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Password Changed Successfully
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Redirecting you to your application...
              </p>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-purple-600 transition-all duration-100"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        <footer className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
          © 2024 Inpact. All rights reserved.
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="flex justify-between items-center p-6">
        <Link
          to="/"
          className="flex items-center space-x-2 transition-transform duration-200 hover:scale-105"
        >
          <Rocket className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          <span className="font-bold text-xl text-gray-900 dark:text-white">
            Inpact
          </span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
            <div className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm animate-[pulse_1s_ease-in-out]">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {password && (
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          Password strength: {text}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {strength}/4
                        </span>
                      </div>
                      <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${color} transition-all duration-300 ease-in-out`}
                          style={{ width: `${(strength / 4) * 100}%` }}
                        ></div>
                      </div>
                      <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400 mt-2">
                        <li className="flex items-center">
                          <span
                            className={`mr-1 ${
                              password.length >= 8
                                ? "text-green-500"
                                : "text-gray-400"
                            }`}
                          >
                            {password.length >= 8 ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              "○"
                            )}
                          </span>
                          At least 8 characters
                        </li>
                        <li className="flex items-center">
                          <span
                            className={`mr-1 ${
                              /[A-Z]/.test(password)
                                ? "text-green-500"
                                : "text-gray-400"
                            }`}
                          >
                            {/[A-Z]/.test(password) ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              "○"
                            )}
                          </span>
                          At least 1 uppercase letter
                        </li>
                        <li className="flex items-center">
                          <span
                            className={`mr-1 ${
                              /[0-9]/.test(password)
                                ? "text-green-500"
                                : "text-gray-400"
                            }`}
                          >
                            {/[0-9]/.test(password) ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              "○"
                            )}
                          </span>
                          At least 1 number
                        </li>
                        <li className="flex items-center">
                          <span
                            className={`mr-1 ${
                              /[^A-Za-z0-9]/.test(password)
                                ? "text-green-500"
                                : "text-gray-400"
                            }`}
                          >
                            {/[^A-Za-z0-9]/.test(password) ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              "○"
                            )}
                          </span>
                          At least 1 special character
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 ${
                        confirmPassword && password !== confirmPassword
                          ? "border-red-500 dark:border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                      placeholder="••••••••"
                    />
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">
                      Passwords don't match
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    (!!confirmPassword && password !== confirmPassword)
                  }
                  className={`w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 focus:ring-offset-purple-200 text-white transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg ${
                    isLoading ||
                    (!!confirmPassword && password !== confirmPassword)
                      ? "opacity-70 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Resetting password...
                    </div>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <footer className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        © 2024 Inpact. All rights reserved.
      </footer>
    </div>
  );
}
