import React, { useEffect } from 'react';
import Navbar from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import ParticleEffect from '../components/ParticleCanva';

const PrivacyPolicy: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "Privacy Policy | inpactAI";
    }, []);

    return (
        <div className="min-h-screen bg-black"> 
            <ParticleEffect />
            <Navbar />
            <main className="pt-24 pb-16">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl mx-auto"
                    >
                        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-purple-400">Privacy Policy</h1>

                        <div className="prose prose-invert max-w-none">
                            <p className="text-gray-300 mb-4">Last updated: April 14, 2025</p>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold mb-4 text-purple-400">Introduction</h2>
                                <p className="text-gray-300">
                                    At inpactAI, we respect your privacy and are committed to protecting your personal data. This Privacy
                                    Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold mb-4 text-purple-400">Information We Collect</h2>
                                <p className="text-gray-300">When you use inpactAI, we may collect the following types of information:</p>
                                <ul className="list-disc pl-5 text-gray-300 space-y-2 mt-3">
                                    <li>
                                        <strong>Personal Information:</strong> Name, email address, and organization details provided
                                        during signup or when joining our waitlist.
                                    </li>
                                    <li>
                                        <strong>Platform Data:</strong> If you connect inpactAI with platforms like Instagram, TikTok, or LinkedIn,
                                        we may collect information necessary to offer creator-brand matching services, such as follower data,
                                        audience engagement, and content performance metrics.
                                    </li>
                                    <li>
                                        <strong>Usage Information:</strong> Data about how you interact with our platform, including features used,
                                        actions taken, and time spent on the platform.
                                    </li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold mb-4 text-purple-400">How We Use Your Information</h2>
                                <p className="text-gray-300">We use the collected information for various purposes, including:</p>
                                <ul className="list-disc pl-5 text-gray-300 space-y-2 mt-3">
                                    <li>Providing and maintaining our AI-powered platform</li>
                                    <li>Improving creator-brand matching accuracy</li>
                                    <li>Personalizing your dashboard and analytics</li>
                                    <li>Communicating with you about updates, matches, and insights</li>
                                    <li>Ensuring data integrity and platform security</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold mb-4 text-purple-400">Data Sharing and Disclosure</h2>
                                <p className="text-gray-300">
                                    We do not sell your personal information. We may share data in the following circumstances:
                                </p>
                                <ul className="list-disc pl-5 text-gray-300 space-y-2 mt-3">
                                    <li>With service providers helping us run the platform (e.g., analytics, hosting)</li>
                                    <li>To comply with legal obligations or respond to lawful requests</li>
                                    <li>With your consent or to fulfill specific actions at your direction</li>
                                    <li>In connection with business restructuring, mergers, or acquisitions</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold mb-4 text-purple-400">Data Security</h2>
                                <p className="text-gray-300">
                                    We apply industry-standard security practices to protect your data, including encryption, access controls,
                                    and regular security reviews. However, no digital system is completely secure, and we encourage
                                    you to practice responsible data handling on your end as well.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold mb-4 text-purple-400">Your Rights</h2>
                                <p className="text-gray-300">
                                    Depending on your location, you may have certain rights related to your personal information:
                                </p>
                                <ul className="list-disc pl-5 text-gray-300 space-y-2 mt-3">
                                    <li>Access or request a copy of your personal data</li>
                                    <li>Request correction of any inaccurate or incomplete data</li>
                                    <li>Request deletion of your personal data</li>
                                    <li>Restrict processing or object to data usage</li>
                                    <li>Request data portability</li>
                                </ul>
                                <p className="text-gray-300 mt-3">
                                    To exercise your rights, contact us at privacy@inpact.ai.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold mb-4 text-purple-400">Changes to This Policy</h2>
                                <p className="text-gray-300">
                                    We may update this Privacy Policy occasionally to reflect changes in law or our practices.
                                    If significant changes are made, we will notify you on the platform or via email.
                                    Please review this policy periodically to stay informed.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold mb-4 text-purple-400">Contact Us</h2>
                                <p className="text-gray-300">
                                    If you have any questions about this Privacy Policy, feel free to reach out:
                                    <br />
                                    <strong>Email:</strong> <a href="mailto:aossie.oss@gmail.com" className="text-primary hover:underline text-purple-400">aossie.oss@gmail.com</a>
                                </p>
                            </section>
                        </div>
                    </motion.div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
