"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { useUpdateProfileMutation } from "@/hooks/use-profile";
import { useAuth } from "@/context/auth-context";
import { User, Camera, Loader2 } from "lucide-react";
import Image from "next/image";
import api from "@/lib/api";

// Helper to convert file to base64
function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export default function ProfileEditPage() {
    const router = useRouter();
    const { user, refreshUser } = useAuth();
    const updateProfile = useUpdateProfileMutation();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [studentClass, setStudentClass] = useState("");
    const [matricNumber, setMatricNumber] = useState("");
    const [phone, setPhone] = useState("");
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Initialize form with user data
    useEffect(() => {
        if (user) {
            setFirstName(user.firstName || "");
            setLastName(user.lastName || "");
            setStudentClass(user.studentClass || "");
            setMatricNumber(user.matricNumber || "");
            setPhone(user.phone || "");
            setProfilePic(user.profilePic || null);
        }
    }, [user]);

    const handleSubmit = async () => {
        if (!firstName.trim() || !lastName.trim()) {
            alert("First name and last name are required");
            return;
        }

        try {
            await updateProfile.mutateAsync({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                studentClass: studentClass.trim(),
                matricNumber: matricNumber.trim(),
                phone: phone.trim(),
                profilePic: profilePic || undefined,
            });
            await refreshUser();
            router.back();
        } catch (error) {
            console.error("Update failed:", error);
            alert("Failed to update profile");
        }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            alert("Please select an image file");
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            alert("Image must be less than 5MB");
            return;
        }

        setIsUploading(true);
        try {
            // Convert to base64
            const base64 = await fileToBase64(file);

            // Upload to Cloudinary via backend
            const response = await api.post("/api/upload/image", {
                image: base64,
                folder: "profiles",
            });

            if (response.data.success && response.data.url) {
                setProfilePic(response.data.url);
            } else {
                throw new Error(response.data.error || "Upload failed");
            }
        } catch (error) {
            console.error("Image upload error:", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Container className="min-h-screen">
            <PageHeader title="Edit Profile" />

            {/* Profile Image Section */}
            <div className="flex flex-col items-center py-6">
                <div className="relative">
                    <div className="w-[100px] h-[100px] rounded-full overflow-hidden bg-[#D9D9D9]">
                        {isUploading ? (
                            <div className="w-full h-full flex items-center justify-center">
                                <Loader2 size={32} className="text-[#2A996B] animate-spin" />
                            </div>
                        ) : profilePic ? (
                            <Image src={profilePic} alt="Profile" width={100} height={100} className="object-cover w-full h-full" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <User size={48} className="text-[#1F382E]" />
                            </div>
                        )}
                    </div>
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#2A996B] rounded-full flex items-center justify-center cursor-pointer border-[3px] border-white">
                        <Camera size={16} className="text-white" />
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                            disabled={isUploading}
                        />
                    </label>
                </div>
                <Text variant="caption" color="gray" className="mt-2">
                    {isUploading ? "Uploading..." : "Tap to change profile photo"}
                </Text>
            </div>

            {/* Form Fields */}
            <div className="flex flex-col gap-5">
                <div>
                    <Text variant="body2" fontWeight="500" className="mb-2">First Name</Text>
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter first name"
                        className="w-full p-3 border border-[#D9D9D9] rounded-xl focus:border-[#2A996B] focus:outline-none"
                    />
                </div>
                <div>
                    <Text variant="body2" fontWeight="500" className="mb-2">Last Name</Text>
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter last name"
                        className="w-full p-3 border border-[#D9D9D9] rounded-xl focus:border-[#2A996B] focus:outline-none"
                    />
                </div>
                <div>
                    <Text variant="body2" fontWeight="500" className="mb-2">Class</Text>
                    <input
                        type="text"
                        value={studentClass}
                        onChange={(e) => setStudentClass(e.target.value)}
                        placeholder="e.g. 300L, 400L"
                        className="w-full p-3 border border-[#D9D9D9] rounded-xl focus:border-[#2A996B] focus:outline-none"
                    />
                </div>
                <div>
                    <Text variant="body2" fontWeight="500" className="mb-2">Matric Number</Text>
                    <input
                        type="text"
                        value={matricNumber}
                        onChange={(e) => setMatricNumber(e.target.value)}
                        placeholder="Enter your matric number"
                        className="w-full p-3 border border-[#D9D9D9] rounded-xl focus:border-[#2A996B] focus:outline-none"
                    />
                </div>
                <div>
                    <Text variant="body2" fontWeight="500" className="mb-2">Phone Number</Text>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter your phone number"
                        className="w-full p-3 border border-[#D9D9D9] rounded-xl focus:border-[#2A996B] focus:outline-none"
                    />
                </div>
            </div>

            <div className="py-6 pb-10">
                <Button
                    variant="secondary"
                    fullWidth
                    onClick={handleSubmit}
                    loading={updateProfile.isPending}
                    disabled={isUploading}
                >
                    Save Changes
                </Button>
            </div>
        </Container>
    );
}
