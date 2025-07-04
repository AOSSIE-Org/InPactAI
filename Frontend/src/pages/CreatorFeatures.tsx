import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
    DollarSign,
    Handshake,
    Layers,
    MessageSquare,
    Rocket,
    Search,
    TrendingUp,
    Users,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { motion, useAnimation, useInView } from 'framer-motion'
import AnimatedSection from "@/components/AnimatedSection";

const CreatorFeatures = () => {
    return (
        <section id="creators" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <AnimatedSection>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <motion.img
                                    src="https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
                                    alt="Female content creator editing video"
                                    className="rounded-xl shadow-lg w-full h-auto"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.3 }}
                                />
                                <motion.img
                                    src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
                                    alt="Male influencer filming content"
                                    className="rounded-xl shadow-lg w-full h-auto"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                            <div className="space-y-4 pt-8">
                                <motion.img
                                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
                                    alt="Creative team brainstorming content"
                                    className="rounded-xl shadow-lg w-full h-auto"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.3 }}
                                />
                                <motion.img
                                    src="https://images.unsplash.com/photo-1478737270239-2f02b77fc618?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
                                    alt="Podcast recording setup"
                                    className="rounded-xl shadow-lg w-full h-auto"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </div>
                    </AnimatedSection>

                    <AnimatedSection delay={0.2}>


                        <h2 className="text-4xl font-bold text-slate-900 mb-6">
                            Grow Your Influence with{" "}
                            <span className="gradient-text">Smart Sponsorships</span>
                        </h2>

                        <p className="text-xl text-slate-600 mb-8">
                            Find brand partnerships that align with your content, audience, and values.
                            Our AI ensures you only see relevant opportunities that boost your credibility.
                        </p>

                        <div className="space-y-6">
                            {[
                                {
                                    icon: Search,
                                    title: "Discover Perfect Matches",
                                    description: "AI analyzes your content style, audience demographics, and engagement patterns to suggest ideal brand partnerships.",
                                    gradient: "from-blue-500 to-indigo-500"
                                },
                                {
                                    icon: DollarSign,
                                    title: "Transparent Pricing",
                                    description: "Get fair compensation suggestions based on your metrics, industry standards, and campaign requirements.",
                                    gradient: "from-purple-500 to-pink-500"
                                },
                                {
                                    icon: TrendingUp,
                                    title: "Performance Insights",
                                    description: "Track campaign performance, audience growth, and engagement metrics to optimize future collaborations.",
                                    gradient: "from-green-500 to-emerald-500"
                                }
                            ].map((feature, index) => (
                                <motion.div
                                    key={index}
                                    className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100"
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className={`w-10 h-10 bg-gradient-to-r ${feature.gradient} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                        <feature.icon className="text-white h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900 mb-2">{feature.title}</h4>
                                        <p className="text-slate-600">{feature.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="mt-10"
                        >
                            <Button className="bg-purple-600 text-white hover:bg-purple-700">
                                 <Rocket className="h-6 w-6 text-white" />
                                <Link to="/signup">Join as Influencer</Link>
                            </Button>
                        </motion.div>
                    </AnimatedSection>
                </div>
            </div>
        </section>
    )
}

export default CreatorFeatures;