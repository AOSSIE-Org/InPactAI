import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const RulerMarks = ({ side }: { side: 'left' | 'right' }) => {
    const marks = [100, 200, 300, 400, 500, 600, 700, 800];
    return (
        <div className={`absolute ${side === 'left' ? 'left-0' : 'right-0'} top-0 bottom-0 w-8 pointer-events-none`}>
            <div className={`absolute ${side === 'left' ? 'right-0' : 'left-0'} top-0 bottom-0 w-px bg-white/[0.08]`} />
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
            <div className={`absolute ${side === 'left' ? 'right-0' : 'left-0'} top-0 w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20`} />
        </div>
    );
};

const GlowingBeam = () => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <motion.div
                className="absolute top-0 left-[-100%] h-px w-full bg-gradient-to-r from-transparent via-purple-500 to-transparent"
                animate={{ left: ['100%', '-100%'] }}
                transition={{ duration: 8, ease: "linear", repeat: Infinity }}
                style={{ opacity: 0.5 }}
            />
            <motion.div
                className="absolute top-[-100%] left-0 w-px h-full bg-gradient-to-b from-transparent via-purple-500 to-transparent"
                animate={{ top: ['100%', '-100%'] }}
                transition={{ duration: 8, ease: "linear", repeat: Infinity, delay: 4 }}
                style={{ opacity: 0.5 }}
            />
        </div>
    );
}

const TermsOfService: React.FC = () => {
    useEffect(() => {
        document.title = "Terms of Service | InPactAI";
    }, []);

    return (
        <div className="min-h-screen pt-20">
            {/* Main Container with Grid Lines */}
            <div className="relative max-w-[1200px] mx-auto px-8 lg:px-12">
                {/* Left Ruler */}
                <RulerMarks side="left" />
                {/* Right Ruler */}
                <RulerMarks side="right" />

                <div className="relative border-x border-white/[0.04] min-h-screen">
                    <GlowingBeam />

                    <main className="py-16 relative z-10 px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-3xl mx-auto"
                        >
                            <h1 className="text-4xl md:text-5xl font-bold mb-8 text-white tracking-tight">
                                Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Service</span>
                            </h1>

                            <div className="prose prose-invert max-w-none">
                            
                                <section className="mb-12">
                                    <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                        Introduction
                                    </h2>
                                    <p className="text-gray-400 leading-relaxed font-medium">
                                        Welcome to <span className="text-white">InPactAI</span>. These Terms of Service ("Terms") govern your use of our platform and services. By accessing or using InPactAI, you agree to be bound by these Terms.
                                    </p>
                                </section>

                                <section className="mb-12">
                                    <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                        Use of the Platform
                                    </h2>
                                    <p className="text-gray-400 leading-relaxed font-medium">You agree to use the platform in compliance with all applicable laws and regulations. You must not misuse our platform or attempt to access it using a method other than the interface we provide.</p>
                                </section>

                                <section className="mb-12">
                                    <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                        Account Registration
                                    </h2>
                                    <p className="text-gray-400 leading-relaxed font-medium">To access certain features, you may be required to create an account. You are responsible for safeguarding your account credentials and for any activities or actions under your account.</p>
                                </section>

                                <section className="mb-12">
                                    <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                        User Content
                                    </h2>
                                    <p className="text-gray-400 leading-relaxed font-medium">You retain ownership of the content you submit to the platform, but you grant <span className="text-white">InPactAI</span> a worldwide, royalty-free license to use, display, and distribute that content as needed to provide services.</p>
                                </section>

                                <section className="mb-12">
                                    <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                        Prohibited Activities
                                    </h2>
                                    <p className="text-gray-400 mb-4 leading-relaxed font-medium">You agree not to engage in any of the following:</p>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                        {['Reverse engineering or decompiling', 'Unlawful or harmful purposes', 'Infringing intellectual property', 'Disrupting platform security'].map((item, i) => (
                                            <li key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-gray-400">
                                                <div className="mt-1 w-1 h-1 rounded-full bg-purple-500/50" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </section>

                                <section className="mb-12">
                                    <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                        Termination
                                    </h2>
                                    <p className="text-gray-400 leading-relaxed font-medium">
                                        We may suspend or terminate your access if you violate these Terms. Upon termination, your right to use the platform ceases immediately.
                                    </p>
                                </section>

                                <section className="mb-12">
                                    <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                        Disclaimers
                                    </h2>
                                    <p className="text-gray-400 leading-relaxed font-medium">
                                        The platform is provided "as is" without warranties of any kind. We do not guarantee that the platform will be uninterrupted, secure, or error-free.
                                    </p>
                                </section>

                                <section className="mb-12">
                                    <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                        Limitation of Liability
                                    </h2>
                                    <p className="text-gray-400 leading-relaxed font-medium">
                                        To the fullest extent permitted by law, <span className="text-white">InPactAI</span> shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of the platform.
                                    </p>
                                </section>

                                <section className="mb-12 border-t border-white/[0.08] pt-12">
                                    <h2 className="text-xl font-semibold mb-4 text-white">Contact Us</h2>
                                    <p className="text-gray-400 leading-relaxed font-medium">
                                        If you have any questions about these Terms, contact us at:
                                        <br />
                                        <a href="mailto:aossie.oss@gmail.com" className="inline-block mt-4 px-6 py-3 rounded-full bg-white/[0.05] border border-white/10 text-white hover:bg-white/10 transition-colors">aossie.oss@gmail.com</a>
                                    </p>
                                </section>
                            </div>
                        </motion.div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;