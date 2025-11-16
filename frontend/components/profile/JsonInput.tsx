"use client";

import { useState } from "react";

interface JsonInputProps {
  label: string;
  value: Record<string, any> | null;
  onChange: (value: Record<string, any> | null) => void;
  disabled?: boolean;
}

export default function JsonInput({
  label,
  value,
  onChange,
  disabled = false,
}: JsonInputProps) {
  const [textValue, setTextValue] = useState(
    value ? JSON.stringify(value, null, 2) : ""
  );
  const [error, setError] = useState<string | null>(null);

  const handleBlur = () => {
    if (!textValue.trim()) {
      onChange(null);
      setError(null);
      return;
    }

    try {
      const parsed = JSON.parse(textValue);
      onChange(parsed);
      setError(null);
    } catch (e) {
      setError("Invalid JSON format");
    }
  };

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <textarea
        value={textValue}
        onChange={(e) => setTextValue(e.target.value)}
        onBlur={handleBlur}
        disabled={disabled}
        rows={4}
        className={`w-full rounded-lg border px-3 py-2 font-mono text-sm ${
          error ? "border-red-300 bg-red-50" : "border-gray-300"
        } disabled:bg-gray-50`}
        placeholder='{"key": "value"}'
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

