"use client";

import ImageUpload from "@/components/onboarding/ImageUpload";
import MultiSelect from "@/components/onboarding/MultiSelect";
import ProgressBar from "@/components/onboarding/ProgressBar";
import TypeformQuestion from "@/components/onboarding/TypeformQuestion";
import { uploadProfilePicture } from "@/lib/storage-helpers";
import { supabase } from "@/lib/supabaseClient";
import { AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const TOTAL_STEPS = 10;

// Niche options
const NICHE_OPTIONS = [
  "Gaming",
  "Technology",
  "Fashion & Beauty",
  "Fitness & Health",
  "Food & Cooking",
  "Travel & Lifestyle",
  "Education & Tutorial",
  "Entertainment & Comedy",
  "Business & Finance",
  "Arts & Crafts",
  "Music",
  "Sports",
  "Parenting & Family",
  "Home & Garden",
  "Automotive",
  "Other",
];

// Collaboration types
const COLLABORATION_TYPES = [
  "Sponsored Posts",
  "Product Reviews",
  "Brand Ambassadorships",
  "Affiliate Marketing",
  "Event Appearances",
  "Content Co-creation",
];

// Social platforms
const SOCIAL_PLATFORMS = [
  "YouTube",
  "Instagram",
  "TikTok",
  "Twitter",
  "Twitch",
  "Facebook",
  "LinkedIn",
  "Snapchat",
];

// Content types
const CONTENT_TYPES = [
  "Videos",
  "Shorts",
  "Reels",
  "Stories",
  "Posts",
  "Blogs",
  "Podcasts",
  "Live Streams",
];

// Languages
const LANGUAGES = [
  "English",
  "Hindi",
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Japanese",
  "Korean",
  "Chinese",
  "Arabic",
  "Other",
];

// Posting frequency
const POSTING_FREQUENCIES = [
  "Daily",
  "3x per week",
  "Weekly",
  "Bi-weekly",
  "Monthly",
];

// Follower ranges
const FOLLOWER_RANGES = [
  "Less than 1K",
  "1K - 10K",
  "10K - 50K",
  "50K - 100K",
  "100K - 500K",
  "500K - 1M",
  "1M+",
];

interface SocialPlatform {
  platform: string;
  handle: string;
  followers: string;
}

interface CreatorFormData {
  displayName: string;
  tagline: string;
  bio: string;
  primaryNiche: string;
  secondaryNiches: string[];
  socialPlatforms: SocialPlatform[];
  contentTypes: string[];
  postingFrequency: string;
  contentLanguage: string[];
  collaborationTypes: string[];
  profilePicture: File | null;
}

export default function CreatorOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreatorFormData>({
    displayName: "",
    tagline: "",
    bio: "",
    primaryNiche: "",
    secondaryNiches: [],
    socialPlatforms: [],
    contentTypes: [],
    postingFrequency: "",
    contentLanguage: [],
    collaborationTypes: [],
    profilePicture: null,
  });

  // Temporary state for social platform input
  const [newPlatform, setNewPlatform] = useState({
    platform: "",
    handle: "",
    followers: "",
  });

  // Get user ID on mount
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUserId(user.id);
    };
    getUser();
  }, [router]);

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (field: keyof CreatorFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addSocialPlatform = () => {
    if (newPlatform.platform && newPlatform.handle && newPlatform.followers) {
      setFormData((prev) => ({
        ...prev,
        socialPlatforms: [...prev.socialPlatforms, newPlatform],
      }));
      setNewPlatform({ platform: "", handle: "", followers: "" });
    }
  };

  const removeSocialPlatform = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      socialPlatforms: prev.socialPlatforms.filter((_, i) => i !== index),
    }));
  };

  const handleComplete = async () => {
    if (!userId) return;

    setIsSubmitting(true);

    try {
      // Upload profile picture if provided
      let profilePictureUrl = null;
      if (formData.profilePicture) {
        profilePictureUrl = await uploadProfilePicture(
          formData.profilePicture,
          userId
        );
      }

      // Insert creator profile
      const { error: creatorError } = await supabase.from("creators").insert({
        user_id: userId,
        display_name: formData.displayName,
        tagline: formData.tagline,
        bio: formData.bio,
        profile_picture_url: profilePictureUrl,
        primary_niche: formData.primaryNiche,
        secondary_niches: formData.secondaryNiches,
        social_platforms: formData.socialPlatforms,
        content_types: formData.contentTypes,
        posting_frequency: formData.postingFrequency,
        content_language: formData.contentLanguage,
        collaboration_types: formData.collaborationTypes,
      });

      if (creatorError) throw creatorError;

      // Mark onboarding as complete
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", userId);

      if (profileError) throw profileError;

      // Show success and redirect
      setTimeout(() => {
        router.push("/creator/home");
      }, 2000);
    } catch (error: any) {
      console.error("Onboarding error:", error);
      alert("Failed to complete onboarding. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Validation for each step
  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return true; // Welcome screen
      case 2:
        return formData.displayName.trim().length >= 2;
      case 3:
        return formData.bio.trim().length >= 50;
      case 4:
        return formData.primaryNiche !== "";
      case 5:
        return true; // Optional step
      case 6:
        return formData.socialPlatforms.length > 0;
      case 7:
        return (
          formData.contentTypes.length > 0 &&
          formData.postingFrequency !== "" &&
          formData.contentLanguage.length > 0
        );
      case 8:
        return formData.collaborationTypes.length > 0;
      case 9:
        return true; // Profile picture is optional
      case 10:
        return true; // Review step
      default:
        return false;
    }
  };

  if (!userId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <>
      <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />

      <AnimatePresence mode="wait">
        {/* Step 1: Welcome */}
        {currentStep === 1 && (
          <TypeformQuestion
            key="step-1"
            title="Welcome to InPact! 👋"
            subtitle="Let's set up your creator profile. This will take about 3 minutes."
            onNext={handleNext}
            canGoNext={canGoNext()}
            isFirstStep={true}
            nextButtonText="Let's Get Started"
          >
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <p className="text-gray-600">
                We'll ask you a few questions to build your profile and help
                brands discover you. Ready?
              </p>
            </div>
          </TypeformQuestion>
        )}

        {/* Step 2: Display Name */}
        {currentStep === 2 && (
          <TypeformQuestion
            key="step-2"
            title="What should we call you?"
            subtitle="Your creator name or handle"
            onNext={handleNext}
            onBack={handleBack}
            canGoNext={canGoNext()}
          >
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => updateFormData("displayName", e.target.value)}
              placeholder="Your creator name"
              className="w-full rounded-lg border-2 border-gray-300 px-6 py-4 text-lg transition-colors focus:border-purple-500 focus:outline-none"
              autoFocus
            />
            {formData.displayName.length > 0 &&
              formData.displayName.length < 2 && (
                <p className="mt-2 text-sm text-red-600">
                  Display name must be at least 2 characters
                </p>
              )}
          </TypeformQuestion>
        )}

        {/* Step 3: Bio & Tagline */}
        {currentStep === 3 && (
          <TypeformQuestion
            key="step-3"
            title="Tell us about yourself"
            subtitle="Help brands understand who you are and what you do"
            onNext={handleNext}
            onBack={handleBack}
            canGoNext={canGoNext()}
          >
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Tagline (Optional)
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => updateFormData("tagline", e.target.value)}
                  placeholder="A catchy one-liner about you"
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 transition-colors focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => updateFormData("bio", e.target.value)}
                  placeholder="Tell us your story, what you create, and what makes you unique..."
                  rows={5}
                  maxLength={500}
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 transition-colors focus:border-purple-500 focus:outline-none"
                />
                <p className="mt-1 text-right text-sm text-gray-500">
                  {formData.bio.length}/500 characters
                  {formData.bio.length < 50 && ` (minimum 50 characters)`}
                </p>
              </div>
            </div>
          </TypeformQuestion>
        )}

        {/* Step 4: Primary Niche */}
        {currentStep === 4 && (
          <TypeformQuestion
            key="step-4"
            title="What's your primary content niche?"
            subtitle="Choose the category that best describes your content"
            onNext={handleNext}
            onBack={handleBack}
            canGoNext={canGoNext()}
          >
            <select
              value={formData.primaryNiche}
              onChange={(e) => updateFormData("primaryNiche", e.target.value)}
              className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-lg transition-colors focus:border-purple-500 focus:outline-none"
            >
              <option value="">Select your primary niche</option>
              {NICHE_OPTIONS.map((niche) => (
                <option key={niche} value={niche}>
                  {niche}
                </option>
              ))}
            </select>
          </TypeformQuestion>
        )}

        {/* Step 5: Secondary Niches */}
        {currentStep === 5 && (
          <TypeformQuestion
            key="step-5"
            title="Do you create content in other niches?"
            subtitle="Select all that apply (optional)"
            onNext={handleNext}
            onBack={handleBack}
            canGoNext={canGoNext()}
          >
            <MultiSelect
              options={NICHE_OPTIONS.filter((n) => n !== formData.primaryNiche)}
              selected={formData.secondaryNiches}
              onChange={(selected) =>
                updateFormData("secondaryNiches", selected)
              }
              placeholder="Select additional niches"
            />
          </TypeformQuestion>
        )}

        {/* Step 6: Social Media */}
        {currentStep === 6 && (
          <TypeformQuestion
            key="step-6"
            title="Where can people find your content?"
            subtitle="Add at least one social media platform"
            onNext={handleNext}
            onBack={handleBack}
            canGoNext={canGoNext()}
          >
            <div className="space-y-4">
              {/* Existing platforms */}
              {formData.socialPlatforms.map((platform, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border-2 border-green-300 bg-green-50 p-4"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {platform.platform}
                    </p>
                    <p className="text-sm text-gray-600">
                      @{platform.handle} • {platform.followers}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSocialPlatform(index)}
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}

              {/* Add new platform */}
              <div className="rounded-lg border-2 border-gray-300 bg-white p-4">
                <p className="mb-3 font-medium text-gray-900">
                  Add Social Platform
                </p>
                <div className="space-y-3">
                  <select
                    value={newPlatform.platform}
                    onChange={(e) =>
                      setNewPlatform({
                        ...newPlatform,
                        platform: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Select platform</option>
                    {SOCIAL_PLATFORMS.map((platform) => (
                      <option key={platform} value={platform}>
                        {platform}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={newPlatform.handle}
                    onChange={(e) =>
                      setNewPlatform({ ...newPlatform, handle: e.target.value })
                    }
                    placeholder="Username/handle"
                    className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
                  />
                  <select
                    value={newPlatform.followers}
                    onChange={(e) =>
                      setNewPlatform({
                        ...newPlatform,
                        followers: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">Select follower count</option>
                    {FOLLOWER_RANGES.map((range) => (
                      <option key={range} value={range}>
                        {range}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addSocialPlatform}
                    disabled={
                      !newPlatform.platform ||
                      !newPlatform.handle ||
                      !newPlatform.followers
                    }
                    className="w-full rounded-lg bg-purple-600 py-2 font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Add Platform
                  </button>
                </div>
              </div>
            </div>
          </TypeformQuestion>
        )}

        {/* Step 7: Content Details */}
        {currentStep === 7 && (
          <TypeformQuestion
            key="step-7"
            title="Tell us about your content"
            subtitle="What do you create and how often?"
            onNext={handleNext}
            onBack={handleBack}
            canGoNext={canGoNext()}
          >
            <div className="space-y-6">
              <MultiSelect
                options={CONTENT_TYPES}
                selected={formData.contentTypes}
                onChange={(selected) =>
                  updateFormData("contentTypes", selected)
                }
                label="Content Types"
                placeholder="Select at least one"
                minSelection={1}
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Posting Frequency
                </label>
                <select
                  value={formData.postingFrequency}
                  onChange={(e) =>
                    updateFormData("postingFrequency", e.target.value)
                  }
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Select frequency</option>
                  {POSTING_FREQUENCIES.map((freq) => (
                    <option key={freq} value={freq}>
                      {freq}
                    </option>
                  ))}
                </select>
              </div>

              <MultiSelect
                options={LANGUAGES}
                selected={formData.contentLanguage}
                onChange={(selected) =>
                  updateFormData("contentLanguage", selected)
                }
                label="Content Languages"
                placeholder="Select at least one"
                minSelection={1}
              />
            </div>
          </TypeformQuestion>
        )}

        {/* Step 8: Collaboration Preferences */}
        {currentStep === 8 && (
          <TypeformQuestion
            key="step-8"
            title="What types of collaborations interest you?"
            subtitle="Select all that apply"
            onNext={handleNext}
            onBack={handleBack}
            canGoNext={canGoNext()}
          >
            <MultiSelect
              options={COLLABORATION_TYPES}
              selected={formData.collaborationTypes}
              onChange={(selected) =>
                updateFormData("collaborationTypes", selected)
              }
              placeholder="Select at least one collaboration type"
              minSelection={1}
            />
          </TypeformQuestion>
        )}

        {/* Step 9: Profile Picture */}
        {currentStep === 9 && (
          <TypeformQuestion
            key="step-9"
            title="Add a profile picture"
            subtitle="Help brands recognize you (optional)"
            onNext={handleNext}
            onBack={handleBack}
            canGoNext={canGoNext()}
          >
            <ImageUpload
              onImageSelect={(file) => updateFormData("profilePicture", file)}
              currentImage={formData.profilePicture}
              label="Profile Picture"
              maxSizeMB={5}
            />
          </TypeformQuestion>
        )}

        {/* Step 10: Review & Submit */}
        {currentStep === 10 && (
          <TypeformQuestion
            key="step-10"
            title={
              isSubmitting ? "Creating your profile..." : "Looking good! 🎉"
            }
            subtitle={
              isSubmitting
                ? "Please wait while we set up your account"
                : "Review your profile and hit complete"
            }
            onNext={handleComplete}
            onBack={handleBack}
            canGoNext={!isSubmitting}
            nextButtonText={isSubmitting ? "Submitting..." : "Complete Profile"}
            showBackButton={!isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-12">
                <Loader2 className="h-16 w-16 animate-spin text-purple-600" />
                <p className="text-lg text-gray-600">
                  Setting up your creator profile...
                </p>
              </div>
            ) : (
              <div className="space-y-4 rounded-lg bg-white p-6 shadow-sm">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Display Name
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formData.displayName}
                  </p>
                </div>
                {formData.tagline && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tagline</p>
                    <p className="text-gray-900">{formData.tagline}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500">Bio</p>
                  <p className="text-gray-900">{formData.bio}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Primary Niche
                  </p>
                  <p className="text-gray-900">{formData.primaryNiche}</p>
                </div>
                {formData.secondaryNiches.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Other Niches
                    </p>
                    <p className="text-gray-900">
                      {formData.secondaryNiches.join(", ")}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Social Platforms ({formData.socialPlatforms.length})
                  </p>
                  <div className="mt-2 space-y-2">
                    {formData.socialPlatforms.map((platform, idx) => (
                      <p key={idx} className="text-sm text-gray-900">
                        {platform.platform}: @{platform.handle} (
                        {platform.followers})
                      </p>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Content Info
                  </p>
                  <p className="text-gray-900">
                    {formData.contentTypes.join(", ")} •{" "}
                    {formData.postingFrequency} •{" "}
                    {formData.contentLanguage.join(", ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Collaboration Interests
                  </p>
                  <p className="text-gray-900">
                    {formData.collaborationTypes.join(", ")}
                  </p>
                </div>
                {formData.profilePicture && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Profile picture added</span>
                  </div>
                )}
              </div>
            )}
          </TypeformQuestion>
        )}
      </AnimatePresence>
    </>
  );
}
