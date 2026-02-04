import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Github,
    Menu,
    X,
    ChevronDown,
} from 'lucide-react';

// Discord icon component
const DiscordIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-4 h-4"
    >
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
);

interface NavLinkProps {
    href: string;
    children: React.ReactNode;
    hasDropdown?: boolean;
}

const NavLink = ({ href, children, hasDropdown }: NavLinkProps) => (
    <a
        href={href}
        className="group flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-white transition-colors duration-200"
    >
        {children}
        {hasDropdown && (
            <ChevronDown className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
        )}
    </a>
);

interface IconButtonProps {
    onClick?: () => void;
    ariaLabel: string;
    children: React.ReactNode;
    href?: string;
}

const IconButton = ({ onClick, ariaLabel, children, href }: IconButtonProps) => {
    const classes =
        'flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-white hover:bg-white/[0.04] transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-white/10';

    if (href) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={ariaLabel}
                className={classes}
            >
                {children}
            </a>
        );
    }

    return (
        <button onClick={onClick} aria-label={ariaLabel} className={classes}>
            {children}
        </button>
    );
};

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        // Sync state on mount
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { label: 'Features', href: '#features', hasDropdown: false },
        { label: 'Process', href: '#how-it-works', hasDropdown: false },
        { label: 'Integrations', href: '#integrations', hasDropdown: false },
        { label: 'Waitlist', href: '#waitlist', hasDropdown: false },
    ];

    return (
        <>
            <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 pointer-events-none">
                <motion.nav
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
                    className={`pointer-events-auto h-14 pl-2 pr-4 flex items-center gap-4 rounded-full border transition-all duration-300 ${isScrolled
                        ? 'bg-[#0a0a0b]/80 backdrop-blur-xl border-white/[0.08] shadow-[0_8px_40px_rgba(0,0,0,0.4)]'
                        : 'bg-[#0a0a0b]/60 backdrop-blur-lg border-white/[0.04]'
                        }`}
                >
                    {/* Logo Mark */}
                    <a
                        href="/"
                        className="flex items-center gap-2 group pl-1.5"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <span className="text-white font-bold text-xs tracking-tight">
                                IP
                            </span>
                        </div>
                    </a>

                    {/* Center Navigation Links (Desktop) */}
                    <div className="hidden lg:flex items-center px-2">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.label}
                                href={link.href}
                                hasDropdown={link.hasDropdown}
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </div>

                    {/* Vertical Separator */}
                    <div className="hidden lg:block w-px h-4 bg-white/[0.08]" />


                    <div className="flex items-center gap-2">
                        {/* Search (Desktop) */}
                        <button
                            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.04] text-gray-500 text-xs hover:border-white/[0.1] hover:text-gray-300 transition-all duration-200 focus:outline-none w-32"
                            onClick={() => { }}
                        >
                            <Search className="w-3 h-3" />
                            <span className="flex-1 text-left">Search...</span>
                            <kbd className="font-sans text-[10px] text-gray-600">⌘K</kbd>
                        </button>

                        {/* Icon Buttons */}
                        <div className="hidden sm:flex items-center gap-1">
                            <IconButton
                                href="https://github.com/AOSSIE-Org/InPactAI"
                                ariaLabel="GitHub"
                            >
                                <Github className="w-4 h-4" />
                            </IconButton>
                            <IconButton
                                href="https://discord.gg/aossie"
                                ariaLabel="Discord"
                            >
                                <DiscordIcon />
                            </IconButton>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="lg:hidden">
                            <IconButton
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                ariaLabel="Toggle menu"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="w-4 h-4" />
                                ) : (
                                    <Menu className="w-4 h-4" />
                                )}
                            </IconButton>
                        </div>

                    </div>

                </motion.nav>
            </div>


            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="fixed top-20 left-4 right-4 z-40 bg-[#0a0a0b]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl lg:hidden overflow-hidden"
                    >
                        <div className="px-6 py-6">
                            {/* Mobile Nav Links */}
                            <div className="flex flex-col gap-1">
                                {navLinks.map((link) => (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        className="flex items-center justify-between px-3 py-3 text-gray-400 hover:text-white hover:bg-white/[0.03] rounded-lg transition-all"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <span className="text-sm font-medium">{link.label}</span>
                                        {link.hasDropdown && (
                                            <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                                        )}
                                    </a>
                                ))}
                            </div>

                            {/* Mobile Divider */}
                            <div className="my-4 h-px bg-white/[0.06]" />

                            {/* Mobile Icons */}
                            <div className="flex items-center justify-between px-3">
                                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Follow Us</span>
                                <div className="flex gap-2">
                                    <IconButton
                                        href="https://github.com/AOSSIE-Org/InPactAI"
                                        ariaLabel="GitHub"
                                    >
                                        <Github className="w-4 h-4" />
                                    </IconButton>
                                    <IconButton
                                        href="https://discord.gg/aossie"
                                        ariaLabel="Discord"
                                    >
                                        <DiscordIcon />
                                    </IconButton>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
