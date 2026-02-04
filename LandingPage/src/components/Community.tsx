import { motion } from 'framer-motion';
import { Github, Twitter, MessageSquare } from 'lucide-react';

const Community = () => {
    const socials = [
        {
            name: 'Discord',
            description: 'Join the community, ask questions, and share tips.',
            icon: <MessageSquare className="w-10 h-10 text-white" />,
            href: 'https://discord.gg/aossie',
            color: 'hover:border-indigo-500/50 hover:shadow-indigo-500/20'
        },
        {
            name: 'GitHub',
            description: 'Report bugs, request features and contribute to the project.',
            icon: <Github className="w-10 h-10 text-white" />,
            href: 'https://github.com/AOSSIE-Org/InPactAI',
            color: 'hover:border-white/50 hover:shadow-white/20'
        },
        {
            name: 'Twitter',
            description: 'Stay updated with tips, announcements, and general info.',
            icon: <Twitter className="w-10 h-10 text-white" />,
            href: 'https://twitter.com/AOSSIE_Org',
            color: 'hover:border-sky-500/50 hover:shadow-sky-500/20'
        }
    ];

    return (
        <section className="relative py-24 bg-[#0a0a0b] overflow-hidden">

            {/* Top Gradient Fade */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#0a0a0b] to-transparent z-10" />

            <div className="container mx-auto px-6 max-w-6xl relative z-20">

                {/* Header */}
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-medium text-gray-300 tracking-wide uppercase">Community</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 tracking-tight mb-4">
                        Join our community
                    </h2>
                    <p className="text-lg text-gray-400 max-w-lg mx-auto">
                        Connect, learn, and grow with fellow creators and developers.
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid md:grid-cols-3 gap-6 relative">
                    {/* Connection Line Graphic (Background) */}
                    <div className="absolute -bottom-16 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent hidden md:block" />
                    <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-white/10 to-transparent hidden md:block" />

                    {socials.map((social, index) => (
                        <motion.a
                            key={index}
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`group relative p-10 rounded-2xl bg-[#0a0a0b] border border-white/10 ${social.color} transition-all duration-300 flex flex-col items-center text-center overflow-hidden`}
                        >
                            {/* Hover Gradient Background */}
                            <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            <div className="relative z-10 mb-6 group-hover:scale-110 transition-transform duration-300">
                                {social.icon}
                            </div>

                            <h3 className="relative z-10 text-xl font-bold text-white mb-3">
                                {social.name}
                            </h3>

                            <p className="relative z-10 text-sm text-gray-400 leading-relaxed px-4">
                                {social.description}
                            </p>
                        </motion.a>
                    ))}
                </div>

                {/* Bottom Connector Graphic (SVG approximation of the reference) */}
                <div className="mt-16 relative h-16 w-full max-w-3xl mx-auto hidden md:block opacity-60">
                    <svg className="w-full h-full text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" viewBox="0 0 400 50" preserveAspectRatio="none">
                        <path d="M0 0 C 150 0, 150 50, 200 50 C 250 50, 250 0, 400 0" fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                        <circle cx="200" cy="50" r="4" fill="currentColor" />
                        <circle cx="0" cy="0" r="3" fill="currentColor" />
                        <circle cx="400" cy="0" r="3" fill="currentColor" />
                    </svg>
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs text-gray-400 font-bold tracking-wider uppercase bg-[#0a0a0b] px-4">
                        <div className="w-2 h-2 rounded-sm border-2 border-white/50" />
                        Stay Informed
                    </div>
                </div>

            </div>
        </section>
    );
};

export default Community;
