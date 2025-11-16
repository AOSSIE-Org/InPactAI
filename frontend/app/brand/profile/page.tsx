"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import SlidingMenu from "@/components/SlidingMenu";
import ProfileButton from "@/components/profile/ProfileButton";
import CollapsibleSection from "@/components/profile/CollapsibleSection";
import ArrayInput from "@/components/profile/ArrayInput";
import JsonInput from "@/components/profile/JsonInput";
import { signOut } from "@/lib/auth-helpers";
import { getBrandProfile, updateBrandProfile, aiFillBrandProfile, BrandProfile } from "@/lib/api/profile";
import { Briefcase, Loader2, LogOut, Edit2, Save, X, Sparkles, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function BrandProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<BrandProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<BrandProfile>>({});
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
      const data = await getBrandProfile();
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
      const updated = await updateBrandProfile(formData);
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
      alert("Please provide some information about your brand");
      return;
    }

    try {
      setAiLoading(true);
      const result = await aiFillBrandProfile(aiInput);

      if (!result.data || Object.keys(result.data).length === 0) {
        alert(result.message || "No new data could be extracted from your input. Please provide more specific information.");
        return;
      }

      // Merge AI-generated data into form, handling all data types properly
      setFormData((prev) => {
        const updated = { ...prev };
        for (const [key, value] of Object.entries(result.data)) {
          // Properly handle arrays, objects, and primitives
          if (Array.isArray(value)) {
            updated[key] = value;
          } else if (typeof value === 'object' && value !== null) {
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
      alert(`Success! ${fieldCount} field${fieldCount !== 1 ? 's' : ''} ${fieldCount !== 1 ? 'were' : 'was'} filled. Please review and save your changes.`);
    } catch (error: any) {
      console.error("Error with AI fill:", error);
      const errorMessage = error?.message || "Failed to generate profile data. Please try again.";
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
      <AuthGuard requiredRole="Brand">
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AuthGuard>
    );
  }

  if (!profile) {
    return (
      <AuthGuard requiredRole="Brand">
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-gray-600">Failed to load profile</p>
        </div>
      </AuthGuard>
    );
  }

  const completionPercentage = profile.profile_completion_percentage || 0;

  return (
    <AuthGuard requiredRole="Brand">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <SlidingMenu role="brand" />
        {/* Header */}
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-blue-600" />
              <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
                InPactAI
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <ProfileButton role="Brand" />
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
            onClick={() => router.push("/brand/home")}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>

          {/* Profile Header */}
          <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">Brand Profile</h2>
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
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
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
                <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                <span className="text-sm font-semibold text-gray-900">{completionPercentage}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
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
                  <label className="mb-1 block text-sm font-medium text-gray-700">Company Name *</label>
                  <input
                    type="text"
                    value={formData.company_name || ""}
                    onChange={(e) => updateField("company_name", e.target.value)}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Industry *</label>
                  <input
                    type="text"
                    value={formData.industry || ""}
                    onChange={(e) => updateField("industry", e.target.value)}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Sub Industries</label>
                  <ArrayInput
                    label=""
                    values={formData.sub_industry || []}
                    onChange={(values) => updateArrayField("sub_industry", values)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Company Tagline</label>
                  <input
                    type="text"
                    value={formData.company_tagline || ""}
                    onChange={(e) => updateField("company_tagline", e.target.value)}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Company Type</label>
                  <input
                    type="text"
                    value={formData.company_type || ""}
                    onChange={(e) => updateField("company_type", e.target.value)}
                    disabled={!isEditing}
                    placeholder="e.g., B2B, B2C, SaaS"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Website URL *</label>
                  <input
                    type="url"
                    value={formData.website_url || ""}
                    onChange={(e) => updateField("website_url", e.target.value)}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Company Size</label>
                  <input
                    type="text"
                    value={formData.company_size || ""}
                    onChange={(e) => updateField("company_size", e.target.value)}
                    disabled={!isEditing}
                    placeholder="e.g., 1-10, 11-50, 51-200, 201-500, 500+"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Founded Year</label>
                  <input
                    type="number"
                    value={formData.founded_year || ""}
                    onChange={(e) => updateField("founded_year", parseInt(e.target.value) || undefined)}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Headquarters Location</label>
                  <input
                    type="text"
                    value={formData.headquarters_location || ""}
                    onChange={(e) => updateField("headquarters_location", e.target.value)}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Contact Email</label>
                  <input
                    type="email"
                    value={formData.contact_email || ""}
                    onChange={(e) => updateField("contact_email", e.target.value)}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.contact_phone || ""}
                    onChange={(e) => updateField("contact_phone", e.target.value)}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Company Description</label>
                  <textarea
                    value={formData.company_description || ""}
                    onChange={(e) => updateField("company_description", e.target.value)}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Company Logo URL</label>
                  <input
                    type="url"
                    value={formData.company_logo_url || ""}
                    onChange={(e) => updateField("company_logo_url", e.target.value)}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Company Cover Image URL</label>
                  <input
                    type="url"
                    value={formData.company_cover_image_url || ""}
                    onChange={(e) => updateField("company_cover_image_url", e.target.value)}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div className="md:col-span-2">
                  <JsonInput
                    label="Social Media Links"
                    value={formData.social_media_links || null}
                    onChange={(value) => updateField("social_media_links", value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* Brand Identity */}
            <CollapsibleSection title="Brand Identity">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <ArrayInput
                    label="Brand Values"
                    values={formData.brand_values || []}
                    onChange={(values) => updateArrayField("brand_values", values)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="md:col-span-2">
                  <ArrayInput
                    label="Brand Personality"
                    values={formData.brand_personality || []}
                    onChange={(values) => updateArrayField("brand_personality", values)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Brand Voice</label>
                  <textarea
                    value={formData.brand_voice || ""}
                    onChange={(e) => updateField("brand_voice", e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div className="md:col-span-2">
                  <JsonInput
                    label="Brand Colors"
                    value={formData.brand_colors || null}
                    onChange={(value) => updateField("brand_colors", value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* Target Audience */}
            <CollapsibleSection title="Target Audience">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Target Audience Description</label>
                  <textarea
                    value={formData.target_audience_description || ""}
                    onChange={(e) => updateField("target_audience_description", e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <ArrayInput
                    label="Age Groups"
                    values={formData.target_audience_age_groups || []}
                    onChange={(values) => updateArrayField("target_audience_age_groups", values)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <ArrayInput
                    label="Gender"
                    values={formData.target_audience_gender || []}
                    onChange={(values) => updateArrayField("target_audience_gender", values)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <ArrayInput
                    label="Locations"
                    values={formData.target_audience_locations || []}
                    onChange={(values) => updateArrayField("target_audience_locations", values)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <ArrayInput
                    label="Interests"
                    values={formData.target_audience_interests || []}
                    onChange={(values) => updateArrayField("target_audience_interests", values)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <ArrayInput
                    label="Income Level"
                    values={formData.target_audience_income_level || []}
                    onChange={(values) => updateArrayField("target_audience_income_level", values)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* Marketing & Campaigns */}
            <CollapsibleSection title="Marketing & Campaigns">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <ArrayInput
                    label="Marketing Goals"
                    values={formData.marketing_goals || []}
                    onChange={(values) => updateArrayField("marketing_goals", values)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="md:col-span-2">
                  <ArrayInput
                    label="Campaign Types Interested"
                    values={formData.campaign_types_interested || []}
                    onChange={(values) => updateArrayField("campaign_types_interested", values)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="md:col-span-2">
                  <ArrayInput
                    label="Preferred Content Types"
                    values={formData.preferred_content_types || []}
                    onChange={(values) => updateArrayField("preferred_content_types", values)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="md:col-span-2">
                  <ArrayInput
                    label="Preferred Platforms"
                    values={formData.preferred_platforms || []}
                    onChange={(values) => updateArrayField("preferred_platforms", values)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Campaign Frequency</label>
                  <input
                    type="text"
                    value={formData.campaign_frequency || ""}
                    onChange={(e) => updateField("campaign_frequency", e.target.value)}
                    disabled={!isEditing}
                    placeholder="e.g., Monthly, Quarterly"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Monthly Marketing Budget</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.monthly_marketing_budget || ""}
                    onChange={(e) => updateField("monthly_marketing_budget", parseFloat(e.target.value) || undefined)}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Influencer Budget Percentage</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.influencer_budget_percentage || ""}
                    onChange={(e) => updateField("influencer_budget_percentage", parseFloat(e.target.value) || undefined)}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Budget per Campaign (Min)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.budget_per_campaign_min || ""}
                    onChange={(e) => updateField("budget_per_campaign_min", parseFloat(e.target.value) || undefined)}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Budget per Campaign (Max)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.budget_per_campaign_max || ""}
                    onChange={(e) => updateField("budget_per_campaign_max", parseFloat(e.target.value) || undefined)}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Typical Deal Size</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.typical_deal_size || ""}
                    onChange={(e) => updateField("typical_deal_size", parseFloat(e.target.value) || undefined)}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Payment Terms</label>
                  <input
                    type="text"
                    value={formData.payment_terms || ""}
                    onChange={(e) => updateField("payment_terms", e.target.value)}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* Creator Preferences */}
            <CollapsibleSection title="Creator Preferences">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <ArrayInput
                    label="Preferred Creator Niches"
                    values={formData.preferred_creator_niches || []}
                    onChange={(values) => updateArrayField("preferred_creator_niches", values)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <ArrayInput
                    label="Preferred Creator Size"
                    values={formData.preferred_creator_size || []}
                    onChange={(values) => updateArrayField("preferred_creator_size", values)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <ArrayInput
                    label="Preferred Creator Locations"
                    values={formData.preferred_creator_locations || []}
                    onChange={(values) => updateArrayField("preferred_creator_locations", values)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Minimum Followers Required</label>
                  <input
                    type="number"
                    value={formData.minimum_followers_required || ""}
                    onChange={(e) => updateField("minimum_followers_required", parseInt(e.target.value) || undefined)}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Minimum Engagement Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.minimum_engagement_rate || ""}
                    onChange={(e) => updateField("minimum_engagement_rate", parseFloat(e.target.value) || undefined)}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.offers_product_only_deals || false}
                      onChange={(e) => updateField("offers_product_only_deals", e.target.checked)}
                      disabled={!isEditing}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label className="text-sm font-medium text-gray-700">Offers Product-Only Deals</label>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.offers_affiliate_programs || false}
                      onChange={(e) => updateField("offers_affiliate_programs", e.target.checked)}
                      disabled={!isEditing}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label className="text-sm font-medium text-gray-700">Offers Affiliate Programs</label>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Affiliate Commission Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.affiliate_commission_rate || ""}
                    onChange={(e) => updateField("affiliate_commission_rate", parseFloat(e.target.value) || undefined)}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* Content Guidelines */}
            <CollapsibleSection title="Content Guidelines">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <ArrayInput
                    label="Content Do's"
                    values={formData.content_dos || []}
                    onChange={(values) => updateArrayField("content_dos", values)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <ArrayInput
                    label="Content Don'ts"
                    values={formData.content_donts || []}
                    onChange={(values) => updateArrayField("content_donts", values)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <ArrayInput
                    label="Brand Safety Requirements"
                    values={formData.brand_safety_requirements || []}
                    onChange={(values) => updateArrayField("brand_safety_requirements", values)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <ArrayInput
                    label="Competitor Brands"
                    values={formData.competitor_brands || []}
                    onChange={(values) => updateArrayField("competitor_brands", values)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.exclusivity_required || false}
                      onChange={(e) => updateField("exclusivity_required", e.target.checked)}
                      disabled={!isEditing}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label className="text-sm font-medium text-gray-700">Exclusivity Required</label>
                  </div>
                  {formData.exclusivity_required && (
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Exclusivity Duration (Months)</label>
                      <input
                        type="number"
                        value={formData.exclusivity_duration_months || ""}
                        onChange={(e) => updateField("exclusivity_duration_months", parseInt(e.target.value) || undefined)}
                        disabled={!isEditing}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleSection>

            {/* Products & Services */}
            <CollapsibleSection title="Products & Services">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <ArrayInput
                    label="Products/Services"
                    values={formData.products_services || []}
                    onChange={(values) => updateArrayField("products_services", values)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Product Price Range</label>
                  <input
                    type="text"
                    value={formData.product_price_range || ""}
                    onChange={(e) => updateField("product_price_range", e.target.value)}
                    disabled={!isEditing}
                    placeholder="e.g., $10-$50, $50-$100"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <ArrayInput
                    label="Product Categories"
                    values={formData.product_categories || []}
                    onChange={(values) => updateArrayField("product_categories", values)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.seasonal_products || false}
                      onChange={(e) => updateField("seasonal_products", e.target.checked)}
                      disabled={!isEditing}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label className="text-sm font-medium text-gray-700">Seasonal Products</label>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Product Catalog URL</label>
                  <input
                    type="url"
                    value={formData.product_catalog_url || ""}
                    onChange={(e) => updateField("product_catalog_url", e.target.value)}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* History & Performance */}
            <CollapsibleSection title="History & Performance">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Past Campaigns Count</label>
                  <input
                    type="number"
                    value={formData.past_campaigns_count || ""}
                    onChange={(e) => updateField("past_campaigns_count", parseInt(e.target.value) || undefined)}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Average Campaign ROI (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.average_campaign_roi || ""}
                    onChange={(e) => updateField("average_campaign_roi", parseFloat(e.target.value) || undefined)}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div className="md:col-span-2">
                  <ArrayInput
                    label="Successful Partnerships"
                    values={formData.successful_partnerships || []}
                    onChange={(values) => updateArrayField("successful_partnerships", values)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Total Deals Posted</label>
                  <input
                    type="number"
                    value={formData.total_deals_posted || ""}
                    onChange={(e) => updateField("total_deals_posted", parseInt(e.target.value) || undefined)}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Total Deals Completed</label>
                  <input
                    type="number"
                    value={formData.total_deals_completed || ""}
                    onChange={(e) => updateField("total_deals_completed", parseInt(e.target.value) || undefined)}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Total Spent</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.total_spent || ""}
                    onChange={(e) => updateField("total_spent", parseFloat(e.target.value) || undefined)}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Average Deal Rating</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.average_deal_rating || ""}
                    onChange={(e) => updateField("average_deal_rating", parseFloat(e.target.value) || undefined)}
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
                    onChange={(values) => updateArrayField("search_keywords", values)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Subscription Tier</label>
                  <select
                    value={formData.subscription_tier || "free"}
                    onChange={(e) => updateField("subscription_tier", e.target.value)}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  >
                    <option value="free">Free</option>
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Matching Score Base</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.matching_score_base || ""}
                    onChange={(e) => updateField("matching_score_base", parseFloat(e.target.value) || undefined)}
                    disabled={!isEditing}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 disabled:bg-gray-50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">AI Profile Summary</label>
                  <textarea
                    value={formData.ai_profile_summary || ""}
                    onChange={(e) => updateField("ai_profile_summary", e.target.value)}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
              <h3 className="mb-4 text-xl font-semibold text-gray-900">AI Profile Filling</h3>
              <p className="mb-4 text-sm text-gray-600">
                Provide information about your brand, and AI will help fill in your profile fields automatically.
              </p>
              <textarea
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="e.g., We are a tech startup founded in 2020, based in San Francisco. We focus on sustainable products and target millennials..."
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

