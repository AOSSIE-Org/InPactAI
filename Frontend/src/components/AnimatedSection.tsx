import { useAnimation, useInView } from "framer-motion";
import { useEffect, useRef } from "react";
import { motion } from 'framer-motion'

export default function AnimatedSection({ children, className = "", delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) {
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