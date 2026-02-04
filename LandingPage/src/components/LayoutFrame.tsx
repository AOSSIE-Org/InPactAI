import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useEffect } from 'react';

export default function LayoutFrame() {
    const { scrollY } = useScroll();

    // Update window height on mount/resize
  useEffect(() => {
    // Optional: could use window height for dynamic ruler calculation
  }, []);

    // Map scroll to glow intensity
    // Input: [0, 500] (pixels scrolled)
    // Output: [0.1, 1] (opacity/glow)
    const scrollRatio = useTransform(scrollY, [0, 300], [0, 1]);
    const glowOpacity = useSpring(scrollRatio, { stiffness: 100, damping: 20 });

    // Dynamic shadow style based on scroll
    const glowShadow = useTransform(
        glowOpacity,
        (v) => `0 0 ${v * 20}px ${v * 4}px rgba(168, 85, 247, ${v * 0.5})`
    );

    const borderColor = useTransform(
        glowOpacity,
        (v) => `rgba(255, 255, 255, ${0.1 + v * 0.4})`
    );

    return (
        <div className="fixed inset-0 pointer-events-none z-[60] flex flex-col justify-between overflow-hidden">

            {/* Top Border */}
            <motion.div
                style={{
                    backgroundColor: borderColor,
                    boxShadow: glowShadow
                }}
                className="w-full h-1.5 relative" // Thicker line
            >
                {/* Ruler Marks Top */}
                <div className="absolute top-0 left-0 w-full h-full flex justify-between px-12">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="h-3 w-px bg-white/30" />
                    ))}
                </div>
            </motion.div>

            {/* Middle Section (Body) with Side Borders */}
            <div className="flex-1 flex justify-between w-full relative">

                {/* Left Border */}
                <motion.div
                    style={{
                        backgroundColor: borderColor,
                        boxShadow: glowShadow
                    }}
                    className="h-full w-1.5 relative"
                >
                    {/* Ruler Marks Left */}
                    <div className="absolute top-0 left-0 h-full w-full flex flex-col justify-between py-12">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="w-3 h-px bg-white/30" />
                        ))}
                    </div>
                </motion.div>

                {/* Right Border */}
                <motion.div
                    style={{
                        backgroundColor: borderColor,
                        boxShadow: glowShadow
                    }}
                    className="h-full w-1.5 relative"
                >
                    {/* Ruler Marks Right */}
                    <div className="absolute top-0 right-0 h-full w-full flex flex-col justify-between py-12">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="w-3 h-px bg-white/30" />
                        ))}
                    </div>
                </motion.div>

            </div>

            {/* Bottom Border */}
            <motion.div
                style={{
                    backgroundColor: borderColor,
                    boxShadow: glowShadow
                }}
                className="w-full h-1.5 relative"
            >
                {/* Ruler Marks Bottom */}
                <div className="absolute bottom-0 left-0 w-full h-full flex justify-between px-12">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="h-3 w-px bg-white/30" />
                    ))}
                </div>
            </motion.div>

            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white/40" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white/40" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white/40" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white/40" />

        </div>
    );
}
