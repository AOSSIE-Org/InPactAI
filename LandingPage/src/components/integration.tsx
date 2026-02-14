import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Youtube, Twitter, Linkedin, Check, Plus } from 'lucide-react';

export default function Integrations() {
    // Independent state for each card would ideally be managing by ID, but index works for now
    const [connected, setConnected] = useState<number[]>([]);

    const toggleConnect = (index: number) => {
        if (connected.includes(index)) {
            setConnected(connected.filter(i => i !== index));
        } else {
            setConnected([...connected, index]);
        }
    };

    const integrations = [
        {
            icon: <Instagram className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />,
            name: 'Instagram',
            description: 'Fetch creator insights like engagement rate, reach trends, and content breakdown.',
            color: 'from-pink-500 to-purple-500'
        },
        {
            icon: <Youtube className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />,
            name: 'YouTube',
            description: 'Access analytics on video performance, channel growth, and viewer demographics.',
            color: 'from-red-500 to-red-600'
        },
        {
            icon: <Twitter className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />,
            name: 'X (Twitter)',
            description: 'Measure influence through tweet engagement, retweet rate, and follower insights.',
            color: 'from-gray-700 to-gray-900'
        },
        {
            icon: <Linkedin className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />,
            name: 'LinkedIn',
            description: 'Track professional creator presence and branded thought leadership impact.',
            color: 'from-blue-600 to-blue-700'
        },
    ];

    return (
        <section id="integrations" className="relative py-24 bg-[#0a0a0b] overflow-hidden">
            <div className="container mx-auto px-6 max-w-6xl relative z-10">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <span className="inline-flex px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] uppercase tracking-wider text-blue-300 font-semibold">
                        Integrations
                    </span>
                    <h2 className="mt-6 text-4xl sm:text-5xl font-bold tracking-[-0.02em] text-white">
                        Connect your favorite tools
                    </h2>
                    <p className="mt-4 text-gray-400 max-w-lg mx-auto leading-relaxed">
                        Inpact utilizes powerful APIs to analyze creator performance and brand-fit intelligence.
                    </p>
                </motion.div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {integrations.map((integration, index) => {
                        const isConnected = connected.includes(index);
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                className={`group relative p-8 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row items-start gap-6 overflow-hidden ${isConnected
                                        ? 'bg-blue-500/[0.05] border-blue-500/30'
                                        : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                                    }`}
                            >
                                {/* Hover Gradient Background */}
                                <div className={`absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 transition-opacity duration-500 pointer-events-none ${isConnected ? 'opacity-0' : 'group-hover:opacity-100'}`} />

                                <div className={`relative z-10 min-w-[64px] w-16 h-16 rounded-xl bg-gradient-to-br ${integration.color} shadow-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isConnected ? 'scale-90 opacity-80' : ''}`}>
                                    {integration.icon}
                                </div>

                                <div className="relative z-10 flex-1">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-2">{integration.name}</h3>
                                            <p className="text-sm text-gray-400 leading-relaxed font-medium mb-4">
                                                {integration.description}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => toggleConnect(index)}
                                        className={`relative overflow-hidden flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${isConnected
                                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                : 'bg-white text-black hover:bg-gray-200'
                                            }`}
                                    >
                                        <AnimatePresence mode='wait'>
                                            {isConnected ? (
                                                <motion.span
                                                    key="connected"
                                                    initial={{ scale: 0.5, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 0.5, opacity: 0 }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    Connected
                                                </motion.span>
                                            ) : (
                                                <motion.span
                                                    key="connect"
                                                    initial={{ y: 10, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    exit={{ y: -10, opacity: 0 }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Connect
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
