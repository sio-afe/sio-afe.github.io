/**
 * Library page scripts
 * Handles carousel functionality and category filtering
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Library JS loaded');
    setTimeout(initCategoryCarousel, 500); // Delay initialization to ensure DOM is fully rendered
    initCategoryFilter();
});

/**
 * Initialize the category carousel
 */
function initCategoryCarousel() {
    const track = document.querySelector('.carousel-track');
    const slides = document.querySelectorAll('.category-slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    console.log('Initializing carousel with:', {
        track: track,
        slides: slides.length,
        prevBtn: prevBtn,
        nextBtn: nextBtn
    });
    
    if (!track || !slides.length || !prevBtn || !nextBtn) {
        console.error('Carousel elements not found');
        return;
    }
    
    // Force browser to calculate dimensions
    window.dispatchEvent(new Event('resize'));
    
    // Set initial slide width with a small delay to ensure proper calculation
    setTimeout(() => {
        let slideWidth = getSlideWidth();
        let currentIndex = 0;
        let slidesToShow = getVisibleSlides();
        
        function getSlideWidth() {
            const slide = slides[0];
            const style = window.getComputedStyle(slide);
            const width = slide.offsetWidth;
            const marginLeft = parseInt(style.marginLeft) || 0;
            const marginRight = parseInt(style.marginRight) || 0;
            const totalWidth = width + marginLeft + marginRight;
            console.log('Slide width calculated:', totalWidth);
            return totalWidth;
        }
        
        function getVisibleSlides() {
            const viewportWidth = window.innerWidth;
            let visible;
            if (viewportWidth < 576) visible = 1;
            else if (viewportWidth < 992) visible = 2;
            else if (viewportWidth < 1200) visible = 3;
            else visible = 4;
            console.log('Visible slides:', visible);
            return visible;
        }
        
        function updateSlideWidth() {
            slideWidth = getSlideWidth();
            slidesToShow = getVisibleSlides();
            moveToSlide(currentIndex);
        }
        
        function moveToSlide(index) {
            if (index < 0) index = 0;
            const maxIndex = Math.max(0, slides.length - slidesToShow);
            if (index > maxIndex) index = maxIndex;
            
            currentIndex = index;
            const translateX = -currentIndex * slideWidth;
            console.log(`Moving to slide ${index}, translateX: ${translateX}px`);
            
            // Apply the transform
            track.style.transform = `translateX(${translateX}px)`;
            
            // Update button states
            prevBtn.disabled = currentIndex === 0;
            nextBtn.disabled = currentIndex >= maxIndex;
            
            prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
            nextBtn.style.opacity = currentIndex >= maxIndex ? '0.5' : '1';
        }
        
        // Event listeners
        prevBtn.addEventListener('click', function() {
            console.log('Previous button clicked');
            moveToSlide(currentIndex - 1);
        });
        
        nextBtn.addEventListener('click', function() {
            console.log('Next button clicked');
            moveToSlide(currentIndex + 1);
        });
        
        // Handle window resize
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(updateSlideWidth, 250);
        });
        
        // Initialize
        updateSlideWidth();
        
        // Make buttons more visible for debugging
        prevBtn.style.backgroundColor = '#1a5928';
        prevBtn.style.color = 'white';
        nextBtn.style.backgroundColor = '#1a5928';
        nextBtn.style.color = 'white';
    }, 100);
}

/**
 * Initialize category filtering functionality
 */
function initCategoryFilter() {
    // Category cards click handling
    const categoryCards = document.querySelectorAll('.category-card');
    const categoryFilter = document.getElementById('categoryFilter');
    const bookGrid = document.getElementById('bookGrid');
    const noResults = document.getElementById('noResults');
    
    if (!categoryCards.length || !categoryFilter || !bookGrid) return;
    
    // Handle category card clicks
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const filter = this.dataset.filter;
            if (categoryFilter) {
                categoryFilter.value = filter;
                filterBooks(filter);
                
                // Scroll to book grid
                document.querySelector('.book-collection').scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Make explore buttons work the same way as clicking the card
    const exploreButtons = document.querySelectorAll('.explore-more');
    exploreButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const card = this.closest('.category-card');
            if (card) {
                const filter = card.dataset.filter;
                if (categoryFilter) {
                    categoryFilter.value = filter;
                    filterBooks(filter);
                }
            }
            
            // Scroll to book collection section
            document.querySelector('.book-collection').scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
    
    // Handle filter dropdown changes
    categoryFilter.addEventListener('change', function() {
        filterBooks(this.value);
    });
    
    // Filter books based on category
    function filterBooks(category) {
        const books = bookGrid.querySelectorAll('.book-card');
        let visibleCount = 0;
        
        books.forEach(book => {
            if (category === 'all' || book.dataset.category === category) {
                book.style.display = 'block';
                visibleCount++;
            } else {
                book.style.display = 'none';
            }
        });
        
        // Show/hide no results message
        if (noResults) {
            noResults.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    }
} 