"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import SlidingMenu from "@/components/SlidingMenu";
import { createCampaign } from "@/lib/campaignApi";
import {
  AGE_GROUP_OPTIONS,
  CampaignDeliverable,
  CampaignFormData,
  CONTENT_TYPE_OPTIONS,
  FOLLOWER_RANGE_OPTIONS,
  GENDER_OPTIONS,
  INCOME_LEVEL_OPTIONS,
  NICHE_OPTIONS,
  PLATFORM_OPTIONS,
} from "@/types/campaign";
import { ArrowLeft, Eye, Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CampaignFormData>({
    title: "",
    short_description: "",
    description: "",
    status: "draft",
    platforms: [],
    deliverables: [],
    target_audience: {},
    budget_min: "",
    budget_max: "",
    preferred_creator_niches: [],
    preferred_creator_followers_range: "",
    starts_at: "",
    ends_at: "",
  });

  const [newDeliverable, setNewDeliverable] = useState<CampaignDeliverable>({
    platform: "",
    content_type: "",
    quantity: 1,
    guidance: "",
    required: true,
  });

  const updateField = (field: keyof CampaignFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (
    field: "platforms" | "preferred_creator_niches",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const updateTargetAudience = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      target_audience: {
        ...prev.target_audience,
        [field]: value,
      },
    }));
  };

  const toggleTargetAudienceArray = (field: string, value: string) => {
    const current =
      (formData.target_audience[
        field as keyof typeof formData.target_audience
      ] as string[]) || [];
    updateTargetAudience(
      field,
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  };

  const addDeliverable = () => {
    if (!newDeliverable.platform || !newDeliverable.content_type) {
      setError(
        "Please select both platform and content type for the deliverable"
      );
      return;
    }
    setError(null); // Clear any previous errors
    setFormData((prev) => ({
      ...prev,
      deliverables: [...prev.deliverables, { ...newDeliverable }],
    }));
    setNewDeliverable({
      platform: "",
      content_type: "",
      quantity: 1,
      guidance: "",
      required: true,
    });
  };

  const removeDeliverable = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError("Campaign title is required");
      return false;
    }
    if (formData.budget_min && formData.budget_max) {
      if (parseFloat(formData.budget_min) > parseFloat(formData.budget_max)) {
        setError("Minimum budget cannot be greater than maximum budget");
        return false;
      }
    }
    if (formData.starts_at && formData.ends_at) {
      if (new Date(formData.starts_at) > new Date(formData.ends_at)) {
        setError("Start date cannot be after end date");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (status: "draft" | "active") => {
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        ...formData,
        status,
        budget_min: formData.budget_min
          ? parseFloat(formData.budget_min)
          : undefined,
        budget_max: formData.budget_max
          ? parseFloat(formData.budget_max)
          : undefined,
        starts_at: formData.starts_at || undefined,
        ends_at: formData.ends_at || undefined,
      };
      await createCampaign(submitData);
      router.push("/brand/campaigns");
    } catch (err: any) {
      setError(err.message || "Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard requiredRole="Brand">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <SlidingMenu role="brand" />

        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="mb-4 flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Create New Campaign
            </h1>
            <p className="mt-2 text-gray-600">
              Fill out the details below to launch your influencer marketing
              campaign
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
              {error}
            </div>
          )}

          <form className="space-y-8">
            {/* Basic Information */}
            <div className="rounded-xl bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Basic Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block font-medium text-gray-700">
                    Campaign Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder="e.g., Summer Product Launch 2024"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium text-gray-700">
                    Short Description
                  </label>
                  <input
                    type="text"
                    value={formData.short_description}
                    onChange={(e) =>
                      updateField("short_description", e.target.value)
                    }
                    placeholder="Brief one-liner about your campaign"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium text-gray-700">
                    Detailed Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Provide detailed information about your campaign goals, requirements, and expectations..."
                    rows={6}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Campaign Duration */}
            <div className="rounded-xl bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Campaign Duration
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.starts_at}
                    onChange={(e) => updateField("starts_at", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.ends_at}
                    onChange={(e) => updateField("ends_at", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Budget */}
            <div className="rounded-xl bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Budget Range (INR)
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block font-medium text-gray-700">
                    Minimum Budget
                  </label>
                  <input
                    type="number"
                    value={formData.budget_min}
                    onChange={(e) => updateField("budget_min", e.target.value)}
                    placeholder="e.g., 50000"
                    min="0"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-medium text-gray-700">
                    Maximum Budget
                  </label>
                  <input
                    type="number"
                    value={formData.budget_max}
                    onChange={(e) => updateField("budget_max", e.target.value)}
                    placeholder="e.g., 200000"
                    min="0"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Platforms */}
            <div className="rounded-xl bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Target Platforms
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {PLATFORM_OPTIONS.map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => toggleArrayField("platforms", platform)}
                    className={`rounded-lg border-2 px-4 py-3 font-medium transition-all ${
                      formData.platforms.includes(platform)
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 bg-white text-gray-700 hover:border-blue-300"
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            {/* Deliverables */}
            <div className="rounded-xl bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Campaign Deliverables
              </h2>

              {/* Add Deliverable Form */}
              <div className="mb-4 rounded-lg bg-gray-50 p-4">
                <h3 className="mb-3 font-medium text-gray-900">
                  Add Deliverable
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  <select
                    value={newDeliverable.platform}
                    onChange={(e) =>
                      setNewDeliverable({
                        ...newDeliverable,
                        platform: e.target.value,
                      })
                    }
                    className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select Platform</option>
                    {PLATFORM_OPTIONS.map((platform) => (
                      <option key={platform} value={platform}>
                        {platform}
                      </option>
                    ))}
                  </select>

                  <select
                    value={newDeliverable.content_type}
                    onChange={(e) =>
                      setNewDeliverable({
                        ...newDeliverable,
                        content_type: e.target.value,
                      })
                    }
                    className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select Content Type</option>
                    {CONTENT_TYPE_OPTIONS.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    value={newDeliverable.quantity}
                    onChange={(e) =>
                      setNewDeliverable({
                        ...newDeliverable,
                        quantity: parseInt(e.target.value) || 1,
                      })
                    }
                    min="1"
                    placeholder="Quantity"
                    className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="mt-3">
                  <textarea
                    value={newDeliverable.guidance}
                    onChange={(e) =>
                      setNewDeliverable({
                        ...newDeliverable,
                        guidance: e.target.value,
                      })
                    }
                    placeholder="Additional guidance or requirements (optional)"
                    rows={2}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newDeliverable.required}
                      onChange={(e) =>
                        setNewDeliverable({
                          ...newDeliverable,
                          required: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Required deliverable
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={addDeliverable}
                    className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>
              </div>

              {/* Deliverables List */}
              {formData.deliverables.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">
                    Added Deliverables ({formData.deliverables.length})
                  </h3>
                  {formData.deliverables.map((deliverable, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between rounded-lg border border-gray-200 bg-white p-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {deliverable.platform} - {deliverable.content_type}
                          </span>
                          <span className="text-gray-600">
                            (Qty: {deliverable.quantity})
                          </span>
                          {deliverable.required && (
                            <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
                              Required
                            </span>
                          )}
                        </div>
                        {deliverable.guidance && (
                          <p className="mt-1 text-sm text-gray-600">
                            {deliverable.guidance}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDeliverable(index)}
                        className="ml-2 text-red-500 transition-colors hover:text-red-700"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Creator Preferences */}
            <div className="rounded-xl bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Creator Preferences
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block font-medium text-gray-700">
                    Preferred Niches
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {NICHE_OPTIONS.map((niche) => (
                      <button
                        key={niche}
                        type="button"
                        onClick={() =>
                          toggleArrayField("preferred_creator_niches", niche)
                        }
                        className={`rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${
                          formData.preferred_creator_niches.includes(niche)
                            ? "border-purple-500 bg-purple-50 text-purple-700"
                            : "border-gray-300 bg-white text-gray-700 hover:border-purple-300"
                        }`}
                      >
                        {niche}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block font-medium text-gray-700">
                    Preferred Follower Range
                  </label>
                  <select
                    value={formData.preferred_creator_followers_range}
                    onChange={(e) =>
                      updateField(
                        "preferred_creator_followers_range",
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  >
                    <option value="">Select a range</option>
                    {FOLLOWER_RANGE_OPTIONS.map((range) => (
                      <option key={range} value={range}>
                        {range}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Target Audience */}
            <div className="rounded-xl bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Target Audience
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block font-medium text-gray-700">
                    Age Groups
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AGE_GROUP_OPTIONS.map((age) => (
                      <button
                        key={age}
                        type="button"
                        onClick={() =>
                          toggleTargetAudienceArray("age_groups", age)
                        }
                        className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                          (formData.target_audience.age_groups || []).includes(
                            age
                          )
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-300 bg-white text-gray-700 hover:border-blue-300"
                        }`}
                      >
                        {age}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block font-medium text-gray-700">
                    Gender
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {GENDER_OPTIONS.map((gender) => (
                      <button
                        key={gender}
                        type="button"
                        onClick={() =>
                          toggleTargetAudienceArray("gender", gender)
                        }
                        className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                          (formData.target_audience.gender || []).includes(
                            gender
                          )
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-300 bg-white text-gray-700 hover:border-blue-300"
                        }`}
                      >
                        {gender}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block font-medium text-gray-700">
                    Income Levels
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {INCOME_LEVEL_OPTIONS.map((income) => (
                      <button
                        key={income}
                        type="button"
                        onClick={() =>
                          toggleTargetAudienceArray("income_level", income)
                        }
                        className={`rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${
                          (
                            formData.target_audience.income_level || []
                          ).includes(income)
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-300 bg-white text-gray-700 hover:border-blue-300"
                        }`}
                      >
                        {income}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block font-medium text-gray-700">
                    Audience Description
                  </label>
                  <textarea
                    value={formData.target_audience.description || ""}
                    onChange={(e) =>
                      updateTargetAudience("description", e.target.value)
                    }
                    placeholder="Describe your target audience in detail..."
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSubmit("draft")}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-lg bg-gray-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
              >
                <Save className="h-5 w-5" />
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => handleSubmit("active")}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-3 font-semibold text-white transition-colors hover:from-purple-600 hover:to-purple-700 disabled:opacity-50"
              >
                <Eye className="h-5 w-5" />
                {loading ? "Publishing..." : "Publish Campaign"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </AuthGuard>
  );
}
