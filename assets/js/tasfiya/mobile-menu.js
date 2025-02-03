class MobileMenu {
    constructor() {
        this.menuToggle = document.querySelector('.mobile-menu-toggle');
        this.menuClose = document.querySelector('.mobile-menu-close');
        this.mobileMenu = document.querySelector('.mobile-menu');
        this.overlay = document.querySelector('.menu-overlay');
        this.isOpen = false;
        
        if (!this.menuToggle || !this.menuClose || !this.mobileMenu || !this.overlay) {
            console.error('Mobile menu elements not found');
            return;
        }
        
        this.init();
    }
    
    init() {
        // Bind methods to this
        this.openMenu = this.openMenu.bind(this);
        this.closeMenu = this.closeMenu.bind(this);
        this.handleEscape = this.handleEscape.bind(this);
        this.preventScroll = this.preventScroll.bind(this);
        this.handleClick = this.handleClick.bind(this);
        
        // Add event listeners
        this.menuToggle.addEventListener('click', this.openMenu);
        this.menuClose.addEventListener('click', this.closeMenu);
        this.overlay.addEventListener('click', this.closeMenu);
        document.addEventListener('keydown', this.handleEscape);
        this.mobileMenu.addEventListener('touchmove', this.preventScroll, { passive: false });
        
        // Add click handlers to menu links
        document.querySelectorAll('.mobile-nav a').forEach(link => {
            link.addEventListener('click', this.handleClick);
        });
        
        // Set active menu item
        this.setActiveMenuItem();
    }
    
    openMenu(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        this.isOpen = true;
        
        // Hide hamburger icon
        this.menuToggle.classList.add('hidden');
        
        // Show overlay first
        this.overlay.style.display = 'block';
        // Trigger reflow
        this.overlay.offsetHeight;
        this.overlay.classList.add('active');
        
        // Show menu
        this.mobileMenu.style.visibility = 'visible';
        // Trigger reflow
        this.mobileMenu.offsetHeight;
        this.mobileMenu.classList.add('active');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }
    
    closeMenu(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        this.isOpen = false;
        
        // Show hamburger icon
        this.menuToggle.classList.remove('hidden');
        
        // Hide menu first
        this.mobileMenu.classList.remove('active');
        this.overlay.classList.remove('active');
        
        // Wait for animations to complete
        setTimeout(() => {
            this.mobileMenu.style.visibility = 'hidden';
            this.overlay.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }
    
    handleClick(e) {
        e.preventDefault();
        const href = e.currentTarget.getAttribute('href');
        
        // Close menu first with animation
        this.closeMenu();
        
        // Navigate after menu closes
        setTimeout(() => {
            window.location.href = href;
        }, 300);
    }
    
    handleEscape(e) {
        if (e.key === 'Escape' && this.isOpen) {
            this.closeMenu();
        }
    }
    
    preventScroll(e) {
        e.preventDefault();
    }
    
    setActiveMenuItem() {
        const currentPath = window.location.pathname;
        document.querySelectorAll('.mobile-nav a, .desktop-menu a').forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MobileMenu();
}); 