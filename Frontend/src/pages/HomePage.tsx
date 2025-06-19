import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Building,
  CheckCircle,
  Handshake,
  Layers,
  MessageSquare,
  Rocket,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { MainNav } from "../components/main-nav";
import { ModeToggle } from "../components/mode-toggle";
import { UserNav } from "../components/user-nav";
import Onboarding from "../components/Onboarding";
import { motion, useAnimation, useInView } from 'framer-motion'

const features = [
  {
    icon: Handshake,
    title: "AI-Driven Sponsorship Matchmaking",
    desc: "Connect with brands based on audience demographics, engagement rates, and content style.",
  },
  {
    icon: Users,
    title: "Creator Collaboration Hub",
    desc: "Find and partner with creators who have complementary audiences and content niches.",
  },
  {
    icon: Layers,
    title: "AI-Based Pricing Optimization",
    desc: "Get fair sponsorship pricing recommendations based on engagement and market trends.",
  },
  {
    icon: MessageSquare,
    title: "Negotiation & Contract Assistant",
    desc: "Structure deals, generate contracts, and optimize terms using AI insights.",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    desc: "Track sponsorship performance, audience engagement, and campaign success.",
  },
  {
    icon: Rocket,
    title: "ROI Tracking",
    desc: "Measure and optimize return on investment for both creators and brands.",
  },
];

export default function HomePage() {
  // Refs for scroll detection
  const featuresRef = useRef(null);
  const footerRef = useRef(null);

  // State to track visibility
  const [isFeaturesVisible, setIsFeaturesVisible] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  // Set up intersection observer for scroll detection
  useEffect(() => {
    const featuresObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsFeaturesVisible(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1, // Trigger when 10% of the element is visible
      }
    );

    const footerObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsFooterVisible(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      }
    );

    if (featuresRef.current) {
      featuresObserver.observe(featuresRef.current);
    }

    if (footerRef.current) {
      footerObserver.observe(footerRef.current);
    }

    return () => {
      if (featuresRef.current) {
        featuresObserver.unobserve(featuresRef.current);
      }
      if (footerRef.current) {
        footerObserver.unobserve(footerRef.current);
      }
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-lg px-6">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6 md:gap-10">
            <Link to="/" className="flex items-center space-x-2">
              <Rocket className="h-6 w-6 text-purple-600" />
              <span className="font-bold text-xl text-gray-900">Inpact</span>
            </Link>
            <MainNav />
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <div className="hidden md:flex gap-2">
              <Button variant="ghost">
                <Link to="/login" className="text-gray-900">
                  Login
                </Link>
              </Button>
              <Button className="bg-purple-600 text-white hover:bg-purple-700">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
            <UserNav />
          </div>
        </div>
      </header>

      {/* Hero Section - Full Screen */}
      <main className="w-full min-h-screen flex items-center pt-14  bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm border mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <motion.div
                  className="w-2 h-2 bg-green-400 rounded-full mr-2"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-sm text-slate-600">AI-Powered Platform • Open Source</span>
              </motion.div>

              <motion.h1
                className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                AI-Powered {" "}
                <span className="gradient-text"> <span className="text-purple-600">Creator</span> Collaboration </span>{" "}
              </motion.h1>

              <motion.p
                className="text-xl text-slate-600 mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Connect with brands, collaborate with creators, and optimize
                your partnerships through data-driven insights.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <Button className="px-8 py-4 bg-purple-600  hover:bg-purple-700 text-white rounded-xl font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  <Rocket className="mr-2 h-5 w-5" />
                  Start Matching Now
                </Button>
              </motion.div>

              <motion.div
                className="flex items-center gap-8 text-sm text-slate-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <div className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                  Free to start
                </div>
                <div className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                  Open source
                </div>
                <div className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                  AI-powered
                </div>
              </motion.div>
            </motion.div>
           
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="text-xs text-slate-500 font-mono">inpact.ai/dashboard</div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-800">Creator Collaboration</h3>
                    <motion.div 
                      className="flex items-center text-green-500"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      <span className="text-sm">Live</span>
                    </motion.div>
                  </div>

                  {/* Creator Cards */}
                  <div className="space-y-3">
                    <motion.div 
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.8 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">TC</span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">Tech Creator</div>
                          <div className="text-sm text-slate-500">Tech Reviews</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-600 font-semibold">95% Match</div>
                        <div className="text-xs text-slate-500">Perfect fit</div>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 1.0 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">LI</span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">Lifestyle Influencer</div>
                          <div className="text-sm text-slate-500">Fashion & Lifestyle</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-600 font-semibold">89% Match</div>
                        <div className="text-xs text-slate-500">Great match</div>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 1.2 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">FC</span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">Food Creator</div>
                          <div className="text-sm text-slate-500">Cooking & Recipes</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-600 font-semibold">82% Match</div>
                        <div className="text-xs text-slate-500">Good match</div>
                      </div>
                    </motion.div>
                  </div>

                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </main>
      {/* <main className="flex-1">
        <section className="w-full min-h-screen flex items-center bg-purple-100 pt-16">
          <div className="container ml-23 px-6 md:px-12 flex flex-col-reverse lg:flex-row items-center gap-12">
            <div className="text-center lg:text-left max-w-2xl">
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-gray-900">
                AI-Powered Creator Collaboration Platform
              </h1>
              <p className="mt-4 text-lg text-gray-700 md:text-xl">
                Connect with brands, collaborate with creators, and optimize
                your partnerships through data-driven insights.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="bg-purple-600 text-white hover:bg-purple-700"
                >
                  <Link to="/dashboard" className="flex items-center">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-gray-300 text-gray-900 hover:bg-gray-100"
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative w-full max-w-lg">
              <img
                src="/Home.png"
                alt="Hero Image"
                className="rounded-xl shadow-xl object-cover w-full h-auto"
              />
            </div>
          </div>
        </section>
      </main> */}

        {/* Onboarding Section */}
      <Onboarding />

      {/* Features Section - Revealed on Scroll */}
      <section ref={featuresRef} className="w-full py-24 bg-white">
        <div
          className={`container px-6 md:px-12 text-center transition-all duration-1000 transform ${isFeaturesVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-20"
            }`}
        >
          <h2 className="text-3xl font-bold sm:text-4xl text-gray-900">
            Key Features
          </h2>
          <p className="mt-4 text-lg text-gray-700">
            Leverage AI to transform your creator partnerships and brand
            sponsorships.
          </p>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, desc }, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center text-center p-6 bg-gray-100 rounded-xl shadow-md"
              >
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-purple-100 mb-4">
                  <Icon className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {title}
                </h3>
                <p className="mt-2 text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* </main> */}

      {/* Footer - Revealed on Scroll */}
      <footer
        ref={footerRef}
        className="mr-12 ml-12 border-t border-gray-200 bg-gray-50 py-6"
      >
        <div
          className={`container flex flex-col md:flex-row items-center justify-between text-gray-600 transition-all duration-1000 transform ${isFooterVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
            }`}
        >
          <p>© 2024 Inpact. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link to="/terms" className="hover:underline">
              Terms
            </Link>
            <Link to="/privacy" className="hover:underline">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
