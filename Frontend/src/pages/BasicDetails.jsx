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
import { Instagram, Youtube, Twitter, BookText as TikTok, Globe, ChevronRight, ChevronLeft,Rocket, Check} from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { useState,useEffect} from "react";
import { useParams } from "react-router-dom";
import { UserNav } from "../components/user-nav";
import { MainNav } from "../components/main-nav"
import { Link } from "react-router-dom"
import { ModeToggle } from "../components/mode-toggle"


export default function BasicDetails() {
    const { user } = useParams();
  const [step, setStep] = useState(0);
  const [animationDirection, setAnimationDirection] = useState(0);

const totalSteps = user === "influencer" ? 3 : 2;
const nextStep = () => {
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
    <div className="space-y-4 p-4 border border-gray-300 rounded-md  ">
      <div className="grid grid-cols-2 gap-4 ">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sky-500">First Name</Label>
          <Input id="firstName" placeholder="John" className="border border-gray-300"/>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sky-500">Last Name</Label>
          <Input id="lastName" placeholder="Doe" className="border border-gray-300"/>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sky-500">Email</Label>
        <Input id="email" type="email" placeholder="john@example.com" className="border border-gray-300" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sky-500">Phone Number</Label>
        <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" className="border border-gray-300"/>
      </div>
      <div className="space-y-2">
        <Label htmlFor="category" className="text-sky-500"  >Content Category</Label>
        <Select >
          <SelectTrigger className= "text-white">
            <SelectValue placeholder="Select your main content category"  />
          </SelectTrigger>
          <SelectContent className="border border-gray-300 bg-blue-100">
            <SelectItem value="lifestyle" className="text-sky-500">Lifestyle</SelectItem>
            <SelectItem value="tech" className="text-sky-500">Technology</SelectItem>
            <SelectItem value="fashion" className="text-sky-500">Fashion</SelectItem>
            <SelectItem value="gaming"className="text-sky-500">Gaming</SelectItem>
            <SelectItem value="food" className="text-sky-500">Food</SelectItem>
            <SelectItem value="travel" className="text-sky-500">Travel</SelectItem>
            <SelectItem value="fitness" className="text-sky-500">Fitness</SelectItem>
            <SelectItem value="education" className="text-sky-500">Education</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const InfluencerSocialMedia = () => (
    <div className="space-y-4 p-4 border border-gray-300 rounded-md">
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-pink-600">
          <Instagram className="h-5 w-5 text-pink-600" />
          Instagram Handle
        </Label>
        <Input placeholder="@username" className="border border-gray-300 text-sky-500" />
      </div>
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-red-600">
          <Youtube className="h-5 w-5 text-red-600 " />
          YouTube Channel
        </Label>
        <Input placeholder="Channel URL"  className="border border-gray-300"/>
      </div>
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-blue-400">
          <Twitter className="h-5 w-5 text-blue-400 " />
          Twitter Handle
        </Label>
        <Input placeholder="@username" className="border border-gray-300" />
      </div>
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-sky-500">
          <TikTok className="h-5 w-5 text-sky-500" />
          TikTok Username
        </Label>
        <Input placeholder="@username"  className="border border-gray-300"/>
      </div>
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-blue">
          <Globe className="h-5 w-5 text-blue-500 text-sky-500" />
          Personal Website
        </Label>
        <Input placeholder="https://"  className="border border-gray-300"/>
      </div>
    </div>
  );

  const InfluencerAudience = () => (
    <div className="space-y-4 p-4 border border-gray-300 rounded-md">
      <div className="space-y-2">
        <Label htmlFor="audienceSize" className="text-white">Total Audience Size</Label>
        <Input id="audienceSize" type="number" placeholder="e.g., 100000" className="border border-gray-300" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="avgEngagement" className="text-white">Average Engagement Rate (%)</Label>
        <Input id="avgEngagement" type="number" step="0.01" placeholder="e.g., 3.5" className="border border-gray-300" />
      </div>
      <div className="space-y-2 ">
        <Label htmlFor="mainPlatform" className="text-white">Primary Platform</Label>
        <Select>
          <SelectTrigger className = "text-white">
            <SelectValue  placeholder="Select your main platform" />
          </SelectTrigger>
          <SelectContent className = "bg-blue-100">
            <SelectItem value="instagram" className="text-sky-500">Instagram</SelectItem>
            <SelectItem value="youtube" className="text-sky-500">YouTube</SelectItem>
            <SelectItem value="tiktok" className="text-sky-500">TikTok</SelectItem>
            <SelectItem value="twitter"className="text-sky-500">Twitter</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="audienceAge" className="text-white"> Primary Audience Age Range</Label>
        <Select>
          <SelectTrigger className = "text-white" >
            <SelectValue placeholder="Select age range"/>
          </SelectTrigger>
          <SelectContent className = "bg-blue-100">
            <SelectItem value="13-17">13-17</SelectItem>
            <SelectItem value="18-24">18-24</SelectItem>
            <SelectItem value="25-34">25-34</SelectItem>
            <SelectItem value="35-44">35-44</SelectItem>
            <SelectItem value="45+">45+</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const BrandBasicDetails = () => (
    <div className="space-y-4 p-4 border border-gray-300 rounded-md">
      <div className="space-y-2">
      <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 text-sky-500">Brand Information</h3>
        <Label htmlFor="companyName" className="text-sky-500">Company Name</Label>
        <Input id="companyName" placeholder="Brand Inc." />
      </div>
      <div className="space-y-2">
        <Label htmlFor="website" className="text-sky-500">Company Website</Label>
        <Input id="website" type="url" placeholder="https://www.example.com" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="industry" className="text-sky-500">Industry</Label>
          <Select>
            <SelectTrigger className="text-white">
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent className ="bg-white">
              <SelectItem value="fashion" className="text-sky-500">Fashion</SelectItem>
              <SelectItem value="tech" className="text-sky-500">Technology</SelectItem>
              <SelectItem value="food" className="text-sky-500">Food & Beverage</SelectItem>
              <SelectItem value="health" className="text-sky-500">Health & Wellness</SelectItem>
              <SelectItem value="beauty" className="text-sky-500">Beauty</SelectItem>
              <SelectItem value="entertainment" className="text-sky-500">Entertainment</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="size" className="text-sky-500">Company Size</Label>
          <Select>
            <SelectTrigger className="text-white">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent className ="bg-white">
              <SelectItem value="1-10" className="text-sky-500">1-10 employees</SelectItem>
              <SelectItem value="11-50" className="text-sky-500">11-50 employees</SelectItem>
              <SelectItem value="51-200" className="text-sky-500">51-200 employees</SelectItem>
              <SelectItem value="201-500" className="text-sky-500">201-500 employees</SelectItem>
              <SelectItem value="501+" className="text-sky-500">501+ employees</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="budget" className="text-sky-500">Monthly Marketing Budget</Label>
        <Select >
          <SelectTrigger className="text-white" >
            <SelectValue placeholder="Select budget range"  />
          </SelectTrigger>
          <SelectContent className = "bg-white"> 
            <SelectItem value="0-5000" className="text-sky-500">$0 - $5,000</SelectItem>
            <SelectItem value="5001-10000" className="text-sky-500">$5,001 - $10,000</SelectItem>
            <SelectItem value="10001-50000" className="text-sky-500">$10,001 - $50,000</SelectItem>
            <SelectItem value="50001+" className="text-sky-500">$50,001+</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const BrandCampaignPreferences = () => (
    <div className="space-y-4 p-4 border border-gray-300 rounded-md">
      <div className="space-y-2">
      <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 text-sky-500">Campaign Settings</h3>
        <Label htmlFor="targetAudience " className="text-sky-500">Target Audience Age Range</Label>
        <Select>
          <SelectTrigger className ="text-white">
            <SelectValue placeholder="Select target age range"  className="text-white"/>
          </SelectTrigger>
          <SelectContent className = "bg-white">
            <SelectItem value="13-17"className="text-sky-500">13-17</SelectItem>
            <SelectItem value="25-34" className="text-sky-500">25-34</SelectItem>
            <SelectItem value="35-44" className="text-sky-500">35-44</SelectItem>
            <SelectItem value="18-24" className="text-sky-500">18-24</SelectItem>
            <SelectItem value="45+" className="text-sky-500">45+</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 ">
        <Label htmlFor="preferredPlatforms" className="text-sky-500">Preferred Platforms</Label>
        <Select>
          <SelectTrigger className = "text-white">
            <SelectValue placeholder="Select primary platform" className="text-white" />
          </SelectTrigger>
          <SelectContent className ="bg-white">
            <SelectItem value="instagram"className="text-sky-500">Instagram</SelectItem>
            <SelectItem value="youtube"className="text-sky-500">YouTube</SelectItem>
            <SelectItem value="tiktok"className="text-sky-500">TikTok</SelectItem>
            <SelectItem value="twitter"className="text-sky-500">Twitter</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="campaignGoals"className="text-sky-500">Primary Campaign Goals</Label>
        <Select>
          <SelectTrigger className="text-white">
            <SelectValue placeholder="Select campaign goal"  />
          </SelectTrigger>
          <SelectContent className ="bg-white">
            <SelectItem value="awareness"className="text-sky-500">Brand Awareness</SelectItem>
            <SelectItem value="sales"className="text-sky-500">Direct Sales</SelectItem>
            <SelectItem value="engagement"className="text-sky-500">Community Engagement</SelectItem>
            <SelectItem value="loyalty"className="text-sky-500">Brand Loyalty</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    
  );

  const getStepContent = () => {
    if (user === "influencer") {
      switch (step) {
        case 0:
          return {
            title: (<h1 className="text-white">Basic Details</h1>),
            description:(<h1 className="text-white"> Let's start with your personal information</h1> ),
            content: <InfluencerBasicDetails />,
          };
        case 1:
          return {
            title: (<h1 className="text-white">Social Media Profiles</h1>),
            description: (<h1 className="text-white">Social Media Profiles</h1>),
            content: <InfluencerSocialMedia />,
          };
        case 2:
          return {
            title: (<h1 className="text-white">Audience Information</h1>),
            description: (<h1 className="text-white">Audience Information</h1>),
            content: <InfluencerAudience />,
          };
      }
    } else {
      switch (step) {
        case 0:
          return {
           title: (<h2 className="text-white">Basic Details</h2>),
            description:( <h2 className="text-white">Tell us about your brand</h2>),
            content: <BrandBasicDetails/>,
          };
        case 1:
          return {
            title: (<h1 className="text-white">Campaign Preferences</h1>),
            description:(<h1 className="text-white">Define your target audience and campaign goals</h1> ),
            content: <BrandCampaignPreferences />,
          };
      }
    }
  };

  const currentStep = getStepContent();
  const variants = {
    enter: (direction) => {
      return {
        x: direction > 0 ? 300 : -300,
        opacity: 0
      };
    },
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => {
      return {
        x: direction < 0 ? 300 : -300,
        opacity: 0
      };
    }
  };

  return (
    <>
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="flex justify-between items-center p-6">
        <Link href="/" className="flex items-center space-x-2 transition-transform duration-200 hover:scale-105">
          <Rocket className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          <span className="font-bold text-xl text-gray-900 dark:text-sky-500">Inpact</span>
        </Link>
        <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
          <span>Need help?</span>
          <Link href="/support" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 transition-colors duration-200">
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
                    initial={{ width: `${((step) / totalSteps) * 100}%` }}
                    animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  />
                </div>
                <div className="flex justify-between">
                  {Array.from({ length: totalSteps }).map((_, index) => (
                    <div 
                      key={index} 
                      className={`flex flex-col items-center ${index <= step ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 dark:text-gray-600'}`}
                    >
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mb-1
                        ${index < step ? 'bg-purple-600 dark:bg-purple-500 border-purple-600 dark:border-purple-500' : 
                          index === step ? 'border-purple-600 dark:border-purple-400' : 'border-gray-300 dark:border-gray-600'}`}
                      >
                        {index < step ? (
                          <Check className="h-4 w-4 text-sky-500" />
                        ) : (
                          <span className={index === step ? "text-purple-600 dark:text-purple-400" : "text-gray-400 dark:text-gray-600"}>
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
                  <CardTitle className="text-2xl">{currentStep?.title}</CardTitle>
                  <CardDescription>{currentStep?.description}</CardDescription>
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
                        opacity: { duration: 0.2 }
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
                        {Array.from({ length: totalSteps }).map((_, index) => (
                          <div
                            key={index}
                            className={`h-2 w-2 rounded-full transition-all duration-300 ${
                              index === step ? "w-4 bg-purple-600 dark:bg-purple-400" : "bg-gray-300 dark:bg-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <Button
                      className="bg-purple-700 hover:bg-purple-800 border border-purple-800 transition-all duration-200 transform hover:scale-105 text-white-500"
                      onClick={nextStep}
                      disabled={
                        (user === "influencer" && step === 2) ||
                        (user === "brand" && step === 1)
                      }
                    >
                      {step === totalSteps - 1 ? "Complete" : "Next"}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                <p>Need to start over? <button className="text-purple-600 hover:text-purple-700 dark:text-purple-400 transition-colors">Reset form</button></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}