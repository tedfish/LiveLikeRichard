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
    }, 1300);
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
// Section Tracking
// ========================================
// Now handled by SectionScroller class

// ========================================
// Custom Robust Section Scrolling
// ========================================

class SectionScroller {
  constructor() {
    this.sections = [];
    this.currentIndex = 0;
    this.isScrolling = false;
    this.scrollTimeout = null;
    this.wheelTimeout = null;
    this.touchStartY = 0;
    this.lastWheelTime = 0;
    this.wheelCooldown = 1000; // ms between scroll actions

    this.init();
  }

  init() {
    this.sections = Array.from(document.querySelectorAll('.hour-section'));

    if (this.sections.length === 0) {
      console.error('No sections found');
      return;
    }

    // Set up event listeners
    this.setupWheelListener();
    this.setupTouchListener();
    this.setupKeyboardListener();

    // Initialize first section
    this.goToSection(0, false);

    console.log('Custom section scroller initialized with', this.sections.length, 'sections');
  }

  setupWheelListener() {
    let wheelDelta = 0;
    const wheelThreshold = 50; // Accumulated delta needed to trigger scroll

    const handleWheel = (e) => {
      e.preventDefault();

      const now = Date.now();

      // If we're in cooldown, ignore
      if (this.isScrolling || now - this.lastWheelTime < this.wheelCooldown) {
        return;
      }

      // Accumulate wheel delta
      wheelDelta += e.deltaY;

      // Clear timeout for delta reset
      clearTimeout(this.wheelTimeout);

      // Check if we've accumulated enough delta
      if (Math.abs(wheelDelta) >= wheelThreshold) {
        if (wheelDelta > 0) {
          // Scroll down
          this.next();
        } else {
          // Scroll up
          this.prev();
        }
        wheelDelta = 0;
      } else {
        // Reset delta after 150ms of no wheel movement
        this.wheelTimeout = setTimeout(() => {
          wheelDelta = 0;
        }, 150);
      }
    };

    // Use both wheel and mousewheel for better compatibility
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('mousewheel', handleWheel, { passive: false });
  }

  setupTouchListener() {
    window.addEventListener('touchstart', (e) => {
      this.touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (this.isScrolling) return;

      const touchEndY = e.changedTouches[0].clientY;
      const diff = this.touchStartY - touchEndY;

      // Minimum swipe distance
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    }, { passive: true });
  }

  setupKeyboardListener() {
    window.addEventListener('keydown', (e) => {
      // Ignore if user is typing
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      if (this.isScrolling) {
        e.preventDefault();
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
          e.preventDefault();
          this.next();
          break;
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          this.prev();
          break;
        case 'Home':
          e.preventDefault();
          this.goToSection(0);
          break;
        case 'End':
          e.preventDefault();
          this.goToSection(this.sections.length - 1);
          break;
      }
    });
  }

  next() {
    if (this.currentIndex < this.sections.length - 1) {
      this.goToSection(this.currentIndex + 1);
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.goToSection(this.currentIndex - 1);
    }
  }

  goToSection(index, animate = true) {
    if (index < 0 || index >= this.sections.length) return;
    if (this.isScrolling && animate) return;

    this.isScrolling = true;
    this.currentIndex = index;
    this.lastWheelTime = Date.now();

    const section = this.sections[index];

    // Scroll to section
    section.scrollIntoView({
      behavior: animate ? 'smooth' : 'auto',
      block: 'start'
    });

    // Update states
    this.updateSectionStates(section, index);

    // Reset scrolling flag
    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.isScrolling = false;
    }, animate ? 1000 : 100);
  }

  updateSectionStates(section, index) {
    // Update sky image
    const hour = parseInt(section.dataset.hour);
    if (skyTimeLapse && hour >= 0) {
      skyTimeLapse.transitionToImage(hour);
    }

    // Update hour nav active state
    const hourItems = document.querySelectorAll('.hour-item');
    hourItems.forEach((item) => {
      if (item.dataset.hour === section.dataset.hour) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update active section for polaroids
    this.sections.forEach(s => s.classList.remove('active'));
    section.classList.add('active');

    // Update hour label
    updateHourLabel(section);

    // Update progress indicator
    updateProgressIndicator(index);

    // Show/hide logo
    toggleLogo(index);
  }
}

// Initialize custom scroller
let sectionScroller;
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', () => {
    sectionScroller = new SectionScroller();
  });
} else {
  sectionScroller = new SectionScroller();
}

// Expose API for compatibility
window.fullpage_api = {
  moveSectionDown: () => sectionScroller?.next(),
  moveSectionUp: () => sectionScroller?.prev(),
  moveTo: (index) => sectionScroller?.goToSection(index - 1),
  getActiveSection: () => ({ index: sectionScroller?.currentIndex || 0 })
};

// ========================================
// Smooth Scrolling & Navigation
// ========================================

// Handle top navigation
document.addEventListener("DOMContentLoaded", () => {
  // Map of section IDs to indices
  const sectionMap = {
    "hour-05": 0,
    "hour-07": 1,
    "hour-09": 2,
    "hour-11": 3,
    "hour-13": 4,
    "hour-15": 5,
    "hour-17": 6,
    "hour-19": 7,
    "hour-21": 8,
    "hour-23": 9,
    "hour-01": 10,
    "hour-03": 11,
  };

  document
    .querySelectorAll('.top-nav a[href^="#"], .logo[href^="#"]')
    .forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const href = this.getAttribute("href");

        // Ignore empty hash links
        if (href === "#" || !href) return;

        e.preventDefault();

        // Use section scroller
        const sectionId = href.substring(1);
        const sectionIndex = sectionMap[sectionId];

        if (sectionScroller && sectionIndex !== undefined) {
          sectionScroller.goToSection(sectionIndex);
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

// Set up hour navigation
document.addEventListener("DOMContentLoaded", () => {
  const hourItems = document.querySelectorAll(".hour-item");

  if (!hourItems.length) {
    console.error("No hour items found");
    return;
  }

  hourItems.forEach((item, index) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // data-section is 1-indexed, convert to 0-indexed
      const sectionIndex = parseInt(item.getAttribute("data-section")) - 1;

      if (sectionScroller && sectionIndex >= 0) {
        sectionScroller.goToSection(sectionIndex);
      }
    });
  });
});

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
  if (!sectionScroller) return;

  if (direction === 'up') {
    sectionScroller.prev();
  } else if (direction === 'down') {
    sectionScroller.next();
  }
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
// Now handled by SectionScroller.updateSectionStates()

console.log("Live Like Richard website initialized ✓");
