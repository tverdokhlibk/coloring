// Main JavaScript functionality for the coloring pages website

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initMobileMenu();
    initLazyLoading();
    initScrollAnimations();
    initSearchEnhancements();
    initImageOptimization();
    initAnalytics();
});

// Mobile Menu Functionality
function initMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.main-nav');
    
    if (mobileToggle && nav) {
        mobileToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            nav.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileToggle.contains(e.target) && !nav.contains(e.target)) {
                mobileToggle.classList.remove('active');
                nav.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
        
        // Close menu on window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                mobileToggle.classList.remove('active');
                nav.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }
}

// Lazy Loading for Images
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for older browsers
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.dataset.src;
        });
    }
}

// Scroll Animations
function initScrollAnimations() {
    if ('IntersectionObserver' in window) {
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        document.querySelectorAll('.category-card, .coloring-card, .age-card, .benefit-item').forEach(el => {
            el.classList.add('animate-on-scroll');
            animationObserver.observe(el);
        });
    }
}

// Enhanced Search Functionality
function initSearchEnhancements() {
    const searchInputs = document.querySelectorAll('.search-input, .page-search-input, .hero-search-input');
    
    searchInputs.forEach(input => {
        // Add search suggestions
        createSearchSuggestions(input);
        
        // Add search history
        initSearchHistory(input);
        
        // Add keyboard shortcuts
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                this.blur();
                hideSuggestions();
            }
        });
    });
}

function createSearchSuggestions(input) {
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'search-suggestions';
    input.parentNode.appendChild(suggestionsContainer);
    
    // Popular search terms
    const popularSearches = [
        'тварини', 'машини', 'принцеси', 'динозаври', 'квіти',
        'космос', 'підводний світ', 'свята', 'професії', 'спорт'
    ];
    
    input.addEventListener('input', debounce(function() {
        const query = this.value.toLowerCase().trim();
        
        if (query.length > 0) {
            const suggestions = popularSearches
                .filter(term => term.includes(query))
                .slice(0, 5);
                
            showSuggestions(suggestions, suggestionsContainer, input);
        } else {
            hideSuggestions();
        }
    }, 200));
    
    input.addEventListener('focus', function() {
        if (this.value === '') {
            showSuggestions(popularSearches.slice(0, 5), suggestionsContainer, input);
        }
    });
    
    input.addEventListener('blur', function() {
        setTimeout(() => hideSuggestions(), 150);
    });
}

function showSuggestions(suggestions, container, input) {
    container.innerHTML = '';
    
    if (suggestions.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    suggestions.forEach(suggestion => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.textContent = suggestion;
        
        item.addEventListener('click', function() {
            input.value = suggestion;
            hideSuggestions();
            // Trigger search
            const form = input.closest('form');
            if (form) {
                form.dispatchEvent(new Event('submit'));
            }
        });
        
        container.appendChild(item);
    });
    
    container.style.display = 'block';
}

function hideSuggestions() {
    document.querySelectorAll('.search-suggestions').forEach(container => {
        container.style.display = 'none';
    });
}

function initSearchHistory(input) {
    const form = input.closest('form');
    if (form) {
        form.addEventListener('submit', function() {
            const query = input.value.trim();
            if (query) {
                saveSearchQuery(query);
            }
        });
    }
}

function saveSearchQuery(query) {
    let history = getSearchHistory();
    history = history.filter(item => item !== query);
    history.unshift(query);
    history = history.slice(0, 10); // Keep only last 10 searches
    
    try {
        localStorage.setItem('search_history', JSON.stringify(history));
    } catch (e) {
        // Handle localStorage not available
        console.log('LocalStorage not available');
    }
}

function getSearchHistory() {
    try {
        const history = localStorage.getItem('search_history');
        return history ? JSON.parse(history) : [];
    } catch (e) {
        return [];
    }
}

// Image Optimization and Loading
function initImageOptimization() {
    // Add loading states to images
    document.querySelectorAll('img').forEach(img => {
        if (!img.complete) {
            img.classList.add('loading');
            
            img.addEventListener('load', function() {
                this.classList.remove('loading');
                this.classList.add('loaded');
            });
            
            img.addEventListener('error', function() {
                this.classList.remove('loading');
                this.classList.add('error');
                // Add fallback image
                this.src = '/images/placeholder.svg';
            });
        }
    });
    
    // Preload critical images
    preloadCriticalImages();
}

function preloadCriticalImages() {
    const criticalImages = [
        '/images/logo.svg',
        '/images/hero-bg.jpg'
    ];
    
    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
}

// Analytics and User Interaction Tracking
function initAnalytics() {
    // Track popular categories
    document.querySelectorAll('.category-link, .quick-category, .quick-tag').forEach(link => {
        link.addEventListener('click', function() {
            const category = this.textContent.trim();
            trackEvent('category_click', { category: category });
        });
    });
    
    // Track coloring page views
    document.querySelectorAll('.coloring-link').forEach(link => {
        link.addEventListener('click', function() {
            const title = this.querySelector('.coloring-title')?.textContent;
            if (title) {
                trackEvent('coloring_page_view', { title: title });
            }
        });
    });
    
    // Track download attempts
    document.querySelectorAll('.download-btn, .action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.textContent.includes('Завантажити') ? 'download' : 'action';
            trackEvent('user_action', { action: action });
        });
    });
    
    // Track search usage
    document.querySelectorAll('.search-form, .page-search-form, .hero-search-form').forEach(form => {
        form.addEventListener('submit', function() {
            const query = this.querySelector('input[type="search"]')?.value;
            if (query) {
                trackEvent('search', { query: query });
            }
        });
    });
}

function trackEvent(eventName, properties = {}) {
    // Simple analytics tracking - можна інтегрувати з Google Analytics, Plausible тощо
    console.log('Analytics Event:', eventName, properties);
    
    // Приклад інтеграції з Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, properties);
    }
    
    // Приклад інтеграції з Plausible
    if (typeof plausible !== 'undefined') {
        plausible(eventName, { props: properties });
    }
}

// Performance Optimization
function optimizePerformance() {
    // Preconnect to external domains
    const preconnectDomains = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com'
    ];
    
    preconnectDomains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        document.head.appendChild(link);
    });
    
    // Prefetch popular pages
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            prefetchPopularPages();
        });
    }
}

function prefetchPopularPages() {
    const popularPages = [
        '/categories/тварини/',
        '/categories/транспорт/',
        '/categories/природа/'
    ];
    
    popularPages.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
    });
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Smooth scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Back to top button
function initBackToTop() {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="18 15l-6-6-6 6"/>
        </svg>
    `;
    backToTopBtn.setAttribute('aria-label', 'Повернутися наверх');
    document.body.appendChild(backToTopBtn);
    
    const toggleBackToTop = throttle(() => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }, 100);
    
    window.addEventListener('scroll', toggleBackToTop);
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Print functionality enhancement
function enhancePrintFunctionality() {
    window.addEventListener('beforeprint', function() {
        // Hide unnecessary elements when printing
        document.body.classList.add('printing');
    });
    
    window.addEventListener('afterprint', function() {
        document.body.classList.remove('printing');
    });
}

// Image zoom functionality for coloring pages
function initImageZoom() {
    const coloringImages = document.querySelectorAll('.coloring-main-image');
    
    coloringImages.forEach(img => {
        img.addEventListener('click', function() {
            createImageModal(this);
        });
        
        // Add cursor pointer to indicate clickability
        img.style.cursor = 'zoom-in';
    });
}

function createImageModal(img) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="modal-backdrop">
            <div class="modal-content">
                <button class="modal-close" aria-label="Закрити">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                <img src="${img.src}" alt="${img.alt}" class="modal-image">
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="downloadImage()">Завантажити</button>
                    <button class="btn btn-outline" onclick="printImage()">Друкувати</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.classList.add('modal-open');
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.modal-close');
    const backdrop = modal.querySelector('.modal-backdrop');
    
    const closeModal = () => {
        document.body.removeChild(modal);
        document.body.classList.remove('modal-open');
    };
    
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
            closeModal();
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', function escapeHandler(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escapeHandler);
        }
    });
}

// Initialize additional features
function initAdditionalFeatures() {
    initSmoothScroll();
    initBackToTop();
    enhancePrintFunctionality();
    initImageZoom();
    optimizePerformance();
}

// Error handling for images
function handleImageErrors() {
    document.addEventListener('error', function(e) {
        if (e.target.tagName === 'IMG') {
            const img = e.target;
            if (!img.classList.contains('error-handled')) {
                img.classList.add('error-handled');
                img.src = '/images/placeholder.svg';
                img.alt = 'Зображення недоступне';
            }
        }
    }, true);
}

// Service Worker registration for offline functionality
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initAdditionalFeatures();
    handleImageErrors();
    registerServiceWorker();
});

// CSS for additional functionality
const additionalCSS = `
/* Back to top button */
.back-to-top {
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.back-to-top.visible {
    opacity: 1;
    visibility: visible;
}

.back-to-top:hover {
    background: #5a6fd8;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* Image modal */
.image-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10000;
}

.modal-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.modal-content {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
    background: white;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.modal-close {
    position: absolute;
    top: 15px;
    right: 15px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    transition: background 0.3s ease;
}

.modal-close:hover {
    background: rgba(0, 0, 0, 0.9);
}

.modal-image {
    max-width: 100%;
    max-height: calc(90vh - 100px);
    object-fit: contain;
}

.modal-actions {
    padding: 20px;
    display: flex;
    gap: 12px;
    justify-content: center;
    background: #f8f9fa;
}

.modal-open {
    overflow: hidden;
}

/* Search suggestions */
.search-suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #e0e0e0;
    border-top: none;
    border-radius: 0 0 8px 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    max-height: 200px;
    overflow-y: auto;
}

.suggestion-item {
    padding: 12px 16px;
    cursor: pointer;
    transition: background 0.2s ease;
    border-bottom: 1px solid #f0f0f0;
}

.suggestion-item:hover {
    background: #f8f9fa;
}

.suggestion-item:last-child {
    border-bottom: none;
}

/* Print styles */
@media print {
    .printing .site-header,
    .printing .site-footer,
    .printing .back-to-top,
    .printing .modal-actions {
        display: none !important;
    }
    
    .printing .coloring-main-image {
        max-width: 100% !important;
        height: auto !important;
    }
}

/* Loading states */
img.loading {
    opacity: 0.5;
}

img.loaded {
    opacity: 1;
    transition: opacity 0.3s ease;
}

img.error {
    opacity: 0.7;
    filter: grayscale(100%);
}

/* Scroll animations */
.animate-on-scroll {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.6s ease;
}

.animate-on-scroll.animate-in {
    opacity: 1;
    transform: translateY(0);
}

/* Mobile menu enhancements */
@media (max-width: 768px) {
    .main-nav {
        position: fixed;
        top: 0;
        left: -100%;
        width: 80%;
        height: 100vh;
        background: white;
        transition: left 0.3s ease;
        z-index: 9999;
        padding: 80px 20px 20px;
        box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    }
    
    .main-nav.active {
        left: 0;
    }
    
    .nav-list {
        flex-direction: column;
        gap: 0;
    }
    
    .nav-link {
        padding: 15px 0;
        border-bottom: 1px solid #f0f0f0;
        font-size: 18px;
    }
    
    .mobile-menu-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .mobile-menu-toggle.active span:nth-child(2) {
        opacity: 0;
    }
    
    .mobile-menu-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
    
    .menu-open::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9998;
    }
}
`;

// Inject additional CSS
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);