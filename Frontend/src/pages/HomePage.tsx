import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Building,
  CheckCircle,
  DollarSign,
  Handshake,
  Layers,
  MessageSquare,
  Rocket,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { MainNav } from "../components/main-nav";
import { ModeToggle } from "../components/mode-toggle";
import { UserNav } from "../components/user-nav";
import Onboarding from "../components/Onboarding";
import { motion, useAnimation, useInView } from 'framer-motion'
import AnimatedSection from "@/components/AnimatedSection";
import CreatorFeatures from "./CreatorFeatures";

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
      <section className="w-full min-h-screen mt-10 md:mt-10 lg:mt-10 xl:mt-0 flex items-center pt-14  bg-white to-purple- relative overflow-hidden">
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
                className="text-4xl font-bold tracking-tight sm:text-6xl text-gray-900"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Connect Creators {" "}
                <span className="gradient-text"> With</span>{" "}
                {" "}
                <span className="text-purple-600">AI-Powered</span>
                {" "}Collaboration Platform
              </motion.h1>

              <motion.p
                className="text-xl text-slate-600 mb-8 leading-relaxed mt-4"
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
                  <Link to={"/login"}>Start Matching Now</Link>
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
              <div className="relative bg-white rounded-3xl shadow-md mb-1 md:mb-0  border border-slate-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="text-xs text-slate-500 font-mono">inpact</div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-slate-800">Key Features</h3>
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
                      <div className="flex flex-col md:flex-row gap-4 md:gap-2 items-center space-x-3">
                        <div className="p-3 aspect-square hidden bg-gradient-to-r from-blue-400 to-blue-400 rounded-full md:flex items-center justify-center overflow-hidden">
                          <span className="text-white text-sm font-medium leading-none">AI</span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">AI-Driven Sponsorship Matchmaking</div>
                          <div className="text-sm text-slate-500">Connect with brands based on audience demographics</div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 1.0 }}
                    >
                      <div className="flex flex-col md:flex-row gap-4 md:gap-2 items-center space-x-3">
                        <div className="p-3 hidden aspect-square bg-gradient-to-r from-purple-400 to-pink-400 rounded-full md:flex items-center justify-center overflow-hidden">
                          <span className="text-white text-sm font-medium leading-none">CC</span>
                        </div>

                        <div>
                          <div className="font-medium text-slate-800">Creator Collaboration Hub</div>
                          <div className="text-sm text-slate-500">Find and partner with creators who have complementary audiences and content niches.</div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 1.2 }}
                    >
                      <div className="flex flex-col md:flex-row gap-4 md:gap-2 items-center space-x-3">
                        <div className="p-2 hidden bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full md:flex items-center justify-center">
                          <span className="text-white text-sm font-medium">PO</span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">AI-Based Pricing Optimization</div>
                          <div className="text-sm text-slate-500">Get fair sponsorship pricing recommendations based on engagement and market trends.</div>
                        </div>
                      </div>
                    </motion.div>

                    <Button onClick={() => {
                      const section = document.getElementById('key-features');
                      if (section) {
                        section.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                      className="px-8 py-4 bg-purple-600  hover:bg-purple-700 text-white rounded-xl font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                      View More
                    </Button>

                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>



      {/* Creator features */}
      <CreatorFeatures />

      {/* Onboarding Section */}
      <Onboarding />

      {/* Features Section - Revealed on Scroll */}
      <section id="key-features" ref={featuresRef} className="w-full py-24 bg-white">
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
              <motion.div
                key={idx}
                whileHover={{ scale: 1.03 }}
                className="flex hover:shadow-md flex-col items-center text-center p-6 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-100 rounded-xl "
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex items-center justify-center h-20 w-20 rounded-full bg-purple-100 mb-4"
                >
                  <Icon className="h-10 w-10 text-purple-600" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {title}
                </h3>
                <p className="mt-2 text-gray-600">{desc}</p>
              </motion.div>
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
