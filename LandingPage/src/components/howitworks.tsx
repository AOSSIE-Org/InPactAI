import React from 'react';
import { motion } from 'framer-motion';
import {
    UserIcon,
    SparklesIcon,
    CreditCardIcon,
    BarChartIcon,   
    LayoutDashboardIcon,
    CameraIcon

} from 'lucide-react';

const HowItWorks: React.FC = () => {

    const steps = [
        {
          title: "User Onboarding",
          description: "Brands and creators register and choose their roles, preferences, and categories.",
          icon: <UserIcon />,
          color: "from-pink-500 to-purple-500"
        },
        {
          title: "AI-Powered Matching",
          description: "Inpact uses AI to suggest ideal brand-creator collaborations based on past work, niches, and engagement.",
          icon: <SparklesIcon />,
          color: "from-pink-500 to-purple-500"
        },
        {
          title: "Creator Showcases",
          description: "Creators can highlight their portfolios and previous collaborations, making it easier for brands to evaluate fit.",
          icon: <CameraIcon />,
          color: "from-purple-500 to-pink-500"
        },
        {
          title: "Collaboration Dashboard",
          description: "Both parties interact, chat, and collaborate with full task and timeline visibility.",
          icon: <LayoutDashboardIcon />,
          color: "from-purple-500 to-pink-500"
        },
        {
          title: "Smart Contracts & Payments",
          description: "Secure agreements and transactions powered by Stripe or Razorpay integrations.",
          icon: <CreditCardIcon />,
          color: "from-pink-500 to-purple-500"
        },
        {
          title: "Analytics & Feedback",
          description: "Track campaign metrics, gather insights, and iterate smarter with built-in dashboards.",
          icon: <BarChartIcon />,
          color: "from-pink-500 to-purple-500"
        }
      ];
      
      

    return (
        <section id="how-it-works" className="section bg-dark-lighter">
            <div className="container mx-auto px-3 md:px-6">
            <div className="container mx-auto px-3 md:px-6">
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12 md:mb-16"
    >
        <h2 className="relative inline-block text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-400">
            How InpactAI works
            <span className="block h-[3px] bg-purple-500 absolute left-1/2 transform -translate-x-1/2 mt-2 w-0 transition-all duration-500 group-hover:w-full"></span>
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base mt-4">
            Inpact uses AI-powered pipelines to bridge the gap between brands and creators—simplifying discovery, onboarding, and collaboration.
        </p>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 max-w-5xl mx-auto">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="relative"
                        >
                            <div className="flex gap-3 md:gap-4 items-start">
                                <div className={`relative z-10 p-2 md:p-3 rounded-lg bg-gradient-to-br ${step.color} text-white shadow-lg`}>
                                    {step.icon}
                                </div>
                                <div>
                                    <h3 className="text-base md:text-lg font-semibold mb-1">{step.title}</h3>
                                    <p className="text-xs md:text-sm text-gray-400">{step.description}</p>
                                </div>
                            </div>

                {index < steps.length - 1 && (
                    <>
                        <div className="hidden md:block">
                        {step.title !== "Smart Contracts & Payments" &&
                                            step.title !== "Analytics & Feedback" &&
                                             (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                whileInView={{ opacity: 1, height: '100%' }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
                                className={`absolute top-[46px] left-[24px] w-px bg-gradient-to-b ${step.color} opacity-70`}
                                style={{ maxHeight: '120px', zIndex: 1 }}
                            />
                                            )}
                        </div>

                        <div className="md:hidden absolute left-[16px] md:left-[24px] top-[38px] md:top-[46px] h-full">
                            <div className={`h-full w-px bg-gradient-to-b ${step.color} opacity-70`} style={{ zIndex: 1 }}></div>
                        </div>
                    </>
                )}
            </motion.div>
        ))}
    </div>
</div>


                
            </div>
        </section>
    );
};

export default HowItWorks;