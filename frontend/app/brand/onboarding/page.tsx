"use client";

import ImageUpload from "@/components/onboarding/ImageUpload";
import MultiSelect from "@/components/onboarding/MultiSelect";
import ProgressBar from "@/components/onboarding/ProgressBar";
import TypeformQuestion from "@/components/onboarding/TypeformQuestion";
import { uploadBrandLogo } from "@/lib/storage-helpers";
import { supabase } from "@/lib/supabaseClient";
import { AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const TOTAL_STEPS = 11;

// Industry options
const INDUSTRIES = [
  "Technology & Software",
  "Fashion & Apparel",
  "Beauty & Cosmetics",
  "Food & Beverage",
  "Health & Wellness",
  "Gaming & Esports",
  "Travel & Hospitality",
  "E-commerce & Retail",
  "Financial Services",
  "Education & E-learning",
  "Entertainment & Media",
  "Sports & Fitness",
  "Home & Lifestyle",
  "Automotive",
  "B2B Services",
  "Other",
];

// Company sizes
const COMPANY_SIZES = [
  "Startup (1-10)",
  "Small (11-50)",
  "Medium (51-200)",
  "Large (201-1000)",
  "Enterprise (1000+)",
];

// Age groups
const AGE_GROUPS = ["13-17", "18-24", "25-34", "35-44", "45-54", "55+"];

// Genders
const GENDERS = ["Male", "Female", "Non-binary", "All"];

// Locations
const LOCATIONS = [
  "United States",
  "India",
  "United Kingdom",
  "Canada",
  "Australia",
  "Europe",
  "Asia",
  "Global",
  "Other",
];

// Interests/Niches
const INTERESTS = [
  "Gaming",
  "Technology",
  "Fashion",
  "Beauty",
  "Fitness",
  "Food",
  "Travel",
  "Lifestyle",
  "Education",
  "Entertainment",
  "Business",
  "Arts",
  "Music",
  "Sports",
  "Parenting",
  "Home",
];

// Brand values
const BRAND_VALUES = [
  "Sustainability",
  "Innovation",
  "Quality",
  "Affordability",
  "Inclusivity",
  "Authenticity",
  "Transparency",
  "Social Responsibility",
  "Customer Focus",
  "Excellence",
];

// Brand personality
const BRAND_PERSONALITIES = [
  "Professional",
  "Fun",
  "Edgy",
  "Friendly",
  "Luxurious",
  "Casual",
  "Bold",
  "Sophisticated",
  "Playful",
  "Trustworthy",
];

// Marketing goals
const MARKETING_GOALS = [
  "Brand Awareness",
  "Product Sales",
  "Lead Generation",
  "Social Engagement",
  "Content Creation",
  "Community Building",
  "Market Research",
  "Customer Retention",
];

// Budget ranges
const BUDGET_RANGES = [
  "Less than $5K",
  "$5K - $20K",
  "$20K - $50K",
  "$50K - $100K",
  "$100K+",
];

const CAMPAIGN_BUDGET_RANGES = [
  "Less than $1K",
  "$1K - $5K",
  "$5K - $10K",
  "$10K - $25K",
  "$25K+",
];

// Campaign types
const CAMPAIGN_TYPES = [
  "Sponsored Posts",
  "Product Reviews",
  "Brand Ambassadorships",
  "Event Coverage",
  "User Generated Content",
  "Influencer Takeovers",
];

// Preferred creator sizes
const PREFERRED_CREATOR_SIZES = [
  "Nano (1K-10K)",
  "Micro (10K-100K)",
  "Mid-tier (100K-500K)",
  "Macro (500K-1M)",
  "Mega (1M+)",
];

interface BrandFormData {
  companyName: string;
  companyTagline: string;
  industry: string;
  description: string;
  websiteUrl: string;
  companySize: string;
  targetAgeGroups: string[];
  targetGenders: string[];
  targetLocations: string[];
  targetInterests: string[];
  brandValues: string[];
  brandPersonality: string[];
  marketingGoals: string[];
  monthlyBudget: string;
  budgetPerCampaignMin: string;
  budgetPerCampaignMax: string;
  campaignTypes: string[];
  preferredNiches: string[];
  preferredCreatorSize: string[];
  minFollowers: string;
  companyLogo: File | null;
}

export default function BrandOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState<BrandFormData>({
    companyName: "",
    companyTagline: "",
    industry: "",
    description: "",
    websiteUrl: "",
    companySize: "",
    targetAgeGroups: [],
    targetGenders: [],
    targetLocations: [],
    targetInterests: [],
    brandValues: [],
    brandPersonality: [],
    marketingGoals: [],
    monthlyBudget: "",
    budgetPerCampaignMin: "",
    budgetPerCampaignMax: "",
    campaignTypes: [],
    preferredNiches: [],
    preferredCreatorSize: [],
    minFollowers: "",
    companyLogo: null,
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

  const updateFormData = (field: keyof BrandFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleComplete = async () => {
    if (!userId) return;

    setIsSubmitting(true);

    try {
      // Upload company logo if provided
      let logoUrl = null;
      if (formData.companyLogo) {
        logoUrl = await uploadBrandLogo(formData.companyLogo, userId);
      }

      // Insert brand profile with correct column names
      const { error: brandError } = await supabase.from("brands").insert({
        user_id: userId,
        company_name: formData.companyName,
        company_tagline: formData.companyTagline,
        industry: formData.industry,
        company_description: formData.description,
        website_url: formData.websiteUrl,
        company_size: formData.companySize,
        company_logo_url: logoUrl,
        target_audience_age_groups: formData.targetAgeGroups,
        target_audience_gender: formData.targetGenders,
        target_audience_locations: formData.targetLocations,
        target_audience_interests: formData.targetInterests,
        brand_values: formData.brandValues,
        brand_personality: formData.brandPersonality,
        marketing_goals: formData.marketingGoals,
        monthly_marketing_budget: formData.monthlyBudget
          ? Number(formData.monthlyBudget)
          : null,
        budget_per_campaign_min: formData.budgetPerCampaignMin
          ? Number(formData.budgetPerCampaignMin)
          : null,
        budget_per_campaign_max: formData.budgetPerCampaignMax
          ? Number(formData.budgetPerCampaignMax)
          : null,
        campaign_types_interested: formData.campaignTypes,
        preferred_creator_niches: formData.preferredNiches,
        preferred_creator_size: formData.preferredCreatorSize,
        minimum_followers_required: formData.minFollowers
          ? parseInt(formData.minFollowers)
          : null,
      });

      if (brandError) throw brandError;

      // Mark onboarding as complete
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", userId);

      if (profileError) throw profileError;

      // Show success and redirect
      setTimeout(() => {
        router.push("/brand/home");
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
        return formData.companyName.trim().length >= 2;
      case 3:
        return formData.industry !== "";
      case 4:
        return (
          formData.description.trim().length >= 50 &&
          formData.websiteUrl.trim().length > 0 &&
          formData.companySize !== ""
        );
      case 5:
        return (
          formData.targetAgeGroups.length > 0 &&
          formData.targetGenders.length > 0 &&
          formData.targetLocations.length > 0
        );
      case 6:
        return (
          formData.brandValues.length > 0 &&
          formData.brandPersonality.length > 0
        );
      case 7:
        return formData.marketingGoals.length > 0;
      case 8:
        return (
          formData.monthlyBudget !== "" &&
          formData.budgetPerCampaignMin !== "" &&
          formData.budgetPerCampaignMax !== "" &&
          formData.campaignTypes.length > 0
        );
      case 9:
        return (
          formData.preferredNiches.length > 0 &&
          formData.preferredCreatorSize.length > 0
        );
      case 10:
        return true; // Logo is optional
      case 11:
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
            title="Welcome to InPact! 🚀"
            subtitle="Let's set up your brand profile. This will take about 4 minutes."
            onNext={handleNext}
            canGoNext={canGoNext()}
            isFirstStep={true}
            nextButtonText="Let's Get Started"
          >
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <p className="text-gray-600">
                We'll help you create a profile to connect with the perfect
                creators for your brand. Ready?
              </p>
            </div>
          </TypeformQuestion>
        )}

        {/* Step 2: Company Basics */}
        {currentStep === 2 && (
          <TypeformQuestion
            key="step-2"
            title="What's your company name?"
            subtitle="Let's start with the basics"
            onNext={handleNext}
            onBack={handleBack}
            canGoNext={canGoNext()}
          >
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) =>
                    updateFormData("companyName", e.target.value)
                  }
                  placeholder="Your company name"
                  className="w-full rounded-lg border-2 border-gray-300 px-6 py-4 text-lg transition-colors focus:border-purple-500 focus:outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Company Tagline (Optional)
                </label>
                <input
                  type="text"
                  value={formData.companyTagline}
                  onChange={(e) =>
                    updateFormData("companyTagline", e.target.value)
                  }
                  placeholder="A short, memorable tagline"
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 transition-colors focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </TypeformQuestion>
        )}

        {/* Step 3: Industry */}
        {currentStep === 3 && (
          <TypeformQuestion
            key="step-3"
            title="What industry are you in?"
            subtitle="Help creators understand your business"
            onNext={handleNext}
            onBack={handleBack}
            canGoNext={canGoNext()}
          >
            <select
              value={formData.industry}
              onChange={(e) => updateFormData("industry", e.target.value)}
              className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-lg transition-colors focus:border-purple-500 focus:outline-none"
            >
              <option value="">Select your industry</option>
              {INDUSTRIES.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </TypeformQuestion>
        )}

        {/* Step 4: Company Description */}
        {currentStep === 4 && (
          <TypeformQuestion
            key="step-4"
            title="Describe your company"
            subtitle="Tell creators about your brand"
            onNext={handleNext}
            onBack={handleBack}
            canGoNext={canGoNext()}
          >
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    updateFormData("description", e.target.value)
                  }
                  placeholder="What does your company do? What makes you unique?"
                  rows={5}
                  maxLength={500}
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 transition-colors focus:border-purple-500 focus:outline-none"
                />
                <p className="mt-1 text-right text-sm text-gray-500">
                  {formData.description.length}/500 characters
                  {formData.description.length < 50 && ` (minimum 50)`}
                </p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Website URL *
                </label>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => updateFormData("websiteUrl", e.target.value)}
                  placeholder="https://yourcompany.com"
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 transition-colors focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Company Size *
                </label>
                <select
                  value={formData.companySize}
                  onChange={(e) =>
                    updateFormData("companySize", e.target.value)
                  }
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 transition-colors focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Select company size</option>
                  {COMPANY_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </TypeformQuestion>
        )}

        {/* Step 5: Target Audience */}
        {currentStep === 5 && (
          <TypeformQuestion
            key="step-5"
            title="Who are you trying to reach?"
            subtitle="Define your target audience"
            onNext={handleNext}
            onBack={handleBack}
            canGoNext={canGoNext()}
          >
            <div className="space-y-6">
              <MultiSelect
                options={AGE_GROUPS}
                selected={formData.targetAgeGroups}
                onChange={(selected) =>
                  updateFormData("targetAgeGroups", selected)
                }
                label="Age Groups *"
                minSelection={1}
              />
              <MultiSelect
                options={GENDERS}
                selected={formData.targetGenders}
                onChange={(selected) =>
                  updateFormData("targetGenders", selected)
                }
                label="Gender *"
                minSelection={1}
              />
              <MultiSelect
                options={LOCATIONS}
                selected={formData.targetLocations}
                onChange={(selected) =>
                  updateFormData("targetLocations", selected)
                }
                label="Locations *"
                minSelection={1}
              />
              <MultiSelect
                options={INTERESTS}
                selected={formData.targetInterests}
                onChange={(selected) =>
                  updateFormData("targetInterests", selected)
                }
                label="Target Interests (Optional)"
              />
            </div>
          </TypeformQuestion>
        )}

        {/* Step 6: Brand Identity */}
        {currentStep === 6 && (
          <TypeformQuestion
            key="step-6"
            title="What does your brand stand for?"
            subtitle="Define your brand identity"
            onNext={handleNext}
            onBack={handleBack}
            canGoNext={canGoNext()}
          >
            <div className="space-y-6">
              <MultiSelect
                options={BRAND_VALUES}
                selected={formData.brandValues}
                onChange={(selected) => updateFormData("brandValues", selected)}
                label="Brand Values *"
                minSelection={1}
              />
              <MultiSelect
                options={BRAND_PERSONALITIES}
                selected={formData.brandPersonality}
                onChange={(selected) =>
                  updateFormData("brandPersonality", selected)
                }
                label="Brand Personality *"
                minSelection={1}
              />
            </div>
          </TypeformQuestion>
        )}

        {/* Step 7: Marketing Goals */}
        {currentStep === 7 && (
          <TypeformQuestion
            key="step-7"
            title="What are your marketing goals?"
            subtitle="Select all that apply"
            onNext={handleNext}
            onBack={handleBack}
            canGoNext={canGoNext()}
          >
            <MultiSelect
              options={MARKETING_GOALS}
              selected={formData.marketingGoals}
              onChange={(selected) =>
                updateFormData("marketingGoals", selected)
              }
              minSelection={1}
            />
          </TypeformQuestion>
        )}

        {/* Step 8: Budget & Campaign Info */}
        {currentStep === 8 && (
          <TypeformQuestion
            key="step-8"
            title="Let's talk budget"
            subtitle="This helps us match you with the right creators"
            onNext={handleNext}
            onBack={handleBack}
            canGoNext={canGoNext()}
          >
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Monthly Marketing Budget (USD) *
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.monthlyBudget}
                  onChange={(e) =>
                    updateFormData("monthlyBudget", e.target.value)
                  }
                  placeholder="e.g. 10000"
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 transition-colors focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Budget Per Campaign (Min, USD) *
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.budgetPerCampaignMin}
                  onChange={(e) =>
                    updateFormData("budgetPerCampaignMin", e.target.value)
                  }
                  placeholder="e.g. 1000"
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 transition-colors focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Budget Per Campaign (Max, USD) *
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.budgetPerCampaignMax}
                  onChange={(e) =>
                    updateFormData("budgetPerCampaignMax", e.target.value)
                  }
                  placeholder="e.g. 5000"
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 transition-colors focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Campaign Types Interested In *
                </label>
                <MultiSelect
                  options={CAMPAIGN_TYPES}
                  selected={formData.campaignTypes}
                  onChange={(selected) =>
                    updateFormData("campaignTypes", selected)
                  }
                  placeholder="Select campaign types"
                  minSelection={1}
                />
              </div>
            </div>
          </TypeformQuestion>
        )}

        {/* Step 9: Creator Preferences */}
        {currentStep === 9 && (
          <TypeformQuestion
            key="step-9"
            title="What type of creators do you want to work with?"
            subtitle="Define your ideal creator partnerships"
            onNext={handleNext}
            onBack={handleBack}
            canGoNext={canGoNext()}
          >
            <div className="space-y-4">
              <MultiSelect
                options={INTERESTS}
                selected={formData.preferredNiches}
                onChange={(selected) =>
                  updateFormData("preferredNiches", selected)
                }
                label="Preferred Niches *"
                minSelection={1}
              />
              <MultiSelect
                options={PREFERRED_CREATOR_SIZES}
                selected={formData.preferredCreatorSize}
                onChange={(selected) =>
                  updateFormData("preferredCreatorSize", selected)
                }
                label="Preferred Creator Size *"
                minSelection={1}
              />
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Minimum Followers Required (Optional)
                </label>
                <input
                  type="number"
                  value={formData.minFollowers}
                  onChange={(e) =>
                    updateFormData("minFollowers", e.target.value)
                  }
                  placeholder="e.g., 10000"
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 transition-colors focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </TypeformQuestion>
        )}

        {/* Step 10: Company Logo */}
        {currentStep === 10 && (
          <TypeformQuestion
            key="step-10"
            title="Upload your company logo"
            subtitle="Help creators recognize your brand (optional)"
            onNext={handleNext}
            onBack={handleBack}
            canGoNext={canGoNext()}
          >
            <ImageUpload
              onImageSelect={(file) => updateFormData("companyLogo", file)}
              currentImage={formData.companyLogo}
              label="Company Logo"
              maxSizeMB={5}
            />
          </TypeformQuestion>
        )}

        {/* Step 11: Review & Submit */}
        {currentStep === 11 && (
          <TypeformQuestion
            key="step-11"
            title={isSubmitting ? "Creating your profile..." : "All set! 🎊"}
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
            {isSubmitting && (
              <div className="flex flex-col items-center justify-center space-y-4 py-12">
                <Loader2 className="h-16 w-16 animate-spin text-purple-600" />
                <div>
                  <p className="text-lg text-gray-600">
                    Setting up your brand profile...
                  </p>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Creator Preferences
                    </p>
                    <p className="text-sm text-gray-900">
                      Niches: {formData.preferredNiches.join(", ")} • Sizes:{" "}
                      {formData.preferredCreatorSize.join(", ")}
                      {formData.minFollowers &&
                        ` • Min Followers: ${formData.minFollowers}`}
                    </p>
                  </div>
                </div>
                {formData.companyTagline && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tagline</p>
                    <p className="text-gray-900">{formData.companyTagline}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500">Industry</p>
                  <p className="text-gray-900">{formData.industry}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Description
                  </p>
                  <p className="text-gray-900">{formData.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Website</p>
                  <p className="text-gray-900">{formData.websiteUrl}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Company Size
                  </p>
                  <p className="text-gray-900">{formData.companySize}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Target Audience
                  </p>
                  <p className="text-sm text-gray-900">
                    Ages: {formData.targetAgeGroups.join(", ")} • Genders:{" "}
                    {formData.targetGenders.join(", ")} • Locations:{" "}
                    {formData.targetLocations.join(", ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Brand Identity
                  </p>
                  <p className="text-sm text-gray-900">
                    Values: {formData.brandValues.join(", ")} • Personality:{" "}
                    {formData.brandPersonality.join(", ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Marketing Goals
                  </p>
                  <p className="text-gray-900">
                    {formData.marketingGoals.join(", ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Budget</p>
                  <p className="text-gray-900">
                    Monthly: {formData.monthlyBudget} • Per Campaign: $
                    {formData.budgetPerCampaignMin} - $
                    {formData.budgetPerCampaignMax}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Creator Preferences
                  </p>
                  <p className="text-sm text-gray-900">
                    Niches: {formData.preferredNiches.join(", ")} • Sizes:{" "}
                    {formData.preferredCreatorSize.join(", ")}
                    {formData.minFollowers &&
                      ` • Min Followers: ${formData.minFollowers}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Campaign Types
                  </p>
                  <p className="text-gray-900">
                    {formData.campaignTypes.join(", ")}
                  </p>
                </div>
                {formData.companyLogo && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Company logo added</span>
                  </div>
                )}
              </div>
            )}
            {!isSubmitting && (
              <div className="flex flex-col items-center justify-center space-y-4 py-12">
                {formData.companyTagline && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tagline</p>
                    <p className="text-gray-900">{formData.companyTagline}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500">Industry</p>
                  <p className="text-gray-900">{formData.industry}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Description
                  </p>
                  <p className="text-gray-900">{formData.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Website</p>
                  <p className="text-gray-900">{formData.websiteUrl}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Company Size
                  </p>
                  <p className="text-gray-900">{formData.companySize}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Target Audience
                  </p>
                  <p className="text-sm text-gray-900">
                    Ages: {formData.targetAgeGroups.join(", ")} • Genders:{" "}
                    {formData.targetGenders.join(", ")} • Locations:{" "}
                    {formData.targetLocations.join(", ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Brand Identity
                  </p>
                  <p className="text-sm text-gray-900">
                    Values: {formData.brandValues.join(", ")} • Personality:{" "}
                    {formData.brandPersonality.join(", ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Marketing Goals
                  </p>
                  <p className="text-gray-900">
                    {formData.marketingGoals.join(", ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Budget</p>
                  <p className="text-gray-900">
                    Monthly: {formData.monthlyBudget} • Per Campaign: $
                    {formData.budgetPerCampaignMin} - $
                    {formData.budgetPerCampaignMax}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Creator Preferences
                  </p>
                  <p className="text-sm text-gray-900">
                    Niches: {formData.preferredNiches.join(", ")} • Sizes:{" "}
                    {formData.preferredCreatorSize.join(", ")}
                    {formData.minFollowers &&
                      ` • Min Followers: ${formData.minFollowers}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Campaign Types
                  </p>
                  <p className="text-gray-900">
                    {formData.campaignTypes.join(", ")}
                  </p>
                </div>
                {formData.companyLogo && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Company logo added</span>
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
