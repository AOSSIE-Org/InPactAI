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

const PrivacyPolicy: React.FC = () => {
    useEffect(() => {
        document.title = "Privacy Policy | InPactAI";
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
                                Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Policy</span>
                            </h1>

                            <div className="prose prose-invert max-w-none">
                                <p className="text-gray-400 mb-8 font-medium">Last updated: February 5, 2026</p>

                                <section className="mb-12">
                                    <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                        Introduction
                                    </h2>
                                    <p className="text-gray-400 leading-relaxed font-medium">
                                        At <span className="text-white">InPactAI</span>, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
                                    </p>
                                </section>

                                <section className="mb-12">
                                    <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                        Information We Collect
                                    </h2>
                                    <p className="text-gray-400 mb-4 leading-relaxed font-medium">When you use InPactAI, we may collect the following types of information:</p>
                                    <ul className="grid grid-cols-1 gap-4 mt-6">
                                        {[
                                            { title: 'Personal Information', desc: 'Name, email address, and organization details provided during signup.' },
                                            { title: 'Platform Data', desc: 'Connected platform data (Instagram, TikTok, LinkedIn) for creator-brand matching.' },
                                            { title: 'Usage Information', desc: 'Analytics on how you interact with our platform and features.' }
                                        ].map((item, i) => (
                                            <li key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm group hover:bg-white/[0.05] transition-colors">
                                                <strong className="text-white block mb-1">{item.title}</strong>
                                                <span className="text-gray-400">{item.desc}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>

                                <section className="mb-12">
                                    <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                        How We Use Your Information
                                    </h2>
                                    <p className="text-gray-400 leading-relaxed font-medium">We use the collected information for various purposes, including:</p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
                                        {[
                                            'Platform maintenance',
                                            'Matching accuracy',
                                            'Dashboard analytics',
                                            'Updates & insights',
                                            'Data integrity',
                                            'Platform security'
                                        ].map((item, i) => (
                                            <div key={i} className="px-3 py-2 rounded-lg bg-purple-500/5 border border-purple-500/10 text-xs text-purple-300 text-center">
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="mb-12 border-t border-white/[0.08] pt-12">
                                    <h2 className="text-xl font-semibold mb-4 text-white">Contact Us</h2>
                                    <p className="text-gray-400 leading-relaxed font-medium">
                                        If you have any questions about this Privacy Policy, feel free to reach out:
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

export default PrivacyPolicy;
