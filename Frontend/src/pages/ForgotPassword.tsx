import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, Rocket } from "lucide-react";
import { supabase } from "../utils/supabase";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [showSignupPrompt, setShowSignupPrompt] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setShowSignupPrompt(false);

        try {
            // Check if the email exists in the users table before sending a reset link
            const { data: users, error: userError } = await supabase
                .from("users")
                .select("id")
                .eq("email", email)
                .maybeSingle();
            if (userError) throw userError;
            if (!users) {
                // If the email does not exist, prompt the user to sign up
                setShowSignupPrompt(true);
                setIsLoading(false);
                return;
            }
            // Send the password reset email using Supabase Auth
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + "/reset-password"
            });
            if (error) throw error;
            setIsSubmitted(true);
        } catch (err: any) {

            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-indigo-50 dark:bg-nightP">
            <div className="flex justify-between items-center p-6 dark:bg-nightP">
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

            <div className="flex-1 flex items-center justify-center p-6 dark:bg-nightP">
                <div className="w-full max-w-md">
                    <div className="bg-white dark:bg-nightS rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
                        <div className="p-8">
                            <Link
                                to="/login"
                                className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 mb-6 transition-colors duration-200"
                            >
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Back to login
                            </Link>

                            {isSubmitted ? (
                                <div className="text-center py-8">
                                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                                        <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        Check your email
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                                        We've sent a password reset link to{" "}
                                        <span className="font-medium">{email}</span>
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Didn't receive the email? Check your spam folder or{" "}
                                        <button
                                            onClick={() => setIsSubmitted(false)}
                                            className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 transition-colors duration-200"
                                        >
                                            try another email address
                                        </button>
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                        Reset your password
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-300 mb-8">
                                        Enter your email address and we'll send you a link to reset
                                        your password
                                    </p>

                                    {error && (
                                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm animate-[pulse_1s_ease-in-out]">
                                            {error}
                                        </div>
                                    )}

                                    {showSignupPrompt && (
                                        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-700 dark:text-yellow-400 text-sm animate-[pulse_1s_ease-in-out]">
                                            No account found with this email. <Link to="/signup" className="underline text-purple-600">Sign up?</Link>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <label
                                                htmlFor="email"
                                                className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                Email address
                                            </label>
                                            <input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                                                // Email is case sensitive for password reset
                                                placeholder="you@example.com (CASE sensitive)"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className={`w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 focus:ring-offset-purple-200 text-white transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg ${isLoading ? "opacity-70 cursor-not-allowed" : ""
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
                                                    Sending reset link...
                                                </div>
                                            ) : (
                                                "Send reset link"
                                            )}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <footer className="py-6 text-center text-sm text-gray-500 dark:text-nightTS dark:bg-nightP">
                © 2024 Inpact. All rights reserved.
            </footer>
        </div>
    );
}
