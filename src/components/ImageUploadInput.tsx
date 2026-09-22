import React, { useRef, useState } from "react";
import { Upload, Image as ImageIcon, X, Check, Eye } from "lucide-react";

interface ImageUploadInputProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  className?: string;
  helpText?: string;
  maxDimension?: number;
}

/**
 * Reusable image upload input component.
 * Allows picking any image file directly from the user's device (desktop or mobile),
 * compresses it to an optimized data URL, and previews it cleanly.
 * Also supports manual URL input if needed.
 */
export default function ImageUploadInput({
  label,
  value,
  onChange,
  placeholder = "https://... or upload from your device",
  className = "",
  helpText,
  maxDimension = 1200,
}: ImageUploadInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<"upload" | "url">("upload");

  const compressAndConvert = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          // Return optimized jpeg for photos, png for icons
          const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
          const dataUrl = canvas.toDataURL(mime, 0.85);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error("Failed to load image for processing"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (PNG, JPG, JPEG, WEBP).");
      return;
    }

    try {
      setIsProcessing(true);
      const dataUrl = await compressAndConvert(file);
      onChange(dataUrl);
    } catch (err) {
      console.error("Image processing error:", err);
      alert("Failed to process image file. Please try another image.");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClear = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        {label && (
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            {label}
          </label>
        )}
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
              mode === "upload"
                ? "bg-blue-900 text-white font-bold"
                : "hover:bg-slate-100 text-slate-600"
            }`}
          >
            Upload Device Photo
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
              mode === "url"
                ? "bg-blue-900 text-white font-bold"
                : "hover:bg-slate-100 text-slate-600"
            }`}
          >
            Paste Web URL
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {mode === "upload" ? (
          <div className="flex-1 flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 border-2 border-dashed border-blue-300 hover:border-blue-600 text-blue-900 font-bold text-xs transition-all hover:bg-blue-100/70 cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-4 h-4 text-blue-700 shrink-0" />
              <span>
                {isProcessing
                  ? "Processing Image..."
                  : value
                  ? "Replace Uploaded Photo"
                  : "Click to Choose Image / Photo"}
              </span>
            </button>
          </div>
        ) : (
          <div className="flex-1">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-900 focus:outline-none bg-slate-50/50"
            />
          </div>
        )}

        {/* Preview & Clear Controls */}
        {value && (
          <div className="flex items-center gap-2 shrink-0 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-200 border border-slate-300 shrink-0 relative group">
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <button
              type="button"
              onClick={handleClear}
              title="Remove this image"
              className="p-1 rounded-lg text-slate-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {helpText && <p className="text-[11px] text-slate-500">{helpText}</p>}
    </div>
  );
}
