"use client";

import { Check, Upload, X } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, DragEvent, useRef, useState } from "react";

export interface ImageUploadProps {
  onImageSelect: (file: File | null) => void;
  currentImage?: File | null;
  label: string;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  previewUrl?: string;
}

export default function ImageUpload({
  onImageSelect,
  currentImage,
  label,
  maxSizeMB = 5,
  acceptedFormats = ["image/jpeg", "image/png", "image/jpg", "image/webp"],
  previewUrl,
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(previewUrl || null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!acceptedFormats.includes(file.type)) {
      return `Please upload a valid image format (${acceptedFormats.join(", ")})`;
    }

    // Check file size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      return `Image size must be less than ${maxSizeMB}MB`;
    }

    return null;
  };

  const handleFile = (file: File) => {
    setError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onImageSelect(file);
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onImageSelect(null);
  };

  return (
    <div className="w-full">
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      {!preview ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-12 transition-colors ${
            dragActive
              ? "border-purple-500 bg-purple-50"
              : "border-gray-300 bg-gray-50 hover:border-purple-400 hover:bg-purple-50"
          }`}
        >
          <Upload
            className={`mb-4 h-12 w-12 ${
              dragActive ? "text-purple-500" : "text-gray-400"
            }`}
          />
          <p className="mb-1 text-sm font-medium text-gray-700">
            Drop your image here, or{" "}
            <span className="text-purple-600">browse</span>
          </p>
          <p className="text-xs text-gray-500">
            {acceptedFormats
              .map((f) => f.split("/")[1].toUpperCase())
              .join(", ")}{" "}
            up to {maxSizeMB}MB
          </p>
        </div>
      ) : (
        <div className="relative rounded-lg border-2 border-gray-300 bg-white p-4">
          <div className="relative h-64 w-full overflow-hidden rounded-lg">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-contain"
            />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Check className="h-5 w-5" />
              <span>Image uploaded successfully</span>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <X className="h-4 w-4" />
              Remove
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        onChange={handleChange}
        accept={acceptedFormats.join(",")}
        className="hidden"
      />
    </div>
  );
}
