class MobileMenu {
    constructor() {
        this.menu = document.querySelector('.mobile-menu');
        this.overlay = document.querySelector('.menu-overlay');
        this.toggleButton = document.querySelector('.mobile-menu-toggle');
        this.closeButton = document.querySelector('.mobile-menu-close');
        this.isAnimating = false;
        
        this.init();
        this.setActiveMenuItem();
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
            
            // Only match exact paths or parent paths that aren't the root
            if (currentPath === itemPath || 
                (currentPath.startsWith(itemPath) && 
                 itemPath !== '/' && 
                 itemPath !== '/tasfiya' && 
                 itemPath !== '/tasfiya/')) {
                item.classList.add('active');
            }
        });
    }
}

// Initialize mobile menu
document.addEventListener('DOMContentLoaded', () => {
    new MobileMenu();
}); 