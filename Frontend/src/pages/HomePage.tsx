import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Handshake,
  Layers,
  MessageSquare,
  Rocket,
  Users,
  TrendingUp,
  Star,
  Zap,
  BookOpen,
  Award,
  Eye,
  Heart,
  UserPlus,
  Sparkles,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { MainNav } from "../components/main-nav";
import { ModeToggle } from "../components/mode-toggle";
import { UserNav } from "../components/user-nav";
import { useAuth } from "../context/AuthContext";
// import { supabase } from "../utils/supabase";
import { useTheme } from "../components/theme-provider";

// const features = [ ... ]; // Unused

// const dashboardFeatures = [ ... ]; // Unused

const successStories = [
  {
    creator: "Sarah Chen",
    niche: "Tech & Lifestyle",
    followers: "2.1M",
    brand: "TechFlow",
    result: "500% ROI increase",
    story: "Sarah's authentic tech reviews helped TechFlow launch their new smartphone with record-breaking pre-orders.",
    avatar: "/avatars/sarah.jpg",
    platform: "YouTube",
  },
  {
    creator: "Marcus Rodriguez",
    niche: "Fitness & Wellness",
    followers: "850K",
    brand: "FitFuel",
    result: "300% engagement boost",
    story: "Marcus's workout challenges with FitFuel products generated over 10M views and 50K+ app downloads.",
    avatar: "/avatars/marcus.jpg",
    platform: "Instagram",
  },
  {
    creator: "Emma Thompson",
    niche: "Sustainable Fashion",
    followers: "1.2M",
    brand: "EcoStyle",
    result: "200% sales increase",
    story: "Emma's sustainable fashion content helped EcoStyle become the top eco-friendly brand in their category.",
    avatar: "/avatars/emma.jpg",
    platform: "TikTok",
  },
];

// const trendingNiches = [ ... ]; // Unused

// const creatorResources = [ ... ]; // Unused

const brandShowcase = [
  {
    name: "TechFlow",
    industry: "Technology",
    logo: "/brands/techflow.png",
    description: "Leading smartphone manufacturer seeking tech reviewers and lifestyle creators",
    followers: "2.5M",
    budget: "$5K - $50K",
    lookingFor: ["Tech Reviewers", "Lifestyle Creators", "Gaming Streamers"],
    activeCampaigns: 3,
  },
  {
    name: "FitFuel",
    industry: "Health & Fitness",
    logo: "/brands/fitfuel.png",
    description: "Premium fitness supplement brand looking for authentic fitness influencers",
    followers: "1.8M",
    budget: "$3K - $25K",
    lookingFor: ["Fitness Trainers", "Nutrition Experts", "Wellness Coaches"],
    activeCampaigns: 5,
  },
  {
    name: "EcoStyle",
    industry: "Sustainable Fashion",
    logo: "/brands/ecostyle.png",
    description: "Eco-friendly fashion brand seeking sustainable lifestyle advocates",
    followers: "950K",
    budget: "$2K - $20K",
    lookingFor: ["Fashion Influencers", "Sustainability Advocates", "Lifestyle Creators"],
    activeCampaigns: 2,
  },
  {
    name: "GameZone",
    industry: "Gaming",
    logo: "/brands/gamezone.png",
    description: "Gaming accessories company looking for esports and gaming content creators",
    followers: "3.2M",
    budget: "$4K - $40K",
    lookingFor: ["Gaming Streamers", "Esports Players", "Tech Reviewers"],
    activeCampaigns: 4,
  },
];

function TrendingNichesSection() {
  const { theme } = useTheme();
  const [niches, setNiches] = useState<{ name: string; insight: string; global_activity: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/trending-niches")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch trending niches");
        return res.json();
      })
      .then(data => {
        setNiches(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading trending niches...</div>;
  if (error) return <div>Error: {error}</div>;

  const icons = ['🤖','🌱','🎮','💸','✈️','🧩'];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
      {niches.map((niche, idx) => (
        <div
          key={idx}
          className={`relative group pt-8 rounded-2xl border shadow-2xl w-full max-w-xs transition-transform duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden ${
            theme === 'dark' 
              ? 'bg-gray-800/80 border-gray-700' 
              : 'bg-white/20 backdrop-blur-xl border-white/30'
          }`}
        >
          <div className={`absolute inset-0 rounded-2xl pointer-events-none ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-gray-700/40 via-gray-800/10 to-blue-900/10' 
              : 'bg-gradient-to-br from-white/40 via-white/10 to-blue-100/10'
          }`} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full shadow-lg border-4 border-white z-10">
            <span className="text-2xl">{icons[idx % icons.length]}</span>
          </div>
          <h3 className={`text-xl font-bold mb-2 mt-6 text-center relative z-10 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>{niche.name}</h3>
          <blockquote className={`italic mb-4 text-center border-l-4 border-purple-300 pl-3 relative z-10 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            “{niche.insight}”
          </blockquote>
          <div className="flex flex-col items-center mt-4 relative z-10">
            <span className={`text-xs mb-1 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>Global Activity</span>
            <div className="w-full flex items-center justify-center">
              <div className={`w-24 h-3 rounded-full overflow-hidden ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${
                    niche.global_activity >= 4
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500'
                      : 'bg-gradient-to-r from-yellow-400 to-orange-500'
                  }`}
                  style={{ width: `${(niche.global_activity / 5) * 100}%` }}
                />
              </div>
              <span className={`ml-2 font-semibold ${
                theme === 'dark' ? 'text-purple-400' : 'text-purple-700'
              }`}>{niche.global_activity}/5</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function WhyChooseSection() {
  const { theme } = useTheme();

  return (
    <section className={`w-full py-20 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-b from-white via-blue-50 to-purple-50'
    }`}>
      <div className="container mx-auto px-6 md:px-12">
        <h2 className={`text-3xl md:text-4xl font-bold text-center mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>Why Choose Inpact AI?</h2>
        <p className={`text-lg text-center mb-12 max-w-2xl mx-auto ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Powerful tools for both brands and creators to connect, collaborate, and grow.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className={`rounded-2xl shadow-lg p-8 flex flex-col items-center border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-purple-100'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <Rocket className="h-8 w-8 text-purple-600" />
              <span className={`text-xl font-semibold ${
                theme === 'dark' ? 'text-purple-400' : 'text-purple-700'
              }`}>For Brands</span>
            </div>
            <ul className={`space-y-4 w-full ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <li className="flex items-start gap-3"><Handshake className="h-6 w-6 text-blue-500" /> AI-driven creator matching for your campaigns</li>
              <li className="flex items-start gap-3"><BarChart3 className="h-6 w-6 text-green-500" /> Real-time performance analytics & ROI tracking</li>
              <li className="flex items-start gap-3"><Layers className="h-6 w-6 text-pink-500" /> Smart pricing & budget optimization</li>
              <li className="flex items-start gap-3"><MessageSquare className="h-6 w-6 text-orange-500" /> Streamlined communication & contract management</li>
            </ul>
          </div>
          <div className={`rounded-2xl shadow-lg p-8 flex flex-col items-center border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-8 w-8 text-blue-600" />
              <span className={`text-xl font-semibold ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-700'
              }`}>For Creators</span>
            </div>
            <ul className={`space-y-4 w-full ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <li className="flex items-start gap-3"><TrendingUp className="h-6 w-6 text-purple-500" /> Get discovered by top brands in your niche</li>
              <li className="flex items-start gap-3"><Award className="h-6 w-6 text-yellow-500" /> Fair sponsorship deals & transparent payments</li>
              <li className="flex items-start gap-3"><BookOpen className="h-6 w-6 text-indigo-500" /> AI-powered content & contract assistant</li>
              <li className="flex items-start gap-3"><Heart className="h-6 w-6 text-pink-500" /> Grow your audience & track your impact</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const { theme } = useTheme();
  
  // Removed unused refs: featuresRef, resourcesRef
  const successStoriesRef = useRef(null);
  const trendingRef = useRef(null);
  const footerRef = useRef(null);

  // Removed unused state: isFeaturesVisible, setIsFeaturesVisible, isResourcesVisible, setIsResourcesVisible
  // Removed unused state: isSuccessStoriesVisible, setIsSuccessStoriesVisible
  const [isTrendingVisible, setIsTrendingVisible] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  const [hasAnimatedTrending, setHasAnimatedTrending] = useState(false);
  const [hasAnimatedBrands, setHasAnimatedBrands] = useState(false);

  useEffect(() => {
    const trendingObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimatedTrending) {
          setIsTrendingVisible(true);
          setHasAnimatedTrending(true);
        }
      },
      { root: null, rootMargin: "0px", threshold: 0.1 }
    );
    const brandsObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimatedBrands) {
          setHasAnimatedBrands(true);
        }
      },
      { root: null, rootMargin: "0px", threshold: 0.1 }
    );
    const trendingNode = trendingRef.current;
    const brandsNode = successStoriesRef.current;
    if (trendingNode) trendingObserver.observe(trendingNode);
    if (brandsNode) brandsObserver.observe(brandsNode);
    return () => {
      if (trendingNode) trendingObserver.unobserve(trendingNode);
      if (brandsNode) brandsObserver.unobserve(brandsNode);
    };
  }, [hasAnimatedTrending, hasAnimatedBrands]);

  useEffect(() => {
    const footerObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsFooterVisible(entry.isIntersecting);
      },
      { root: null, rootMargin: "0px", threshold: 0.1 }
    );
    const footerNode = footerRef.current;
    if (footerNode) footerObserver.observe(footerNode);
    return () => {
      if (footerNode) footerObserver.unobserve(footerNode);
    };
  }, []);

  if (isAuthenticated && user) {
    return (
      <div className={`flex min-h-screen flex-col ${
        theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-900'
      }`}>
        {/* Enhanced Header with Improved Logo */}
        <header className={`fixed top-0 z-50 w-full border-b ${
          theme === 'dark' ? 'border-gray-700 bg-gray-800/80' : 'border-white/20 bg-white/10'
        } backdrop-blur-xl px-6`}>
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-6 md:gap-10">
              <Link to="/" className="flex items-center space-x-2 group">
                <div className="relative">
                  <Rocket className={`h-6 w-6 ${
                    theme === 'dark' ? 'text-purple-400 group-hover:text-purple-300' : 'text-purple-600 group-hover:text-purple-500'
                  } transition-colors`} />
                  <div className={`absolute -inset-1 rounded-full ${
                    theme === 'dark' ? 'bg-purple-500/30' : 'bg-purple-600/30'
                  } blur-sm group-hover:opacity-80 transition-opacity`}></div>
                </div>
                <span className={`font-bold text-xl ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                } group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors`}>
                  Inpact
                </span>
              </Link>
              <MainNav />
            </div>
            <div className="flex items-center gap-4">
              <ModeToggle />
              <UserNav />
            </div>
          </div>
        </header>

        <main className="flex-1">
          <section className="w-full min-h-screen flex items-center relative pt-16 overflow-hidden">
            <div className={`absolute inset-0 ${
              theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-100/50 via-blue-100/50 to-indigo-100/50'
            }`}></div>
            <div className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl animate-pulse ${
              theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-300/30'
            }`}></div>
            <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse ${
              theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-300/30'
            }`}></div>
            <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl ${
              theme === 'dark' ? 'bg-gradient-to-r from-purple-900/10 to-blue-900/10' : 'bg-gradient-to-r from-purple-400/10 to-blue-400/10'
            }`}></div>
            
            <div className="container relative z-10 px-0 md:px-0 max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-24 items-center">
                <div className="relative order-first">
                  <div className="relative">
                    <div className={`absolute -inset-8 rounded-3xl blur-2xl animate-pulse ${
                      theme === 'dark' ? 'bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-indigo-900/20' : 'bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-indigo-600/20'
                    }`}></div>
                    <div className={`absolute -inset-4 rounded-2xl blur-xl ${
                      theme === 'dark' ? 'bg-gradient-to-r from-purple-800/30 to-blue-800/30' : 'bg-gradient-to-r from-purple-400/30 to-blue-400/30'
                    }`}></div>
                    <div className={`relative rounded-2xl p-4 border shadow-2xl ${
                      theme === 'dark' ? 'bg-gray-800/80 border-gray-700 backdrop-blur-sm' : 'bg-white/20 border-white/30 backdrop-blur-sm'
                    }`}>
                      <img
                        src="/Home.png"
                        alt="Dashboard Preview"
                        className="rounded-xl object-cover w-full h-auto shadow-lg"
                      />
                    </div>
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{animationDelay: '0.5s'}}>
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute top-1/2 -right-8 w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{animationDelay: '1s'}}>
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center lg:items-start justify-center w-full h-full space-y-8 order-last px-6 md:px-12 lg:px-24">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6 ${
                    theme === 'dark' ? 'bg-gray-800/80 border-gray-700 backdrop-blur-sm' : 'bg-white/20 border-white/30 backdrop-blur-sm'
                  }`}>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>Welcome back!</span>
                  </div>
                  <div className="space-y-6 w-full">
                    <h1 className={`text-5xl lg:text-7xl font-bold tracking-tight leading-tight w-full text-center lg:text-left ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Welcome, <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent animate-gradient">{user.user_metadata?.name || user.email?.split('@')[0]}</span>
                    </h1>
                    <p className={`text-xl lg:text-2xl max-w-2xl mx-auto lg:mx-0 leading-relaxed w-full text-center lg:text-left ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Ready to grow your creator business? Explore new opportunities, track your performance, and connect with brands.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg"
                    >
                      <Link to="/dashboard" className="flex items-center">
                        Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'secondary' : 'outline'}
                      size="lg"
                      className={`${
                        theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'border-white/30 bg-white/10 hover:bg-white/20'
                      } backdrop-blur-sm transition-all duration-300 px-8 py-4 text-lg`}
                    >
                      <Link to="/dashboard/sponsorships" className="flex items-center">
                        Browse Opportunities
                      </Link>
                    </Button>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-8 justify-center mt-19">
                    <div className="flex flex-col items-center text-center">
                      <UserPlus className="h-10 w-10 mb-2 text-purple-600" />
                      <span className={`font-semibold ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-800'
                      }`}>Create your profile</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <Sparkles className="h-10 w-10 mb-2 text-blue-600" />
                      <span className={`font-semibold ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-800'
                      }`}>Get matched by AI</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <Handshake className="h-10 w-10 mb-2 text-green-600" />
                      <span className={`font-semibold ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-800'
                      }`}>Collaborate & grow</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <WhyChooseSection />

          <section ref={trendingRef} className={`w-full py-24 relative ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-b from-blue-50 via-white to-purple-50'
          }`}>
            <div className={`absolute inset-0 ${
              theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50/50 to-blue-50/50'
            }`}></div>
            <div
              className={`max-w-7xl mx-auto relative z-10 px-2 sm:px-4 md:px-8 text-center transition-all duration-1000 transform ${
                isTrendingVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-20"
              }`}
            >
              <h2 className={`text-3xl font-bold sm:text-4xl mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Trending Niches
              </h2>
              <p className={`mt-4 text-lg mb-12 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Discover the fastest-growing content categories and opportunities.
              </p>
              <TrendingNichesSection />
            </div>
          </section>

          <section ref={successStoriesRef} className={`w-full py-24 relative ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-b from-purple-50 via-white to-blue-50'
          }`}>
            <div className={`absolute inset-0 ${
              theme === 'dark' ? 'bg-gray-900/80' : 'bg-white/50'
            } backdrop-blur-sm`}></div>
            <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10">
              <h2 className={`text-3xl font-bold sm:text-4xl mb-4 text-center ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Brands Seeking Creators
              </h2>
              <p className={`mt-4 text-lg mb-12 text-center ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Connect with companies actively looking for creators like you.
              </p>
              <div className="mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
                {brandShowcase.map((brand, idx) => (
                  <div
                    key={idx}
                    className={`group p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border w-full max-w-xl ${
                      theme === 'dark' 
                        ? 'bg-gray-800/80 border-gray-700 hover:bg-gray-800/90' 
                        : 'bg-white/80 border-white/20 hover:bg-white/90'
                    } backdrop-blur-sm`}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold text-xl">
                            {brand.name.split('').slice(0, 2).join('')}
                          </span>
                        </div>
                        <div className="absolute -inset-1 bg-gradient-to-br from-purple-400/20 to-blue-500/20 rounded-xl blur-sm"></div>
                      </div>
                      <div className="text-left flex-1">
                        <h3 className={`font-semibold text-lg ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>{brand.name}</h3>
                        <p className={`text-sm mb-2 ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>{brand.industry}</p>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>{brand.description}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Followers</p>
                        <p className={theme === 'dark' ? 'font-semibold text-gray-200' : 'font-semibold text-gray-900'}>{brand.followers}</p>
                      </div>
                      <div>
                        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Budget Range</p>
                        <p className="font-semibold text-green-600">{brand.budget}</p>
                      </div>
                      <div>
                        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Active Campaigns</p>
                        <p className="font-semibold text-blue-600">{brand.activeCampaigns}</p>
                      </div>
                      <div>
                        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Looking For</p>
                        <p className="font-semibold text-purple-600">{brand.lookingFor.length} types</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {brand.lookingFor.map((type, typeIdx) => (
                        <span
                          key={typeIdx}
                          className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                    >
                      <Link to="/dashboard/sponsorships" className="flex items-center justify-center">
                        View Opportunities <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <footer ref={footerRef} className="w-full py-12 bg-gradient-to-r from-gray-900 to-gray-800 text-white relative">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
            <div
              className={`container relative z-10 px-6 md:px-12 text-center transition-all duration-1000 transform ${
                isFooterVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-20"
              }`}
            >
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="relative">
                  <Rocket className="h-6 w-6 text-purple-400" />
                  <div className="absolute -inset-1 bg-purple-400/20 rounded-full blur-sm"></div>
                </div>
                <span className="font-bold text-xl">Inpact</span>
              </div>
              <p className="text-gray-400">
                Empowering creators to build meaningful partnerships and grow their businesses.
              </p>
              <div className="mt-6 flex justify-center space-x-6 text-sm text-gray-400">
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Link to="/dashboard/sponsorships" className="hover:text-white transition-colors">
                  Opportunities
                </Link>
                <Link to="/dashboard/analytics" className="hover:text-white transition-colors">
                  Analytics
                </Link>
                <Link to="/dashboard/messages" className="hover:text-white transition-colors">
                  Messages
                </Link>
              </div>
            </div>
          </footer>
        </main>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen flex-col ${
      theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-900'
    }`}>
      {/* Enhanced Header with Improved Logo */}
      <header className={`fixed top-0 z-50 w-full border-b ${
        theme === 'dark' ? 'border-gray-700 bg-gray-800/80' : 'border-white/20 bg-white/10'
      } backdrop-blur-xl px-6`}>
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6 md:gap-10">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <Rocket className={`h-6 w-6 ${
                  theme === 'dark' ? 'text-purple-400 group-hover:text-purple-300' : 'text-purple-600 group-hover:text-purple-500'
                } transition-colors`} />
                <div className={`absolute -inset-1 rounded-full ${
                  theme === 'dark' ? 'bg-purple-500/30' : 'bg-purple-600/30'
                } blur-sm group-hover:opacity-80 transition-opacity`}></div>
              </div>
              <span className={`font-bold text-xl ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              } group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors`}>
                Inpact
              </span>
            </Link>
            <MainNav />
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <div className="hidden md:flex gap-2">
              <Button variant={theme === 'dark' ? 'ghost' : 'outline'} className={theme === 'dark' ? 'text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-white/20'}>
                <Link to="/login">Login</Link>
              </Button>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
            <UserNav />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full min-h-screen flex items-center relative pt-16 overflow-hidden">
          <div className={`absolute inset-0 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-100/50 via-blue-100/50 to-indigo-100/50'
          }`}></div>
          <div className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl animate-pulse ${
            theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-300/30'
          }`}></div>
          <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse ${
            theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-300/30'
          }`}></div>
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl ${
            theme === 'dark' ? 'bg-gradient-to-r from-purple-900/10 to-blue-900/10' : 'bg-gradient-to-r from-purple-400/10 to-blue-400/10'
          }`}></div>
          
          <div className="container relative z-10 px-6 md:px-12">
            <div className="grid lg:grid-cols-2 gap-24 items-center">
              <div className="text-center lg:text-left space-y-8">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6 ${
                  theme === 'dark' ? 'bg-gray-800/80 border-gray-700' : 'bg-white/20 border-white/30'
                } backdrop-blur-sm`}>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>AI-Powered Platform</span>
                </div>
                
                <div className="space-y-6">
                  <div className="relative">
                    <h1 className={`text-5xl lg:text-7xl font-black tracking-tight leading-tight uppercase ${
                      theme === 'dark' ? 'text-white' : 'bg-gradient-to-r from-purple-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent'
                    }`}>
                      INPACT AI
                    </h1>
                    <h2 className={`text-3xl lg:text-4xl font-bold mt-4 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-800'
                    }`}>
                      Creator Collaboration Platform
                    </h2>
                  </div>
                  
                  <p className={`text-xl lg:text-2xl max-w-2xl mx-auto lg:mx-0 leading-relaxed ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Connect with brands, collaborate with creators, and optimize your partnerships through data-driven insights.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg group"
                  >
                    <Link to="/signup" className="flex items-center">
                      Get Started <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'secondary' : 'outline'}
                    size="lg"
                    className={`${
                      theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'border-white/30 bg-white/10 hover:bg-white/20'
                    } backdrop-blur-sm transition-all duration-300 px-8 py-4 text-lg`}
                  >
                    Learn More
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row gap-8 justify-center mt-19">
                  <div className="flex flex-col items-center text-center">
                    <UserPlus className="h-10 w-10 mb-2 text-purple-600" />
                    <span className={`font-semibold ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-800'
                    }`}>Create your profile</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <Sparkles className="h-10 w-10 mb-2 text-blue-600" />
                    <span className={`font-semibold ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-800'
                    }`}>Get matched by AI</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <Handshake className="h-10 w-10 mb-2 text-green-600" />
                    <span className={`font-semibold ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-800'
                    }`}>Collaborate & grow</span>
                  </div>
                </div>
              </div>
              
              <div className="relative order-first lg:order-last">
                <div className="relative">
                  <div className={`absolute -inset-8 rounded-3xl blur-2xl animate-pulse ${
                    theme === 'dark' ? 'bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-indigo-900/20' : 'bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-indigo-600/20'
                  }`}></div>
                  <div className={`absolute -inset-4 rounded-2xl blur-xl ${
                    theme === 'dark' ? 'bg-gradient-to-r from-purple-800/30 to-blue-800/30' : 'bg-gradient-to-r from-purple-400/30 to-blue-400/30'
                  }`}></div>
                  
                  <div className={`relative rounded-2xl p-4 border shadow-2xl ${
                    theme === 'dark' ? 'bg-gray-800/80 border-gray-700' : 'bg-white/20 border-white/30'
                  } backdrop-blur-sm`}>
                    <img
                      src="/Home.png"
                      alt="Hero Image"
                      className="rounded-xl object-cover w-full h-auto shadow-lg"
                    />
                  </div>
                  
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{animationDelay: '0.5s'}}>
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute top-1/2 -right-8 w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{animationDelay: '1s'}}>
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <WhyChooseSection />

        <section ref={successStoriesRef} className={`w-full py-24 relative ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-b from-purple-50 via-white to-blue-50'
        }`}>
          <div className={`absolute inset-0 ${
            theme === 'dark' ? 'bg-gray-900/80' : 'bg-white/50'
          } backdrop-blur-sm`}></div>
          <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10">
            <h2 className={`text-3xl font-bold sm:text-4xl mb-4 text-center ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Success Stories
            </h2>
            <p className={`mt-4 text-lg mb-12 text-center ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Real creators achieving amazing results with brand partnerships.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {successStories.map((story, idx) => (
                <div
                  key={idx}
                  className={`group p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border ${
                    theme === 'dark' 
                      ? 'bg-gray-800/80 border-gray-700 hover:bg-gray-800/90' 
                      : 'bg-white/80 border-white/20 hover:bg-white/90'
                  } backdrop-blur-sm`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {story.creator.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="absolute -inset-1 bg-gradient-to-br from-purple-400/20 to-blue-500/20 rounded-full blur-sm"></div>
                    </div>
                    <div className="text-left">
                      <h3 className={`font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>{story.creator}</h3>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>{story.niche}</p>
                    </div>
                  </div>
                  <div className="text-left mb-4">
                    <p className={`${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    } mb-3`}>{story.story}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className={`flex items-center gap-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        <Eye className="h-4 w-4" />
                        {story.followers}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {story.platform}
                      </span>
                    </div>
                  </div>
                  <div className={`rounded-lg p-3 border ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-800' 
                      : 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-200'
                  }`}>
                    <p className={`text-sm font-semibold ${
                      theme === 'dark' ? 'text-green-300' : 'text-green-800'
                    }`}>
                      Result: {story.result}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section ref={trendingRef} className={`w-full py-24 relative ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-b from-blue-50 via-white to-purple-50'
        }`}>
          <div className={`absolute inset-0 ${
            theme === 'dark' ? 'bg-gray-900/80' : 'bg-white/50'
          } backdrop-blur-sm`}></div>
          <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-10">
            <h2 className={`text-3xl font-bold sm:text-4xl mb-4 text-center ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Trending Niches
            </h2>
            <p className={`mt-4 text-lg mb-12 text-center ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Discover the fastest-growing content categories and opportunities.
            </p>
            <TrendingNichesSection />
          </div>
        </section>

        <footer ref={footerRef} className="w-full py-12 bg-gradient-to-r from-gray-900 to-gray-800 text-white relative">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
          <div
            className={`container relative z-10 px-6 md:px-12 text-center transition-all duration-1000 transform ${
              isFooterVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-20"
            }`}
          >
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="relative">
                <Rocket className="h-6 w-6 text-purple-400" />
                <div className="absolute -inset-1 bg-purple-400/20 rounded-full blur-sm"></div>
              </div>
              <span className="font-bold text-xl">Inpact</span>
            </div>
            <p className="text-gray-400">
              Empowering creators to build meaningful partnerships and grow their businesses.
            </p>
            <div className="mt-6 flex justify-center space-x-6 text-sm text-gray-400">
              <Link to="/dashboard" className="hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link to="/dashboard/sponsorships" className="hover:text-white transition-colors">
                Opportunities
              </Link>
              <Link to="/dashboard/analytics" className="hover:text-white transition-colors">
                Analytics
              </Link>
              <Link to="/dashboard/messages" className="hover:text-white transition-colors">
                Messages
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}