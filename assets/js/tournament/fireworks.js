// Fireworks jQuery Plugin
(function($) {
    $.fn.fireworks = function() {
        var canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '9999';
        canvas.style.background = 'transparent';
        canvas.style.opacity = '1';
        canvas.style.transition = 'opacity 2s ease-out';
        this.append(canvas);

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        var ctx = canvas.getContext('2d');
        var particles = [];
        var ratio = window.devicePixelRatio;
        var fireworks = [];
        var isRunning = true;
        var startTime = Date.now();
        var isFadingOut = false;

        // Resize canvas on window resize
        window.addEventListener('resize', function() {
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;
        });

        // Firework class
        function Firework() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height;
            this.targetY = canvas.height * 0.2 + (Math.random() * canvas.height * 0.3);
            this.speed = 8 + Math.random() * 4;
            this.angle = Math.PI / 2;  // Straight up
            this.trail = [];
            this.trailLength = 10;
            this.exploded = false;
            this.color = `hsl(${Math.random() * 360}, 100%, 70%)`;
        }

        Firework.prototype.update = function() {
            this.x += Math.cos(this.angle) * this.speed;
            this.y -= Math.sin(this.angle) * this.speed;

            // Add trail
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > this.trailLength) {
                this.trail.shift();
            }

            if (this.y <= this.targetY && !this.exploded) {
                this.exploded = true;
                this.explode();
            }
        };

        Firework.prototype.draw = function() {
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 3;
            ctx.stroke();
        };

        Firework.prototype.explode = function() {
            const particleCount = 100;  // More particles
            for (let i = 0; i < particleCount; i++) {
                const angle = (Math.PI * 2 * i) / particleCount;
                const speed = 6 + Math.random() * 6;  // Faster particles
                particles.push(new Particle(this.x, this.y, angle, speed, this.color));
            }
        };

        // Particle class
        function Particle(x, y, angle, speed, color) {
            this.x = x;
            this.y = y;
            this.angle = angle;
            this.speed = speed;
            this.life = 150;  // Longer life
            this.color = color;
            this.alpha = 1;
            this.decay = Math.random() * 0.015 + 0.015;  // Slower decay
            this.gravity = 0.12;
            this.drift = (Math.random() - 0.5) * 0.3;
            this.radius = 3 + Math.random() * 3;  // Even bigger particles
            this.trail = [];  // Add trail for streaking effect
            this.trailLength = 5 + Math.floor(Math.random() * 3);  // Random trail length
        }

        Particle.prototype.update = function() {
            // Store current position in trail
            this.trail.push({x: this.x, y: this.y, alpha: this.alpha});
            if (this.trail.length > this.trailLength) {
                this.trail.shift();
            }

            this.speed *= 0.98;
            this.x += Math.cos(this.angle) * this.speed + this.drift;
            this.y += Math.sin(this.angle) * this.speed + this.gravity;
            this.alpha -= this.decay;
            this.life--;
        };

        Particle.prototype.draw = function() {
            // Draw trail
            if (this.trail.length > 1) {
                ctx.beginPath();
                ctx.moveTo(this.trail[0].x, this.trail[0].y);
                for (let i = 1; i < this.trail.length; i++) {
                    const point = this.trail[i];
                    ctx.lineTo(point.x, point.y);
                }
                ctx.strokeStyle = this.color.replace(')', `,${this.alpha * 0.5})`);
                ctx.lineWidth = this.radius * 0.8;
                ctx.lineCap = 'round';
                ctx.stroke();
            }

            // Draw particle
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color.replace(')', `,${this.alpha})`);
            ctx.shadowBlur = 15;  // Increased glow
            ctx.shadowColor = this.color;
            ctx.fill();
            ctx.shadowBlur = 0;  // Reset shadow
        };

        function animate() {
            if (!isRunning) {
                // Only remove canvas after fade completes
                setTimeout(() => canvas.remove(), 2000);
                return;
            }

            // Start fading out at 8 seconds (2 seconds before end)
            if (Date.now() - startTime > 8000 && !isFadingOut) {
                isFadingOut = true;
                canvas.style.opacity = '0';
            }

            // Stop animation at 10 seconds
            if (Date.now() - startTime > 10000) {
                isRunning = false;
                return;
            }

            requestAnimationFrame(animate);
            ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear with transparency

            // Reduce frequency of new fireworks during fade-out
            const launchChance = isFadingOut ? 0.02 : 0.05;
            if (Math.random() < launchChance) {
                fireworks.push(new Firework());
            }

            // Update and draw fireworks
            for (let i = fireworks.length - 1; i >= 0; i--) {
                fireworks[i].update();
                fireworks[i].draw();
                if (fireworks[i].exploded && Math.random() < 0.1) {
                    fireworks.splice(i, 1);
                }
            }

            // Update and draw particles
            for (let i = particles.length - 1; i >= 0; i--) {
                particles[i].update();
                particles[i].draw();
                if (particles[i].alpha <= 0 || particles[i].life <= 0) {
                    particles.splice(i, 1);
                }
            }
        }

        requestAnimationFrame(animate);
        return this;
    };
}(jQuery));