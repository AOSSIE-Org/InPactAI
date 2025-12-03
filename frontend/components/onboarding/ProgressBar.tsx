export interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressBar({
  currentStep,
  totalSteps,
}: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="fixed top-0 right-0 left-0 z-50">
      {/* Progress bar background */}
      <div className="h-1 bg-gray-200">
        <div
          className="h-full bg-linear-to-r from-purple-600 to-blue-600 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step counter */}
      <div className="absolute top-4 right-4 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-lg">
        <span className="text-purple-600">{currentStep}</span> / {totalSteps}
      </div>
    </div>
  );
}

