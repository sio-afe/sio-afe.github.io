class Fireworks {
    constructor() {
        this.canvas = document.getElementById('fireworksCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.fireworks = [];
        this.isRunning = false;
        
        this.init();
    }

    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.setupEventListeners();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        // Listen for goal celebrations or match end events
        document.addEventListener('goalScored', () => this.celebrate());
        document.addEventListener('matchEnd', () => this.celebrate(true));
    }

    celebrate(isMatchEnd = false) {
        this.isRunning = true;
        const duration = isMatchEnd ? 10000 : 3000; // Longer celebration for match end
        
        // Launch multiple fireworks
        const count = isMatchEnd ? 10 : 3;
        for (let i = 0; i < count; i++) {
            setTimeout(() => this.launchFirework(), i * 300);
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
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
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
        this.fireworks.forEach((firework, index) => {
            firework.y -= firework.speed;
            
            this.ctx.beginPath();
            this.ctx.arc(firework.x, firework.y, 2, 0, Math.PI * 2);
            this.ctx.fillStyle = firework.color;
            this.ctx.fill();

            if (firework.y <= firework.targetY) {
                this.createParticles(firework.x, firework.y, firework.color);
                this.fireworks.splice(index, 1);
            }
        });

        // Update and draw particles
        this.particles.forEach((particle, index) => {
            particle.x += particle.velocity.x;
            particle.y += particle.velocity.y;
            particle.velocity.y += 0.1; // Gravity
            particle.life -= 0.01;
            particle.alpha = particle.life;

            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 1, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${particle.color}, ${particle.alpha})`;
            this.ctx.fill();

            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });

        this.animationFrame = requestAnimationFrame(() => this.animate());
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => new Fireworks());