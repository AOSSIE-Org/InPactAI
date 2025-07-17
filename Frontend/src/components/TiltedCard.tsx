import { ReactNode, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface TiltedCardProps {
    children: ReactNode;
    className?: string;
}

const TiltedCard = ({ children, className = "" }: TiltedCardProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useTransform(y, [-0.5, 0.5], [8, -8]);
    const rotateY = useTransform(x, [-0.5, 0.5], [-8, 8]);

    const springX = useSpring(rotateX, { stiffness: 100, damping: 10 });
    const springY = useSpring(rotateY, { stiffness: 100, damping: 10 });

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;

        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        const dx = offsetX / rect.width - 0.5;
        const dy = offsetY / rect.height - 0.5;

        x.set(dx);
        y.set(dy);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX: springX,
                rotateY: springY,
                transformStyle: "preserve-3d",
            }}
            className={`transition-transform duration-300 ease-out ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default TiltedCard;
