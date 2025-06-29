/**
 * Library page scripts
 * Handles carousel functionality and category filtering
 */

document.addEventListener('DOMContentLoaded', function() {
    initCategoryCarousel();
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
    
    if (!track || !slides.length || !prevBtn || !nextBtn) return;
    
    let slideWidth = slides[0].offsetWidth + parseInt(window.getComputedStyle(slides[0]).marginLeft) + 
                    parseInt(window.getComputedStyle(slides[0]).marginRight);
    let currentIndex = 0;
    let slidesToShow = getVisibleSlides();
    
    function getVisibleSlides() {
        const viewportWidth = window.innerWidth;
        if (viewportWidth < 576) return 1;
        if (viewportWidth < 992) return 2;
        if (viewportWidth < 1200) return 3;
        return 4;
    }
    
    function updateSlideWidth() {
        slideWidth = slides[0].offsetWidth + parseInt(window.getComputedStyle(slides[0]).marginLeft) + 
                    parseInt(window.getComputedStyle(slides[0]).marginRight);
        slidesToShow = getVisibleSlides();
        moveToSlide(currentIndex);
    }
    
    function moveToSlide(index) {
        if (index < 0) index = 0;
        if (index > slides.length - slidesToShow) index = slides.length - slidesToShow;
        
        currentIndex = index;
        track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        
        // Update button states
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex >= slides.length - slidesToShow;
        
        prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
        nextBtn.style.opacity = currentIndex >= slides.length - slidesToShow ? '0.5' : '1';
    }
    
    prevBtn.addEventListener('click', () => {
        moveToSlide(currentIndex - 1);
    });
    
    nextBtn.addEventListener('click', () => {
        moveToSlide(currentIndex + 1);
    });
    
    window.addEventListener('resize', updateSlideWidth);
    
    // Initialize
    updateSlideWidth();
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