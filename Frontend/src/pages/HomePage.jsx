"use client";

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
} from "lucide-react";
import { Button } from "../components/ui/button";
import { MainNav } from "../components/main-nav";
import { ModeToggle } from "../components/mode-toggle";
import { UserNav } from "../components/user-nav";

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
      <main className="flex-1">
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

        {/* Features Section - Revealed on Scroll */}
        <section ref={featuresRef} className="w-full py-24 bg-white">
          <div
            className={`container px-6 md:px-12 text-center transition-all duration-1000 transform ${
              isFeaturesVisible
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
      </main>

      {/* Footer - Revealed on Scroll */}
      <footer
        ref={footerRef}
        className="mr-12 ml-12 border-t border-gray-200 bg-gray-50 py-6"
      >
        <div
          className={`container flex flex-col md:flex-row items-center justify-between text-gray-600 transition-all duration-1000 transform ${
            isFooterVisible
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
