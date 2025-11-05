// ========================================
// Sky Background with Scroll-Based Transitions
// ========================================

class SkyTimeLapse {
  constructor() {
    this.overlay = document.querySelector(".sky-timelapse");
    this.currentHour = 0;
    this.sections = [];

    this.init();
  }

  init() {
    // Get all hour sections
    this.sections = Array.from(document.querySelectorAll(".hour-section"));

    // Set up scroll listener
    this.setupScrollListener();

    // Set initial brightness
    this.updateBrightness(0);
  }

  setupScrollListener() {
    let ticking = false;

    window.addEventListener("scroll", () => {
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
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    skyTimeLapse = new SkyTimeLapse();
  });
} else {
  skyTimeLapse = new SkyTimeLapse();
}

// ========================================
// Section Tracking (CSS Scroll Snap handles scrolling)
// ========================================

let currentSection = 0;
const sections = document.querySelectorAll(".hour-section");
let isNavigating = false;
let navigationTimeout = null;

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

// Debounced update function for more reliable tracking
let updateDebounceTimer = null;
function debouncedUpdateCurrentSection() {
  clearTimeout(updateDebounceTimer);
  updateDebounceTimer = setTimeout(() => {
    updateCurrentSection();
  }, 100);
}

// Handle keyboard navigation with fullpage.js integration
function handleKeydown(e) {
  // Ignore if user is typing in an input field
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
    return;
  }

  // Prevent rapid repeated navigation
  if (isNavigating) {
    e.preventDefault();
    return;
  }

  let targetSection = null;

  switch (e.key) {
    case "ArrowDown":
    case "PageDown":
    case " ": // Space
      e.preventDefault();
      // Use fullpage.js API if available, otherwise fallback
      if (typeof fullpage_api !== "undefined") {
        fullpage_api.moveSectionDown();
      } else if (currentSection < sections.length - 1) {
        targetSection = currentSection + 1;
      }
      break;
    case "ArrowUp":
    case "PageUp":
      e.preventDefault();
      // Use fullpage.js API if available, otherwise fallback
      if (typeof fullpage_api !== "undefined") {
        fullpage_api.moveSectionUp();
      } else if (currentSection > 0) {
        targetSection = currentSection - 1;
      }
      break;
    case "Home":
      e.preventDefault();
      if (typeof fullpage_api !== "undefined") {
        fullpage_api.moveTo(1);
      } else {
        targetSection = 0;
      }
      break;
    case "End":
      e.preventDefault();
      if (typeof fullpage_api !== "undefined") {
        fullpage_api.moveTo(sections.length);
      } else {
        targetSection = sections.length - 1;
      }
      break;
    default:
      return; // Don't prevent default for other keys
  }

  // Fallback navigation if fullpage.js not available
  if (targetSection !== null) {
    isNavigating = true;
    sections[targetSection].scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    // Update current section immediately
    currentSection = targetSection;

    // Reset navigation lock after animation completes
    clearTimeout(navigationTimeout);
    navigationTimeout = setTimeout(() => {
      isNavigating = false;
      updateCurrentSection();
    }, 1000);
  } else if (typeof fullpage_api !== "undefined") {
    // If using fullpage.js, set navigation lock
    isNavigating = true;
    clearTimeout(navigationTimeout);
    navigationTimeout = setTimeout(() => {
      isNavigating = false;
    }, 800);
  }
}

// Attach event listeners
window.addEventListener("keydown", handleKeydown);
window.addEventListener("scroll", debouncedUpdateCurrentSection, {
  passive: true,
});

// Initialize current section
updateCurrentSection();

// ========================================
// Initialize fullPage.js
// ========================================

let fullPageInstance = null;

window.addEventListener("DOMContentLoaded", () => {
  if (typeof fullpage !== "undefined" && fullpage.default) {
    // fullpage.js v4 uses ES6 modules, access via .default
    fullPageInstance = new fullpage.default("#fullpage", {
      licenseKey: "YOUR_LICENSE_KEY",
      autoScrolling: true,
      scrollHorizontally: false,
      navigation: false,
      scrollingSpeed: 1000,
      fitToSection: true,
      fitToSectionDelay: 1000,
      easingcss3: "cubic-bezier(0.645, 0.045, 0.355, 1)",
      scrollBar: false,
      css3: true,
      verticalCentered: true,

      afterLoad: function (origin, destination, direction) {
        // Update sky brightness when section changes
        const hour = parseInt(destination.item.dataset.hour);
        if (skyTimeLapse && hour >= 0) {
          skyTimeLapse.updateBrightness(hour);
        }

        // Update hour nav active state
        const hourItems = document.querySelectorAll(".hour-item");
        hourItems.forEach((item) => {
          if (item.dataset.hour === destination.item.dataset.hour) {
            item.classList.add("active");
          } else {
            item.classList.remove("active");
          }
        });
      },
    });
  } else if (typeof fullpage === "function") {
    // Try direct constructor if not a module
    fullPageInstance = new fullpage("#fullpage", {
      licenseKey: "YOUR_LICENSE_KEY",
      autoScrolling: true,
      scrollHorizontally: false,
      navigation: false,
      scrollingSpeed: 1000,
      fitToSection: true,
      fitToSectionDelay: 1000,
      easingcss3: "cubic-bezier(0.645, 0.045, 0.355, 1)",
      scrollBar: false,
      css3: true,
      verticalCentered: true,

      afterLoad: function (origin, destination, direction) {
        const hour = parseInt(destination.item.dataset.hour);
        if (skyTimeLapse && hour >= 0) {
          skyTimeLapse.updateBrightness(hour);
        }

        const hourItems = document.querySelectorAll(".hour-item");
        hourItems.forEach((item) => {
          if (item.dataset.hour === destination.item.dataset.hour) {
            item.classList.add("active");
          } else {
            item.classList.remove("active");
          }
        });
      },
    });
  }
});

// ========================================
// Smooth Scrolling & Navigation
// ========================================

// Handle top navigation with fullpage.js (excluding hour nav)
document.addEventListener("DOMContentLoaded", () => {
  // Map of section IDs to indices
  const sectionMap = {
    "hour-05": 1,
    "hour-07": 2,
    "hour-09": 3,
    "hour-11": 4,
    "hour-13": 5,
    "hour-15": 6,
    "hour-17": 7,
    "hour-19": 8,
    "hour-21": 9,
    "hour-23": 10,
    "hour-01": 11,
    "hour-03": 12,
  };

  document
    .querySelectorAll('.top-nav a[href^="#"], .logo[href^="#"]')
    .forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const href = this.getAttribute("href");

        // Ignore empty hash links
        if (href === "#" || !href) return;

        e.preventDefault();

        // Use fullpage.js API to navigate by index
        const sectionId = href.substring(1); // Remove #
        const sectionIndex = sectionMap[sectionId];

        if (typeof fullpage_api !== "undefined" && sectionIndex) {
          fullpage_api.moveTo(sectionIndex);
        }
      });
    });
});

// ========================================
// Navigation Bar Scroll Effect
// ========================================

let lastScrollTop = 0;
const navbar = document.querySelector(".top-header");

if (navbar) {
  window.addEventListener(
    "scroll",
    () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      // Add shadow when scrolled
      if (scrollTop > 50) {
        navbar.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.15)";
      } else {
        navbar.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.08)";
      }

      lastScrollTop = scrollTop;
    },
    { passive: true }
  );
}

// ========================================
// Hour Navigation
// ========================================

// Wait for fullpage to initialize before setting up navigation
setTimeout(() => {
  const hourItems = document.querySelectorAll(".hour-item");

  if (!hourItems.length) {
    console.error("No hour items found");
    return;
  }

  hourItems.forEach((item, index) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const sectionIndex = parseInt(item.getAttribute("data-section"));

      // Use section index for navigation
      if (window.fullpage_api) {
        window.fullpage_api.moveTo(sectionIndex);
      } else if (typeof fullpage_api !== "undefined") {
        fullpage_api.moveTo(sectionIndex);
      } else {
        console.error("fullpage_api not available");
      }
    });
  });
}, 500);

// ========================================
// Intersection Observer for Hour Sections
// ========================================

const observerOptions = {
  threshold: 0.3,
  rootMargin: "0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, observerOptions);

// Observe all hour sections
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll(".hour-section");
  sections.forEach((section) => {
    observer.observe(section);
  });
});

// ========================================
// Accessibility Enhancements
// ========================================

// Skip to main content link (can be added to HTML if needed)
document.addEventListener("keydown", (e) => {
  // Allow Escape key to close any modals or overlays
  if (e.key === "Escape") {
    // Future modal functionality
  }
});

// ========================================
// Performance Optimization
// ========================================

// Lazy load images below the fold
if ("loading" in HTMLImageElement.prototype) {
  const images = document.querySelectorAll('img[loading="lazy"]');
  images.forEach((img) => {
    img.src = img.dataset.src || img.src;
  });
} else {
  // Fallback for browsers that don't support lazy loading
  const script = document.createElement("script");
  script.src =
    "https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js";
  document.body.appendChild(script);
}

// ========================================
// Sun/Moon Icon Opacity Simulation
// ========================================

function updateIconOpacity() {
  const hourItems = document.querySelectorAll(".hour-item");

  hourItems.forEach((item) => {
    const hour = parseInt(item.getAttribute("data-hour"));
    const icon = item.querySelector(".hour-icon");

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
    icon.style.transition = "opacity 0.3s ease";
    icon.style.opacity = opacity;
  });
}

// Initialize icon opacity on load
updateIconOpacity();

// Optional: Update icon opacity based on currently visible section
function updateIconBasedOnScroll() {
  const sections = document.querySelectorAll(".hour-section");
  const hourItems = document.querySelectorAll(".hour-item");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const currentHour = entry.target.getAttribute("data-hour");

          // Add 'active' class to corresponding nav item
          hourItems.forEach((item) => {
            if (item.getAttribute("data-hour") === currentHour) {
              item.classList.add("active");
            } else {
              item.classList.remove("active");
            }
          });
        }
      });
    },
    {
      threshold: 0.5,
    }
  );

  sections.forEach((section) => observer.observe(section));
}

// Initialize scroll-based active state
updateIconBasedOnScroll();

// ========================================
// Section Navigation Arrows
// ========================================

window.addEventListener("DOMContentLoaded", () => {
  const upArrows = document.querySelectorAll(".section-nav-up");
  const downArrows = document.querySelectorAll(".section-nav-down");

  // Handle up arrow clicks
  upArrows.forEach((arrow) => {
    arrow.addEventListener("click", (e) => {
      e.preventDefault();
      if (typeof fullpage_api !== "undefined") {
        fullpage_api.moveSectionUp();
      }
    });
  });

  // Handle down arrow clicks
  downArrows.forEach((arrow) => {
    arrow.addEventListener("click", (e) => {
      e.preventDefault();
      if (typeof fullpage_api !== "undefined") {
        fullpage_api.moveSectionDown();
      }
    });
  });
});

console.log("Live Like Richard website initialized ✓");
