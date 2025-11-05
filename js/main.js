// ========================================
// Sky Background with Scroll-Based Transitions
// ========================================

class SkyTimeLapse {
    constructor() {
        this.overlay = document.querySelector('.sky-timelapse');
        this.currentHour = 0;
        this.sections = [];
        
        this.init();
    }
    
    init() {
        // Get all hour sections
        this.sections = Array.from(document.querySelectorAll('.hour-section'));
        
        // Set up scroll listener
        this.setupScrollListener();
        
        // Set initial brightness
        this.updateBrightness(0);
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
                    this.updateBrightness(hour);
                    this.currentHour = hour;
                }
                break;
            }
        }
    }
    
    updateBrightness(hour) {
        // Calculate darkness overlay based on time of day
        let darkness;
        
        if (hour >= 6 && hour <= 18) {
            // Daytime hours (6 AM - 6 PM): lighter
            if (hour === 12 || hour === 13) {
                // Noon - brightest (no overlay)
                darkness = 0;
            } else if (hour >= 10 && hour <= 15) {
                // Mid-day - very bright
                darkness = 0.1;
            } else if (hour >= 8 && hour <= 16) {
                // Morning/afternoon - bright
                darkness = 0.2;
            } else if (hour === 7 || hour === 17) {
                // Early morning/late afternoon
                darkness = 0.35;
            } else {
                // Sunrise/sunset (6, 18)
                darkness = 0.5;
            }
        } else {
            // Nighttime hours: darker
            if (hour === 0 || hour === 1 || hour === 23) {
                // Midnight - darkest
                darkness = 0.8;
            } else if (hour >= 2 && hour <= 4) {
                // Deep night
                darkness = 0.75;
            } else if (hour === 5 || hour === 19) {
                // Dawn/dusk
                darkness = 0.65;
            } else {
                // Evening (20-22)
                darkness = 0.7;
            }
        }
        
        // Apply the darkness overlay
        this.overlay.style.background = `rgba(0, 0, 0, ${darkness})`;
    }
}

// Initialize sky background brightness control
let skyTimeLapse;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        skyTimeLapse = new SkyTimeLapse();
    });
} else {
    skyTimeLapse = new SkyTimeLapse();
}

// ========================================
// Section Tracking (CSS Scroll Snap handles scrolling)
// ========================================

let currentSection = 0;
const sections = document.querySelectorAll('.hour-section');

// Update current section based on scroll position
function updateCurrentSection() {
    const scrollPosition = window.scrollY + window.innerHeight / 2;
    
    sections.forEach((section, index) => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            currentSection = index;
        }
    });
}


// Handle keyboard navigation
function handleKeydown(e) {
    switch(e.key) {
        case 'ArrowDown':
        case 'PageDown':
        case ' ': // Space
            e.preventDefault();
            if (currentSection < sections.length - 1) {
                sections[currentSection + 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            break;
        case 'ArrowUp':
        case 'PageUp':
            e.preventDefault();
            if (currentSection > 0) {
                sections[currentSection - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            break;
        case 'Home':
            e.preventDefault();
            sections[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
            break;
        case 'End':
            e.preventDefault();
            sections[sections.length - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
            break;
    }
}

// Attach event listeners
window.addEventListener('keydown', handleKeydown);
window.addEventListener('scroll', updateCurrentSection, { passive: true });

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
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ========================================
// Navigation Bar Scroll Effect
// ========================================

let lastScrollTop = 0;
const navbar = document.querySelector('.top-header');

if (navbar) {
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add shadow when scrolled
        if (scrollTop > 50) {
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.08)';
        }
        
        lastScrollTop = scrollTop;
    }, { passive: true });
}

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
