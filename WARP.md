# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

### Local Development
```bash
# Start local server (choose one)
python3 -m http.server 8000
# OR
php -S localhost:8000
# OR
npx http-server -p 8000

# View at: http://localhost:8000
```

### Asset Generation
```bash
# Generate 24-hour sky images (requires Python + PIL)
python3 generate_sky_images.py

# Generate melody MIDI file (requires Python + midiutil)
python3 generate_melody.py
```

### Python Environment
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On macOS/Linux

# Install dependencies
pip install Pillow midiutil
```

## Architecture

### Core Concept: 24-Hour Time-Based Journey
The website is a single-page application that simulates a full 24-hour day through continuous scrolling. Each hour (00:00-23:59) has its own section with corresponding sky imagery that changes as users scroll.

### Key Components

#### 1. Sky Background System (`js/main.js` - `SkyTimeLapse` class)
- **Fixed Background**: The sky remains fixed while content scrolls over it
- **Dynamic Image Loading**: Loads 24 images (00.jpg - 23.jpg) from `images/sky/`
- **Scroll-Based Transitions**: Sky image changes based on which hour section is currently in viewport
- **Fallback Gradients**: If images are missing, generates time-appropriate gradient backgrounds

**How it works:**
- Scroll listener monitors viewport position
- Determines which `.hour-section` is currently centered
- Crossfades to corresponding sky image using CSS opacity transitions
- Uses `requestAnimationFrame` for performance optimization

#### 2. Navigation System
**Dual Navigation:**
- **Top Header** (`top-header`): Fixed horizontal navigation with quick jump links
- **Vertical Hour Navigation** (`hour-nav`): Fixed left sidebar showing all 24 hours with icons and times

**Active State Management:**
- Both navigation systems update active state based on scroll position
- Hour navigation auto-scrolls to keep active hour visible
- Uses `IntersectionObserver` for efficient section visibility detection

#### 3. Hour Sections Structure
Each section follows this pattern:
```html
<section id="hour-XX" class="hour-section" data-hour="XX">
  <div class="container">
    <div class="hour-content">
      <!-- Content -->
      <div class="hour-label">XX:00 AM/PM</div>
    </div>
  </div>
</section>
```

**Content Mapping:**
- Hour 00: Hero/Introduction
- Hour 06-08: About Richard
- Hour 09-15: Mission and partner organizations
- Hour 16-17: Events and golden hour
- Hour 18-20: Gallery and community stories
- Hour 21: Donations
- Hour 22-23: Newsletter and closing message

#### 4. Audio Player (`js/audio-player.js`)
- Uses Web Audio API to synthesize MIDI melody
- Original composition in C major with bass accompaniment
- Play/pause controls with state management
- Includes reverb effect using convolver node
- Auto-resets after ~13 second playback

### File Organization

```
LiveLikeRichard/
├── index.html              # Single HTML file with all 24 hour sections
├── css/styles.css          # Complete styling with CSS variables
├── js/
│   ├── main.js            # Sky transitions, scrolling, navigation
│   └── audio-player.js    # Web Audio API melody player
├── images/
│   ├── sky/               # 24 hourly images (00.jpg-23.jpg)
│   ├── gallery/           # Gallery photos (not yet implemented)
│   └── richard-main.jpg   # Hero image
├── audio/
│   └── melody.mid         # Generated MIDI file
├── generate_sky_images.py # Python script to create realistic sky gradients
└── generate_melody.py     # Python script to create MIDI melody
```

### Styling Architecture

**CSS Variables** (in `css/styles.css` `:root`):
- `--primary-color`, `--secondary-color`, `--accent-color`: Brand colors
- `--font-primary`: Inter (body text)
- `--font-heading`: Playfair Display (headings)
- Easily customizable color scheme for entire site

**Layout System:**
- Fixed position elements: top header, hour navigation, sky background
- Scrolling content overlays fixed sky
- Each section is full viewport height (`min-height: 100vh`)
- Mobile-responsive breakpoints defined in media queries

### State Management

**JavaScript Classes:**
- `SkyTimeLapse`: Manages sky image loading and transitions
- `MelodyPlayer`: Controls audio playback state

**Global Variables:**
- `currentSection`: Tracks active section for keyboard navigation
- `isScrolling`: Debounce flag for scroll animations

### Performance Considerations

1. **Scroll Optimization**: Uses `requestAnimationFrame` to throttle scroll handlers
2. **Image Preloading**: All 24 sky images loaded on page init for smooth transitions
3. **Lazy Loading**: `IntersectionObserver` for section visibility animations
4. **CSS Transitions**: Hardware-accelerated opacity changes for sky crossfades

## Important Technical Details

### Sky Image Requirements
- **Naming**: Must be exactly `00.jpg` through `23.jpg` (zero-padded)
- **Location**: `images/sky/` directory
- **Format**: JPG recommended
- **Size**: 1920x1080 or higher, optimized to <500KB each
- **Missing Images**: System gracefully falls back to gradient backgrounds

### Adding New Hour Sections
1. Add section in `index.html` with correct `id="hour-XX"` and `data-hour="XX"`
2. Add corresponding navigation link in `.hour-nav` with matching `data-hour`
3. Sky transition is automatic based on section position

### Modifying Sky Transition Speed
In `js/main.js`, the CSS transition is defined in `styles.css`:
```css
.sky-timelapse img {
    transition: opacity 0.8s ease-in-out;
}
```
Adjust the `0.8s` value to change crossfade duration.

### Form Integration
Forms in the HTML are currently client-side only. To integrate:
1. Newsletter form (Hour 22): Add MailChimp API integration
2. Story submission: Add backend endpoint or service (e.g., Formspree)

## Development Workflow

1. **Content Updates**: Edit `index.html` directly
2. **Style Changes**: Modify `css/styles.css`, use CSS variables for colors
3. **JavaScript Features**: Edit `js/main.js` or `js/audio-player.js`
4. **Sky Images**: Generate with Python script or add custom photos
5. **Testing**: Open in browser via local server (required for proper image loading)

## Deployment Notes

- Pure static site - no build process required
- All dependencies are via CDN (Google Fonts)
- No server-side requirements
- Can deploy to Netlify, GitHub Pages, or any static host
- Remember to upload all 24 sky images before deployment
