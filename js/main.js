// ========================================
// Sky Background with Scroll-Based Transitions
// ========================================

class SkyTimeLapse {
    constructor() {
        this.container = document.querySelector('.sky-timelapse');
        this.currentHour = 0;
        this.images = [];
        this.isInitialized = false;
        this.sections = [];
        
        this.init();
    }
    
    init() {
        // Load 24 hourly sky images (named 00.jpg through 23.jpg)
        for (let i = 0; i < 24; i++) {
            const hour = i.toString().padStart(2, '0');
            const img = document.createElement('img');
            img.src = `images/sky/${hour}.jpg`;
            img.alt = `Sky at ${hour}:00`;
            img.dataset.hour = i;
            
            // Add error handling for missing images
            img.onerror = () => {
                console.warn(`Sky image not found: ${hour}.jpg`);
                img.style.background = this.getTimeBasedGradient(i);
            };
            
            this.container.appendChild(img);
            this.images.push(img);
        }
        
        // Get all hour sections
        this.sections = Array.from(document.querySelectorAll('.hour-section'));
        
        // Start with the first image
        if (this.images.length > 0) {
            this.images[0].classList.add('active');
            this.isInitialized = true;
        }
        
        // Set up scroll listener
        this.setupScrollListener();
    }
    
    setupScrollListener() {
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
        
        // Initial check
        this.handleScroll();
    }
    
    handleScroll() {
        const scrollPosition = window.scrollY + window.innerHeight / 2;
        
        // Find which section is currently in view
        for (let i = 0; i < this.sections.length; i++) {
            const section = this.sections[i];
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                const hour = parseInt(section.dataset.hour);
                if (hour !== this.currentHour) {
                    this.transitionToHour(hour);
                }
                break;
            }
        }
    }
    
    transitionToHour(hour) {
        if (hour >= 0 && hour < 24 && hour !== this.currentHour) {
            // Remove active class from current image
            this.images[this.currentHour].classList.remove('active');
            
            // Add active class to new image
            this.currentHour = hour;
            this.images[this.currentHour].classList.add('active');
        }
    }
    
    // Generate time-appropriate gradient as fallback
    getTimeBasedGradient(hour) {
        if (hour >= 5 && hour < 7) {
            return 'linear-gradient(to bottom, #FF6B6B, #FFA07A, #87CEEB)';
        } else if (hour >= 7 && hour < 17) {
            return 'linear-gradient(to bottom, #4A90E2, #87CEEB)';
        } else if (hour >= 17 && hour < 19) {
            return 'linear-gradient(to bottom, #FF6B6B, #FF8C42, #4A5568)';
        } else {
            return 'linear-gradient(to bottom, #1A202C, #2D3748)';
        }
    }
}

// Initialize sky background when DOM is ready
let skyTimeLapse;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        skyTimeLapse = new SkyTimeLapse();
    });
} else {
    skyTimeLapse = new SkyTimeLapse();
}

// ========================================
// Full-Page Scrolling
// ========================================

let isScrolling = false;
let currentSection = 0;
const sections = document.querySelectorAll('.hour-section');
let scrollTimeout;

function scrollToSection(index) {
    if (index < 0 || index >= sections.length) return;
    
    isScrolling = true;
    currentSection = index;
    
    sections[index].scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
    
    // Reset scrolling flag after animation
    setTimeout(() => {
        isScrolling = false;
    }, 1000);
}

// Handle wheel/trackpad scrolling
function handleWheel(e) {
    if (isScrolling) {
        e.preventDefault();
        return;
    }
    
    // Clear previous timeout
    clearTimeout(scrollTimeout);
    
    // Set new timeout to detect end of scroll
    scrollTimeout = setTimeout(() => {
        const direction = e.deltaY > 0 ? 1 : -1;
        const nextSection = currentSection + direction;
        
        if (nextSection >= 0 && nextSection < sections.length) {
            scrollToSection(nextSection);
        }
    }, 50);
}

// Handle keyboard navigation
function handleKeydown(e) {
    if (isScrolling) return;
    
    switch(e.key) {
        case 'ArrowDown':
        case 'PageDown':
        case ' ': // Space
            e.preventDefault();
            scrollToSection(currentSection + 1);
            break;
        case 'ArrowUp':
        case 'PageUp':
            e.preventDefault();
            scrollToSection(currentSection - 1);
            break;
        case 'Home':
            e.preventDefault();
            scrollToSection(0);
            break;
        case 'End':
            e.preventDefault();
            scrollToSection(sections.length - 1);
            break;
    }
}

// Update current section based on scroll position
function updateCurrentSection() {
    if (isScrolling) return;
    
    const scrollPosition = window.scrollY + window.innerHeight / 2;
    
    sections.forEach((section, index) => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            currentSection = index;
        }
    });
}

// Attach event listeners
window.addEventListener('wheel', handleWheel, { passive: false });
window.addEventListener('keydown', handleKeydown);
window.addEventListener('scroll', updateCurrentSection);

// Initialize current section
updateCurrentSection();

// ========================================
// Smooth Scrolling & Navigation
// ========================================

// Handle navigation smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Ignore empty hash links
        if (href === '#' || !href) return;
        
        e.preventDefault();
        
        const target = document.querySelector(href);
        if (target) {
            const navHeight = document.querySelector('.nav').offsetHeight;
            const targetPosition = target.offsetTop - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ========================================
// Navigation Bar Scroll Effect
// ========================================

let lastScrollTop = 0;
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Add shadow when scrolled
    if (scrollTop > 50) {
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
    
    lastScrollTop = scrollTop;
});

// ========================================
// Hour Navigation
// ========================================

const hourItems = document.querySelectorAll('.hour-item');
const hourNav = document.querySelector('.hour-nav');

// Handle clicking on hour items
hourItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetHour = item.getAttribute('href').substring(1); // e.g., "hour-06"
        const targetSection = document.getElementById(targetHour);
        
        if (targetSection) {
            // Update active state
            hourItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Smooth scroll to the target section
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Update active hour based on scroll position
function updateActiveHour() {
    const scrollPosition = window.scrollY + window.innerHeight / 2;
    const sections = document.querySelectorAll('.hour-section');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            const hour = section.dataset.hour;
            hourItems.forEach(item => {
                if (item.dataset.hour === hour) {
                    hourItems.forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                    
                    // Auto-scroll nav to show active hour
                    if (hourNav) {
                        const itemRect = item.getBoundingClientRect();
                        const navRect = hourNav.getBoundingClientRect();
                        const scrollTop = item.offsetTop - (navRect.height / 2) + (itemRect.height / 2);
                        hourNav.scrollTo({
                            top: scrollTop,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        }
    });
}

// Update on scroll (throttled)
let hourUpdateTicking = false;
window.addEventListener('scroll', () => {
    if (!hourUpdateTicking) {
        window.requestAnimationFrame(() => {
            updateActiveHour();
            hourUpdateTicking = false;
        });
        hourUpdateTicking = true;
    }
});

// Initial update
updateActiveHour();


// ========================================
// Intersection Observer for Hour Sections
// ========================================

const observerOptions = {
    threshold: 0.3,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all hour sections
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.hour-section');
    sections.forEach(section => {
        observer.observe(section);
    });
});



// ========================================
// Accessibility Enhancements
// ========================================

// Skip to main content link (can be added to HTML if needed)
document.addEventListener('keydown', (e) => {
    // Allow Escape key to close any modals or overlays
    if (e.key === 'Escape') {
        // Future modal functionality
    }
});

// ========================================
// Performance Optimization
// ========================================

// Lazy load images below the fold
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.dataset.src || img.src;
    });
} else {
    // Fallback for browsers that don't support lazy loading
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
}

// ========================================
// Sun/Moon Icon Opacity Simulation
// ========================================

function updateIconOpacity() {
    const hourItems = document.querySelectorAll('.hour-item');
    
    hourItems.forEach(item => {
        const hour = parseInt(item.getAttribute('data-hour'));
        const icon = item.querySelector('.hour-icon');
        
        if (!icon) return;
        
        let opacity;
        
        // Determine opacity based on time of day with more dramatic ranges
        if (hour >= 6 && hour <= 18) {
            // Daytime (sun) - 6 AM to 6 PM
            if (hour === 6) {
                // Sunrise - very dim
                opacity = 0.2;
            } else if (hour === 7) {
                // Early morning
                opacity = 0.35;
            } else if (hour === 8) {
                // Morning
                opacity = 0.55;
            } else if (hour === 9) {
                // Late morning
                opacity = 0.75;
            } else if (hour === 10) {
                // Pre-noon
                opacity = 0.9;
            } else if (hour === 11) {
                // Almost noon
                opacity = 0.95;
            } else if (hour === 12) {
                // Noon - brightest sun
                opacity = 1.0;
            } else if (hour === 13) {
                // Early afternoon
                opacity = 1.0;
            } else if (hour === 14) {
                // Afternoon
                opacity = 0.95;
            } else if (hour === 15) {
                // Mid afternoon
                opacity = 0.9;
            } else if (hour === 16) {
                // Late afternoon
                opacity = 0.8;
            } else if (hour === 17) {
                // Pre-sunset
                opacity = 0.65;
            } else if (hour === 18) {
                // Sunset - dimming fast
                opacity = 0.4;
            }
        } else {
            // Nighttime (moon) - 7 PM to 5 AM
            if (hour === 19) {
                // Early evening - dim moon
                opacity = 0.3;
            } else if (hour === 20) {
                // Evening
                opacity = 0.45;
            } else if (hour === 21) {
                // Night
                opacity = 0.6;
            } else if (hour === 22) {
                // Late night
                opacity = 0.75;
            } else if (hour === 23) {
                // Pre-midnight
                opacity = 0.85;
            } else if (hour === 0) {
                // Midnight - brightest moon
                opacity = 1.0;
            } else if (hour === 1) {
                // Post-midnight
                opacity = 0.95;
            } else if (hour === 2) {
                // Deep night
                opacity = 0.85;
            } else if (hour === 3) {
                // Pre-dawn
                opacity = 0.7;
            } else if (hour === 4) {
                // Dawn approaching
                opacity = 0.5;
            } else if (hour === 5) {
                // Early dawn - moon fading
                opacity = 0.25;
            }
        }
        
        // Apply opacity with transition
        icon.style.transition = 'opacity 0.3s ease';
        icon.style.opacity = opacity;
    });
}

// Initialize icon opacity on load
updateIconOpacity();

// Optional: Update icon opacity based on currently visible section
function updateIconBasedOnScroll() {
    const sections = document.querySelectorAll('.hour-section');
    const hourItems = document.querySelectorAll('.hour-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentHour = entry.target.getAttribute('data-hour');
                
                // Add 'active' class to corresponding nav item
                hourItems.forEach(item => {
                    if (item.getAttribute('data-hour') === currentHour) {
                        item.classList.add('active');
                    } else {
                        item.classList.remove('active');
                    }
                });
            }
        });
    }, {
        threshold: 0.5
    });
    
    sections.forEach(section => observer.observe(section));
}

// Initialize scroll-based active state
updateIconBasedOnScroll();

console.log('Live Like Richard website initialized ✓');
