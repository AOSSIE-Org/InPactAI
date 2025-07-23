import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
}

interface ParticleEffectProps {
  particleCount?: number;
  colors?: string[];
  enableMouseInteraction?: boolean;
}

const ParticleEffect: React.FC<ParticleEffectProps> = ({
  particleCount = 50,
  colors = ['rgba(147, 0, 160, 0.8)', 'rgba(168, 85, 247, 0.6)', 'rgba(236, 72, 153, 0.7)', 'rgba(255, 255, 255, 0.4)'],
  enableMouseInteraction = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticle = (): Particle => {
      const maxLife = Math.random() * 200 + 100;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: maxLife,
        maxLife: maxLife,
      };
    };

    const initParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(createParticle());
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const drawParticle = (particle: Particle) => {
      ctx.save();
      
      // Create gradient for each particle
      const gradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size * 2
      );
      gradient.addColorStop(0, particle.color);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.globalAlpha = particle.opacity * (particle.life / particle.maxLife);
      
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();

      // Add a subtle glow effect
      ctx.shadowBlur = 10;
      ctx.shadowColor = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const updateParticle = (particle: Particle) => {
      // Mouse interaction
      if (enableMouseInteraction) {
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          const force = (150 - distance) / 150;
          particle.vx += (dx / distance) * force * 0.002;
          particle.vy += (dy / distance) * force * 0.002;
        }
      }

      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Apply subtle drift
      particle.vx *= 0.99;
      particle.vy *= 0.99;

      // Add floating motion
      particle.x += Math.sin(Date.now() * 0.001 + particle.y * 0.01) * 0.1;
      particle.y += Math.cos(Date.now() * 0.001 + particle.x * 0.01) * 0.1;

      // Boundary wrapping
      if (particle.x < -particle.size) particle.x = canvas.width + particle.size;
      if (particle.x > canvas.width + particle.size) particle.x = -particle.size;
      if (particle.y < -particle.size) particle.y = canvas.height + particle.size;
      if (particle.y > canvas.height + particle.size) particle.y = -particle.size;

      // Update life
      particle.life -= 0.5;
      if (particle.life <= 0) {
        // Regenerate particle
        const newParticle = createParticle();
        Object.assign(particle, newParticle);
      }
    };

    const drawConnections = () => {
      const particles = particlesRef.current;
      ctx.strokeStyle = 'rgba(147, 0, 160, 0.1)';
      ctx.lineWidth = 0.5;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            const opacity = (100 - distance) / 100 * 0.3;
            ctx.globalAlpha = opacity;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections first (behind particles)
      drawConnections();

      // Update and draw particles
      particlesRef.current.forEach(particle => {
        updateParticle(particle);
        drawParticle(particle);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // Initialize
    resizeCanvas();
    initParticles();
    
    // Event listeners
    window.addEventListener('resize', resizeCanvas);
    if (enableMouseInteraction) {
      canvas.addEventListener('mousemove', handleMouseMove);
    }

    // Start animation
    animate();

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
      if (enableMouseInteraction) {
        canvas.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [particleCount, colors, enableMouseInteraction]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[10]"
      style={{ background: 'transparent' }}
    />
  );
};

export default ParticleEffect; 