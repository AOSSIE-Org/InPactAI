import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Rocket } from "lucide-react";

const Footer = () => {
  const footerRef = useRef<HTMLElement | null>(null);
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    if (footerRef.current) observer.observe(footerRef.current);

    return () => {
      if (footerRef.current) observer.unobserve(footerRef.current);
    };
  }, []);

  return (
    <footer
      ref={footerRef}
      className="relative w-full overflow-hidden bg-gradient-to-r from-gray-900 via-gray-900 to-gray-800 text-white"
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      <div
        className={`relative z-10 mx-auto max-w-7xl px-6 md:px-12 py-14 text-center transition-all duration-1000 ease-out transform ${
          isFooterVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-20"
        }`}
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="relative">
            <Rocket className="h-6 w-6 text-purple-400" />
            <div className="absolute -inset-1 rounded-full bg-purple-400/20 blur-md" />
          </div>
          <span className="text-xl font-semibold tracking-wide">Inpact</span>
        </div>

        <p className="mx-auto max-w-xl text-sm md:text-base text-gray-400">
          Empowering creators to build meaningful partnerships and grow their
          businesses.
        </p>

        <nav className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-gray-400">
          <Link to="/dashboard" className="hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link
            to="/dashboard/sponsorships"
            className="hover:text-white transition-colors"
          >
            Opportunities
          </Link>
          <Link
            to="/dashboard/analytics"
            className="hover:text-white transition-colors"
          >
            Analytics
          </Link>
          <Link
            to="/dashboard/messages"
            className="hover:text-white transition-colors"
          >
            Messages
          </Link>
        </nav>

        <div className="mt-10 h-px w-full bg-gradient-to-r from-transparent via-gray-700 to-transparent" />

        <p className="mt-6 text-xs text-gray-500">
          © {new Date().getFullYear()} InpactAI. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;