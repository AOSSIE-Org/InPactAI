import { motion } from 'framer-motion';
import { Sparkles, Users, ArrowRight, Zap, Globe, ShieldCheck, Check } from 'lucide-react';
import { DollarSign, FileText, BarChart2, RefreshCw } from 'lucide-react';
import ChatbotSidebarForm from '../components/form';
import Integrations from '../components/integration';
import HowItWorks from '../components/howitworks';
import { useEffect, useState } from 'react';
import Community from '../components/Community';
import Threads from '../components/bg';
import ShootingStars from '../components/ShootingStars';

// Ruler marks component for the grid lines
const RulerMarks = ({ side }: { side: 'left' | 'right' }) => {
  const marks = [100, 200, 300, 400, 500, 600, 700, 800];
  return (
    <div className={`absolute ${side === 'left' ? 'left-0' : 'right-0'} top-0 bottom-0 w-8 pointer-events-none`}>
      {/* Main vertical line - Brighter opacity [0.08] */}
      <div className={`absolute ${side === 'left' ? 'right-0' : 'left-0'} top-0 bottom-0 w-px bg-white/[0.08]`} />
      {/* Number markers */}
      {marks.map((num) => (
        <div
          key={num}
          className={`absolute ${side === 'left' ? 'right-2' : 'left-2'} flex items-center gap-1`}
          style={{ top: `${num}px` }}
        >
          {side === 'left' && (
            <>
              <span className="text-[10px] text-white/30 font-mono">{num}</span>
              <div className="w-1.5 h-px bg-white/[0.1]" />
            </>
          )}
          {side === 'right' && (
            <>
              <div className="w-1.5 h-px bg-white/[0.1]" />
              <span className="text-[10px] text-white/30 font-mono">{num}</span>
            </>
          )}
        </div>
      ))}
      {/* Corner dots */}
      <div className={`absolute ${side === 'left' ? 'right-0' : 'left-0'} top-0 w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20`} />
    </div>
  );
};

// Typewriter Component
const Typewriter = ({ text, delay = 0, className }: { text: string; delay?: number; className?: string }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayedText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(interval);
        }
      }, 50); // Typing speed

      // Cleanup for interval inside timeout
      return () => clearInterval(interval);
    }, delay * 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [text, delay]);

  return (
    <span className={className}>
      {displayedText}
      <span className="animate-pulse">|</span>
    </span>
  );
};

// Glowing Beam Component for Grid Borders
const GlowingBeam = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Horizontal Beam */}
      <motion.div
        className="absolute top-0 left-[-100%] h-px w-full bg-gradient-to-r from-transparent via-purple-500 to-transparent"
        animate={{ left: ['100%', '-100%'] }}
        transition={{ duration: 8, ease: "linear", repeat: Infinity }}
        style={{ opacity: 0.5 }}
      />
      {/* Vertical Beam */}
      <motion.div
        className="absolute top-[-100%] left-0 w-px h-full bg-gradient-to-b from-transparent via-purple-500 to-transparent"
        animate={{ top: ['100%', '-100%'] }}
        transition={{ duration: 8, ease: "linear", repeat: Infinity, delay: 4 }}
        style={{ opacity: 0.5 }}
      />
    </div>
  );
}

function Landing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] } },
  };

  const features = [
    {
      icon: <Users className="w-5 h-5" />,
      title: 'AI-Driven Sponsorship Matchmaking',
      description:
        'Connects creators with brands based on demographics.',
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: 'Creator Collaboration Hub',
      description:
        'Facilitates partnerships between creators with complementary audiences.',
    },
    {
      icon: <DollarSign className="w-5 h-5" />,
      title: 'Pricing & Deal Optimization',
      description:
        'Fair pricing recommendations based on engagement trends.',
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: 'Contract Assistant',
      description:
        'AI-powered deal structuring, contract generation, and optimization.',
    },
    {
      icon: <BarChart2 className="w-5 h-5" />,
      title: 'Performance Analytics',
      description:
        'Track sponsorship performance, audience engagement, and ROI.',
    },
    {
      icon: <RefreshCw className="w-5 h-5" />,
      title: 'Real-Time Feedback Loop',
      description:
        'Continuous campaign feedback to improve effectiveness.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Main Container with Grid Lines */}
      <div className="relative max-w-[1200px] mx-auto px-8 lg:px-12">
        {/* Left Ruler */}
        <RulerMarks side="left" />
        {/* Right Ruler */}
        <RulerMarks side="right" />

        {/* Hero Section */}
        <div className="relative isolate pt-14 lg:pt-0 min-h-screen flex flex-col justify-center overflow-visible z-10">
          {/* Threads Background - Moved here for impact */}
          <div className="absolute inset-0 opacity-40 pointer-events-none z-0">
            <Threads
              color={[0.6, 0.3, 0.9]}
              amplitude={1.2}
              distance={0}
              enableMouseInteraction={true}
            />
          </div>

          {/* Background Gradients */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Main glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-purple-600/[0.12] via-pink-600/[0.08] to-transparent rounded-full blur-[100px]" />
            {/* Secondary accent glow */}
            <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-purple-500/[0.06] rounded-full blur-[80px]" />
            <div className="absolute bottom-1/3 left-1/4 w-[250px] h-[250px] bg-pink-500/[0.05] rounded-full blur-[60px]" />
            {/* Noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
            {/* Radial gradient vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0a0a0b_70%)]" />
          </div>

          <motion.div
            className="relative z-10 max-w-3xl mx-auto text-center"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {/* Social Proof Badge */}
            <motion.div
              variants={itemVariants}
              className="mb-8 flex items-center justify-center gap-3"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-[#0a0a0b] flex items-center justify-center text-[9px] font-medium text-white"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span className="text-sm text-gray-500 font-medium">
                Trusted by <span className="text-gray-300">2,000+</span> creators
              </span>
            </motion.div>

            {/* Headline - Typewriter Effect */}
            <div className="min-h-[160px] sm:min-h-[200px] flex items-center justify-center mb-8">
              <h1 className="text-[3.5rem] sm:text-[4.5rem] lg:text-[5.5rem] font-bold tracking-[-0.04em] leading-[0.9] text-center">
                <span className="block text-white lg:text-transparent lg:bg-clip-text lg:bg-gradient-to-r lg:from-purple-300 lg:via-pink-200 lg:to-purple-300">
                  <Typewriter text="Creator Collaboration Hub" />
                </span>
              </h1>
            </div>

            {/* Subheadline */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-gray-400 max-w-md mx-auto mb-10 leading-relaxed font-medium"
            >
              The future of creator partnerships. Join the waitlist to experience the revolution in influencer marketing.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#waitlist"
                className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-white text-black font-semibold text-sm hover:bg-gray-100 transition-all duration-200 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              >
                <span>Get Started</span>
                <span className="text-gray-500">— it's free</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </motion.div>

            {/* Premium Badges */}
            <motion.div
              variants={itemVariants}
              className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500 font-medium"
            >
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08]">
                <Globe className="w-4 h-4 text-purple-400" />
                <span>Global Reach</span>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08]">
                <ShieldCheck className="w-4 h-4 text-pink-400" />
                <span>Enterprise Secure</span>
              </div>
            </motion.div>

            {/* Powered by AOSSIE */}
            <motion.div
              variants={itemVariants}
              className="mt-20 pt-8 border-t border-white/[0.08] w-full max-w-xs mx-auto"
            >
              <a
                href="https://aossie.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 text-xs text-gray-500 hover:text-gray-300 transition-colors w-full"
              >
                <Zap className="w-3.5 h-3.5 text-purple-500/80" />
                <span>Powered by AOSSIE</span>
                <span className="w-px h-3 bg-white/10" />
                <img
                  src="/aossie_logo.png"
                  alt="AOSSIE"
                  className="h-4 w-auto opacity-50 grayscale hover:grayscale-0 transition-all"
                />
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Horizontal Divider with Dots - Brighter [0.08] */}
        <div className="relative h-px bg-white/[0.08]">
          <div className="absolute left-0 top-1/2 w-1.5 h-1.5 -translate-y-1/2 rounded-full bg-white/20" />
          <div className="absolute right-0 top-1/2 w-1.5 h-1.5 -translate-y-1/2 rounded-full bg-white/20" />
        </div>

        {/* Features Section - Grid Layout */}
        <section id="features" className="py-24">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <span className="inline-flex px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] uppercase tracking-wider text-purple-300 font-semibold">
              Features
            </span>
            <h2 className="mt-6 text-4xl font-bold tracking-[-0.02em] text-white">
              What's inside InPactAI?
            </h2>
            <p className="mt-4 text-gray-400 max-w-lg mx-auto">
              500+ flexible components with developer-friendly codebase.
            </p>
          </motion.div>

          {/* Features Grid Container */}
          <div className="relative border border-white/10 bg-white/[0.01] shadow-[0_0_20px_rgba(255,255,255,0.02)]">
            <GlowingBeam />
            <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.15]">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative p-8 md:p-10 flex flex-col items-center text-center transition-colors duration-300"
                >
                  {/* Horizontal Divider for mobile (except first) */}
                  {index > 0 && <div className="absolute top-0 left-8 right-8 h-[1.5px] bg-white/[0.15] md:hidden shadow-[0_0_8px_rgba(255,255,255,0.2)]" />}

                  {/* Inner Horizontal Grid Lines (Desktop) - Row Dividers */}
                  {index >= 3 && (
                    <div className="hidden md:block absolute top-0 left-0 right-0 h-[1.5px] bg-white/[0.15] shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
                  )}


                  <div className="w-10 h-10 rounded-lg bg-transparent flex items-center justify-center text-purple-400 mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:text-purple-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
            {/* Horizontal Grid Line for 2nd Row Desktop - Bolder */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-[1.5px] bg-white/[0.15] shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
          </div>
        </section>

        {/* Horizontal Divider with Dots */}
        <div className="relative h-px bg-white/[0.08]">
          <div className="absolute left-0 top-1/2 w-1.5 h-1.5 -translate-y-1/2 rounded-full bg-white/20" />
          <div className="absolute right-0 top-1/2 w-1.5 h-1.5 -translate-y-1/2 rounded-full bg-white/20" />
        </div>

        {/* How It Works Section */}
        <section>
          <HowItWorks />
        </section>

        {/* Horizontal Divider with Dots */}
        <div className="relative h-px bg-white/[0.08]">
          <div className="absolute left-0 top-1/2 w-1.5 h-1.5 -translate-y-1/2 rounded-full bg-white/20" />
          <div className="absolute right-0 top-1/2 w-1.5 h-1.5 -translate-y-1/2 rounded-full bg-white/20" />
        </div>

        {/* Integrations Section */}
        <section className="py-32">
          <Integrations />
        </section>

        {/* Horizontal Divider with Dots */}
        <div className="relative h-px bg-white/[0.08]">
          <div className="absolute left-0 top-1/2 w-1.5 h-1.5 -translate-y-1/2 rounded-full bg-white/20" />
          <div className="absolute right-0 top-1/2 w-1.5 h-1.5 -translate-y-1/2 rounded-full bg-white/20" />
        </div>

        {/* Community Section */}
        <Community />

        {/* Horizontal Divider with Dots */}
        <div className="relative h-px bg-white/[0.08]">
          <div className="absolute left-0 top-1/2 w-1.5 h-1.5 -translate-y-1/2 rounded-full bg-white/20" />
          <div className="absolute right-0 top-1/2 w-1.5 h-1.5 -translate-y-1/2 rounded-full bg-white/20" />
        </div>

        {/* Waitlist CTA Section */}
        <section id="waitlist" className="relative py-32 overflow-hidden">

          {/* Spotlight Background */}
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-[#0a0a0b] to-[#0a0a0b] pointer-events-none z-0" />

          {/* Shooting Stars Background */}
          <div className="absolute inset-0 z-0">
            <ShootingStars />
          </div>

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none z-0" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative z-10 max-w-4xl mx-auto text-center px-6"
          >
            <span className="inline-flex px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-[10px] uppercase tracking-wider text-pink-300 font-semibold mb-8 shadow-[0_0_10px_rgba(236,72,153,0.2)]">
              Early Access
            </span>
            <h2 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter text-white mb-8 drop-shadow-[0_0_25px_rgba(168,85,247,0.6)]">
              Join the revolution
            </h2>
            <p className="mt-6 text-xl sm:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed font-light">
              Be the first to experience how InPactAI is transforming creator-brand collaboration.
            </p>

            <div className="mt-16 flex justify-center">
              <ChatbotSidebarForm />
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 inline-flex items-center justify-center gap-4 sm:gap-8 p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm">
              {['Free to join', 'No spam', 'Priority access'].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm sm:text-base text-gray-300 font-medium">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500/20 border border-green-500/30">
                    <Check className="w-3 h-3 text-green-400" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}

export default Landing;
