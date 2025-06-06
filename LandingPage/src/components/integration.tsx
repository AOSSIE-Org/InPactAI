import { motion } from 'framer-motion';
import { SocialIcon } from 'react-social-icons'

export default function Integrations() {
    const integrations = [
        {
            icon: <SocialIcon url="https://www.instagram.com/" />,
            name: 'Instagram',
            description: 'Fetch creator insights like engagement rate, reach trends, and content breakdown.',
        },
        {
            icon: <SocialIcon url="https://www.youtube.com/" />,
            name: 'YouTube',
            description: 'Access analytics on video performance, channel growth, and viewer demographics.',
        },
        {
            icon: <SocialIcon url="https://twitter.com/" />,
            name: 'X (formerly Twitter)',
            description: 'Measure influence through tweet engagement, retweet rate, and follower insights.',
        },
        {
            icon: <SocialIcon url="https://www.linkedin.com/" />,
            name: 'LinkedIn',
            description: 'Track professional creator presence and branded thought leadership impact.',
        },
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.12,
                delayChildren: 0.2,
            },
        },
    };

    const item = {
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    };

    return (
        <section id="integrations" className="section py-24 bg-black">
            <div className="max-w-6xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="relative inline-block text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-400">
            Social Integrations
            <span className="block h-[3px] bg-purple-500 absolute left-1/2 transform -translate-x-1/2 mt-2 w-0 transition-all duration-500 group-hover:w-full"></span>
        </h2>
                    <p className="text-gray-400 max-w-xl mx-auto text-base leading-relaxed mt-4">
                        Inpact connects with major social platforms to analyze creator performance and brand-fit intelligence.
                    </p>
                </motion.div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                >
                    {integrations.map((integration, index) => (
                        <motion.div
                            key={index}
                            variants={item}
                            whileHover={{ scale: 1.02, boxShadow: '0px 4px 20px rgba(0,0,0,0.25)' }}
                            className="bg-[#111212] border border-neutral-800 rounded-2xl p-6 transition-all duration-300 group hover:border-primary"
                        >
                            <div className="flex items-center gap-4 mb-3">
                                <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-primary group-hover:text-white group-hover:bg-primary/10 transition h-12 w-16 flex items-center justify-center">
                                    {integration.icon}
                                </div>
                                <h3 className="text-lg font-medium text-white">{integration.name}</h3>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                {integration.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
