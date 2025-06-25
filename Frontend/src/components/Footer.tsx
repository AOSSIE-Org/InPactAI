import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";


const Footer = () => {
    const footerRef = useRef(null);
    const [isFooterVisible, setIsFooterVisible] = useState(false);

    useEffect(() => {

        const footerObserver = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                setIsFooterVisible(entry.isIntersecting);
            },
            {
                root: null,
                rootMargin: "0px",
                threshold: 0.1,
            }
        );

        if (footerRef.current) {
            footerObserver.observe(footerRef.current);
        }

        return () => {
            if (footerRef.current) {
                footerObserver.unobserve(footerRef.current);
            }
        };
    }, [])


    return (
       <footer ref={footerRef} className="w-full border-t border-gray-200 bg-gray-50 py-6">
            <div
                className={`container px-10 flex flex-col md:flex-row items-center justify-between text-gray-600 transition-all duration-1000 transform ${isFooterVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                    }`}
            >
                <p>© 2024 Inpact. All rights reserved.</p>
                <div className="flex gap-4 mt-4 md:mt-0">
                    <Link to="/terms" className="hover:underline">
                        Terms
                    </Link>
                    <Link to="/privacy" className="hover:underline">
                        Privacy
                    </Link>
                </div>
            </div>
        </footer>
    )
}

export default Footer;