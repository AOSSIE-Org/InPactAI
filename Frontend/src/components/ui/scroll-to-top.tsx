import { useState, useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [circleRadius, setCircleRadius] = useState(20);
  const rafIdRef = useRef<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const updateScrollState = () => {
      const scrolled = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const scrollableHeight = documentHeight - clientHeight;
      
      const progress = scrollableHeight > 0
        ? Math.min(100, Math.max(0, (scrolled / scrollableHeight) * 100))
        : 0;
      
      setScrollProgress(progress);
      setIsVisible(scrolled > 300);
      rafIdRef.current = null;
    };

    const handleScroll = () => {
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(updateScrollState);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateScrollState();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const updateCircleRadius = () => {
      if (svgRef.current) {
        const svgRect = svgRef.current.getBoundingClientRect();
        const computedRadius = (Math.min(svgRect.width, svgRect.height) / 2) * 0.45;
        setCircleRadius(Math.max(computedRadius, 1));
      }
    };

    updateCircleRadius();
    window.addEventListener("resize", updateCircleRadius, { passive: true });

    return () => {
      window.removeEventListener("resize", updateCircleRadius);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const circumference = 2 * Math.PI * circleRadius;
  const offset = circumference * (1 - scrollProgress / 100);

  return (
    <div
      className={`fixed bottom-8 right-8 z-50 transition-all duration-500 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16 pointer-events-none"
      }`}
      role="complementary"
      aria-label="Scroll to top navigation"
    >
      <div className="group relative">
        <button
        onClick={scrollToTop}
        className="group relative p-4 rounded-full bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-600 text-white shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-purple-500/50 active:scale-95 backdrop-blur-sm"
        aria-label="Scroll to top"
        type="button"
        style={{
          boxShadow: `0 10px 40px rgba(147, 51, 234, ${Math.min(0.5, scrollProgress / 200)})`,
        }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 -z-10" />
        
        <svg 
          ref={svgRef}
          className="absolute inset-0 w-full h-full -rotate-90" 
          style={{ filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.4))' }}
        >
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
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>

        <ArrowUp className="h-6 w-6 relative z-10 group-hover:animate-bounce" aria-hidden="true" />
        
        <span className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 group-hover:animate-ping" aria-hidden="true" />
        </button>
        
        <div 
          className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none"
          role="tooltip"
          aria-hidden="true"
        >
          Back to top
          <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-900" />
        </div>
      </div>
    </div>
  );
}
