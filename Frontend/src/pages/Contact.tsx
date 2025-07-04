import React, { useState, useRef, useEffect } from "react";
import {
  Github,
  MessageCircle,
  Twitter,
  Linkedin,
  Users,
  Send,
  ChevronDown,
  Star,
} from "lucide-react";
import { CiChat1 } from "react-icons/ci";
interface SocialLink {
  name: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  bgColor: string;
  hoverColor: string;
}

const InPactCommunity: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    messageType: "Praise & Thanks",
    message: "",
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const messageTypes = [
    "Praise & Thanks",
    "Feature Request",
    "Bug Report",
    "General Feedback",
    "Partnership Inquiry",
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const socialLinks: SocialLink[] = [
    {
      name: "GitHub",
      description: "View source code",
      icon: <Github className="w-6 h-6" />,
      href: "https://github.com/inpact-community",
      bgColor: "bg-gray-900",
      hoverColor: "hover:bg-gray-800",
    },
    {
      name: "Discord",
      description: "Join community",
      icon: <MessageCircle className="w-6 h-6" />,
      href: "https://discord.gg/inpact",
      bgColor: "bg-indigo-600",
      hoverColor: "hover:bg-indigo-700",
    },
    {
      name: "Twitter",
      description: "Latest updates",
      icon: <Twitter className="w-6 h-6" />,
      href: "https://twitter.com/inpact",
      bgColor: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
    },
    {
      name: "LinkedIn",
      description: "Professional updates",
      icon: <Linkedin className="w-6 h-6" />,
      href: "https://linkedin.com/company/inpact",
      bgColor: "bg-blue-700",
      hoverColor: "hover:bg-blue-800",
    },
  ];

  const handleLinkClick = (href: string, name: string) => {
    console.log(`Clicked ${name} link: ${href}`);
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMessageTypeSelect = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      messageType: type,
    }));
    setIsDropdownOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setFormData({
      name: "",
      email: "",
      messageType: "Praise & Thanks",
      message: "",
    });
    alert(
      "Thank you for your feedback! Your message has been sent to our Discord community."
    );
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col items-center px-4 md:px-6 py-8 space-y-10 md:space-y-20">
      <div className="max-w-4xl w-full space-y-6">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">
              Open Source
            </span>
            <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">
              Community Driven
            </span>
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-2xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Join the{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              inPact
            </span>{" "}
            Community
          </h1>

          <p className="text-sm text-center md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Connect with creators, brands, and developers building the future of
            AI-powered influencer marketing. Your ideas shape our platform.
          </p>
        </div>
      </div>
      <div className="w-full shadow-lg bg-white rounded-2xl p-4 md:p-10 space-y-6">
        <div className="flex items-center justify-start gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
            Connect With Us
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {socialLinks.map((link, index) => (
            <button
              key={link.name}
              onClick={() => handleLinkClick(link.href, link.name)}
              className={`
                  ${link.bgColor} ${link.hoverColor}
                  text-white rounded-2xl p-2 md:p-6
                  focus:outline-none focus:ring-4 focus:ring-blue-200
                  group cursor-pointer
                `}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 p-2 bg-opacity-20 rounded-lg">
                  {link.icon}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-md md:text-lg mb-1">{link.name}</h3>
                  <p className="text-sm opacity-90">{link.description}</p>
                </div>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full max-w-3xl space-y-10">
        <div className="flex flex-col items-center justify-center space-y-6">
          <h2 className="text-xl md:text-4xl font-bold text-gray-800">
            Share Your Thoughts
          </h2>
          <p className="text-sm text-center md:text-lg font-semibold text-gray-600 max-w-3xl">
            Your feedback helps us improve and build better features for
            everyone
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-purple-200">
          <div className="bg-purple-50 px-4 md:px-8 py-6 md:py-8 text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <CiChat1 className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />
              <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                Send us a message
              </h3>
            </div>
            <p className="text-gray-600 text-sm font-medium">
              Messages are sent directly to our Discord community for quick
              response
            </p>
          </div>
          <div className="p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Type
                </label>
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-left focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-green-500" />
                      <span>{formData.messageType}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition-transform ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                      {messageTypes.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleMessageTypeSelect(type)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-green-500" />
                            <span>{type}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tell us what's on your mind..."
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-vertical"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 focus:ring-4 focus:ring-purple-200 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send Message
              </button>
            </form>
          </div>
        </div>
        <div className="flex justify-center items-center">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <CiChat1 className="w-8 h-8 md:w-4 md:h-4 text-purple-600" />
            <span className="font-semibold">
              Messages go directly to our Discord #feedback channel
            </span>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default InPactCommunity;