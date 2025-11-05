"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ReactNode, useEffect } from "react";

export interface TypeformQuestionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onNext: () => void;
  onBack?: () => void;
  canGoNext: boolean;
  isFirstStep?: boolean;
  nextButtonText?: string;
  showBackButton?: boolean;
}

export default function TypeformQuestion({
  title,
  subtitle,
  children,
  onNext,
  onBack,
  canGoNext,
  isFirstStep = false,
  nextButtonText = "Continue",
  showBackButton = true,
}: TypeformQuestionProps) {
  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" && canGoNext && !e.shiftKey) {
        e.preventDefault();
        onNext();
      }
      if (e.key === "Backspace" && !isFirstStep && onBack && showBackButton) {
        // Only trigger if not in an input field
        const target = e.target as HTMLElement;
        if (
          target.tagName !== "INPUT" &&
          target.tagName !== "TEXTAREA" &&
          !target.isContentEditable
        ) {
          e.preventDefault();
          onBack();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [canGoNext, isFirstStep, onNext, onBack, showBackButton]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex min-h-screen items-center justify-center bg-linear-to-br from-purple-50 via-white to-blue-50 px-4 py-20"
    >
      <div className="w-full max-w-2xl">
        {/* Question content */}
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg text-gray-600 md:text-xl">{subtitle}</p>
          )}
        </div>

        {/* Form inputs */}
        <div className="mb-8">{children}</div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-4">
          {/* Back button */}
          {!isFirstStep && showBackButton && onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </button>
          )}

          {/* Spacer for alignment when no back button */}
          {(isFirstStep || !showBackButton) && <div />}

          {/* Continue button */}
          <button
            type="button"
            onClick={onNext}
            disabled={!canGoNext}
            className="flex items-center gap-2 rounded-lg bg-linear-to-r from-purple-600 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-lg"
          >
            {nextButtonText}
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        {/* Keyboard hint */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Press <kbd className="rounded bg-gray-100 px-2 py-1">Enter ↵</kbd> to
          continue
          {!isFirstStep && showBackButton && (
            <>
              {" "}
              or <kbd className="rounded bg-gray-100 px-2 py-1">
                Backspace
              </kbd>{" "}
              to go back
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
