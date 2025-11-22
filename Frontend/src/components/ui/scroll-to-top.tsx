import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Show button when page is scrolled down and track scroll progress
  useEffect(() => {
    const toggleVisibility = () => {
      const scrolled = window.scrollY;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = (scrolled / windowHeight) * 100;
      
      setScrollProgress(progress);
      
      if (scrolled > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    toggleVisibility(); // Initial check

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div
      className={`fixed bottom-8 right-8 z-50 transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16 pointer-events-none"
      }`}
    >
      <button
        onClick={scrollToTop}
        className="group relative p-4 rounded-full bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-600 text-white shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-purple-500/50 active:scale-95 backdrop-blur-sm"
        aria-label="Scroll to top"
        style={{
          boxShadow: `0 10px 40px rgba(147, 51, 234, ${scrollProgress / 200})`,
        }}
      >
        {/* Animated gradient border */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 -z-10" />
        
        {/* Progress ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" style={{ filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.4))' }}>
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="2"
          />
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeDasharray={`${2 * Math.PI * 20}`}
            strokeDashoffset={`${2 * Math.PI * 20 * (1 - scrollProgress / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>

        {/* Arrow icon with animation */}
        <ArrowUp className="h-6 w-6 relative z-10 group-hover:animate-bounce" />
        
        {/* Pulse effect on hover */}
        <span className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 group-hover:animate-ping" />
      </button>
      
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
        Back to top
        <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-900" />
      </div>
    </div>
  );
}
