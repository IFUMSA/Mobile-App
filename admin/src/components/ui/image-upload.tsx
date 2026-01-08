"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    folder?: string;
    className?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export function ImageUpload({
    value,
    onChange,
    folder = "products",
    className = "",
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            // Validate file type
            if (!file.type.startsWith("image/")) {
                setError("Please select an image file");
                return;
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setError("Image must be less than 5MB");
                return;
            }

            setError("");
            setIsUploading(true);

            try {
                // Convert to base64
                const base64 = await fileToBase64(file);

                // Upload to backend
                const res = await fetch(`${API_URL}/api/upload/image`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ image: base64, folder }),
                });

                const data = await res.json();

                if (!res.ok || !data.success) {
                    throw new Error(data.error || "Upload failed");
                }

                onChange(data.url);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Upload failed");
            } finally {
                setIsUploading(false);
                // Reset input
                if (inputRef.current) {
                    inputRef.current.value = "";
                }
            }
        },
        [folder, onChange]
    );

    const handleRemove = useCallback(() => {
        onChange("");
    }, [onChange]);

    return (
        <div className={`space-y-2 ${className}`}>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            {value ? (
                <div className="relative inline-block">
                    <div className="relative w-40 h-40 rounded-lg overflow-hidden border border-zinc-200">
                        <Image
                            src={value}
                            alt="Preview"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <div
                    onClick={() => inputRef.current?.click()}
                    className="w-40 h-40 border-2 border-dashed border-zinc-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-zinc-400 transition-colors"
                >
                    {isUploading ? (
                        <Loader2 className="h-8 w-8 text-zinc-400 animate-spin" />
                    ) : (
                        <>
                            <Upload className="h-8 w-8 text-zinc-400 mb-2" />
                            <span className="text-sm text-zinc-500">Click to upload</span>
                        </>
                    )}
                </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}

// Helper to convert file to base64 data URL
function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
