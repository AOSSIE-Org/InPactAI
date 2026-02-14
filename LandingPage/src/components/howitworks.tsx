import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    UserIcon,
    SparklesIcon,
    CreditCardIcon,
    BarChartIcon,
    LayoutDashboardIcon,
    CameraIcon
} from 'lucide-react';

// Floating Logo Component
const FloatingLogo = ({ d, className, delay, x, y }: { d: string, className?: string, delay: number, x: number | string, y: number | string }) => (
    <motion.div
        className={`absolute opacity-20 pointer-events-none ${className}`}
        initial={{ x, y }}
        animate={{
            y: [typeof y === 'number' ? y : 0, typeof y === 'number' ? y - 40 : -40, typeof y === 'number' ? y : 0],
            rotate: [0, 10, -10, 0]
        }}
        transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: delay
        }}
    >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 sm:w-24 sm:h-24 text-white/10">
            <path d={d} />
        </svg>
    </motion.div>
);

const HowItWorks: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const height = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

    const steps = [
        {
            title: "User Onboarding",
            description: "Brands and creators register and choose their roles, preferences, and categories.",
            icon: <UserIcon className="w-5 h-5" />,
            color: "from-pink-500 to-purple-500"
        },
        {
            title: "AI-Powered Matching",
            description: "Inpact uses AI to suggest ideal brand-creator collaborations based on past work.",
            icon: <SparklesIcon className="w-5 h-5" />,
            color: "from-pink-500 to-purple-500"
        },
        {
            title: "Creator Showcases",
            description: "Creators highlight their portfolios and previous collaborations for brands to evaluate.",
            icon: <CameraIcon className="w-5 h-5" />,
            color: "from-purple-500 to-pink-500"
        },
        {
            title: "Collaboration Dashboard",
            description: "Both parties interact, chat, and collaborate with full task and timeline visibility.",
            icon: <LayoutDashboardIcon className="w-5 h-5" />,
            color: "from-purple-500 to-pink-500"
        },
        {
            title: "Smart Contracts & Payments",
            description: "Secure agreements and transactions powered by Stripe or Razorpay integrations.",
            icon: <CreditCardIcon className="w-5 h-5" />,
            color: "from-pink-500 to-purple-500"
        },
        {
            title: "Analytics & Feedback",
            description: "Track campaign metrics, gather insights, and iterate smarter with dashboards.",
            icon: <BarChartIcon className="w-5 h-5" />,
            color: "from-pink-500 to-purple-500"
        }
    ];

    // Simple icons paths (React-like, Code-like, etc.) for visual ambience
    const logos = [
        { d: "M12 2L2 7l10 5 10-5-10-5zm0 9l2-10 10 5-10 5-2-10zm0 9l2-10 10 5-10 5-2-10z M2 17l10 5 10-5M2 12l10 5 10-5", x: "10%", y: 100, delay: 0 }, // Generic Layer
        { d: "M24 10.93h-5.906a4.819 4.819 0 00-1.297-2.915l3.812-4.103a1.071 1.071 0 00-.23-1.666L18.89.656a1.072 1.072 0 00-1.57.172l-3.376 4.39a4.832 4.832 0 00-3.877 0L6.69.828a1.071 1.071 0 00-1.57-.172l-1.488 1.59a1.072 1.072 0 00-.231 1.666l3.812 4.103a4.814 4.814 0 00-1.296 2.915H0a1.072 1.072 0 00-1.072 1.072v2.146A1.072 1.072 0 001.072 15.26h5.906a4.816 4.816 0 001.297 2.916l-3.812 4.102a1.072 1.072 0 00.23 1.666l1.489 1.59a1.071 1.071 0 001.57-.171l3.376-4.391a4.836 4.836 0 003.877 0l3.376 4.391a1.072 1.072 0 001.57.171l1.488-1.59a1.072 1.072 0 00.231-1.666l-3.812-4.102a4.819 4.819 0 001.297-2.916h5.906a1.072 1.072 0 001.072-1.072v-2.146a1.072 1.072 0 00-1.072-1.072zM12 15.485a3.486 3.486 0 11.001-6.972 3.486 3.486 0 01-.001 6.972z", x: "85%", y: 200, delay: 1 }, // React-ish
        { d: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.604-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12", x: "10%", y: 600, delay: 2 }, // Github
        { d: "M7.44 5.32c-.56-.56-.82-1.28-.79-2.16.03-.88.35-1.57.97-2.06.63-.49 1.36-.67 2.2-.55.84.11 1.5.51 1.99 1.18.49.67.65 1.41.48 2.23-.17.82-.61 1.5-1.32 2.03-.71.53-1.48.69-2.31.48-.83-.22-1.48-.68-1.95-1.38l.73.23zm10.23 11.23c-.76.76-1.12 1.74-1.08 2.94.04 1.2.46 2.14 1.27 2.83.81.69 1.77.92 2.88.69 1.11-.23 1.96-.83 2.56-1.81.6-1,.76-2.07.48-3.21-.28-1.14-.88-2.05-1.81-2.73-1.42-1.03-3.08-1.42-4.99-1.16l.69 2.45zm-1.8 1.83c.48.48.7 1.08.66 1.81-.04.73-.28 1.3-.73 1.71-.45.41-.95.53-1.51.36-.56-.17-.96-.51-1.22-1.02-.26-.51-.29-1.08-.11-1.71.19-.63.53-1.1 1.03-1.42.92-.59 1.88-1.21 2.88-1.83l-1.0 2.1zm-8.76-7.85c-.93.93-1.4 2.17-1.39 3.73.01 1.56.49 2.76 1.45 3.6.96.84 2.14 1.09 3.54.76 1.4-.33 2.45-1.17 3.15-2.52.7-1.35.84-2.77.42-4.26-.42-1.49-1.28-2.61-2.58-3.36-1.3-.75-2.67-.93-4.11-.53 1.09 1.29 2.18 2.58 3.27 3.87l-3.75-1.29z", x: "80%", y: 800, delay: 3 }, // Git-ish
    ];

    return (
        <section id="how-it-works" className="relative py-4 overflow-hidden" ref={containerRef}>

            {/* Background Animation - Floating Logos */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {logos.map((logo, i) => (
                    <FloatingLogo
                        key={i}
                        d={logo.d}
                        x={logo.x}
                        y={logo.y}
                        delay={logo.delay}
                    />
                ))}
            </div>

            <div className="container mx-auto px-6 max-w-6xl relative z-10">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-5"
                >
                    <span className="inline-flex px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] uppercase tracking-wider text-purple-300 font-semibold">
                        Process
                    </span>
                    <h2 className="mt-6 text-4xl sm:text-6xl font-bold tracking-[-0.02em] text-white">
                        How InpactAI works
                    </h2>
                    <p className="mt-6 text-lg text-gray-400 max-w-lg mx-auto leading-relaxed">
                        A seamless, AI-driven workflow rooted in open source transparency.
                    </p>
                </motion.div>

                {/* Timeline Container */}
                <div className="relative">

                    {/* Central Timeline Line - Bolder & Glowing */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1.5 bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                        <motion.div
                            style={{ height }}
                            className="w-full bg-gradient-to-b from-purple-500 via-pink-500 to-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.6)]"
                        />
                    </div>

                    {/* Timeline Steps */}
                    <div className="flex flex-col gap-12 sm:gap-16 relative z-20">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className={`relative flex items-center md:items-start ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                                    }`}
                            >
                                {/* Mobile: Icon on left, Content on right */}
                                {/* Desktop: Alternating */}

                                {/* Padding Spacer for Alternating Layout */}
                                <div className="hidden md:block flex-1" />

                                {/* Center Connector Point */}
                                <div className="absolute left-[20px] md:left-1/2 -translate-x-1/2 flex items-center justify-center w-4 h-4 rounded-full bg-[#0a0a0b] border border-white/20 shadow-[0_0_10px_rgba(0,0,0,1)] z-30">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                </div>

                                {/* Content Card */}
                                <div className="flex-1 pl-16 md:pl-0 md:px-12">
                                    {/* Conditional alignment for desktop */}
                                    <div className={`p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-colors duration-300 group flex items-start gap-6 backdrop-blur-sm relative z-20 ${index % 2 === 0 ? 'md:flex-row-reverse md:text-right' : 'md:flex-row md:text-left'
                                        }`}>
                                        <div className={`min-w-[48px] w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} text-white shadow-lg flex items-center justify-center mt-1 flex-shrink-0`}>
                                            {step.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                                            <p className="text-base text-gray-400 leading-relaxed font-medium">{step.description}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                </div>

            </div>
        </section>
    );
};

export default HowItWorks;