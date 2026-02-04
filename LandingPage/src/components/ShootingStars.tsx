import { useEffect, useRef } from 'react';

interface Star {
    x: number;
    y: number;
    size: number;
    opacity: number;
    speed: number;
}

interface ShootingStar {
    id: number;
    x: number;
    y: number;
    length: number;
    speed: number;
    angle: number;
    opacity: number;
    color: string;
}

const ShootingStars = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set dimensions
        const handleResize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        // Static Stars
        const stars: Star[] = Array.from({ length: 150 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5,
            opacity: Math.random() * 0.5 + 0.1,
            speed: Math.random() * 0.05,
        }));

        let shootingStars: ShootingStar[] = [];
        let shootingStarId = 0;
        let animationId: number;
        let isActive = true;

        const createShootingStar = (): ShootingStar => {
            const startX = Math.random() * canvas.width;
            const startY = Math.random() * canvas.height * 0.5; // Start in top half
            return {
                id: shootingStarId++,
                x: startX,
                y: startY,
                length: Math.random() * 80 + 50,
                speed: Math.random() * 15 + 10,
                angle: Math.PI / 4 + (Math.random() * 0.2 - 0.1), // Diagonal down-right roughly 45deg
                opacity: 1,
                color: Math.random() > 0.7 ? '#a855f7' : Math.random() > 0.5 ? '#3b82f6' : '#ffffff', // Purple, Blue, or White
            };
        };

        const animate = () => {
            if (!isActive) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Static Stars
            stars.forEach((star) => {
                ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();

                // Twinkle effect
                star.opacity += (Math.random() * 0.02 - 0.01);
                if (star.opacity < 0.1) star.opacity = 0.1;
                if (star.opacity > 0.6) star.opacity = 0.6;
            });

            // Manage Shooting Stars
            if (Math.random() < 0.02) { // Chance to spawn
                shootingStars.push(createShootingStar());
            }

            shootingStars.forEach((star, index) => {
                star.x += Math.cos(star.angle) * star.speed;
                star.y += Math.sin(star.angle) * star.speed;
                star.opacity -= 0.01;

                // Draw Trail (Gradient line)
                const gradient = ctx.createLinearGradient(
                    star.x, star.y,
                    star.x - Math.cos(star.angle) * star.length,
                    star.y - Math.sin(star.angle) * star.length
                );
                gradient.addColorStop(0, `rgba(${hexToRgb(star.color)}, ${star.opacity})`);
                gradient.addColorStop(1, `rgba(${hexToRgb(star.color)}, 0)`);

                ctx.strokeStyle = gradient;
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(star.x, star.y);
                ctx.lineTo(
                    star.x - Math.cos(star.angle) * star.length,
                    star.y - Math.sin(star.angle) * star.length
                );
                ctx.stroke();

                // Glow head
                ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
                ctx.beginPath();
                ctx.arc(star.x, star.y, 1.5, 0, Math.PI * 2);
                ctx.fill();

                // Remove if off screen or faded
                if (
                    star.x > canvas.width + 100 ||
                    star.y > canvas.height + 100 ||
                    star.opacity <= 0
                ) {
                    shootingStars.splice(index, 1);
                }
            });

            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);

        return () => {
            isActive = false;
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return <canvas ref={canvasRef} className="w-full h-full absolute inset-0 pointer-events-none" />;
};

// Helper
function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
}

export default ShootingStars;
