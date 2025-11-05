"use client";

import { Check } from "lucide-react";

export interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  label?: string;
  placeholder?: string;
  minSelection?: number;
  maxSelection?: number;
}

export default function MultiSelect({
  options,
  selected,
  onChange,
  label,
  placeholder = "Select options",
  minSelection,
  maxSelection,
}: MultiSelectProps) {
  const handleToggle = (option: string) => {
    if (selected.includes(option)) {
      // Remove option
      onChange(selected.filter((item) => item !== option));
    } else {
      // Add option (if not at max)
      if (!maxSelection || selected.length < maxSelection) {
        onChange([...selected, option]);
      }
    }
  };

  const isSelected = (option: string) => selected.includes(option);
  const isDisabled = (option: string) =>
    !!(maxSelection && selected.length >= maxSelection && !isSelected(option));

  return (
    <div className="w-full">
      {label && (
        <label className="mb-3 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {placeholder && selected.length === 0 && (
        <p className="mb-3 text-sm text-gray-500">{placeholder}</p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const disabled = isDisabled(option);
          const checked = isSelected(option);

          return (
            <button
              key={option}
              type="button"
              onClick={() => !disabled && handleToggle(option)}
              disabled={disabled}
              className={`flex items-center justify-between rounded-lg border-2 px-4 py-3 text-left text-sm font-medium transition-all ${
                checked
                  ? "border-purple-500 bg-purple-50 text-purple-900"
                  : disabled
                    ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                    : "border-gray-300 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-50"
              }`}
            >
              <span>{option}</span>
              {checked && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selection info */}
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>
          {selected.length} selected
          {minSelection && ` (minimum ${minSelection})`}
          {maxSelection && ` (maximum ${maxSelection})`}
        </span>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="font-medium text-purple-600 hover:text-purple-700"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
