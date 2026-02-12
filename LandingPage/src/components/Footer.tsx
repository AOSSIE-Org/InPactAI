import { Rocket, Github, Mail, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative w-full py-16 mt-20 overflow-hidden">
      {/* Background with gradient and glassmorphism */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900"></div>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      
      {/* Animated background elements */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      
      <div className="relative z-10 container mx-auto px-6 md:px-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative">
                <Rocket className="h-8 w-8 text-purple-400" />
                <div className="absolute -inset-1 bg-purple-400/20 rounded-full blur-sm"></div>
              </div>
              <span className="text-2xl font-bold text-white">InpactAI</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Empowering brands to make smarter creator decisions through AI-powered insights and integrations.
            </p>
            <div className="flex items-center space-x-2 text-sm text-purple-300">
              <span>Powered by</span>
              <a 
                href="https://aossie.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold hover:text-purple-200 transition-colors"
              >
                AOSSIE
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4 relative">
              Explore
              <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
            </h3>
            <div className="space-y-3">
              <a href="/" className="block text-gray-300 hover:text-purple-300 transition-colors duration-200 text-sm">
                Home
              </a>
              <a href="#features" className="block text-gray-300 hover:text-purple-300 transition-colors duration-200 text-sm">
                Features
              </a>
              <a href="#how-it-works" className="block text-gray-300 hover:text-purple-300 transition-colors duration-200 text-sm">
                How It Works
              </a>
              <a href="#integrations" className="block text-gray-300 hover:text-purple-300 transition-colors duration-200 text-sm">
                Integrations
              </a>
            </div>
          </div>

          {/* Legal & Resources */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4 relative">
              Legal & Code
              <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
            </h3>
            <div className="space-y-3">
              <a 
                href="https://github.com/AOSSIE-Org/InPactAI" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-300 hover:text-purple-300 transition-colors duration-200 text-sm group"
              >
                <Github className="h-4 w-4" />
                <span>GitHub</span>
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <a href="/terms-of-service" className="block text-gray-300 hover:text-purple-300 transition-colors duration-200 text-sm">
                Terms of Use
              </a>
              <a href="/privacy-policy" className="block text-gray-300 hover:text-purple-300 transition-colors duration-200 text-sm">
                Privacy Policy
              </a>
            </div>
          </div>

          {/* Contact & Community */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4 relative">
              Connect
              <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
            </h3>
            <div className="space-y-3">
              <a 
                href="mailto:aossie.oss@gmail.com" 
                className="flex items-center space-x-2 text-gray-300 hover:text-purple-300 transition-colors duration-200 text-sm group"
              >
                <Mail className="h-4 w-4" />
                <span>Contact Us</span>
              </a>
              <div className="pt-4">
                <p className="text-xs text-gray-400 mb-2">Join the revolution</p>
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-0.5 rounded-lg">
                  <div className="bg-gray-900 rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-300">Be the first to experience AI-powered creator collaboration</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider with gradient */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
          </div>
          <div className="relative flex justify-center">
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-4 py-1 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} InpactAI. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 text-xs text-gray-400">
            <span>Made with</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
              <span>for creators & brands</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
