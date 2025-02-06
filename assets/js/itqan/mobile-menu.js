// Singleton pattern to prevent multiple instances
if (!window.mobileMenuInstance) {
    window.mobileMenuInstance = null;

    class MobileMenu {
        constructor() {
            // Return existing instance if already initialized
            if (window.mobileMenuInstance) {
                return window.mobileMenuInstance;
            }
            
            this.menu = document.querySelector('.mobile-menu');
            this.overlay = document.querySelector('.menu-overlay');
            this.toggleButton = document.querySelector('.mobile-menu-toggle');
            this.closeButton = document.querySelector('.mobile-menu-close');
            this.isAnimating = false;
            
            this.init();
            this.setActiveMenuItem();
            
            // Store instance
            window.mobileMenuInstance = this;
        }
        
        init() {
            if (!this.menu || !this.toggleButton) return;
            
            this.toggleButton.addEventListener('click', () => this.toggleMenu());
            this.closeButton.addEventListener('click', () => this.closeMenu());
            this.overlay.addEventListener('click', () => this.closeMenu());
            
            window.addEventListener('resize', () => this.handleResize());
            window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') this.closeMenu();
            });
            
            // Handle navigation items
            const navItems = this.menu.querySelectorAll('.mobile-nav a');
            navItems.forEach(item => {
                item.addEventListener('click', () => {
                    this.closeMenu();
                    this.setActiveMenuItem();
                });
            });
        }
        
        handleResize() {
            if (window.innerWidth > 991 && this.menu.classList.contains('active')) {
                this.closeMenu();
            }
        }
        
        toggleMenu() {
            if (this.isAnimating) return;
            
            if (this.menu.classList.contains('active')) {
                this.closeMenu();
            } else {
                this.openMenu();
            }
        }
        
        openMenu() {
            if (this.isAnimating) return;
            this.isAnimating = true;
            
            // Hide hamburger icon
            this.toggleButton.style.opacity = '0';
            this.toggleButton.style.visibility = 'hidden';
            
            this.menu.style.visibility = 'visible';
            this.overlay.style.visibility = 'visible';
            
            requestAnimationFrame(() => {
                this.menu.classList.add('active');
                this.overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                setTimeout(() => {
                    this.isAnimating = false;
                }, 300);
            });
        }
        
        closeMenu() {
            if (this.isAnimating) return;
            this.isAnimating = true;
            
            this.menu.classList.remove('active');
            this.overlay.classList.remove('active');
            document.body.style.overflow = '';
            
            // Show hamburger icon
            this.toggleButton.style.opacity = '1';
            this.toggleButton.style.visibility = 'visible';
            
            setTimeout(() => {
                this.menu.style.visibility = 'hidden';
                this.overlay.style.visibility = 'hidden';
                this.isAnimating = false;
            }, 300);
        }
        
        setActiveMenuItem() {
            const currentPath = window.location.pathname;
            const navItems = this.menu.querySelectorAll('.mobile-nav a');
            
            navItems.forEach(item => {
                const itemPath = item.getAttribute('href');
                item.classList.remove('active');
                
                // Special handling for home page
                if (itemPath.endsWith('/itqan') || itemPath.endsWith('/itqan/')) {
                    // Only match if it's exactly the home page
                    if (currentPath === itemPath || currentPath === itemPath + '/') {
                        item.classList.add('active');
                    }
                } else {
                    // For other pages, match if current path contains the item path
                    if (currentPath.startsWith(itemPath) && itemPath !== '/') {
                        item.classList.add('active');
                    }
                }
            });
        }
    }

    // Initialize mobile menu only if not already initialized
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.mobileMenuInstance) {
            new MobileMenu();
        }
    });
} 