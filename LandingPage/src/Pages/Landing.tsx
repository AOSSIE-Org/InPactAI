import { motion } from 'framer-motion';
import { Sparkles, Users } from 'lucide-react';
import {  DollarSign, FileText, BarChart2, RefreshCw } from 'lucide-react';
import ChatbotSidebarForm from '../components/form';
import Footer from '../components/Footer';
import Threads from '../components/bg';
import  SpotlightCard  from '../components/card';
import Header from '../components/Header';
import HowItWorks from '../components/howitworks';
import Integrations from '../components/integration';
import ParticleEffect from '../components/ParticleCanva';


function Landing() {
  const headingWords = ['Creator', 'Collaboration', 'Hub'];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };
  
  const wordVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 },
  };
  return (
    <div className="min-h-screen bg-black text-white">
      <ParticleEffect />
            <Header/>
            {/* Hero Section */}

            <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
    className=" mt-32 flex justify-center"
>
    <a
        href="https://aossie.org/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 bg-dark/80 backdrop-blur-sm py-3 px-5 rounded-full hover:bg-dark-lighter transition-all border border-gray-800 group"
    >
        <span className="text-sm text-gray-300 group-hover:text-white">Powered by AOSSIE</span>
        <img
            src="/aossie_logo.png"
            alt="AOSSIE"
            className="h-7 w-auto"
        />
    </a>
</motion.div>
            <main className="container mx-auto px-6 pb-24">
            <div style={{ width: '100%', height: '700px', marginTop: '-250px' }} className='-z-10 opacity-50'>
        <Threads
          amplitude={1}
          distance={0}
          enableMouseInteraction={true}
          color = {[147, 0, 60]}
        />
        </div>
        <motion.div
  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-wrap justify-center gap-3 text-white text-6xl font-bold text-center"
  variants={containerVariants}
  initial="hidden"
  animate="show"
>
  {headingWords.map((word, index) => (
    <motion.span
      key={index}
      variants={wordVariants}
    >
      {word}
    </motion.span>
  ))}
</motion.div>


          <p className="text-xl top-2/3 left-1/2 transform -translate-x-1/2 absolute text-gray-300 text-center">
  The future of <span className="text-pink-500 font-semibold">creator collaboration</span> is coming. 
  Join the <span className="text-pink-500 font-semibold">waitlist</span> to be the first to experience 
  the revolution in <span className="text-pink-500 font-semibold">influencer marketing</span>.
</p>

 
         {/* Features */}
            <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-8 mt-16"
        >
        <h2 className="relative inline-block text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-400">
            Features
            <span className="block h-[3px] bg-purple-500 absolute left-1/2 transform -translate-x-1/2 mt-2 w-0 transition-all duration-500 group-hover:w-full"></span>
        </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mt-16 px-4">
          {[
            {
              icon: <Users className="w-8 h-8 text-purple-400 mb-4" />,
              title: "AI-Driven Sponsorship Matchmaking",
              description:
                "Automatically connects creators with brands based on audience demographics, engagement rates, and content style.",
            },
            {
              icon: <Sparkles className="w-8 h-8 text-purple-400 mb-4" />,
              title: "AI-Powered Creator Collaboration Hub",
              description:
                "Facilitates partnerships between creators with complementary audiences and content niches.",
            },
            {
              icon: <DollarSign className="w-8 h-8 text-purple-400 mb-4" />,
              title: "AI-Based Pricing & Deal Optimization",
              description:
                "Provides fair sponsorship pricing recommendations based on engagement, market trends, and historical data.",
            },
            {
              icon: <FileText className="w-8 h-8 text-purple-400 mb-4" />,
              title: "AI-Powered Negotiation & Contract Assistant",
              description:
                "Assists in structuring deals, generating contracts, and optimizing terms using AI insights.",
            },
            {
              icon: <BarChart2 className="w-8 h-8 text-purple-400 mb-4" />,
              title: "Performance Analytics & ROI Tracking",
              description:
                "Enables brands and creators to track sponsorship performance, audience engagement, and campaign success.",
            },
            {
              icon: <RefreshCw className="w-8 h-8 text-purple-400 mb-4" />,
              title: "Real-Time Campaign Feedback Loop",
              description:
                "Gathers continuous feedback on campaigns to adapt and improve collaboration effectiveness over time.",
            },
          ].map((feature, index) => (
            <SpotlightCard
              key={index}
              className="custom-spotlight-card p-6 rounded-2xl bg-white/5 border border-purple-500/20 text-left backdrop-blur"
              spotlightColor="rgba(147, 0, 160, 0.25)"
            >
              {feature.icon}
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-300 text-sm">{feature.description}</p>
            </SpotlightCard>
          ))}
        </div>

        {/* How It Works Section */}
        <section className='mt-32'>
          <HowItWorks/>
        </section>

        <section className='mt-32'>
          <Integrations/>
        </section>


        {/* Waitlist Form Section */}
        <section className="min-h-[60vh] flex flex-col justify-center items-center text-center px-6 py-16 bg-[#0f0f1b] text-white mt-32 rounded-3xl">
      <div className="max-w-xl space-y-6">
      <h2 className="relative inline-block text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-400">
            Be a Part of the Revolution
            <span className="block h-[3px] bg-purple-500 absolute left-1/2 transform -translate-x-1/2 mt-2 w-0 transition-all duration-500 group-hover:w-full"></span>
        </h2>
        <p className="text-lg text-gray-300">
          Join our waitlist to be the first to experience how InpactAI is transforming the way brands and creators collaborate. 
        </p>
        <div className="pt-4 ml-44">
          <ChatbotSidebarForm />
        </div>
      </div>
    </section>

       
      </main>
      <Footer />
    </div>
  );
}

export default Landing;
