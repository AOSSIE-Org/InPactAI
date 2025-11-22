import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSelect = (role: string) => {
    setSelectedRole(role);
    setError("");
  };

  const handleContinue = () => {
    if (!selectedRole) {
      setError("Please select a role to continue.");
      return;
    }
    if (selectedRole === "brand") {
      navigate("/onboarding/brand");
    } else if (selectedRole === "creator") {
      navigate("/onboarding/creator");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center">Choose your role</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8 text-center">Select whether you want to sign up as a Brand or a Creator. You cannot change this later.</p>
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
        <div className="flex gap-6 justify-center mb-8">
          <button
            className={`flex-1 py-4 rounded-lg border-2 transition-all duration-200 text-lg font-semibold ${selectedRole === "creator" ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"}`}
            onClick={() => handleSelect("creator")}
          >
            Creator
          </button>
          <button
            className={`flex-1 py-4 rounded-lg border-2 transition-all duration-200 text-lg font-semibold ${selectedRole === "brand" ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"}`}
            onClick={() => handleSelect("brand")}
          >
            Brand
          </button>
        </div>
        <button
          className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors duration-200"
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
} 