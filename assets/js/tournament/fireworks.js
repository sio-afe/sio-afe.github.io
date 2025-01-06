class Fireworks {
    constructor() {
        console.log('Fireworks constructor called');
        this.canvas = document.getElementById('fireworksCanvas');
        if (!this.canvas) {
            console.error('Canvas element not found!');
            return;
        }
        
        console.log('Canvas found, initializing...');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.fireworks = [];
        this.isRunning = false;
        this.isMobile = window.innerWidth <= 768;
        
        this.init();
    }

    init() {
        this.resizeCanvas();
        this.setupEventListeners();
        console.log('Fireworks initialized');
    }

    resizeCanvas() {
        // Handle device pixel ratio for sharper rendering on mobile
        const dpr = window.devicePixelRatio || 1;
        const rect = document.body.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;
        
        this.ctx.scale(dpr, dpr);
        
        // Update mobile check on resize
        this.isMobile = window.innerWidth <= 768;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());
        document.addEventListener('goalScored', () => {
            console.log('Goal scored event received');
            this.celebrate();
        });
        document.addEventListener('matchEnd', () => {
            console.log('Match end event received');
            this.celebrate(true);
        });
        
        // Handle visibility change to stop animations when tab is hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.isRunning = false;
            }
        });
    }

    celebrate(isMatchEnd = false) {
        console.log(`Celebrating ${isMatchEnd ? 'match end' : 'goal'}`);
        this.isRunning = true;
        
        // Adjust duration and count for mobile
        const duration = this.isMobile ? 
            (isMatchEnd ? 5000 : 2000) : 
            (isMatchEnd ? 10000 : 3000);
        
        const count = this.isMobile ? 
            (isMatchEnd ? 5 : 2) : 
            (isMatchEnd ? 10 : 3);

        for (let i = 0; i < count; i++) {
            setTimeout(() => this.launchFirework(), i * (this.isMobile ? 400 : 300));
        }

        setTimeout(() => {
            this.isRunning = false;
            this.particles = [];
            this.fireworks = [];
        }, duration);

        if (!this.animationFrame) {
            this.animate();
        }
    }

    launchFirework() {
        const firework = {
            x: this.canvas.width * Math.random(),
            y: this.canvas.height,
            targetY: this.canvas.height * 0.2 + (Math.random() * this.canvas.height * 0.3),
            speed: 15 + Math.random() * 5,
            color: this.getRandomColor(),
            particles: []
        };

        this.fireworks.push(firework);
    }

    getRandomColor() {
        const colors = [
            '#ff4444', // red
            '#44ff44', // green
            '#4444ff', // blue
            '#ffff44', // yellow
            '#ff44ff', // magenta
            '#44ffff'  // cyan
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    createParticles(x, y, color) {
        for (let i = 0; i < 50; i++) {
            const particle = {
                x,
                y,
                color,
                velocity: {
                    x: (Math.random() - 0.5) * 8,
                    y: (Math.random() - 0.5) * 8
                },
                alpha: 1,
                life: 1
            };
            this.particles.push(particle);
        }
    }

    animate() {
        if (!this.isRunning) {
            this.animationFrame = null;
            return;
        }

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw fireworks
        for (let i = this.fireworks.length - 1; i >= 0; i--) {
            const firework = this.fireworks[i];
            firework.y -= firework.speed;
            
            this.ctx.beginPath();
            this.ctx.arc(firework.x, firework.y, 2, 0, Math.PI * 2);
            this.ctx.fillStyle = firework.color;
            this.ctx.fill();

            if (firework.y <= firework.targetY) {
                this.createParticles(firework.x, firework.y, firework.color);
                this.fireworks.splice(i, 1);
            }
        }

        // Update and draw particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.velocity.x;
            particle.y += particle.velocity.y;
            particle.velocity.y += 0.1; // Gravity
            particle.life -= 0.01;
            particle.alpha = particle.life;

            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 1, 0, Math.PI * 2);
            this.ctx.fillStyle = `${particle.color}${Math.floor(particle.alpha * 255).toString(16).padStart(2, '0')}`;
            this.ctx.fill();

            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        this.animationFrame = requestAnimationFrame(() => this.animate());
    }
}

// Initialize with error handling
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, creating Fireworks');
    try {
        new Fireworks();
    } catch (error) {
        console.error('Error initializing Fireworks:', error);
    }
});