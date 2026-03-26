import React, { useEffect } from 'react';
import Navbar from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

const TermsOfService: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "Terms of Service | inpactAI";
    }, []);

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />
            <main className="pt-24 pb-16">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl mx-auto"
                    >
                        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-purple-400">Terms of Service</h1>

                        <div className="prose prose-invert max-w-none">
                            <p className="text-gray-300 mb-4">Last updated: April 14, 2025</p>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold mb-4 text-purple-400">Introduction</h2>
                                <p className="text-gray-300">
                                    Welcome to inpactAI. These Terms of Service ("Terms") govern your use of our platform and services. By accessing or using inpactAI, you agree to be bound by these Terms.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold mb-4 text-purple-400">Use of the Platform</h2>
                                <p className="text-gray-300">You agree to use the platform in compliance with all applicable laws and regulations. You must not misuse our platform or attempt to access it using a method other than the interface we provide.</p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold mb-4 text-purple-400">Account Registration</h2>
                                <p className="text-gray-300">To access certain features, you may be required to create an account. You are responsible for safeguarding your account credentials and for any activities or actions under your account.</p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold mb-4 text-purple-400">User Content</h2>
                                <p className="text-gray-300">You retain ownership of the content you submit to the platform, but you grant inpactAI a worldwide, royalty-free license to use, display, and distribute that content as needed to provide services.</p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold mb-4 text-purple-400">Prohibited Activities</h2>
                                <p className="text-gray-300">You agree not to engage in any of the following:</p>
                                <ul className="list-disc pl-5 text-gray-300 space-y-2 mt-3">
                                    <li>Reverse engineering or decompiling any part of the platform</li>
                                    <li>Using the platform for unlawful or harmful purposes</li>
                                    <li>Infringing on the intellectual property rights of others</li>
                                    <li>Disrupting the functionality or security of the platform</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold mb-4 text-purple-400">Termination</h2>
                                <p className="text-gray-300">
                                    We may suspend or terminate your access if you violate these Terms. Upon termination, your right to use the platform ceases immediately.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold mb-4 text-purple-400">Disclaimers</h2>
                                <p className="text-gray-300">
                                    The platform is provided "as is" without warranties of any kind. We do not guarantee that the platform will be uninterrupted, secure, or error-free.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold mb-4 text-purple-400">Limitation of Liability</h2>
                                <p className="text-gray-300">
                                    To the fullest extent permitted by law, inpactAI shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of the platform.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-xl font-semibold mb-4 text-purple-400">Changes to These Terms</h2>
                                <p className="text-gray-300">
                                    We may modify these Terms at any time. If we do, we will notify you via the platform or by email. Continued use of the platform after changes means you accept the new Terms.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-xl font-semibold mb-4 text-purple-400">Contact Us</h2>
                                <p className="text-gray-300">
                                    If you have any questions about these Terms, contact us at:
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

export default TermsOfService;