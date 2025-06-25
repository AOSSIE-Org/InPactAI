import { useState, useRef, useEffect } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import {
    Github,
    MessageCircle,
    Twitter,
    Linkedin,
    Users,
    ExternalLink,

} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import FeedbackForm from "@/components/FeedbackForm";
import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";

function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const controls = useAnimation();

    useEffect(() => {
        if (isInView) {
            controls.start("animate");
        }
    }, [isInView, controls]);

    return (
        <motion.div
            ref={ref}
            initial="initial"
            animate={controls}
            variants={{
                initial: { opacity: 0, y: 50 },
                animate: {
                    opacity: 1,
                    y: 0,
                    transition: {
                        duration: 0.8,
                        ease: "easeOut",
                        delay: delay
                    }
                }
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}


const ContactPage = () => {
    return (
        <div className="w-full">
            {/* Top Nav */}
            <TopNav />
            <div className="max-w-4xl mx-auto space-y-12 mt-20">
                <div className="mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <motion.div
                            className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm border mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <motion.div
                                className="w-2 h-2 bg-green-400 rounded-full mr-2"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                            <span className="text-sm text-slate-600">Open Source • Community Driven</span>
                        </motion.div>

                        <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                            Join the{" "}
                            <span className="gradient-text text-purple-600">inPact</span>{" "}
                            Community
                        </h1>

                        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                            Connect with creators, brands, and developers building the future of AI-powered
                            influencer marketing. Your ideas shape our platform.
                        </p>
                    </motion.div>

                    {/* Social Links & Community */}
                    <AnimatedSection delay={0.3}>
                        <Card className="bg-white/60 backdrop-blur-lg shadow-lg border-0 min-h-[300px]">
                            <CardContent className="p-6 ">
                                <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                                    <Users className="w-5 h-5 mr-2 text-blue-500" />
                                    Connect With Us
                                </h3>
                                <div className="grid grid-cols-2 gap-6 mt-10">
                                    <motion.a
                                        href="https://github.com/AOSSIE-Org/InPactAI"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center p-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors duration-300 group"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Github className="w-5 h-5 mr-3" />
                                        <div>
                                            <div className="font-medium">GitHub</div>
                                            <div className="text-xs text-slate-300">View source code</div>
                                        </div>
                                        <ExternalLink className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </motion.a>

                                    <motion.a
                                        href="https://discord.com/channels/1022871757289422898/1345044736515379210"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center p-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors duration-300 group"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <MessageCircle className="w-5 h-5 mr-3" />
                                        <div>
                                            <div className="font-medium">Discord</div>
                                            <div className="text-xs text-indigo-200">Join community</div>
                                        </div>
                                        <ExternalLink className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </motion.a>

                                    <motion.a
                                        href="https://twitter.com/inpact_ai"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center p-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-300 group"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Twitter className="w-5 h-5 mr-3" />
                                        <div>
                                            <div className="font-medium">Twitter</div>
                                            <div className="text-xs text-blue-200">Latest updates</div>
                                        </div>
                                        <ExternalLink className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </motion.a>

                                    <motion.a
                                        href="https://linkedin.com/company/inpact-ai"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center p-4 bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-colors duration-300 group"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Linkedin className="w-5 h-5 mr-3" />
                                        <div>
                                            <div className="font-medium">LinkedIn</div>
                                            <div className="text-xs text-blue-200">Professional updates</div>
                                        </div>
                                        <ExternalLink className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </motion.a>
                                </div>
                            </CardContent>
                        </Card>

                    </AnimatedSection>
                </div>

                {/* Contact Form */}
                <FeedbackForm />

            </div>
            {/* Footer */}
            <Footer />
        </div>
    )
}

export default ContactPage;