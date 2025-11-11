// ========================================
// Sky Background with Scroll-Based Transitions
// ========================================

class SkyTimeLapse {
  constructor() {
    this.container = document.querySelector(".sky-timelapse");
    this.currentHour = null;
    this.sections = [];
    this.images = {};
    this.currentImage = null;
    
    // Hours that have corresponding images
    this.availableHours = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23];

    this.init();
  }

  init() {
    // Get all hour sections
    this.sections = Array.from(document.querySelectorAll(".hour-section"));

    // Preload all sky images
    this.preloadImages();

    // Set up scroll listener
    this.setupScrollListener();
  }

  preloadImages() {
    this.availableHours.forEach(hour => {
      const img = new Image();
      const hourStr = hour.toString().padStart(2, '0');
      img.src = `images/sky/${hourStr}.jpg`;
      this.images[hour] = img;
    });
    
    // Set initial image after short delay
    setTimeout(() => this.handleScroll(), 100);
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
          this.transitionToImage(hour);
          this.currentHour = hour;
        }
        break;
      }
    }
  }

  transitionToImage(hour) {
    if (!this.images[hour]) return;

    const newImg = this.images[hour];
    
    // Set initial image
    if (!this.currentImage) {
      const imgElement = document.createElement('img');
      imgElement.src = newImg.src;
      imgElement.style.opacity = '1';
      imgElement.classList.add('sky-image', 'active');
      this.container.innerHTML = '';
      this.container.appendChild(imgElement);
      this.currentImage = imgElement;
      return;
    }

    // Crossfade to new image
    const newImgElement = document.createElement('img');
    newImgElement.src = newImg.src;
    newImgElement.style.opacity = '0';
    newImgElement.classList.add('sky-image');
    this.container.appendChild(newImgElement);

    setTimeout(() => {
      newImgElement.style.opacity = '1';
      if (this.currentImage) this.currentImage.style.opacity = '0';
    }, 100);

    setTimeout(() => {
      if (this.currentImage?.parentNode) this.currentImage.remove();
      newImgElement.classList.add('active');
      this.currentImage = newImgElement;
    }, 2700);
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
        // Update sky image when section changes
        const hour = parseInt(destination.item.dataset.hour);
        if (skyTimeLapse && hour >= 0) {
          skyTimeLapse.transitionToImage(hour);
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

        // Update active section for polaroids
        document.querySelectorAll('.hour-section').forEach(section => {
          section.classList.remove('active');
        });
        destination.item.classList.add('active');

        // Update fixed hour-label-wrapper text
        updateHourLabel(destination.item);
        
        // Update progress indicator
        updateProgressIndicator(destination.index);
        
        // Show/hide logo based on section
        toggleLogo(destination.index);
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
          skyTimeLapse.transitionToImage(hour);
        }

        const hourItems = document.querySelectorAll(".hour-item");
        hourItems.forEach((item) => {
          if (item.dataset.hour === destination.item.dataset.hour) {
            item.classList.add("active");
          } else {
            item.classList.remove("active");
          }
        });

        // Update active section for polaroids
        document.querySelectorAll('.hour-section').forEach(section => {
          section.classList.remove('active');
        });
        destination.item.classList.add('active');

        // Update fixed hour-label-wrapper text
        updateHourLabel(destination.item);
        
        // Update progress indicator
        updateProgressIndicator(destination.index);
        
        // Show/hide logo based on section
        toggleLogo(destination.index);
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

  // Initialize hour label
  setTimeout(() => {
    const firstSection = document.querySelector(".hour-section");
    if (firstSection) {
      updateHourLabel(firstSection);
    }
  }, 500);
});

// ========================================
// Hour Label Navigation
// ========================================

// Map of hour values to labels with icons
const hourLabels = {
  "5": "☀ 5:30 AM - A New Day Begins",
  "7": "☀ 7:32 AM - From Seoul to the World",
  "9": "☀ 9:17 AM - The Hospitality Dream",
  "11": "☀ 11:43 AM - Taking the Leap",
  "13": "☀ 1:22 PM - A Giving Spirit",
  "15": "☀ 3:08 PM - Finding True Love",
  "17": "☀ 5:47 PM - Faith & Family",
  "19": "☾ 7:28 PM - That Laugh",
  "21": "☾ 9:14 PM - How He Lived",
  "23": "☾ 11:36 PM - His Heart for St. Serra",
  "1": "☾ 1:52 AM - Those He Left Behind",
  "3": "☾ 2:42 AM - Rest in Peace"
};

// Section order for navigation
const sectionOrder = ["5", "7", "9", "11", "13", "15", "17", "19", "21", "23", "1", "3"];
let currentSectionIndex = 0;

// ========================================
// Navigation Helper Function
// ========================================

function navigateToSection(direction) {
  console.log(`Navigation requested: ${direction}`);
  
  // Wait for API to be available
  let attempts = 0;
  const checkAPI = setInterval(() => {
    attempts++;
    const api = window.fullpage_api;
    
    if (api) {
      clearInterval(checkAPI);
      console.log(`API found after ${attempts} attempts, moving ${direction}`);
      
      if (direction === 'up') {
        api.moveSectionUp();
      } else if (direction === 'down') {
        api.moveSectionDown();
      }
    } else if (attempts >= 60) {
      // After 3 seconds (60 * 50ms)
      clearInterval(checkAPI);
      console.error('fullpage_api not available after 3 seconds');
    }
  }, 50); // Check every 50ms
}

function updateHourLabel(section) {
  const hourLabelText = document.getElementById("hourLabelText");
  const navUp = document.getElementById("navUp");
  const navDown = document.getElementById("navDown");
  
  if (hourLabelText && section) {
    const hour = section.dataset.hour;
    hourLabelText.textContent = hourLabels[hour] || `Hour ${hour}`;
    
    // Update current index
    currentSectionIndex = sectionOrder.indexOf(hour);
    
    // Update tooltips and visibility
    const prevIndex = currentSectionIndex - 1;
    const nextIndex = currentSectionIndex + 1;
    
    // Handle up arrow
    if (navUp) {
      if (prevIndex >= 0) {
        const prevHour = sectionOrder[prevIndex];
        navUp.setAttribute("data-tooltip", hourLabels[prevHour]);
        navUp.style.visibility = "visible";
        navUp.style.opacity = "0.7";
      } else {
        // First section - hide up arrow
        navUp.style.visibility = "hidden";
        navUp.style.opacity = "0";
      }
    }
    
    // Handle down arrow
    if (navDown) {
      if (nextIndex < sectionOrder.length) {
        const nextHour = sectionOrder[nextIndex];
        navDown.setAttribute("data-tooltip", hourLabels[nextHour]);
        navDown.style.visibility = "visible";
        navDown.style.opacity = "0.7";
      } else {
        // Last section - hide down arrow
        navDown.style.visibility = "hidden";
        navDown.style.opacity = "0";
      }
    }
  }
}

// Navigation button handlers
document.addEventListener("DOMContentLoaded", () => {
  const navUp = document.getElementById("navUp");
  const navDown = document.getElementById("navDown");

  if (navUp) {
    navUp.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      navigateToSection('up');
    });
  }

  if (navDown) {
    navDown.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      navigateToSection('down');
    });
  }
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


// Initialize progress bar on first section
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    updateProgressIndicator(0); // Start at first section
    toggleLogo(0); // Hide logo on first section
  }, 500);
});

// ========================================
// Logo Visibility Toggle
// ========================================

function toggleLogo(sectionIndex) {
  const logo = document.querySelector('.logo');
  if (!logo) return;
  
  // Hide logo on first section (index 0), show on all others
  if (sectionIndex === 0) {
    logo.classList.remove('visible');
  } else {
    logo.classList.add('visible');
  }
}

// ========================================
// Progress Indicator Update
// ========================================

function updateProgressIndicator(sectionIndex) {
  const hourNav = document.querySelector('.hour-nav');
  if (!hourNav) return;
  
  const totalSections = 12;
  const progress = ((sectionIndex + 1) / totalSections) * 100;
  hourNav.style.setProperty('--nav-progress', `${progress}%`);
}

// ========================================
// Section Navigation Arrows - Refactored
// ========================================

// Track current section globally
let currentFullpageSection = 1;

function setupSectionArrows() {
  const upArrows = document.querySelectorAll(".section-nav-up");
  const downArrows = document.querySelectorAll(".section-nav-down");

  // Handle up arrow clicks
  upArrows.forEach((arrow) => {
    // Remove any existing listeners by cloning
    const newArrow = arrow.cloneNode(true);
    arrow.parentNode.replaceChild(newArrow, arrow);
    
    newArrow.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      navigateToSection('up');
    });
  });

  // Handle down arrow clicks
  downArrows.forEach((arrow) => {
    // Remove any existing listeners by cloning
    const newArrow = arrow.cloneNode(true);
    arrow.parentNode.replaceChild(newArrow, arrow);
    
    newArrow.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      navigateToSection('down');
    });
  });
}

// Setup arrows immediately and after delay
window.addEventListener("DOMContentLoaded", () => {
  setupSectionArrows();
  // Try again after fullpage initializes
  setTimeout(setupSectionArrows, 1500);
});

// ========================================
// Polaroid Image Loading with Random Selection
// ========================================

// Gallery of available photos and captions
const photoGallery = [
  {
    src: 'images/gallery/1000s.jpg',
    captions: [
      'Living with purpose',
      'Making a difference',
      'Every moment counts',
      'A generous heart',
      'Inspiring others'
    ]
  },
  {
    src: 'images/gallery/1000s (1).jpg',
    captions: [
      'A life of generosity',
      'Leading with love',
      'Community first',
      'Always giving',
      'Remembered fondly'
    ]
  },
  {
    src: 'images/gallery/b52a4521-af5f-4d3a-9c48-6c4331cc1727.png',
    captions: [
      '"Do what you can"',
      'Miracle maker',
      'Touching lives',
      'His legacy lives on',
      'A friend to all'
    ]
  },
  {
    src: 'images/gallery/header-menu.jpg',
    captions: [
      'Building community',
      'Bringing people together',
      'Shared moments',
      'Always welcoming',
      'A place for everyone'
    ]
  },
  {
    src: 'images/gallery/rooftop-splash3.jpg',
    captions: [
      'Joy in every moment',
      'Living fully',
      'Making memories',
      'A spirit of adventure',
      'Life celebrated'
    ]
  }
];

// Shuffle array helper
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function initPolaroidImages() {
  // Get all polaroids (both with data-random-photo and without)
  const allPolaroids = document.querySelectorAll('.polaroid');
  
  allPolaroids.forEach((polaroid) => {
    const img = polaroid.querySelector('img');
    
    if (img && img.src) {
      // If image is already loaded (cached)
      if (img.complete && img.naturalWidth > 0) {
        polaroid.classList.add('loaded');
      } else {
        // Wait for image to load
        img.addEventListener('load', () => {
          polaroid.classList.add('loaded');
        });
        
        // Handle error case
        img.addEventListener('error', () => {
          console.error('Failed to load image:', img.src);
          polaroid.classList.add('loaded'); // Show anyway with placeholder
        });
      }
    } else {
      // No image source, still show the polaroid
      polaroid.classList.add('loaded');
    }
  });
}

// Initialize polaroids when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPolaroidImages);
} else {
  initPolaroidImages();
}

// Fallback: ensure all polaroids are visible after a short delay
setTimeout(() => {
  const allPolaroids = document.querySelectorAll('.polaroid');
  allPolaroids.forEach(polaroid => {
    if (!polaroid.classList.contains('loaded')) {
      console.log('Force-loading polaroid:', polaroid);
      polaroid.classList.add('loaded');
    }
  });
}, 500);

// ========================================
// Active Section Management for Polaroids
// ========================================
function updateActiveSections() {
  const allSections = document.querySelectorAll('.hour-section');
  
  allSections.forEach(section => {
    section.classList.remove('active');
  });
  
  // Use fullpage.js API if available
  if (window.fullpage_api) {
    const activeIndex = window.fullpage_api.getActiveSection().index;
    if (allSections[activeIndex]) {
      allSections[activeIndex].classList.add('active');
    }
  }
}

// Set up fullpage.js callbacks
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (window.fullpage_api) {
      // Mark first section as active
      const firstSection = document.querySelector('.hour-section');
      if (firstSection) {
        firstSection.classList.add('active');
      }
    }
  }, 1000);
});

console.log("Live Like Richard website initialized ✓");
