"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import ArrayInput from "@/components/profile/ArrayInput";
import CollapsibleSection from "@/components/profile/CollapsibleSection";
import JsonInput from "@/components/profile/JsonInput";
import ProfileButton from "@/components/profile/ProfileButton";
import SlidingMenu from "@/components/SlidingMenu";
import {
  aiFillCreatorProfile,
  CreatorProfile,
  getCreatorProfile,
  updateCreatorProfile,
} from "@/lib/api/profile";
import { signOut } from "@/lib/auth-helpers";
import {
  ArrowLeft,
  Edit2,
  Loader2,
  LogOut,
  Save,
  Sparkles,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CreatorProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<CreatorProfile>>({});
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [showAiModal, setShowAiModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getCreatorProfile();
      setProfile(data);
      setFormData(data);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await updateCreatorProfile(formData);
      setProfile(updated);
      setFormData(updated);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData(profile);
      setIsEditing(false);
    }
  };

  const handleAiFill = async () => {
    if (!aiInput.trim()) {
      alert("Please provide some information about yourself");
      return;
    }

    try {
      setAiLoading(true);
      const result = await aiFillCreatorProfile(aiInput);

      if (!result.data || Object.keys(result.data).length === 0) {
        alert(
          result.message ||
            "No new data could be extracted from your input. Please provide more specific information."
        );
        return;
      }

      // Merge AI-generated data into form, handling all data types properly
      setFormData((prev) => {
        const updated = { ...prev };
        for (const [key, value] of Object.entries(result.data)) {
          // Properly handle arrays, objects, and primitives
          if (Array.isArray(value)) {
            updated[key] = value;
          } else if (typeof value === "object" && value !== null) {
            updated[key] = value;
          } else {
            updated[key] = value;
          }
        }
        return updated;
      });

      setAiInput("");
      setShowAiModal(false);

      // Auto-enable edit mode if not already
      if (!isEditing) {
        setIsEditing(true);
      }

      // Show success message
      const fieldCount = Object.keys(result.data).length;
      alert(
        `Success! ${fieldCount} field${fieldCount !== 1 ? "s" : ""} ${fieldCount !== 1 ? "were" : "was"} filled. Please review and save your changes.`
      );
    } catch (error: any) {
      console.error("Error with AI fill:", error);
      const errorMessage =
        error?.message || "Failed to generate profile data. Please try again.";
      alert(errorMessage);
    } finally {
      setAiLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateArrayField = (field: string, values: string[]) => {
    setFormData((prev) => ({ ...prev, [field]: values }));
  };

  if (loading) {
    return (
      <AuthGuard requiredRole="Creator">
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </AuthGuard>
    );
  }

  if (!profile) {
    return (
      <AuthGuard requiredRole="Creator">
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-gray-600">Failed to load profile</p>
        </div>
      </AuthGuard>
    );
  }

  const completionPercentage = profile.profile_completion_percentage || 0;

  return (
    <AuthGuard requiredRole="Creator">
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <SlidingMenu role="creator" />
        {/* Header */}
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-600" />
              <h1 className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-2xl font-bold text-transparent">
                InPactAI
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <ProfileButton role="Creator" />
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => router.push("/creator/home")}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>

          {/* Profile Header */}
          <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">
                Creator Profile
              </h2>
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => setShowAiModal(true)}
                      className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:shadow-lg"
                    >
                      <Sparkles className="h-4 w-4" />
                      AI Fill
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Completion Bar */}
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Profile Completion
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {completionPercentage}%
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="space-y-4">
            {/* Basic Information */}
            <CollapsibleSection title="Basic Information" defaultOpen={true}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    value={formData.display_name || ""}
                    onChange={(e) =>
                      updateField("display_name", e.target.value)
                    }
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Primary Niche *
                  </label>
                  <input
                    type="text"
                    value={formData.primary_niche || ""}
                    onChange={(e) =>
                      updateField("primary_niche", e.target.value)
                    }
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={formData.tagline || ""}
                    onChange={(e) => updateField("tagline", e.target.value)}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={formData.website_url || ""}
                    onChange={(e) => updateField("website_url", e.target.value)}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio || ""}
                    onChange={(e) => updateField("bio", e.target.value)}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Profile Picture URL
                  </label>
                  <input
                    type="url"
                    value={formData.profile_picture_url || ""}
                    onChange={(e) =>
                      updateField("profile_picture_url", e.target.value)
                    }
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.cover_image_url || ""}
                    onChange={(e) =>
                      updateField("cover_image_url", e.target.value)
                    }
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div className="md:col-span-2">
                  <ArrayInput
                    label="Secondary Niches"
                    values={formData.secondary_niches || []}
                    onChange={(values) =>
                      updateArrayField("secondary_niches", values)
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="md:col-span-2">
                  <ArrayInput
                    label="Content Types"
                    values={formData.content_types || []}
                    onChange={(values) =>
                      updateArrayField("content_types", values)
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="md:col-span-2">
                  <ArrayInput
                    label="Content Language"
                    values={formData.content_language || []}
                    onChange={(values) =>
                      updateArrayField("content_language", values)
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* Social Media */}
            <CollapsibleSection title="Social Media">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Instagram Handle
                  </label>
                  <input
                    type="text"
                    value={formData.instagram_handle || ""}
                    onChange={(e) =>
                      updateField("instagram_handle", e.target.value)
                    }
                    disabled={!isEditing}
                    placeholder="@username"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    value={formData.instagram_url || ""}
                    onChange={(e) =>
                      updateField("instagram_url", e.target.value)
                    }
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Instagram Followers
                  </label>
                  <input
                    type="number"
                    value={formData.instagram_followers || ""}
                    onChange={(e) => {
                      const raw = e.target.value;
                      updateField(
                        "instagram_followers",
                        raw === "" ? undefined : parseInt(raw, 10)
                      );
                    }}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    YouTube Handle
                  </label>
                  <input
                    type="text"
                    value={formData.youtube_handle || ""}
                    onChange={(e) =>
                      updateField("youtube_handle", e.target.value)
                    }
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    YouTube URL
                  </label>
                  <input
                    type="url"
                    value={formData.youtube_url || ""}
                    onChange={(e) => updateField("youtube_url", e.target.value)}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    YouTube Subscribers
                  </label>
                  <input
                    type="number"
                    value={formData.youtube_subscribers || ""}
                    onChange={(e) => {
                      const raw = e.target.value;
                      updateField(
                        "youtube_subscribers",
                        raw === "" ? undefined : parseInt(raw, 10)
                      );
                    }}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    TikTok Handle
                  </label>
                  <input
                    type="text"
                    value={formData.tiktok_handle || ""}
                    onChange={(e) =>
                      updateField("tiktok_handle", e.target.value)
                    }
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    TikTok URL
                  </label>
                  <input
                    type="url"
                    value={formData.tiktok_url || ""}
                    onChange={(e) => updateField("tiktok_url", e.target.value)}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    TikTok Followers
                  </label>
                  <input
                    type="number"
                    value={formData.tiktok_followers || ""}
                    onChange={(e) => {
                      const raw = e.target.value;
                      updateField(
                        "tiktok_followers",
                        raw === "" ? undefined : parseInt(raw, 10)
                      );
                    }}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Twitter Handle
                  </label>
                  <input
                    type="text"
                    value={formData.twitter_handle || ""}
                    onChange={(e) =>
                      updateField("twitter_handle", e.target.value)
                    }
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Twitter URL
                  </label>
                  <input
                    type="url"
                    value={formData.twitter_url || ""}
                    onChange={(e) => updateField("twitter_url", e.target.value)}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Twitter Followers
                  </label>
                  <input
                    type="number"
                    value={formData.twitter_followers || ""}
                    onChange={(e) => {
                      const raw = e.target.value;
                      updateField(
                        "twitter_followers",
                        raw === "" ? undefined : parseInt(raw, 10)
                      );
                    }}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Twitch Handle
                  </label>
                  <input
                    type="text"
                    value={formData.twitch_handle || ""}
                    onChange={(e) =>
                      updateField("twitch_handle", e.target.value)
                    }
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Twitch URL
                  </label>
                  <input
                    type="url"
                    value={formData.twitch_url || ""}
                    onChange={(e) => updateField("twitch_url", e.target.value)}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Twitch Followers
                  </label>
                  <input
                    type="number"
                    value={formData.twitch_followers || ""}
                    onChange={(e) => {
                      const raw = e.target.value;
                      updateField(
                        "twitch_followers",
                        raw === "" ? undefined : parseInt(raw, 10)
                      );
                    }}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin_url || ""}
                    onChange={(e) =>
                      updateField("linkedin_url", e.target.value)
                    }
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Facebook URL
                  </label>
                  <input
                    type="url"
                    value={formData.facebook_url || ""}
                    onChange={(e) =>
                      updateField("facebook_url", e.target.value)
                    }
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Total Followers
                  </label>
                  <input
                    type="number"
                    value={formData.total_followers || ""}
                    onChange={(e) => {
                      const raw = e.target.value;
                      updateField(
                        "total_followers",
                        raw === "" ? undefined : parseInt(raw, 10)
                      );
                    }}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div className="md:col-span-2">
                  <JsonInput
                    label="Social Platforms (JSON)"
                    value={formData.social_platforms || null}
                    onChange={(value) => updateField("social_platforms", value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* Audience & Analytics */}
            <CollapsibleSection title="Audience & Analytics">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Total Reach
                  </label>
                  <input
                    type="number"
                    value={formData.total_reach || ""}
                    onChange={(e) => {
                      const raw = e.target.value;
                      updateField(
                        "total_reach",
                        raw === "" ? undefined : parseInt(raw, 10)
                      );
                    }}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Average Views
                  </label>
                  <input
                    type="number"
                    value={formData.average_views || ""}
                    onChange={(e) => {
                      const raw = e.target.value;
                      updateField(
                        "average_views",
                        raw === "" ? undefined : parseInt(raw, 10)
                      );
                    }}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Engagement Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.engagement_rate || ""}
                    onChange={(e) => {
                      const raw = e.target.value;
                      updateField(
                        "engagement_rate",
                        raw === "" ? undefined : parseFloat(raw)
                      );
                    }}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Average Engagement per Post
                  </label>
                  <input
                    type="number"
                    value={formData.average_engagement_per_post || ""}
                    onChange={(e) => {
                      const raw = e.target.value;
                      updateField(
                        "average_engagement_per_post",
                        raw === "" ? undefined : parseInt(raw, 10)
                      );
                    }}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Primary Audience Age
                  </label>
                  <input
                    type="text"
                    value={formData.audience_age_primary || ""}
                    onChange={(e) =>
                      updateField("audience_age_primary", e.target.value)
                    }
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <ArrayInput
                    label="Secondary Audience Age"
                    values={formData.audience_age_secondary || []}
                    onChange={(values) =>
                      updateArrayField("audience_age_secondary", values)
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="md:col-span-2">
                  <JsonInput
                    label="Audience Gender Split (JSON)"
                    value={formData.audience_gender_split || null}
                    onChange={(value) =>
                      updateField("audience_gender_split", value)
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="md:col-span-2">
                  <JsonInput
                    label="Audience Locations (JSON)"
                    value={formData.audience_locations || null}
                    onChange={(value) =>
                      updateField("audience_locations", value)
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="md:col-span-2">
                  <ArrayInput
                    label="Audience Interests"
                    values={formData.audience_interests || []}
                    onChange={(values) =>
                      updateArrayField("audience_interests", values)
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Best Performing Content Type
                  </label>
                  <input
                    type="text"
                    value={formData.best_performing_content_type || ""}
                    onChange={(e) =>
                      updateField(
                        "best_performing_content_type",
                        e.target.value
                      )
                    }
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div className="md:col-span-2">
                  <JsonInput
                    label="Peak Posting Times (JSON)"
                    value={formData.peak_posting_times || null}
                    onChange={(value) =>
                      updateField("peak_posting_times", value)
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* Content & Rates */}
            <CollapsibleSection title="Content & Rates">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    value={formData.years_of_experience || ""}
                    onChange={(e) =>
                      updateField(
                        "years_of_experience",
                        parseInt(e.target.value) || undefined
                      )
                    }
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Posting Frequency
                  </label>
                  <input
                    type="text"
                    value={formData.posting_frequency || ""}
                    onChange={(e) =>
                      updateField("posting_frequency", e.target.value)
                    }
                    disabled={!isEditing}
                    placeholder="e.g., Daily, 3x/week"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Rate per Post
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.rate_per_post || ""}
                    onChange={(e) =>
                      updateField(
                        "rate_per_post",
                        parseFloat(e.target.value) || undefined
                      )
                    }
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Rate per Video
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.rate_per_video || ""}
                    onChange={(e) =>
                      updateField(
                        "rate_per_video",
                        parseFloat(e.target.value) || undefined
                      )
                    }
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Rate per Story
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.rate_per_story || ""}
                    onChange={(e) =>
                      updateField(
                        "rate_per_story",
                        parseFloat(e.target.value) || undefined
                      )
                    }
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Rate per Reel
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.rate_per_reel || ""}
                    onChange={(e) =>
                      updateField(
                        "rate_per_reel",
                        parseFloat(e.target.value) || undefined
                      )
                    }
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.rate_negotiable || false}
                      onChange={(e) =>
                        updateField("rate_negotiable", e.target.checked)
                      }
                      disabled={!isEditing}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Rate Negotiable
                    </label>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Minimum Deal Value
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.minimum_deal_value || ""}
                    onChange={(e) =>
                      updateField(
                        "minimum_deal_value",
                        parseFloat(e.target.value) || undefined
                      )
                    }
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Preferred Payment Terms
                  </label>
                  <input
                    type="text"
                    value={formData.preferred_payment_terms || ""}
                    onChange={(e) =>
                      updateField("preferred_payment_terms", e.target.value)
                    }
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.accepts_product_only_deals || false}
                      onChange={(e) =>
                        updateField(
                          "accepts_product_only_deals",
                          e.target.checked
                        )
                      }
                      disabled={!isEditing}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Accepts Product-Only Deals
                    </label>
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Professional Details */}
            <CollapsibleSection title="Professional Details">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.content_creation_full_time || false}
                      onChange={(e) =>
                        updateField(
                          "content_creation_full_time",
                          e.target.checked
                        )
                      }
                      disabled={!isEditing}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Content Creation Full-Time
                    </label>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Team Size
                  </label>
                  <input
                    type="number"
                    value={formData.team_size || ""}
                    onChange={(e) =>
                      updateField("team_size", parseInt(e.target.value) || 1)
                    }
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Equipment Quality
                  </label>
                  <input
                    type="text"
                    value={formData.equipment_quality || ""}
                    onChange={(e) =>
                      updateField("equipment_quality", e.target.value)
                    }
                    disabled={!isEditing}
                    placeholder="e.g., Professional, Semi-Professional"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div className="md:col-span-2">
                  <ArrayInput
                    label="Editing Software"
                    values={formData.editing_software || []}
                    onChange={(values) =>
                      updateArrayField("editing_software", values)
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="md:col-span-2">
                  <ArrayInput
                    label="Collaboration Types"
                    values={formData.collaboration_types || []}
                    onChange={(values) =>
                      updateArrayField("collaboration_types", values)
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="md:col-span-2">
                  <ArrayInput
                    label="Preferred Brands Style"
                    values={formData.preferred_brands_style || []}
                    onChange={(values) =>
                      updateArrayField("preferred_brands_style", values)
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="md:col-span-2">
                  <ArrayInput
                    label="Not Interested In"
                    values={formData.not_interested_in || []}
                    onChange={(values) =>
                      updateArrayField("not_interested_in", values)
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* Portfolio & Links */}
            <CollapsibleSection title="Portfolio & Links">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <ArrayInput
                    label="Portfolio Links"
                    values={formData.portfolio_links || []}
                    onChange={(values) =>
                      updateArrayField("portfolio_links", values)
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <ArrayInput
                    label="Past Brand Collaborations"
                    values={formData.past_brand_collaborations || []}
                    onChange={(values) =>
                      updateArrayField("past_brand_collaborations", values)
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <ArrayInput
                    label="Case Study Links"
                    values={formData.case_study_links || []}
                    onChange={(values) =>
                      updateArrayField("case_study_links", values)
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Media Kit URL
                  </label>
                  <input
                    type="url"
                    value={formData.media_kit_url || ""}
                    onChange={(e) =>
                      updateField("media_kit_url", e.target.value)
                    }
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* Additional Settings */}
            <CollapsibleSection title="Additional Settings">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <ArrayInput
                    label="Search Keywords"
                    values={formData.search_keywords || []}
                    onChange={(values) =>
                      updateArrayField("search_keywords", values)
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Matching Score Base
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.matching_score_base || ""}
                    onChange={(e) =>
                      updateField(
                        "matching_score_base",
                        parseFloat(e.target.value) || undefined
                      )
                    }
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    AI Profile Summary
                  </label>
                  <textarea
                    value={formData.ai_profile_summary || ""}
                    onChange={(e) =>
                      updateField("ai_profile_summary", e.target.value)
                    }
                    disabled={!isEditing}
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
              </div>
            </CollapsibleSection>
          </div>
        </main>

        {/* AI Fill Modal */}
        {showAiModal && (
          <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
            <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                AI Profile Filling
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                Provide information about yourself, and AI will help fill in
                your profile fields automatically.
              </p>
              <textarea
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="e.g., I'm a lifestyle content creator with 5 years of experience. I focus on sustainable living and wellness. I post 3 times a week on Instagram and have 50k followers..."
                rows={6}
                className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setShowAiModal(false);
                    setAiInput("");
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAiFill}
                  disabled={aiLoading || !aiInput.trim()}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:shadow-lg disabled:opacity-50"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
