import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Info } from "lucide-react";
import { supabase } from "../utils/supabase";

const platforms = [
  { name: "YouTube", icon: "/youtube.png" },
  { name: "Instagram", icon: "/instagram.png" },
  { name: "Facebook", icon: "/facebook.png" },
  { name: "TikTok", icon: "/tiktok.png" },
];

const steps = [
  "Role Selection",
  "Personal Details",
  "Platform Selection",
  "Platform Details",
  "Pricing",
  "Profile Picture",
  "Review & Submit",
];

// const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY; // No longer needed in frontend

type BrandData = {
  brand_name: string;
  logo: File | null;
  website_url: string;
  industry: string;
  company_size: string;
  location: string;
  description: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  role: string;
  platforms: string[];
  social_links: Record<string, string>;
  collaboration_types: string[];
  preferred_creator_categories: string[];
  brand_values: string[];
  preferred_tone: string[];
};

const brandInitialState: BrandData = {
  brand_name: "",
  logo: null,
  website_url: "",
  industry: "",
  company_size: "",
  location: "",
  description: "",
  contact_person: "",
  contact_email: "",
  contact_phone: "",
  role: "",
  platforms: [],
  social_links: {},
  collaboration_types: [],
  preferred_creator_categories: [],
  brand_values: [],
  preferred_tone: [],
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState("");
  const [personal, setPersonal] = useState({ name: "", email: "", age: "", gender: "", country: "", category: "", otherCategory: "" });
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [platformDetails, setPlatformDetails] = useState<any>({});
  const [pricing, setPricing] = useState<any>({});
  const [personalError, setPersonalError] = useState("");
  const [platformDetailsError, setPlatformDetailsError] = useState("");
  const [pricingError, setPricingError] = useState("");
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicError, setProfilePicError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [brandStep, setBrandStep] = useState(0);
  const [brandData, setBrandData] = useState<BrandData>(brandInitialState);
  const [brandLogoPreview, setBrandLogoPreview] = useState<string | null>(null);
  const [brandError, setBrandError] = useState("");

  // Memoized preview URL for profile picture to avoid creating new ObjectURLs every render
  const profilePicUrl = useMemo(() => (profilePic ? URL.createObjectURL(profilePic) : null), [profilePic]);
  useEffect(() => {
    return () => {
      if (profilePicUrl) URL.revokeObjectURL(profilePicUrl);
    };
  }, [profilePicUrl]);

  // Revoke brand logo preview when it changes/unmounts
  useEffect(() => {
    return () => {
      if (brandLogoPreview) {
        try { URL.revokeObjectURL(brandLogoPreview); } catch {}
      }
    };
  }, [brandLogoPreview]);

  // Prefill name and email from Google user if available
  useEffect(() => {
    if (user) {
      setPersonal((prev) => ({
        ...prev,
        name: user.user_metadata?.name || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  // Validation for personal details
  const validatePersonal = () => {
    if (!personal.name || personal.name.length < 2) return "Please enter a valid name.";
    if (!personal.email) return "Email is required.";
    if (!personal.age || isNaN(Number(personal.age)) || Number(personal.age) < 10 || Number(personal.age) > 99) return "Please enter a valid age (10-99).";
    if (!personal.gender) return "Please select a gender.";
    if (!personal.category) return "Please select a content category.";
    if (personal.category === "Other" && !personal.otherCategory) return "Please enter your content category.";
    if (!personal.country) return "Please enter a valid country.";
    return "";
  };

  // Validation for platform details
  const validatePlatformDetails = () => {
    for (const platform of selectedPlatforms) {
      const details = platformDetails[platform];
      if (!details) return `Please fill in all details for ${platform}.`;
      if (platform === "YouTube") {
        if (!details.channelUrl || !details.channelId || !details.channelName) return `Please provide a valid YouTube channel for ${platform}.`;
      } else {
        if (!details.profileUrl || !details.followers || !details.posts) return `Please fill in all details for ${platform}.`;
        if (isNaN(Number(details.followers)) || isNaN(Number(details.posts))) return `Followers and posts must be numbers for ${platform}.`;
      }
    }
    return "";
  };

  // Validation for pricing
  const validatePricing = () => {
    for (const platform of selectedPlatforms) {
      const p = pricing[platform];
      if (!p) return `Please fill in pricing for ${platform}.`;
      if (platform === "YouTube") {
        if (!p.per_video_cost || !p.per_short_cost || !p.per_community_post_cost || !p.currency) return `Please fill all YouTube pricing fields.`;
        if ([p.per_video_cost, p.per_short_cost, p.per_community_post_cost].some(v => isNaN(Number(v)))) return `YouTube pricing must be numbers.`;
      } else if (platform === "Instagram") {
        if (!p.per_post_cost || !p.per_story_cost || !p.per_reel_cost || !p.currency) return `Please fill all Instagram pricing fields.`;
        if ([p.per_post_cost, p.per_story_cost, p.per_reel_cost].some(v => isNaN(Number(v)))) return `Instagram pricing must be numbers.`;
      } else if (platform === "Facebook") {
        if (!p.per_post_cost || !p.currency) return `Please fill all Facebook pricing fields.`;
        if (isNaN(Number(p.per_post_cost))) return `Facebook pricing must be a number.`;
      } else if (platform === "TikTok") {
        if (!p.per_video_cost || !p.currency) return `Please fill all TikTok pricing fields.`;
        if (isNaN(Number(p.per_video_cost))) return `TikTok pricing must be a number.`;
      }
    }
    return "";
  };

  // Step 1: Role Selection
  const renderRoleStep = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Are you a Brand or a Creator?</h2>
      <div className="flex gap-8 justify-center">
        <button
          className={`flex flex-col items-center px-8 py-4 rounded-xl border-2 text-lg font-semibold transition-all duration-200 shadow-sm w-48 h-48 ${role === "brand" ? "border-purple-600 bg-purple-50" : "border-gray-300 bg-white"}`}
          onClick={() => setRole("brand")}
        >
          <img src="/brand.png" alt="Brand" className="h-20 w-20 mb-2" />
          <span className="font-bold text-xl">Brand</span>
        </button>
        <button
          className={`flex flex-col items-center px-8 py-4 rounded-xl border-2 text-lg font-semibold transition-all duration-200 shadow-sm w-48 h-48 ${role === "creator" ? "border-purple-600 bg-purple-50" : "border-gray-300 bg-white"}`}
          onClick={() => setRole("creator")}
        >
          <img src="/contnetcreator.png" alt="Content Creator" className="h-20 w-20 mb-2" />
          <span className="font-bold text-xl">Content Creator</span>
        </button>
      </div>
    </div>
  );

  // Step 2: Personal Details
  const genderOptions = ["Male", "Female", "Non-binary", "Prefer not to say"];
  const categoryOptions = [
    "Tech",
    "Fashion",
    "Travel",
    "Food",
    "Fitness",
    "Beauty",
    "Gaming",
    "Education",
    "Music",
    "Finance",
    "Other",
  ];
  const renderPersonalStep = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Personal Details</h2>
      <form className="grid grid-cols-1 gap-4 max-w-lg mx-auto">
        <input
          type="text"
          placeholder="Name"
          value={personal.name}
          onChange={e => {
            // Only allow letters, spaces, and basic punctuation
            const value = e.target.value.replace(/[^a-zA-Z\s.'-]/g, "");
            setPersonal({ ...personal, name: value });
          }}
          className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={personal.email}
          onChange={e => setPersonal({ ...personal, email: e.target.value })}
          className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled
        />
        <input
          type="number"
          placeholder="Age"
          value={personal.age}
          onChange={e => {
            // Only allow numbers and limit to 2 digits
            let value = e.target.value.replace(/[^0-9]/g, "");
            if (value.length > 2) value = value.slice(0, 2);
            setPersonal({ ...personal, age: value });
          }}
          className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          min={10}
          max={99}
          required
        />
        <select
          value={personal.gender}
          onChange={e => setPersonal({ ...personal, gender: e.target.value })}
          className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        >
          <option value="" disabled>
            Select Gender
          </option>
          {genderOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <select
          value={personal.category}
          onChange={e => setPersonal({ ...personal, category: e.target.value })}
          className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        >
          <option value="" disabled>
            Select Content Category
          </option>
          {categoryOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {personal.category === "Other" && (
          <input
            type="text"
            placeholder="Enter your content category"
            value={personal.otherCategory || ""}
            onChange={e => setPersonal({ ...personal, otherCategory: e.target.value })}
            className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        )}
        <input
          type="text"
          placeholder="Country"
          value={personal.country}
          onChange={e => {
            // Only allow letters and spaces
            const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
            setPersonal({ ...personal, country: value });
          }}
          className="px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
      </form>
      {personalError && <div className="text-red-500 text-sm mt-2">{personalError}</div>}
    </div>
  );

  // Step 3: Platform Selection
  const renderPlatformStep = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Which platforms do you use?</h2>
      <div className="flex flex-wrap gap-6 justify-center">
        {platforms.map((platform) => (
          <button
            key={platform.name}
            type="button"
            onClick={() => {
              setSelectedPlatforms((prev) =>
                prev.includes(platform.name)
                  ? prev.filter((p) => p !== platform.name)
                  : [...prev, platform.name]
              );
            }}
            className={`flex flex-col items-center px-6 py-4 rounded-xl border-2 transition-all duration-200 shadow-sm w-32 h-36 ${selectedPlatforms.includes(platform.name) ? "border-purple-600 bg-purple-50" : "border-gray-300 bg-white"}`}
          >
            <img src={platform.icon} alt={platform.name} className="h-12 w-12 mb-2" />
            <span className="font-semibold text-lg">{platform.name}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // Step 4: Platform Details
  const renderPlatformDetailsStep = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Platform Details</h2>
      <div className="space-y-8">
        {selectedPlatforms.map((platform) => (
          <div key={platform} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow">
            <div className="flex items-center gap-4 mb-4">
              <img src={platforms.find(p => p.name === platform)?.icon} alt={platform} className="h-8 w-8" />
              <span className="font-semibold text-lg">{platform}</span>
            </div>
            {platform === "YouTube" && (
              <YouTubeDetails
                details={platformDetails[platform] || {}}
                setDetails={d => setPlatformDetails((prev: any) => ({ ...prev, [platform]: d }))}
              />
            )}
            {platform === "Instagram" && (
              <InstagramDetails
                details={platformDetails[platform] || {}}
                setDetails={d => setPlatformDetails((prev: any) => ({ ...prev, [platform]: d }))}
              />
            )}
            {platform === "Facebook" && (
              <FacebookDetails
                details={platformDetails[platform] || {}}
                setDetails={d => setPlatformDetails((prev: any) => ({ ...prev, [platform]: d }))}
              />
            )}
            {platform === "TikTok" && (
              <TikTokDetails
                details={platformDetails[platform] || {}}
                setDetails={d => setPlatformDetails((prev: any) => ({ ...prev, [platform]: d }))}
              />
            )}
          </div>
        ))}
      </div>
      {platformDetailsError && <div className="text-red-500 text-sm mt-2">{platformDetailsError}</div>}
    </div>
  );

  // Step 5: Pricing
  const renderPricingStep = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Set Your Pricing</h2>
      <div className="space-y-8">
        {selectedPlatforms.map((platform) => (
          <div key={platform} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 shadow">
            <div className="flex items-center gap-4 mb-4">
              <img src={platforms.find(p => p.name === platform)?.icon} alt={platform} className="h-8 w-8" />
              <span className="font-semibold text-lg">{platform}</span>
            </div>
            {platform === "YouTube" && (
              <YouTubePricing
                pricing={pricing[platform] || {}}
                setPricing={d => setPricing((prev: any) => ({ ...prev, [platform]: d }))}
              />
            )}
            {platform === "Instagram" && (
              <InstagramPricing
                pricing={pricing[platform] || {}}
                setPricing={d => setPricing((prev: any) => ({ ...prev, [platform]: d }))}
              />
            )}
            {platform === "Facebook" && (
              <FacebookPricing
                pricing={pricing[platform] || {}}
                setPricing={d => setPricing((prev: any) => ({ ...prev, [platform]: d }))}
              />
            )}
            {platform === "TikTok" && (
              <TikTokPricing
                pricing={pricing[platform] || {}}
                setPricing={d => setPricing((prev: any) => ({ ...prev, [platform]: d }))}
              />
            )}
          </div>
        ))}
      </div>
      {pricingError && <div className="text-red-500 text-sm mt-2">{pricingError}</div>}
    </div>
  );

  // Step 5: Profile Picture Upload (new step)
  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfilePicError("");
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 3 * 1024 * 1024) {
        setProfilePicError("File size must be less than 3MB.");
        setProfilePic(null);
        return;
      }
      setProfilePic(file);
    }
  };

  const renderProfilePicStep = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Upload Profile Picture</h2>
      <div className="flex flex-col items-start gap-2">
        <label htmlFor="profile-pic-upload" className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold cursor-pointer hover:bg-purple-700 transition-colors">
          Choose File
        </label>
        <input
          id="profile-pic-upload"
          type="file"
          accept="image/*"
          onChange={handleProfilePicChange}
          className="hidden"
        />
        <div className="flex items-center gap-4 mt-2">
          {(profilePicUrl || user?.user_metadata?.avatar_url) ? (
            <img
              src={profilePicUrl ?? user?.user_metadata?.avatar_url}
              alt="Profile Preview"
              className="h-20 w-20 rounded-full object-cover border-2 border-purple-500"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
          )}
          {profilePic && <div className="text-sm">{profilePic.name}</div>}
        </div>
        {profilePicError && <div className="text-red-500 text-sm mt-2">{profilePicError}</div>}
        <div className="text-xs text-gray-500 mt-2">Max file size: 3MB. You can skip this step if you want to use your Google/YouTube profile image.</div>
      </div>
    </div>
  );

  // Step 6: Review & Submit
  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");
    setProgress(0);
    let profile_image_url = null;
    try {
      // 1. Upload profile picture if provided
      if (profilePic) {
        setProgress(20);
        const ext = profilePic.name.includes('.') ? profilePic.name.split('.').pop()!.toLowerCase() : undefined;
        const fileName = `${user?.id}_${Date.now()}${ext ? `.${ext}` : ''}`;
        const { data, error } = await supabase
          .storage.from('profile-pictures')
          .upload(fileName, profilePic, { contentType: profilePic.type, cacheControl: '3600', upsert: false });
        if (error) throw error;
        profile_image_url = `${supabase.storage.from('profile-pictures').getPublicUrl(fileName).data.publicUrl}`;
      } else if (user?.user_metadata?.avatar_url) {
        profile_image_url = user.user_metadata.avatar_url;
      }
      setProgress(40);
      // 2. Ensure auth and upsert users row
      const categoryToSave = personal.category === 'Other' ? personal.otherCategory : personal.category;
      if (!user?.id || !user?.email) throw new Error('You must be signed in to submit onboarding.');
      const { error: userError } = await supabase.from('users').upsert({
        id: user.id,
        email: user.email,
        username: personal.name,
        age: Number(personal.age),
        gender: personal.gender,
        country: personal.country,
        category: categoryToSave,
        profile_image: profile_image_url,
        role,
      }, { onConflict: 'id' });
      if (userError) throw userError;
      setProgress(60);
      // 3. Insert social_profiles for each platform
      for (const platform of selectedPlatforms) {
        const details = platformDetails[platform];
        const p = pricing[platform];
        const profileData: any = {
          user_id: user?.id,
          platform,
          per_post_cost: p?.per_post_cost ? Number(p.per_post_cost) : null,
          per_story_cost: p?.per_story_cost ? Number(p.per_story_cost) : null,
          per_reel_cost: p?.per_reel_cost ? Number(p.per_reel_cost) : null,
          per_video_cost: p?.per_video_cost ? Number(p.per_video_cost) : null,
          per_short_cost: p?.per_short_cost ? Number(p.per_short_cost) : null,
          per_community_post_cost: p?.per_community_post_cost ? Number(p.per_community_post_cost) : null,
          per_post_cost_currency: p?.currency || null,
          per_story_cost_currency: p?.currency || null,
          per_reel_cost_currency: p?.currency || null,
          per_video_cost_currency: p?.currency || null,
          per_short_cost_currency: p?.currency || null,
          per_community_post_cost_currency: p?.currency || null,
        };
        if (platform === 'YouTube') {
          Object.assign(profileData, {
            channel_id: details.channelId,
            channel_name: details.channelName,
            profile_image: details.profile_image,
            subscriber_count: details.subscriber_count ? Number(details.subscriber_count) : null,
            total_views: details.total_views ? Number(details.total_views) : null,
            video_count: details.video_count ? Number(details.video_count) : null,
            channel_url: details.channelUrl,
          });
        } else {
          Object.assign(profileData, {
            username: details.profileUrl,
            followers: details.followers ? Number(details.followers) : null,
            posts: details.posts ? Number(details.posts) : null,
            profile_image: null,
            channel_url: details.profileUrl,
          });
        }
        // Upsert to avoid duplicates
        const { error: spError } = await supabase.from('social_profiles').upsert(profileData, { onConflict: 'user_id,platform' });
        if (spError) throw spError;
      }
      setProgress(90);
      setSubmitSuccess('Onboarding complete! Your details have been saved.');
      setProgress(100);
      // Route based on role
      if (role === "brand") {
        setTimeout(() => navigate('/brand/dashboard'), 1200);
      } else {
        setTimeout(() => navigate('/dashboard'), 1200);
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit onboarding data.');
      setProgress(0);
    } finally {
      setSubmitting(false);
    }
  };

  const renderReviewStep = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Review & Submit</h2>
      {submitting && (
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
          <div
            className="bg-purple-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
      <div className="mb-4">
        <label className="block font-medium mb-2">Profile Picture</label>
        <div className="flex items-center gap-4">
          {(profilePic || user?.user_metadata?.avatar_url) ? (
            <img
              src={profilePic ? URL.createObjectURL(profilePic) : user?.user_metadata?.avatar_url}
              alt="Profile Preview"
              className="h-20 w-20 rounded-full object-cover border-2 border-purple-500"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
          )}
          {profilePic && <div className="text-sm">{profilePic.name}</div>}
        </div>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold">Personal Details</h3>
        <ul className="text-sm">
          <li><b>Name:</b> {personal.name}</li>
          <li><b>Email:</b> {personal.email}</li>
          <li><b>Age:</b> {personal.age}</li>
          <li><b>Gender:</b> {personal.gender}</li>
          <li><b>Country:</b> {personal.country}</li>
          <li><b>Category:</b> {personal.category === 'Other' ? personal.otherCategory : personal.category}</li>
        </ul>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold">Platforms</h3>
        {selectedPlatforms.map(platform => (
          <div key={platform} className="mb-2">
            <b>{platform}</b>
            <ul className="text-sm ml-4">
              {platform === 'YouTube' ? (
                <>
                  <li><b>Channel Name:</b> {platformDetails[platform]?.channelName}</li>
                  <li><b>Subscribers:</b> {platformDetails[platform]?.subscriber_count}</li>
                  <li><b>Videos:</b> {platformDetails[platform]?.video_count}</li>
                  <li><b>Views:</b> {platformDetails[platform]?.total_views}</li>
                  <li><b>Channel URL:</b> {platformDetails[platform]?.channelUrl}</li>
                  <li><b>Pricing:</b> Video: {pricing[platform]?.per_video_cost}, Short: {pricing[platform]?.per_short_cost}, Community Post: {pricing[platform]?.per_community_post_cost} ({pricing[platform]?.currency})</li>
                </>
              ) : (
                <>
                  <li><b>Profile URL:</b> {platformDetails[platform]?.profileUrl}</li>
                  <li><b>Followers:</b> {platformDetails[platform]?.followers}</li>
                  <li><b>Posts:</b> {platformDetails[platform]?.posts}</li>
                  <li><b>Pricing:</b> {platform === 'Instagram' ? `Post: ${pricing[platform]?.per_post_cost}, Story: ${pricing[platform]?.per_story_cost}, Reel: ${pricing[platform]?.per_reel_cost}` : `Post/Video: ${pricing[platform]?.per_post_cost || pricing[platform]?.per_video_cost}`} ({pricing[platform]?.currency})</li>
                </>
              )}
            </ul>
          </div>
        ))}
      </div>
      {submitError && <div className="text-red-500 text-sm mb-2">{submitError}</div>}
      {submitSuccess && <div className="text-green-600 text-sm mb-2">{submitSuccess}</div>}
    </div>
  );

  const handleNext = () => {
    if (step === 1) {
      const err = validatePersonal();
      if (err) {
        setPersonalError(err);
        return;
      } else {
        setPersonalError("");
      }
    }
    if (step === 3) {
      const err = validatePlatformDetails();
      if (err) {
        setPlatformDetailsError(err);
        return;
      } else {
        setPlatformDetailsError("");
      }
    }
    if (step === 4) {
      const err = validatePricing();
      if (err) {
        setPricingError(err);
        return;
      } else {
        setPricingError("");
      }
    }
    if (step < steps.length - 1) setStep(step + 1);
  };
  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  // Brand onboarding steps
  const brandSteps = [
    "Brand Details",
    "Contact Information",
    "Platforms",
    "Social Links",
    "Collaboration Preferences",
    "Review & Submit",
  ];

  // Brand Step 1: Brand Details
  const companySizes = ["1-10", "11-50", "51-200", "201-1000", "1000+"];
  const industries = ["Tech", "Fashion", "Travel", "Food", "Fitness", "Beauty", "Gaming", "Education", "Music", "Finance", "Other"];
  const handleBrandLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Revoke previous preview if present
      if (brandLogoPreview) {
        try { URL.revokeObjectURL(brandLogoPreview); } catch {}
      }
      const url = URL.createObjectURL(file);
      setBrandData({ ...brandData, logo: file });
      setBrandLogoPreview(url);
    }
  };
  const renderBrandDetailsStep = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Brand Details</h2>
      <input
        type="text"
        placeholder="Brand Name"
        value={brandData.brand_name}
        onChange={e => setBrandData({ ...brandData, brand_name: e.target.value })}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 mb-2"
      />
      <label className="block font-medium mb-1">Logo (optional)</label>
      <label htmlFor="brand-logo-upload" className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold cursor-pointer hover:bg-purple-700 mb-2">Choose Logo</label>
      <input id="brand-logo-upload" type="file" accept="image/*" onChange={handleBrandLogoChange} className="hidden" />
      {brandLogoPreview && <img src={brandLogoPreview} alt="Logo Preview" className="h-16 w-16 rounded-full object-cover border mb-2" />}
      <input
        type="text"
        placeholder="Website URL"
        value={brandData.website_url}
        onChange={e => setBrandData({ ...brandData, website_url: e.target.value })}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 mb-2"
      />
      <select
        value={brandData.industry}
        onChange={e => setBrandData({ ...brandData, industry: e.target.value })}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 mb-2"
      >
        <option value="" disabled>Select Industry</option>
        {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
      </select>
      <select
        value={brandData.company_size}
        onChange={e => setBrandData({ ...brandData, company_size: e.target.value })}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 mb-2"
      >
        <option value="" disabled>Select Company Size</option>
        {companySizes.map(size => <option key={size} value={size}>{size}</option>)}
      </select>
      <input
        type="text"
        placeholder="Location"
        value={brandData.location}
        onChange={e => setBrandData({ ...brandData, location: e.target.value })}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 mb-2"
      />
      <textarea
        placeholder="Description"
        value={brandData.description}
        onChange={e => setBrandData({ ...brandData, description: e.target.value })}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 mb-2"
        rows={3}
      />
    </div>
  );

  // Brand Step 2: Contact Information
  const renderBrandContactStep = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
      <input
        type="text"
        placeholder="Contact Person"
        value={brandData.contact_person}
        onChange={e => setBrandData({ ...brandData, contact_person: e.target.value })}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 mb-2"
      />
      <input
        type="email"
        placeholder="Contact Email"
        value={brandData.contact_email}
        onChange={e => setBrandData({ ...brandData, contact_email: e.target.value })}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 mb-2"
      />
      <input
        type="text"
        placeholder="Contact Phone"
        value={brandData.contact_phone}
        onChange={e => setBrandData({ ...brandData, contact_phone: e.target.value })}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 mb-2"
      />
      <input
        type="text"
        placeholder="Role at Company"
        value={brandData.role}
        onChange={e => setBrandData({ ...brandData, role: e.target.value })}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 mb-2"
      />
    </div>
  );

  // Brand Step 3: Platforms
  const allBrandPlatforms = [
    { name: "Instagram", key: "instagram_url" },
    { name: "YouTube", key: "youtube_url" },
    { name: "Facebook", key: "facebook_url" },
    { name: "Twitter", key: "twitter_url" },
    { name: "LinkedIn", key: "linkedin_url" },
    // Add TikTok if needed
  ];
  const renderBrandPlatformsStep = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Which platforms is your brand on?</h2>
      <div className="flex flex-wrap gap-4">
        {allBrandPlatforms.map(platform => (
          <button
            key={platform.name}
            type="button"
            onClick={() => {
              setBrandData(prev => {
                const exists = prev.platforms.includes(platform.name);
                return {
                  ...prev,
                  platforms: exists
                    ? prev.platforms.filter(p => p !== platform.name)
                    : [...prev.platforms, platform.name],
                };
              });
            }}
            className={`px-6 py-3 rounded-lg border-2 font-semibold ${brandData.platforms.includes(platform.name) ? "border-purple-600 bg-purple-50" : "border-gray-300 bg-white"}`}
          >
            {platform.name}
          </button>
        ))}
      </div>
    </div>
  );

  // Brand Step 4: Social Links (conditional)
  const socialLinkExamples: Record<string, string> = {
    instagram_url: "https://instagram.com/yourbrand",
    youtube_url: "https://youtube.com/yourbrand",
    facebook_url: "https://facebook.com/yourbrand",
    twitter_url: "https://twitter.com/yourbrand",
    linkedin_url: "https://linkedin.com/company/yourbrand",
  };
  const renderBrandSocialLinksStep = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Social Links</h2>
      {brandData.platforms.map(platform => {
        const key = allBrandPlatforms.find(p => p.name === platform)?.key;
        if (!key) return null;
        return (
          <div key={platform} className="mb-2">
            <label className="block font-medium mb-1">{platform} URL</label>
            <input
              type="text"
              placeholder={socialLinkExamples[key] || `Enter your ${platform} URL`}
              value={brandData.social_links[key] || ""}
              onChange={e => setBrandData({
                ...brandData,
                social_links: { ...brandData.social_links, [key]: e.target.value },
              })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300"
            />
          </div>
        );
      })}
    </div>
  );

  // Brand Step 5: Collaboration Preferences
  const collabTypes = ["Sponsored Posts", "Giveaways", "Product Reviews", "Long-term Partnerships", "Affiliate Marketing", "Events", "Content Creation", "Brand Ambassadorship", "Social Media Takeover", "Other"];
  const creatorCategories = ["Tech", "Fashion", "Travel", "Food", "Fitness", "Beauty", "Gaming", "Education", "Music", "Finance", "Other"];
  const brandValues = ["Sustainability", "Innovation", "Diversity", "Quality", "Community", "Transparency", "Customer Focus", "Creativity", "Integrity", "Other"];
  const tones = ["Professional", "Friendly", "Humorous", "Inspirational", "Bold", "Casual", "Formal", "Playful", "Serious", "Other"];
  const toggleMultiSelect = (field: keyof BrandData, value: string) => {
    setBrandData(prev => {
      const arr = prev[field] as string[];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
      };
    });
  };
  const renderBrandCollabPrefsStep = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Collaboration Preferences</h2>
      <div className="mb-4">
        <label className="block font-medium mb-1">Collaboration Types</label>
        <div className="flex flex-wrap gap-2">
          {collabTypes.map(type => (
            <button
              key={type}
              type="button"
              onClick={() => toggleMultiSelect("collaboration_types", type)}
              className={`px-4 py-2 rounded-lg border-2 text-sm ${brandData.collaboration_types.includes(type) ? "border-purple-600 bg-purple-50" : "border-gray-300 bg-white"}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Preferred Creator Categories</label>
        <div className="flex flex-wrap gap-2">
          {creatorCategories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => toggleMultiSelect("preferred_creator_categories", cat)}
              className={`px-4 py-2 rounded-lg border-2 text-sm ${brandData.preferred_creator_categories.includes(cat) ? "border-purple-600 bg-purple-50" : "border-gray-300 bg-white"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Brand Values</label>
        <div className="flex flex-wrap gap-2">
          {brandValues.map(val => (
            <button
              key={val}
              type="button"
              onClick={() => toggleMultiSelect("brand_values", val)}
              className={`px-4 py-2 rounded-lg border-2 text-sm ${brandData.brand_values.includes(val) ? "border-purple-600 bg-purple-50" : "border-gray-300 bg-white"}`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Preferred Tone</label>
        <div className="flex flex-wrap gap-2">
          {tones.map(tone => (
            <button
              key={tone}
              type="button"
              onClick={() => toggleMultiSelect("preferred_tone", tone)}
              className={`px-4 py-2 rounded-lg border-2 text-sm ${brandData.preferred_tone.includes(tone) ? "border-purple-600 bg-purple-50" : "border-gray-300 bg-white"}`}
            >
              {tone}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Brand step validation
  const validateBrandStep = () => {
    if (brandStep === 0) {
      if (!brandData.brand_name) return "Brand name is required.";
      if (!brandData.website_url) return "Website URL is required.";
      if (!brandData.industry) return "Industry is required.";
      if (!brandData.company_size) return "Company size is required.";
      if (!brandData.location) return "Location is required.";
      if (!brandData.description) return "Description is required.";
    }
    if (brandStep === 1) {
      if (!brandData.contact_person) return "Contact person is required.";
      if (!brandData.contact_email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(brandData.contact_email)) return "Valid contact email is required.";
    }
    if (brandStep === 2) {
      if (!brandData.platforms.length) return "Select at least one platform.";
    }
    if (brandStep === 3) {
      for (const platform of brandData.platforms) {
        const key = allBrandPlatforms.find(p => p.name === platform)?.key;
        if (key && !brandData.social_links[key]) return `Enter your ${platform} URL.`;
        if (key && brandData.social_links[key] && !/^https?:\/\//.test(brandData.social_links[key])) return `${platform} URL must start with http:// or https://`;
      }
    }
    if (brandStep === 4) {
      if (!brandData.collaboration_types.length) return "Select at least one collaboration type.";
      if (!brandData.preferred_creator_categories.length) return "Select at least one creator category.";
      if (!brandData.brand_values.length) return "Select at least one brand value.";
      if (!brandData.preferred_tone.length) return "Select at least one preferred tone.";
    }
    return "";
  };
  const handleBrandNext = () => {
    const err = validateBrandStep();
    if (err) {
      setBrandError(err);
      return;
    } else {
      setBrandError("");
    }
    if (brandStep < brandSteps.length - 1) setBrandStep(brandStep + 1);
  };
  const handleBrandBack = () => {
    if (brandStep > 0) setBrandStep(brandStep - 1);
  };

  // Brand Step 6: Review & Submit
  const [brandSubmitting, setBrandSubmitting] = useState(false);
  const [brandSubmitError, setBrandSubmitError] = useState("");
  const [brandSubmitSuccess, setBrandSubmitSuccess] = useState("");
  const handleBrandSubmit = async () => {
    setBrandSubmitting(true);
    setBrandSubmitError("");
    setBrandSubmitSuccess("");
    let logo_url = null;
    try {
  if (!user?.id || !user?.email) throw new Error("Please sign in to finish brand onboarding.");
      // 0. Ensure user exists in users table (upsert)
      if (user) {
        const upsertUser = {
          id: user.id,
          email: user.email,
          username: user.user_metadata?.name || user.email || `user_${user.id}`,
          role: 'brand',
        };
        const { error: upsertError } = await supabase.from('users').upsert(upsertUser, { onConflict: 'id' });
        if (upsertError) throw upsertError;
      }
      // 1. Upload logo if provided
      if (brandData.logo instanceof File) {
        const ext = brandData.logo.name.includes('.') ? brandData.logo.name.split('.').pop()!.toLowerCase() : undefined;
        const fileName = `${user!.id}_${Date.now()}${ext ? `.${ext}` : ''}`;
        const { data, error } = await supabase
          .storage.from('brand-logos')
          .upload(fileName, brandData.logo, { contentType: brandData.logo.type, cacheControl: '3600', upsert: false });
        if (error) throw error;
        logo_url = supabase.storage.from('brand-logos').getPublicUrl(fileName).data.publicUrl;
      }
      // 2. Insert into brands table
      const { error: brandError } = await supabase.from('brands').insert({
        user_id: user?.id,
        brand_name: brandData.brand_name,
        logo_url,
        website_url: brandData.website_url,
        industry: brandData.industry,
        company_size: brandData.company_size,
        location: brandData.location,
        description: brandData.description,
        contact_person: brandData.contact_person,
        contact_email: brandData.contact_email,
        contact_phone: brandData.contact_phone,
        role: brandData.role,
        instagram_url: brandData.social_links.instagram_url || null,
        facebook_url: brandData.social_links.facebook_url || null,
        twitter_url: brandData.social_links.twitter_url || null,
        linkedin_url: brandData.social_links.linkedin_url || null,
        youtube_url: brandData.social_links.youtube_url || null,
        collaboration_types: brandData.collaboration_types,
        preferred_creator_categories: brandData.preferred_creator_categories,
        brand_values: brandData.brand_values,
        preferred_tone: brandData.preferred_tone,
        platforms: brandData.platforms,
      });
      if (brandError) throw brandError;
      setBrandSubmitSuccess("Brand onboarding complete! Redirecting to dashboard...");
      // Clear localStorage for brand onboarding
      localStorage.removeItem("brandStep");
      localStorage.removeItem("brandData");
      setTimeout(() => navigate("/brand/dashboard"), 1200);
    } catch (err: any) {
      setBrandSubmitError(err.message || "Failed to submit brand onboarding data.");
    } finally {
      setBrandSubmitting(false);
    }
  };
  const renderBrandReviewStep = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Review & Submit</h2>
      <div className="mb-4">
        <label className="block font-medium mb-2">Logo</label>
        {(brandLogoPreview || (brandData.logo instanceof File ? brandLogoPreview : undefined)) ? (
          <img src={(brandLogoPreview || (brandData.logo instanceof File ? brandLogoPreview : undefined)) ?? ''} alt="Logo Preview" className="h-16 w-16 rounded-full object-cover border mb-2" />
        ) : (
          <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">No Logo</div>
        )}
      </div>
      <div className="mb-4">
        <h3 className="font-semibold">Brand Details</h3>
        <ul className="text-sm">
          <li><b>Name:</b> {brandData.brand_name}</li>
          <li><b>Website:</b> {brandData.website_url}</li>
          <li><b>Industry:</b> {brandData.industry}</li>
          <li><b>Company Size:</b> {brandData.company_size}</li>
          <li><b>Location:</b> {brandData.location}</li>
          <li><b>Description:</b> {brandData.description}</li>
        </ul>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold">Contact Information</h3>
        <ul className="text-sm">
          <li><b>Contact Person:</b> {brandData.contact_person}</li>
          <li><b>Email:</b> {brandData.contact_email}</li>
          <li><b>Phone:</b> {brandData.contact_phone}</li>
          <li><b>Role:</b> {brandData.role}</li>
        </ul>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold">Platforms & Social Links</h3>
        <ul className="text-sm">
          {brandData.platforms.map(platform => {
            const key = allBrandPlatforms.find(p => p.name === platform)?.key;
            return (
              <li key={platform}><b>{platform}:</b> {key ? brandData.social_links[key] : ""}</li>
            );
          })}
        </ul>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold">Collaboration Preferences</h3>
        <ul className="text-sm">
          <li><b>Collaboration Types:</b> {brandData.collaboration_types.join(", ")}</li>
          <li><b>Preferred Creator Categories:</b> {brandData.preferred_creator_categories.join(", ")}</li>
          <li><b>Brand Values:</b> {brandData.brand_values.join(", ")}</li>
          <li><b>Preferred Tone:</b> {brandData.preferred_tone.join(", ")}</li>
        </ul>
      </div>
      {brandSubmitError && <div className="text-red-500 text-sm mb-2">{brandSubmitError}</div>}
      {brandSubmitSuccess && <div className="text-green-600 text-sm mb-2">{brandSubmitSuccess}</div>}
      <button
        type="button"
        onClick={handleBrandSubmit}
        disabled={brandSubmitting}
        className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold disabled:opacity-50"
      >
        {brandSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </div>
  );

  // Persist and restore brand onboarding state
  useEffect(() => {
    const savedStep = localStorage.getItem("brandStep");
    const savedData = localStorage.getItem("brandData");
    if (savedStep) setBrandStep(Number(savedStep));
    if (savedData) {
      const parsed = JSON.parse(savedData);
      if (parsed.logo) parsed.logo = null;
      setBrandData(parsed);
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("brandStep", String(brandStep));
    localStorage.setItem("brandData", JSON.stringify(brandData));
  }, [brandStep, brandData]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        {/* Stepper UI */}
        <div className="flex justify-between mb-8">
          {role === "brand"
            ? brandSteps.map((label, idx) => (
                <div key={label} className={`flex-1 text-center text-xs font-semibold ${idx === brandStep ? "text-purple-600" : "text-gray-400"}`}>{label}</div>
              ))
            : steps.map((label, idx) => (
                <div key={label} className={`flex-1 text-center text-xs font-semibold ${idx === step ? "text-purple-600" : "text-gray-400"}`}>{label}</div>
              ))}
        </div>
        {/* Step Content */}
        <div className="mb-8">
          {role === "brand" ? (
            <>
              {brandStep === 0 && renderBrandDetailsStep()}
              {brandStep === 1 && renderBrandContactStep()}
              {brandStep === 2 && renderBrandPlatformsStep()}
              {brandStep === 3 && renderBrandSocialLinksStep()}
              {brandStep === 4 && renderBrandCollabPrefsStep()}
              {brandStep === 5 && renderBrandReviewStep()}
            </>
          ) : (
            <>
              {step === 0 && renderRoleStep()}
              {step === 1 && renderPersonalStep()}
              {step === 2 && renderPlatformStep()}
              {step === 3 && renderPlatformDetailsStep()}
              {step === 4 && renderPricingStep()}
              {step === 5 && renderProfilePicStep()}
              {step === 6 && renderReviewStep()}
            </>
          )}
        </div>
        {/* Navigation */}
        <div className="flex justify-between">
          {role === "brand" ? (
            <>
              <button
                onClick={handleBrandBack}
                disabled={brandStep === 0}
                className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold disabled:opacity-50"
              >
                Back
              </button>
              {brandStep < brandSteps.length - 1 ? (
                <button
                  onClick={handleBrandNext}
                  disabled={!!validateBrandStep()}
                  className="px-6 py-2 rounded-lg bg-purple-600 text-white font-semibold disabled:opacity-50"
                >
                  Next
                </button>
              ) : null}
            </>
          ) : (
            <>
              <button
                onClick={handleBack}
                disabled={step === 0}
                className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold disabled:opacity-50"
              >
                Back
              </button>
              {step < steps.length - 1 ? (
                <button
                  onClick={handleNext}
                  disabled={
                    (step === 0 && !role) ||
                    (step === 1 && !!validatePersonal()) ||
                    (step === 2 && selectedPlatforms.length === 0) ||
                    (step === 3 && !!validatePlatformDetails()) ||
                    (step === 4 && !!validatePricing()) ||
                    (step === 5 && !!profilePicError)
                  }
                  className="px-6 py-2 rounded-lg bg-purple-600 text-white font-semibold disabled:opacity-50"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              )}
            </>
          )}
        </div>
        {brandError && <div className="text-red-500 text-sm mt-2">{brandError}</div>}
      </div>
    </div>
  );
}

// Platform detail components
function YouTubeDetails({ details, setDetails }: { details: any, setDetails: (d: any) => void }) {
  const [input, setInput] = useState(details.channelUrl || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showInfo, setShowInfo] = useState(false);

  const fetchChannel = async () => {
    setLoading(true);
    setError("");
    let channelId = input;
    // Extract channel ID from URL if needed
    if (input.includes("youtube.com")) {
      const match = input.match(/(?:channel\/|user\/|c\/)?([\w-]{21,})/);
      if (match) channelId = match[1];
    }
    try {
      const res = await fetch(
        `/youtube/channel-info?channelId=${encodeURIComponent(channelId)}`
      );
      if (!res.ok) {
        let errMsg = `Error: ${res.status}`;
        try {
          const errData = await res.json();
          if (errData && errData.detail) errMsg = errData.detail;
        } catch {}
        setError(errMsg);
        return;
      }
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        const ch = data.items[0];
        setDetails({
          channelUrl: input,
          channelId: ch.id,
          channelName: ch.snippet.title,
          profile_image: ch.snippet.thumbnails.default.url,
          subscriber_count: ch.statistics.subscriberCount,
          total_views: ch.statistics.viewCount,
          video_count: ch.statistics.videoCount,
        });
      } else {
        setError("Channel not found");
      }
    } catch (e) {
      setError("Failed to fetch channel. Please check your network connection or try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
  <label className="flex font-medium items-center gap-2">
        YouTube Channel URL or ID
        <button
          type="button"
          onClick={() => setShowInfo(true)}
          className="ml-1 text-purple-600 hover:text-purple-800 focus:outline-none"
          aria-label="How to find your YouTube channel URL or ID"
        >
          <Info className="h-4 w-4" />
        </button>
      </label>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        className="w-full px-4 py-2 rounded border border-gray-300"
        placeholder="e.g. https://www.youtube.com/channel/UCxxxxxxxxxxxxxxxxxxx or channel ID"
      />
      {/* Info Dialog */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowInfo(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h3 className="text-lg font-bold mb-2">How to find your YouTube Channel URL or ID</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-200">
              <li>Go to <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 underline">youtube.com</a> and sign in.</li>
              <li>Click your profile picture at the top right and select <b>Your Channel</b>.</li>
              <li>Click <b>Customize Channel</b> (top right).</li>
              <li>Go to the <b>Basic info</b> tab.</li>
              <li>Find the <b>Channel URL</b> section and copy the URL shown there.</li>
              <li>Paste the full Channel URL above (e.g. <span className="font-mono">https://www.youtube.com/channel/UCxxxxxxxxxxxxxxxxxxx</span>).</li>
            </ol>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={fetchChannel}
        className="px-4 py-2 bg-purple-600 text-white rounded"
        disabled={loading || !input}
      >
        {loading ? "Fetching..." : "Fetch Channel"}
      </button>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {details.channelName && (
        <div className="mt-2 p-2 bg-gray-100 rounded">
          <div><b>Name:</b> {details.channelName}</div>
          <div><b>Subscribers:</b> {details.subscriber_count}</div>
          <div><b>Videos:</b> {details.video_count}</div>
          <div><b>Views:</b> {details.total_views}</div>
        </div>
      )}
    </div>
  );
}

function InstagramDetails({ details, setDetails }: { details: any, setDetails: (d: any) => void }) {
  return (
    <div className="space-y-2">
      <label className="block font-medium">Instagram Profile URL</label>
      <input
        type="text"
        value={details.profileUrl || ""}
        onChange={e => setDetails({ ...details, profileUrl: e.target.value })}
        className="w-full px-4 py-2 rounded border border-gray-300"
        placeholder="Paste your Instagram profile URL"
      />
      <label className="block font-medium">Followers</label>
      <input
        type="number"
        value={details.followers || ""}
        onChange={e => setDetails({ ...details, followers: e.target.value })}
        className="w-full px-4 py-2 rounded border border-gray-300"
        placeholder="Followers count"
      />
      <label className="block font-medium">Posts</label>
      <input
        type="number"
        value={details.posts || ""}
        onChange={e => setDetails({ ...details, posts: e.target.value })}
        className="w-full px-4 py-2 rounded border border-gray-300"
        placeholder="Number of posts"
      />
    </div>
  );
}

function FacebookDetails({ details, setDetails }: { details: any, setDetails: (d: any) => void }) {
  return (
    <div className="space-y-2">
      <label className="block font-medium">Facebook Profile URL</label>
      <input
        type="text"
        value={details.profileUrl || ""}
        onChange={e => setDetails({ ...details, profileUrl: e.target.value })}
        className="w-full px-4 py-2 rounded border border-gray-300"
        placeholder="Paste your Facebook profile URL"
      />
      <label className="block font-medium">Followers</label>
      <input
        type="number"
        value={details.followers || ""}
        onChange={e => setDetails({ ...details, followers: e.target.value })}
        className="w-full px-4 py-2 rounded border border-gray-300"
        placeholder="Followers count"
      />
      <label className="block font-medium">Posts</label>
      <input
        type="number"
        value={details.posts || ""}
        onChange={e => setDetails({ ...details, posts: e.target.value })}
        className="w-full px-4 py-2 rounded border border-gray-300"
        placeholder="Number of posts"
      />
    </div>
  );
}

function TikTokDetails({ details, setDetails }: { details: any, setDetails: (d: any) => void }) {
  return (
    <div className="space-y-2">
      <label className="block font-medium">TikTok Profile URL</label>
      <input
        type="text"
        value={details.profileUrl || ""}
        onChange={e => setDetails({ ...details, profileUrl: e.target.value })}
        className="w-full px-4 py-2 rounded border border-gray-300"
        placeholder="Paste your TikTok profile URL"
      />
      <label className="block font-medium">Followers</label>
      <input
        type="number"
        value={details.followers || ""}
        onChange={e => setDetails({ ...details, followers: e.target.value })}
        className="w-full px-4 py-2 rounded border border-gray-300"
        placeholder="Followers count"
      />
      <label className="block font-medium">Posts</label>
      <input
        type="number"
        value={details.posts || ""}
        onChange={e => setDetails({ ...details, posts: e.target.value })}
        className="w-full px-4 py-2 rounded border border-gray-300"
        placeholder="Number of posts"
      />
    </div>
  );
}

// Pricing components
function YouTubePricing({ pricing, setPricing }: { pricing: any, setPricing: (d: any) => void }) {
  return (
    <div className="space-y-2">
      <label className="block font-medium">Per Video</label>
      <input
        type="number"
        value={pricing.per_video_cost || ""}
        onChange={e => setPricing({ ...pricing, per_video_cost: e.target.value })}
        className="w-full px-4 py-2 rounded border border-gray-300"
        placeholder="Price per video"
      />
      <label className="block font-medium">Per Short</label>
      <input
        type="number"
        value={pricing.per_short_cost || ""}
        onChange={e => setPricing({ ...pricing, per_short_cost: e.target.value })}
        className="w-full px-4 py-2 rounded border border-gray-300"
        placeholder="Price per short"
      />
      <label className="block font-medium">Per Community Post</label>
      <input
        type="number"
        value={pricing.per_community_post_cost || ""}
        onChange={e => setPricing({ ...pricing, per_community_post_cost: e.target.value })}
        className="w-full px-4 py-2 rounded border border-gray-300"
        placeholder="Price per community post"
      />
      <label className="block font-medium">Currency</label>
      <input
        type="text"
        value={pricing.currency || ""}
        onChange={e => setPricing({ ...pricing, currency: e.target.value })}
        className="w-full px-4 py-2 rounded border border-gray-300"
        placeholder="e.g. USD, INR"
      />
    </div>
  );
}

function InstagramPricing({ pricing, setPricing }: { pricing: any, setPricing: (d: any) => void }) {
  return (
    <div className="space-y-2">
      <label className="block font-medium">Per Post</label>
      <input
        type="number"
        value={pricing.per_post_cost || ""}
        onChange={e => setPricing({ ...pricing, per_post_cost: e.target.value })}
        className="w-full px-4 py-2 rounded border border-gray-300"
        placeholder="Price per post"
      />
      <label className="block font-medium">Per Story</label>
      <input
        type="number"
        value={pricing.per_story_cost || ""}
        onChange={e => setPricing({ ...pricing, per_story_cost: e.target.value })}
        className="w-full px-4 py-2 rounded border border-gray-300"
        placeholder="Price per story"
      />
      <label className="block font-medium">Per Reel</label>
      <input
        type="number"
        value={pricing.per_reel_cost || ""}
        onChange={e => setPricing({ ...pricing, per_reel_cost: e.target.value })}
        className="w-full px-4 py-2 rounded border border-gray-300"
        placeholder="Price per reel"
      />
      <label className="block font-medium">Currency</label>
      <input
        type="text"
        value={pricing.currency || ""}
        onChange={e => setPricing({ ...pricing, currency: e.target.value })}
        className="w-full px-4 py-2 rounded border border-gray-300"
        placeholder="e.g. USD, INR"
      />
    </div>
  );
}

function FacebookPricing({ pricing, setPricing }: { pricing: any, setPricing: (d: any) => void }) {
  return (
    <div className="space-y-2">
      <label className="block font-medium">Per Post</label>
      <input
        type="number"
        value={pricing.per_post_cost || ""}
        onChange={e => setPricing({ ...pricing, per_post_cost: e.target.value })}
        className="w-full px-4 py-2 rounded border border-gray-300"
        placeholder="Price per post"
      />
      <label className="block font-medium">Currency</label>
      <input
        type="text"
        value={pricing.currency || ""}
        onChange={e => setPricing({ ...pricing, currency: e.target.value })}
        className="w-full px-4 py-2 rounded border border-gray-300"
        placeholder="e.g. USD, INR"
      />
    </div>
  );
}

function TikTokPricing({ pricing, setPricing }: { pricing: any, setPricing: (d: any) => void }) {
  return (
    <div className="space-y-2">
      <label className="block font-medium">Per Video</label>
      <input
        type="number"
        value={pricing.per_video_cost || ""}
        onChange={e => setPricing({ ...pricing, per_video_cost: e.target.value })}
        className="w-full px-4 py-2 rounded border border-gray-300"
        placeholder="Price per video"
      />
      <label className="block font-medium">Currency</label>
      <input
        type="text"
        value={pricing.currency || ""}
        onChange={e => setPricing({ ...pricing, currency: e.target.value })}
        className="w-full px-4 py-2 rounded border border-gray-300"
        placeholder="e.g. USD, INR"
      />
    </div>
  );
}
