import { Github, Twitter, Linkedin, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'Integrations', href: '#integrations' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Changelog', href: '#' },
      ]
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', href: '#' },
        { label: 'API Reference', href: '#' },
        { label: 'Community', href: '#' },
        { label: 'Blog', href: '#' },
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Legal guide', href: '#' },
        { label: 'Contact', href: '#' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy', href: '#' },
        { label: 'Terms', href: '#' },
        { label: 'Security', href: '#' },
      ]
    }
  ];

  return (
    <footer className="bg-[#0a0a0b] py-12 sm:py-20 border-t border-white/[0.08] relative overflow-hidden">

      {/* Glow Effect */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 max-w-6xl relative z-10">

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-8 gap-y-12 lg:gap-y-0 mb-16">

          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2 pr-0 lg:pr-8">
            <div className="flex items-center gap-2 group mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <span className="text-white font-bold text-xs tracking-tight">IP</span>
              </div>
              <span className="text-lg font-bold text-white tracking-tight">InpactAI</span>
            </div>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed max-w-xs">
              Empowering brands and creators to build meaningful partnerships through data-driven intelligence and AI automation.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-500 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Link Columns */}
          {footerLinks.map((column, idx) => (
            <div key={idx} className="col-span-1">
              <h4 className="text-sm font-semibold text-white mb-4 tracking-wide">{column.title}</h4>
              <ul className="space-y-3">
                {column.links.map((link, i) => (
                  <li key={i}>
                    <a href={link.href} className="text-sm text-gray-500 hover:text-purple-400 transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            &copy; {currentYear} InpactAI Inc. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <span>Made with</span>
              <Heart className="w-3 h-3 text-red-500 fill-red-500" />
              <span>by AOSSIE</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
