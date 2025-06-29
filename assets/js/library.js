/**
 * Library page scripts
 * Handles carousel functionality and category filtering
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Library JS loaded');
    setTimeout(initCategoryCarousel, 500); // Delay initialization to ensure DOM is fully rendered
    initCategoryFilter();
    enhanceBookCollection();
    
    // Initialize results counter
    const resultsCounter = document.getElementById('resultsCounter');
    const resultsContainer = document.querySelector('.results-counter');
    if (resultsCounter && resultsContainer) {
        resultsContainer.style.display = 'inline-block';
    }
    
    // Connect the hero section search with our enhanced search functionality
    const heroSearchInput = document.querySelector('.search-container #bookSearch');
    const heroSearchButton = document.querySelector('.search-container #searchButton');
    
    // Add clear button to hero search
    const searchContainer = document.querySelector('.search-container .input-group');
    if (searchContainer && heroSearchInput) {
        const clearBtn = document.createElement('button');
        clearBtn.id = 'clearSearchHero';
        clearBtn.type = 'button';
        clearBtn.innerHTML = '<i class="fas fa-times"></i>';
        clearBtn.style.display = 'none';
        searchContainer.appendChild(clearBtn);
        
        // Show/hide clear button
        heroSearchInput.addEventListener('input', function() {
            clearBtn.style.display = this.value ? 'flex' : 'none';
        });
        
        // Clear search functionality
        clearBtn.addEventListener('click', function() {
            heroSearchInput.value = '';
            this.style.display = 'none';
            heroSearchInput.focus();
            
            // If we're already on the book collection page, perform the search
            if (document.querySelector('.book-collection')) {
                performSearch(heroSearchInput.value);
                showAllBooks();
            }
        });
    }
    
    // Connect hero search button to our search functionality
    if (heroSearchButton) {
        heroSearchButton.addEventListener('click', function() {
            const searchTerm = heroSearchInput ? heroSearchInput.value.trim() : '';
            
            // If we're already on the book collection page, perform the search
            if (document.querySelector('.book-collection')) {
                performSearch(searchTerm);
                scrollToBookCollection();
            } else {
                // If we're on another page, redirect to the library page with search parameter
                window.location.href = '/library/?search=' + encodeURIComponent(searchTerm);
            }
        });
    }
    
    // Handle Enter key in hero search
    if (heroSearchInput) {
        heroSearchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                const searchTerm = this.value.trim();
                
                // If we're already on the book collection page, perform the search
                if (document.querySelector('.book-collection')) {
                    performSearch(searchTerm);
                    scrollToBookCollection();
                } else {
                    // If we're on another page, redirect to the library page with search parameter
                    window.location.href = '/library/?search=' + encodeURIComponent(searchTerm);
                }
            }
        });
    }
    
    // Check for search parameter in URL when page loads
    function checkUrlSearchParam() {
        const urlParams = new URLSearchParams(window.location.search);
        const searchParam = urlParams.get('search');
        
        if (searchParam && heroSearchInput) {
            heroSearchInput.value = searchParam;
            
            // If we're on the book collection page, perform the search
            if (document.querySelector('.book-collection')) {
                performSearch(searchParam);
                scrollToBookCollection();
                
                // Show clear button
                const clearBtn = document.getElementById('clearSearchHero');
                if (clearBtn) {
                    clearBtn.style.display = 'flex';
                }
            }
        }
    }
    
    // Scroll to book collection section
    function scrollToBookCollection() {
        const bookCollection = document.querySelector('.book-collection');
        if (bookCollection) {
            setTimeout(() => {
                bookCollection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }
    
    // Run the check for search parameters when page loads
    checkUrlSearchParam();
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
                performSearch();
                scrollToResults();
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
                    performSearch();
                    scrollToResults();
                }
            }
        });
    });
    
    // Handle filter dropdown changes
    categoryFilter.addEventListener('change', function() {
        performSearch();
        scrollToResults();
    });
    
    // Search and filter functionality
    function performSearch(externalSearchTerm = null) {
        // Get references to DOM elements
        const bookCards = document.querySelectorAll('.book-card');
        const searchInput = document.getElementById('bookSearch');
        const categoryFilter = document.getElementById('categoryFilter');
        const backToAllBtn = document.getElementById('backToAllBooks');
        const noResults = document.getElementById('noResults');
        
        // Use external search term if provided, otherwise use the search input value
        const searchTerm = externalSearchTerm !== null ? 
            externalSearchTerm.toLowerCase().trim() : 
            (searchInput ? searchInput.value.toLowerCase().trim() : '');
        
        // If we have a search input in the book collection area, update it
        if (searchInput && externalSearchTerm !== null) {
            searchInput.value = externalSearchTerm;
        }
        
        let resultsFound = false;
        let visibleCount = 0;
        
        // Toggle visibility of category carousel based on search state
        const categoryCarouselSection = document.querySelector('.category-carousel-section');
        if (categoryCarouselSection) {
            categoryCarouselSection.style.display = searchTerm ? 'none' : 'block';
        }
        
        // Toggle back button visibility
        if (backToAllBtn) {
            backToAllBtn.style.display = searchTerm || categoryFilter.value !== 'all' ? 'inline-flex' : 'none';
        }
        
        // Toggle search-active class on book collection
        const bookCollection = document.querySelector('.book-collection');
        if (bookCollection) {
            if (searchTerm || categoryFilter.value !== 'all') {
                bookCollection.classList.add('search-active');
            } else {
                bookCollection.classList.remove('search-active');
            }
        }
        
        // Update page title/heading when searching
        const collectionHeader = document.querySelector('.collection-header .section-title');
        if (collectionHeader) {
            if (searchTerm) {
                collectionHeader.innerHTML = `Search Results <span class="search-query">${searchTerm}</span>`;
                collectionHeader.classList.add('search-mode');
            } else if (categoryFilter.value !== 'all') {
                const categoryName = categoryFilter.options[categoryFilter.selectedIndex].text;
                collectionHeader.innerHTML = `Category: <span class="search-query">${categoryName}</span>`;
                collectionHeader.classList.add('search-mode');
            } else {
                collectionHeader.textContent = 'Our Book Collection';
                collectionHeader.classList.remove('search-mode');
            }
        }
        
        // Reset all cards before filtering
        bookCards.forEach(card => {
            card.classList.remove('highlight-match');
            card.querySelectorAll('.highlight').forEach(el => {
                el.outerHTML = el.innerHTML;
            });
        });
        
        // If search is empty, just filter by category
        if (searchTerm === '') {
            bookCards.forEach((card, index) => {
                const category = card.dataset.category;
                const matchesCategory = categoryFilter.value === 'all' || category === categoryFilter.value;
                
                if (matchesCategory) {
                    card.style.display = 'block';
                    card.style.animationDelay = `${Math.min(index * 0.05, 0.4)}s`;
                    card.classList.add('fade-in');
                    visibleCount++;
                    resultsFound = true;
                } else {
                    card.style.display = 'none';
                    card.classList.remove('fade-in');
                }
            });
        } else {
            // Advanced search with term matching
            const searchTerms = searchTerm.split(' ').filter(term => term.length > 0);
            
            bookCards.forEach((card, index) => {
                const titleEl = card.querySelector('.book-title');
                const authorEl = card.querySelector('.book-author');
                const categoryEl = card.querySelector('.book-category');
                
                const title = titleEl.textContent.toLowerCase();
                const author = authorEl.textContent.toLowerCase();
                const category = card.dataset.category.toLowerCase();
                
                // Check for matches in title, author, or category
                let matchScore = 0;
                let hasExactMatch = false;
                let matchDetails = { title: false, author: false, category: false };
                
                // Check for exact matches first
                if (title.includes(searchTerm)) {
                    matchScore += 10;
                    hasExactMatch = true;
                    matchDetails.title = true;
                }
                
                if (author.includes(searchTerm)) {
                    matchScore += 8;
                    hasExactMatch = true;
                    matchDetails.author = true;
                }
                
                if (category.includes(searchTerm)) {
                    matchScore += 5;
                    hasExactMatch = true;
                    matchDetails.category = true;
                }
                
                // If no exact match, try partial matching with individual terms
                if (!hasExactMatch && searchTerms.length > 1) {
                    searchTerms.forEach(term => {
                        if (term.length < 3) return; // Skip very short terms
                        
                        if (title.includes(term)) {
                            matchScore += 3;
                            matchDetails.title = true;
                        }
                        
                        if (author.includes(term)) {
                            matchScore += 2;
                            matchDetails.author = true;
                        }
                        
                        if (category.includes(term)) {
                            matchScore += 1;
                            matchDetails.category = true;
                        }
                    });
                }
                
                const matchesSearch = matchScore > 0;
                const matchesCategory = categoryFilter.value === 'all' || card.dataset.category === categoryFilter.value;
                
                if (matchesSearch && matchesCategory) {
                    // Highlight matching text
                    if (matchDetails.title) {
                        highlightText(titleEl, searchTerm, searchTerms);
                    }
                    
                    if (matchDetails.author) {
                        highlightText(authorEl, searchTerm, searchTerms);
                    }
                    
                    // Add a special class for better visibility
                    if (matchScore >= 8) {
                        card.classList.add('highlight-match');
                    }
                    
                    // Display the card with animation
                    card.style.display = 'block';
                    card.style.animationDelay = `${Math.min(index * 0.05, 0.4)}s`;
                    card.classList.add('fade-in');
                    visibleCount++;
                    resultsFound = true;
                } else {
                    card.style.display = 'none';
                    card.classList.remove('fade-in');
                }
            });
        }
        
        // Show/hide no results message
        if (noResults) {
            noResults.style.display = resultsFound ? 'none' : 'block';
        }
        
        // Update counter if it exists
        const resultsCounter = document.getElementById('resultsCounter');
        if (resultsCounter) {
            resultsCounter.textContent = visibleCount;
            resultsCounter.parentElement.style.display = 'block';
            
            // Add search term to counter if there was a search
            if (searchTerm) {
                resultsCounter.parentElement.querySelector('.search-term-display')?.remove();
                const searchDisplay = document.createElement('span');
                searchDisplay.className = 'search-term-display';
                searchDisplay.innerHTML = ` for "<strong>${searchTerm}</strong>"`;
                resultsCounter.insertAdjacentElement('afterend', searchDisplay);
            } else {
                resultsCounter.parentElement.querySelector('.search-term-display')?.remove();
            }
        }
    }
    
    // Helper function to highlight matching text
    function highlightText(element, fullSearchTerm, searchTerms) {
        let content = element.innerHTML;
        
        // Try to highlight the full search term first
        if (fullSearchTerm && fullSearchTerm.length > 2) {
            const regex = new RegExp(escapeRegExp(fullSearchTerm), 'gi');
            content = content.replace(regex, match => `<span class="highlight">${match}</span>`);
        }
        
        // Then try individual terms if they're long enough
        if (searchTerms && searchTerms.length > 0) {
            searchTerms.forEach(term => {
                if (term.length > 2) {
                    const regex = new RegExp(escapeRegExp(term), 'gi');
                    content = content.replace(regex, match => {
                        // Don't double-highlight
                        if (!match.includes('highlight')) {
                            return `<span class="highlight">${match}</span>`;
                        }
                        return match;
                    });
                }
            });
        }
        
        element.innerHTML = content;
    }
    
    // Helper function to escape special characters in regex
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    // Helper function to show toast notifications
    function showToast(message) {
        // Check if a toast container exists, if not create one
        let toastContainer = document.querySelector('.toast-container');
        
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
            
            // Add styles if not already in CSS
            const style = document.createElement('style');
            style.textContent = `
                .toast-container {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 9999;
                }
                .toast {
                    background-color: #1a5928;
                    color: white;
                    padding: 12px 20px;
                    border-radius: 4px;
                    margin-top: 10px;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.2);
                    transform: translateY(100px);
                    opacity: 0;
                    transition: all 0.3s ease;
                }
                .toast.show {
                    transform: translateY(0);
                    opacity: 1;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Create and show the toast
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toastContainer.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toastContainer.removeChild(toast);
            }, 300);
        }, 3000);
    }
    
    
    
    // Function to scroll to search results
    function scrollToResults() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
        
        if (searchTerm || selectedCategory !== 'all') {
            // Slight delay to allow DOM to update
            setTimeout(() => {
                const resultsCounter = document.querySelector('.results-counter');
                if (resultsCounter) {
                    resultsCounter.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    }
}

// Book Collection Enhancements
function enhanceBookCollection() {
    // Add hover effects to book cards
    const bookCards = document.querySelectorAll('.book-card');
    const searchInput = document.getElementById('bookSearch');
    const searchButton = document.getElementById('searchButton');
    const clearSearchBtn = document.getElementById('clearSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const backToAllBtn = document.getElementById('backToAllBooks');
    const noResults = document.getElementById('noResults');
    
    // Initialize with staggered animation
    bookCards.forEach((card, index) => {
        // Add fancy loading animation
        card.classList.add('fade-in');
        card.style.animationDelay = `${Math.min(index * 0.1, 0.8)}s`;
        
        // Add bookmark functionality
        const bookmarkBtn = card.querySelector('.bookmark-btn');
        if (bookmarkBtn) {
            bookmarkBtn.addEventListener('click', function(e) {
                e.preventDefault();
                this.classList.toggle('active');
                
                const icon = this.querySelector('i');
                if (icon) {
                    if (icon.classList.contains('far')) {
                        icon.classList.replace('far', 'fas');
                        this.setAttribute('title', 'Bookmarked');
                        
                        // Optional: Show a toast notification
                        showToast('Book added to your bookmarks!');
                    } else {
                        icon.classList.replace('fas', 'far');
                        this.setAttribute('title', 'Add to bookmarks');
                        
                        // Optional: Show a toast notification
                        showToast('Book removed from your bookmarks!');
                    }
                }
            });
        }
    });
    
    // Add lazy loading for book covers
    const bookCovers = document.querySelectorAll('.book-cover img');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loading');
                    
                    // Simulate loading delay for visual effect
                    setTimeout(() => {
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        setTimeout(() => {
                            img.classList.remove('loading');
                        }, 300);
                        imageObserver.unobserve(img);
                    }, 300);
                }
            });
        });
        
        bookCovers.forEach(img => {
            if (img.dataset.src) {
                imageObserver.observe(img);
            }
        });
    }
} 