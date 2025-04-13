import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function Onboarding() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-200 flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to Inpact</h1>
        <p className="mt-2 text-gray-600">
          Let's get you started with your profile setup
        </p>

        <div className="mt-6 space-y-4">
          {/* Influencer Button */}
          <button
            onClick={() => navigate("/signup")}
            className="w-full flex items-center justify-between bg-purple-600 text-white font-medium px-6 py-3 rounded-lg shadow-md hover:bg-purple-700 transition"
          >
            I'm an Influencer
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Brand Button */}
          <button
            onClick={() => navigate("/signup")}
            className="w-full flex items-center justify-between bg-purple-600 text-white font-medium px-6 py-3 rounded-lg shadow-md hover:bg-purple-700 transition"
          >
            I'm a Brand
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
