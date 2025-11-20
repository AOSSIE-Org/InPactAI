import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Instagram,
  Youtube,
  Twitter,
  BookText as TikTok,
  Globe,
  ChevronRight,
  ChevronLeft,
  Rocket,
  Check,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { UserNav } from "../components/user-nav";
import { Link } from "react-router-dom";
import { ModeToggle } from "../components/mode-toggle";

// Validation utilities
const validatePhone = (phone: string): boolean => {
  // Basic pattern: optional country code + local number with common separators
  const phoneRegex =
    /^\+?[0-9]{1,3}?[-\s.]?\(?[0-9]{3}\)?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4}$/;
  return phoneRegex.test(phone.trim());
};

const validateURL = (url: string): boolean => {
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export default function BasicDetails() {
  const { user } = useParams();
  const [step, setStep] = useState(0);
  const [animationDirection, setAnimationDirection] = useState(0);
  
  // Form state and validation
  const [formData, setFormData] = useState({
    influencer: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      category: "",
      instagram: "",
      youtube: "",
      twitter: "",
      tiktok: "",
      website: "",
      audienceSize: "",
      avgEngagement: "",
      mainPlatform: "",
      audienceAge: "",
    },
    brand: {
      companyName: "",
      website: "",
      industry: "",
      size: "",
      budget: "",
      targetAudience: "",
      preferredPlatforms: "",
      campaignGoals: "",
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = user === "influencer" ? 3 : 2;

  // Validation functions
  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    const data = user === "influencer" ? formData.influencer : formData.brand;

    if (user === "influencer") {
      const influData = data as typeof formData.influencer;
      if (step === 0) {
        if (!influData.firstName?.trim()) newErrors.firstName = "First name is required";
        if (!influData.lastName?.trim()) newErrors.lastName = "Last name is required";
        if (!influData.email?.trim()) {
          newErrors.email = "Email is required";
        } else if (!validateEmail(influData.email)) {
          newErrors.email = "Invalid email format";
        }
        if (!influData.phone?.trim()) {
          newErrors.phone = "Phone number is required";
        } else if (!validatePhone(influData.phone)) {
          newErrors.phone = "Invalid phone format (e.g., +1-555-000-0000)";
        }
        if (!influData.category) newErrors.category = "Content category is required";
      } else if (step === 1) {
        if (influData.instagram && !influData.instagram.startsWith("@")) {
          newErrors.instagram = "Instagram handle should start with @";
        }
        if (influData.youtube && !validateURL(influData.youtube)) {
          newErrors.youtube = "Invalid YouTube URL";
        }
        if (influData.website && !validateURL(influData.website)) {
          newErrors.website = "Invalid website URL";
        }
      } else if (step === 2) {
        if (!influData.audienceSize) newErrors.audienceSize = "Audience size is required";
        else if (isNaN(Number(influData.audienceSize)) || Number(influData.audienceSize) <= 0) {
          newErrors.audienceSize = "Audience size must be a positive number";
        }
        if (!influData.avgEngagement) newErrors.avgEngagement = "Engagement rate is required";
        else if (isNaN(Number(influData.avgEngagement)) || Number(influData.avgEngagement) < 0 || Number(influData.avgEngagement) > 100) {
          newErrors.avgEngagement = "Engagement rate must be between 0 and 100";
        }
        if (!influData.mainPlatform) newErrors.mainPlatform = "Primary platform is required";
        if (!influData.audienceAge) newErrors.audienceAge = "Audience age range is required";
      }
    } else {
      const brandData = data as typeof formData.brand;
      if (step === 0) {
        if (!brandData.companyName?.trim()) newErrors.companyName = "Company name is required";
        if (!brandData.website) {
          newErrors.website = "Website is required";
        } else if (!validateURL(brandData.website)) {
          newErrors.website = "Invalid website URL";
        }
        if (!brandData.industry) newErrors.industry = "Industry is required";
        if (!brandData.size) newErrors.size = "Company size is required";
        if (!brandData.budget) newErrors.budget = "Budget range is required";
      } else if (step === 1) {
        if (!brandData.targetAudience) newErrors.targetAudience = "Target audience is required";
        if (!brandData.preferredPlatforms) newErrors.preferredPlatforms = "Preferred platforms is required";
        if (!brandData.campaignGoals) newErrors.campaignGoals = "Campaign goals is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    if (user === "influencer") {
      setFormData(prev => ({
        ...prev,
        influencer: { ...prev.influencer, [field]: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        brand: { ...prev.brand, [field]: value }
      }));
    }
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  const nextStep = () => {
    if (!validateStep()) return; // Don't proceed if validation fails
    
    if ((user === "influencer" && step < 2) || (user === "brand" && step < 1)) {
      setAnimationDirection(1);
      setTimeout(() => {
        setStep((prev) => prev + 1);
      }, 50);
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setAnimationDirection(-1);
      setTimeout(() => {
        setStep((prev) => prev - 1);
      }, 50);
    }
  };

  useEffect(() => {
    // Reset animation direction after animation completes
    const timer = setTimeout(() => {
      setAnimationDirection(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [step]);

  const InfluencerBasicDetails = () => (
    <div className="space-y-4 p-4 border border-gray-300 rounded-md">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
          <Input
            id="firstName"
            placeholder="John"
            value={formData.influencer.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            className={`border ${errors.firstName ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="h-4 w-4" /> {errors.firstName}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
          <Input
            id="lastName"
            placeholder="Doe"
            value={formData.influencer.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            className={`border ${errors.lastName ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="h-4 w-4" /> {errors.lastName}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          value={formData.influencer.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          className={`border ${errors.email ? "border-red-500" : "border-gray-300"}`}
        />
        {errors.email && (
          <p className="text-red-500 text-sm flex items-center gap-1">
            <AlertCircle className="h-4 w-4" /> {errors.email}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 (555) 000-0000"
          value={formData.influencer.phone}
          onChange={(e) => handleInputChange("phone", e.target.value)}
          className={`border ${errors.phone ? "border-red-500" : "border-gray-300"}`}
        />
        {errors.phone && (
          <p className="text-red-500 text-sm flex items-center gap-1">
            <AlertCircle className="h-4 w-4" /> {errors.phone}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Content Category <span className="text-red-500">*</span></Label>
        <Select value={formData.influencer.category} onValueChange={(value) => handleInputChange("category", value)}>
          <SelectTrigger className={errors.category ? "border-red-500" : ""}>
            <SelectValue placeholder="Select your main content category" />
          </SelectTrigger>
          <SelectContent className="border border-gray-300">
            <SelectItem value="lifestyle">Lifestyle</SelectItem>
            <SelectItem value="tech">Technology</SelectItem>
            <SelectItem value="fashion">Fashion</SelectItem>
            <SelectItem value="gaming">Gaming</SelectItem>
            <SelectItem value="food">Food</SelectItem>
            <SelectItem value="travel">Travel</SelectItem>
            <SelectItem value="fitness">Fitness</SelectItem>
            <SelectItem value="education">Education</SelectItem>
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-red-500 text-sm flex items-center gap-1">
            <AlertCircle className="h-4 w-4" /> {errors.category}
          </p>
        )}
      </div>
    </div>
  );

  const InfluencerSocialMedia = () => (
    <div className="space-y-4 p-4 border border-gray-300 rounded-md">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Instagram className="h-5 w-5 text-pink-600" />
          Instagram Handle
        </Label>
        <Input 
          placeholder="@username" 
          value={formData.influencer.instagram}
          onChange={(e) => handleInputChange("instagram", e.target.value)}
          className={`border ${errors.instagram ? "border-red-500" : "border-gray-300"}`}
        />
        {errors.instagram && (
          <p className="text-red-500 text-sm flex items-center gap-1">
            <AlertCircle className="h-4 w-4" /> {errors.instagram}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Youtube className="h-5 w-5 text-red-600" />
          YouTube Channel
        </Label>
        <Input 
          placeholder="Channel URL" 
          value={formData.influencer.youtube}
          onChange={(e) => handleInputChange("youtube", e.target.value)}
          className={`border ${errors.youtube ? "border-red-500" : "border-gray-300"}`}
        />
        {errors.youtube && (
          <p className="text-red-500 text-sm flex items-center gap-1">
            <AlertCircle className="h-4 w-4" /> {errors.youtube}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Twitter className="h-5 w-5 text-blue-400" />
          Twitter Handle
        </Label>
        <Input 
          placeholder="@username" 
          value={formData.influencer.twitter}
          onChange={(e) => handleInputChange("twitter", e.target.value)}
          className="border border-gray-300"
        />
      </div>
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <TikTok className="h-5 w-5" />
          TikTok Username
        </Label>
        <Input 
          placeholder="@username" 
          value={formData.influencer.tiktok}
          onChange={(e) => handleInputChange("tiktok", e.target.value)}
          className="border border-gray-300"
        />
      </div>
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-500" />
          Personal Website
        </Label>
        <Input 
          placeholder="https://" 
          value={formData.influencer.website}
          onChange={(e) => handleInputChange("website", e.target.value)}
          className={`border ${errors.website ? "border-red-500" : "border-gray-300"}`}
        />
        {errors.website && (
          <p className="text-red-500 text-sm flex items-center gap-1">
            <AlertCircle className="h-4 w-4" /> {errors.website}
          </p>
        )}
      </div>
    </div>
  );

  const InfluencerAudience = () => (
    <div className="space-y-4 p-4 border border-gray-300 rounded-md">
      <div className="space-y-2">
        <Label htmlFor="audienceSize">Total Audience Size <span className="text-red-500">*</span></Label>
        <Input
          id="audienceSize"
          type="number"
          placeholder="e.g., 100000"
          value={formData.influencer.audienceSize}
          onChange={(e) => handleInputChange("audienceSize", e.target.value)}
          className={`border ${errors.audienceSize ? "border-red-500" : "border-gray-300"}`}
        />
        {errors.audienceSize && (
          <p className="text-red-500 text-sm flex items-center gap-1">
            <AlertCircle className="h-4 w-4" /> {errors.audienceSize}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="avgEngagement">Average Engagement Rate (%) <span className="text-red-500">*</span></Label>
        <Input
          id="avgEngagement"
          type="number"
          step="0.01"
          placeholder="e.g., 3.5"
          value={formData.influencer.avgEngagement}
          onChange={(e) => handleInputChange("avgEngagement", e.target.value)}
          className={`border ${errors.avgEngagement ? "border-red-500" : "border-gray-300"}`}
        />
        {errors.avgEngagement && (
          <p className="text-red-500 text-sm flex items-center gap-1">
            <AlertCircle className="h-4 w-4" /> {errors.avgEngagement}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="mainPlatform">Primary Platform <span className="text-red-500">*</span></Label>
        <Select value={formData.influencer.mainPlatform} onValueChange={(value) => handleInputChange("mainPlatform", value)}>
          <SelectTrigger className={errors.mainPlatform ? "border-red-500" : ""}>
            <SelectValue placeholder="Select your main platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="youtube">YouTube</SelectItem>
            <SelectItem value="tiktok">TikTok</SelectItem>
            <SelectItem value="twitter">Twitter</SelectItem>
          </SelectContent>
        </Select>
        {errors.mainPlatform && (
          <p className="text-red-500 text-sm flex items-center gap-1">
            <AlertCircle className="h-4 w-4" /> {errors.mainPlatform}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="audienceAge">Primary Audience Age Range <span className="text-red-500">*</span></Label>
        <Select value={formData.influencer.audienceAge} onValueChange={(value) => handleInputChange("audienceAge", value)}>
          <SelectTrigger className={errors.audienceAge ? "border-red-500" : ""}>
            <SelectValue placeholder="Select age range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="13-17">13-17</SelectItem>
            <SelectItem value="18-24">18-24</SelectItem>
            <SelectItem value="25-34">25-34</SelectItem>
            <SelectItem value="35-44">35-44</SelectItem>
            <SelectItem value="45+">45+</SelectItem>
          </SelectContent>
        </Select>
        {errors.audienceAge && (
          <p className="text-red-500 text-sm flex items-center gap-1">
            <AlertCircle className="h-4 w-4" /> {errors.audienceAge}
          </p>
        )}
      </div>
    </div>
  );

  const BrandBasicDetails = () => (
    <div className="space-y-4 p-4 border border-gray-300 rounded-md">
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
          Brand Information
        </h3>
        <Label htmlFor="companyName">Company Name <span className="text-red-500">*</span></Label>
        <Input 
          id="companyName" 
          placeholder="Brand Inc." 
          value={formData.brand.companyName}
          onChange={(e) => handleInputChange("companyName", e.target.value)}
          className={`border ${errors.companyName ? "border-red-500" : "border-gray-300"}`}
        />
        {errors.companyName && (
          <p className="text-red-500 text-sm flex items-center gap-1">
            <AlertCircle className="h-4 w-4" /> {errors.companyName}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="website">Company Website <span className="text-red-500">*</span></Label>
        <Input 
          id="website" 
          type="url" 
          placeholder="https://www.example.com" 
          value={formData.brand.website}
          onChange={(e) => handleInputChange("website", e.target.value)}
          className={`border ${errors.website ? "border-red-500" : "border-gray-300"}`}
        />
        {errors.website && (
          <p className="text-red-500 text-sm flex items-center gap-1">
            <AlertCircle className="h-4 w-4" /> {errors.website}
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="industry">Industry <span className="text-red-500">*</span></Label>
          <Select value={formData.brand.industry} onValueChange={(value) => handleInputChange("industry", value)}>
            <SelectTrigger className={errors.industry ? "border-red-500" : ""}>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fashion">Fashion</SelectItem>
              <SelectItem value="tech">Technology</SelectItem>
              <SelectItem value="food">Food & Beverage</SelectItem>
              <SelectItem value="health">Health & Wellness</SelectItem>
              <SelectItem value="beauty">Beauty</SelectItem>
              <SelectItem value="entertainment">Entertainment</SelectItem>
            </SelectContent>
          </Select>
          {errors.industry && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="h-4 w-4" /> {errors.industry}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="size">Company Size <span className="text-red-500">*</span></Label>
          <Select value={formData.brand.size} onValueChange={(value) => handleInputChange("size", value)}>
            <SelectTrigger className={errors.size ? "border-red-500" : ""}>
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-10">1-10 employees</SelectItem>
              <SelectItem value="11-50">11-50 employees</SelectItem>
              <SelectItem value="51-200">51-200 employees</SelectItem>
              <SelectItem value="201-500">201-500 employees</SelectItem>
              <SelectItem value="501+">501+ employees</SelectItem>
            </SelectContent>
          </Select>
          {errors.size && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="h-4 w-4" /> {errors.size}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="budget">Monthly Marketing Budget <span className="text-red-500">*</span></Label>
        <Select value={formData.brand.budget} onValueChange={(value) => handleInputChange("budget", value)}>
          <SelectTrigger className={errors.budget ? "border-red-500" : ""}>
            <SelectValue placeholder="Select budget range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0-5000">$0 - $5,000</SelectItem>
            <SelectItem value="5001-10000">$5,001 - $10,000</SelectItem>
            <SelectItem value="10001-50000">$10,001 - $50,000</SelectItem>
            <SelectItem value="50001+">$50,001+</SelectItem>
          </SelectContent>
        </Select>
        {errors.budget && (
          <p className="text-red-500 text-sm flex items-center gap-1">
            <AlertCircle className="h-4 w-4" /> {errors.budget}
          </p>
        )}
      </div>
    </div>
  );

  const BrandCampaignPreferences = () => (
    <div className="space-y-4 p-4 border border-gray-300 rounded-md">
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
          Campaign Settings
        </h3>
        <Label htmlFor="targetAudience">Target Audience Age Range <span className="text-red-500">*</span></Label>
        <Select value={formData.brand.targetAudience} onValueChange={(value) => handleInputChange("targetAudience", value)}>
          <SelectTrigger className={errors.targetAudience ? "border-red-500" : ""}>
            <SelectValue placeholder="Select target age range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="13-17">13-17</SelectItem>
            <SelectItem value="18-24">18-24</SelectItem>
            <SelectItem value="25-34">25-34</SelectItem>
            <SelectItem value="35-44">35-44</SelectItem>
            <SelectItem value="45+">45+</SelectItem>
          </SelectContent>
        </Select>
        {errors.targetAudience && (
          <p className="text-red-500 text-sm flex items-center gap-1">
            <AlertCircle className="h-4 w-4" /> {errors.targetAudience}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="preferredPlatforms">Preferred Platforms <span className="text-red-500">*</span></Label>
        <Select value={formData.brand.preferredPlatforms} onValueChange={(value) => handleInputChange("preferredPlatforms", value)}>
          <SelectTrigger className={errors.preferredPlatforms ? "border-red-500" : ""}>
            <SelectValue placeholder="Select primary platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="youtube">YouTube</SelectItem>
            <SelectItem value="tiktok">TikTok</SelectItem>
            <SelectItem value="twitter">Twitter</SelectItem>
          </SelectContent>
        </Select>
        {errors.preferredPlatforms && (
          <p className="text-red-500 text-sm flex items-center gap-1">
            <AlertCircle className="h-4 w-4" /> {errors.preferredPlatforms}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="campaignGoals">Primary Campaign Goals <span className="text-red-500">*</span></Label>
        <Select value={formData.brand.campaignGoals} onValueChange={(value) => handleInputChange("campaignGoals", value)}>
          <SelectTrigger className={errors.campaignGoals ? "border-red-500" : ""}>
            <SelectValue placeholder="Select campaign goal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="awareness">Brand Awareness</SelectItem>
            <SelectItem value="sales">Direct Sales</SelectItem>
            <SelectItem value="engagement">Community Engagement</SelectItem>
            <SelectItem value="loyalty">Brand Loyalty</SelectItem>
          </SelectContent>
        </Select>
        {errors.campaignGoals && (
          <p className="text-red-500 text-sm flex items-center gap-1">
            <AlertCircle className="h-4 w-4" /> {errors.campaignGoals}
          </p>
        )}
      </div>
    </div>
  );

  const getStepContent = () => {
    if (user === "influencer") {
      switch (step) {
        case 0:
          return {
            title: "Basic Details",
            description: "Let's start with your personal information",
            content: <InfluencerBasicDetails />,
          };
        case 1:
          return {
            title: "Social Media Profiles",
            description: "Connect your social media accounts",
            content: <InfluencerSocialMedia />,
          };
        case 2:
          return {
            title: "Audience Information",
            description: "Tell us about your audience and engagement",
            content: <InfluencerAudience />,
          };
      }
    } else {
      switch (step) {
        case 0:
          return {
            title: "Company Information",
            description: "Tell us about your brand",
            content: <BrandBasicDetails />,
          };
        case 1:
          return {
            title: "Campaign Preferences",
            description: "Define your target audience and campaign goals",
            content: <BrandCampaignPreferences />,
          };
      }
    }
  };

  const currentStep = getStepContent();
  const variants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 300 : -300,
        opacity: 0,
      };
    },
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => {
      return {
        x: direction < 0 ? 300 : -300,
        opacity: 0,
      };
    },
  };

  const resetForm = () => {
    setStep(0);
    setAnimationDirection(0);

    document.querySelectorAll("input").forEach((input) => (input.value = ""));
    document
      .querySelectorAll("select")
      .forEach((select) => (select.value = ""));
  };

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="flex justify-between items-center p-6">
          <Link
            to="/"
            className="flex items-center space-x-2 transition-transform duration-200 hover:scale-105"
          >
            <Rocket className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            <span className="font-bold text-xl text-gray-900 dark:text-white">
              Inpact
            </span>
          </Link>
          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <span>Need help?</span>
            <Link
              to="/support"
              className="text-purple-600 hover:text-purple-700 dark:text-purple-400 transition-colors duration-200"
            >
              Contact support
            </Link>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-4xl">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl border border-gray-200 dark:border-gray-700">
              <div className="p-8">
                {/* Progress indicator */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Step {step + 1} of {totalSteps}
                    </h2>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {Math.round(((step + 1) / totalSteps) * 100)}% Complete
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
                    <motion.div
                      className="bg-purple-600 dark:bg-purple-500 h-2.5 rounded-full"
                      initial={{ width: `${(step / totalSteps) * 100}%` }}
                      animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    />
                  </div>
                  <div className="flex justify-between">
                    {Array.from({ length: totalSteps }).map((_, index) => (
                      <div
                        key={index}
                        className={`flex flex-col items-center ${
                          index <= step
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-gray-400 dark:text-gray-600"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mb-1
                        ${
                          index < step
                            ? "bg-purple-600 dark:bg-purple-500 border-purple-600 dark:border-purple-500"
                            : index === step
                            ? "border-purple-600 dark:border-purple-400"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                        >
                          {index < step ? (
                            <Check className="h-4 w-4 text-white" />
                          ) : (
                            <span
                              className={
                                index === step
                                  ? "text-purple-600 dark:text-purple-400"
                                  : "text-gray-400 dark:text-gray-600"
                              }
                            >
                              {index + 1}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Card className="w-full border border-gray-300 dark:border-gray-600">
                  <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                    <CardTitle className="text-2xl">
                      {currentStep?.title}
                    </CardTitle>
                    <CardDescription>
                      {currentStep?.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <AnimatePresence mode="wait" custom={animationDirection}>
                      <motion.div
                        key={step}
                        custom={animationDirection}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                          x: { type: "spring", stiffness: 300, damping: 30 },
                          opacity: { duration: 0.2 },
                        }}
                      >
                        {currentStep?.content}
                      </motion.div>
                    </AnimatePresence>

                    <div className="flex justify-between pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="outline"
                        onClick={prevStep}
                        disabled={step === 0}
                        className="border border-gray-300 dark:border-gray-600 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>

                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {Array.from({ length: totalSteps }).map(
                            (_, index) => (
                              <div
                                key={index}
                                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                                  index === step
                                    ? "w-4 bg-purple-600 dark:bg-purple-400"
                                    : "bg-gray-300 dark:bg-gray-600"
                                }`}
                              />
                            )
                          )}
                        </div>
                      </div>

                      <Button
                        className="bg-purple-700 hover:bg-purple-800 border border-purple-800 transition-all duration-200 transform hover:scale-105 text-white"
                       onClick={nextStep}
                     >
                        {step === totalSteps - 1 ? "Complete" : "Next"}
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  <p>
                    Need to start over?{" "}
                    <button
                      onClick={resetForm}
                      className="text-purple-600 hover:text-purple-700 dark:text-purple-400 transition-colors"
                    >
                      Reset form
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
