import { useState } from "react"
import { Link, useNavigate } from 'react-router-dom'
import { Check, Eye, EyeOff, Rocket } from "lucide-react"

export default function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    accountType: "creator"
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAccountTypeChange = (type) => {
    setFormData((prev) => ({ ...prev, accountType: type }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (step === 1) {
      setStep(2)
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // In a real app, you would call your auth API here
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Redirect to dashboard on success
      navigate("/dashboard")
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const passwordStrength = () => {
    const { password } = formData
    if (!password) return { strength: 0, text: "", color: "bg-gray-200 dark:bg-gray-700" }

    let strength = 0
    if (password.length >= 8) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1

    const strengthMap = [
      { text: "Weak", color: "bg-red-500" },
      { text: "Fair", color: "bg-orange-500" },
      { text: "Good", color: "bg-yellow-500" },
      { text: "Strong", color: "bg-green-500" },
    ]

    return {
      strength,
      text: strengthMap[strength - 1]?.text || "",
      color: strengthMap[strength - 1]?.color || "bg-gray-200 dark:bg-gray-700",
    }
  }

  const { strength, text, color } = passwordStrength()

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="flex justify-between items-center p-6">
        <Link href="/" className="flex items-center space-x-2 transition-transform duration-200 hover:scale-105">
          <Rocket className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          <span className="font-bold text-xl text-gray-900 dark:text-white">Inpact</span>
        </Link>
        <div className="flex space-x-4">
          <span className="text-sm text-gray-600 dark:text-gray-300">Already have an account?</span>
          <Link
            to="/login"
            className="text-sm font-medium text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 transition-colors duration-200"
          >
            Sign in
          </Link>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
            <div className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {step === 1 ? "Create your account" : "Complete your profile"}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                {step === 1 ? "Join the AI-powered creator collaboration platform" : "Tell us more about yourself"}
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm animate-[pulse_1s_ease-in-out]">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {step === 1 ? (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                        placeholder="you@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>

                      {formData.password && (
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Password strength: {text}</span>
                            <span className="text-xs text-gray-600 dark:text-gray-400">{strength}/4</span>
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
                                className={`mr-1 ${formData.password.length >= 8 ? "text-green-500" : "text-gray-400"}`}
                              >
                                {formData.password.length >= 8 ? <Check className="h-3 w-3" /> : "○"}
                              </span>
                              At least 8 characters
                            </li>
                            <li className="flex items-center">
                              <span
                                className={`mr-1 ${/[A-Z]/.test(formData.password) ? "text-green-500" : "text-gray-400"}`}
                              >
                                {/[A-Z]/.test(formData.password) ? <Check className="h-3 w-3" /> : "○"}
                              </span>
                              At least 1 uppercase letter
                            </li>
                            <li className="flex items-center">
                              <span
                                className={`mr-1 ${/[0-9]/.test(formData.password) ? "text-green-500" : "text-gray-400"}`}
                              >
                                {/[0-9]/.test(formData.password) ? <Check className="h-3 w-3" /> : "○"}
                              </span>
                              At least 1 number
                            </li>
                            <li className="flex items-center">
                              <span
                                className={`mr-1 ${/[^A-Za-z0-9]/.test(formData.password) ? "text-green-500" : "text-gray-400"}`}
                              >
                                {/[^A-Za-z0-9]/.test(formData.password) ? <Check className="h-3 w-3" /> : "○"}
                              </span>
                              At least 1 special character
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Full Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                        placeholder="Your name"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Type</label>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => handleAccountTypeChange("creator")}
                          className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-all duration-200 ${
                            formData.accountType === "creator"
                              ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                              : "border-gray-300 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-700"
                          }`}
                        >
                          <svg
                            className="h-6 w-6 mb-2"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm font-medium">Creator</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAccountTypeChange("brand")}
                          className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-all duration-200 ${
                            formData.accountType === "brand"
                              ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                              : "border-gray-300 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-700"
                          }`}
                        >
                          <svg
                            className="h-6 w-6 mb-2"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm font-medium">Brand</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAccountTypeChange("agency")}
                          className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-all duration-200 ${
                            formData.accountType === "agency"
                              ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
                              : "border-gray-300 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-700"
                          }`}
                        >
                          <svg
                            className="h-6 w-6 mb-2"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="text-sm font-medium">Agency</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 focus:ring-offset-purple-200 text-white transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg ${
                      isLoading ? "opacity-70 cursor-not-allowed" : ""
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
                        Creating account...
                      </div>
                    ) : step === 1 ? (
                      "Continue"
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </div>

                {step === 1 && (
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                    By creating an account, you agree to our{" "}
                    <Link
                      href="/terms"
                      className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </p>
                )}
              </form>

              {step === 1 && (
                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                    >
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                      </svg>
                      Google
                    </button>
                    <button
                      type="button"
                      className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                    >
                      <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                      </svg>
                      Facebook
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        © 2024 Inpact. All rights reserved.
      </footer>
    </div>
  )
}

