# Live Like Richard Website

A charitable foundation website honoring Richard Ham's legacy through community impact, featuring a unique time-lapse sky background that transitions through 24 hours of images.

## 🌟 Features

- **Sky Time-Lapse Hero**: Automatically cycles through 24 hourly sky images to simulate a full day
- **Long-Form Scrolling**: Single-page design with smooth scrolling between sections
- **Responsive Design**: Fully mobile-friendly and accessible
- **Interactive Sections**: About, Mission, Events, Gallery, Stories, Donations, Newsletter
- **Form Integration**: Ready for MailChimp email integration and story submissions
- **ADA Compliant**: Accessible design with keyboard navigation support

## 📁 Project Structure

```
LiveLikeRichard/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # All website styles
├── js/
│   └── main.js             # JavaScript functionality
├── images/
│   ├── sky/                # 24 hourly sky images (00.jpg - 23.jpg)
│   ├── gallery/            # Gallery photos
│   ├── richard-main.jpg    # Main photo of Richard Ham
│   └── ...                 # Other images
├── fonts/                  # Custom fonts (if needed)
└── README.md               # This file
```

## 🚀 Quick Start

### 1. Add Sky Time-Lapse Images

The hero section requires 24 hourly sky images taken from the business location:

1. Take photos of the sky every hour for 24 hours (or use existing photos)
2. Name them sequentially: `00.jpg`, `01.jpg`, `02.jpg`, ... `23.jpg`
3. Place all 24 images in the `images/sky/` directory
4. Recommended image specs:
   - Format: JPG
   - Resolution: 1920x1080 or higher
   - File size: Optimize to < 500KB each for fast loading
   - Aspect ratio: 16:9 or similar landscape format

**Image Naming Convention:**
- `00.jpg` = Midnight (12:00 AM)
- `06.jpg` = 6:00 AM
- `12.jpg` = Noon (12:00 PM)
- `18.jpg` = 6:00 PM
- `23.jpg` = 11:00 PM

### 2. Add Content Images

#### Main Photo of Richard
- Add `richard-main.jpg` to `images/` directory
- Recommended: Professional portrait, 800x800px or larger

#### Gallery Images
- Add gallery photos to `images/gallery/` directory
- Name them descriptively: `event-2024.jpg`, `family-photo.jpg`, etc.
- Update `js/main.js` to load gallery images (see instructions in file)

### 3. Update Content

Edit `index.html` to update:
- About section text
- Mission statement
- Event details
- Partner organization links
- Social media links
- Instagram URL in footer

### 4. Test Locally

Open `index.html` in a web browser to test:

```bash
# Option 1: Simple Python server
cd ~/LiveLikeRichard
python3 -m http.server 8000
# Visit: http://localhost:8000

# Option 2: PHP built-in server
php -S localhost:8000

# Option 3: Node.js with http-server
npx http-server -p 8000
```

## 🎨 Color Customization

The website uses CSS variables for easy color customization. Edit `css/styles.css`:

```css
:root {
    --primary-color: #4A90E2;      /* Main brand color (blue) */
    --primary-dark: #2E5C8A;       /* Darker shade */
    --secondary-color: #F7D794;     /* Accent color (soft yellow) */
    --accent-color: #81C784;        /* Success/action color (green) */
    --text-dark: #2C3E50;           /* Dark text */
    --text-light: #7F8C8D;          /* Light text */
}
```

### Suggested Alternative Palettes

**Option 1: Warm & Compassionate**
```css
--primary-color: #E67E22;       /* Orange */
--secondary-color: #F39C12;     /* Gold */
--accent-color: #16A085;        /* Teal */
```

**Option 2: Calm & Trustworthy**
```css
--primary-color: #3498DB;       /* Bright blue */
--secondary-color: #9B59B6;     /* Purple */
--accent-color: #2ECC71;        /* Green */
```

## 📧 Email Integration (MailChimp)

### Setup Newsletter Subscription

1. Create a MailChimp account and audience
2. Get your form action URL from MailChimp
3. Update the form in `index.html` or integrate via API in `js/main.js`

**Current Implementation:** Forms are set up with client-side validation. The TODO comments in `js/main.js` (lines 166 and 204) indicate where to add MailChimp API integration.

### Recommended: Using MailChimp Embedded Forms
1. Go to MailChimp > Audience > Signup Forms > Embedded Forms
2. Copy the form code
3. Replace the newsletter form section in `index.html`

## 🌐 Deployment Options

### Option 1: Netlify (Recommended - Free)

1. Sign up at [netlify.com](https://netlify.com)
2. Drag and drop the `LiveLikeRichard` folder
3. Connect domain `LiveLikeRichard.com`
4. Enable HTTPS (automatic)

### Option 2: GitHub Pages (Free)

1. Create a GitHub repository
2. Upload all files
3. Go to Settings > Pages
4. Enable Pages from main branch
5. Add custom domain

### Option 3: Traditional Web Hosting

1. Use FTP/SFTP to upload files to web server
2. Ensure domain DNS points to hosting server
3. Enable HTTPS certificate

## 🔗 Domain Setup

The domain `LiveLikeRichard.com` is already acquired. To connect it:

1. Access domain registrar account
2. Update DNS records:
   - For Netlify: Add their nameservers
   - For other hosting: Point A record to server IP
3. Wait 24-48 hours for DNS propagation
4. Verify HTTPS is working

## 📝 Content Management

### Adding New Events

Edit `index.html`, find the events section (~line 135), and add:

```html
<div class="event-card">
    <div class="event-date">
        <span class="month">Mar</span>
        <span class="day">15</span>
    </div>
    <div class="event-details">
        <h3>Event Name</h3>
        <p>Event description</p>
        <p class="event-price">$500 per person</p>
        <a href="#contact" class="btn-secondary">Register</a>
    </div>
</div>
```

### Adding Gallery Images

In `js/main.js`, uncomment and update lines 287-291:

```javascript
loadGalleryImages([
    'images/gallery/photo1.jpg',
    'images/gallery/photo2.jpg',
    'images/gallery/photo3.jpg',
    // Add more images...
]);
```

### Updating Partner Organizations

Edit the partner cards in `index.html` (~line 106) with correct links:

```html
<div class="partner-card">
    <h3>Organization Name</h3>
    <p>Description</p>
    <a href="https://website.com" target="_blank" class="btn-link">Learn More</a>
</div>
```

## ♿ Accessibility

The website includes:
- ARIA labels for screen readers
- Keyboard navigation support
- Focus indicators
- Reduced motion support for animations
- Semantic HTML structure
- Alt text for all images (add to your images!)

**Important:** When adding images, always include descriptive alt text:
```html
<img src="image.jpg" alt="Detailed description of image">
```

## 🎯 SEO Recommendations

1. **Update Meta Tags** in `index.html`:
   ```html
   <meta name="description" content="Your custom description">
   <meta property="og:title" content="Live Like Richard">
   <meta property="og:image" content="images/social-share.jpg">
   ```

2. **Add Google Analytics** before closing `</head>`:
   ```html
   <!-- Google Analytics -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
   ```

3. **Create sitemap.xml** for better search indexing

4. **Submit to Google Search Console** after deployment

## 📱 Social Media Integration

Update social links in footer (~line 242):
- Instagram: Currently links to instagram.com (update with actual profile)
- Add Facebook, Twitter, LinkedIn if needed

## 🔧 Customization Guide

### Change Animation Speed

In `js/main.js` line 10:
```javascript
this.transitionDuration = 3000; // Change to 5000 for 5 seconds, etc.
```

### Start with Current Time

In `js/main.js`, uncomment line 306:
```javascript
setTimeout(setToCurrentTime, 100);
```

### Add More Sections

Copy any section from `index.html` and paste where needed. Update classes and content.

## 🐛 Troubleshooting

**Sky images not showing:**
- Check that images are named correctly (00.jpg - 23.jpg)
- Verify images are in `images/sky/` directory
- Check browser console for errors

**Forms not submitting:**
- This is expected - backend integration needed
- Check console logs for form data
- Integrate with MailChimp or form service

**Slow loading:**
- Optimize/compress images (use tools like TinyPNG)
- Enable CDN if using paid hosting
- Consider lazy loading more aggressively

## 📞 Next Steps

1. ✅ Add 24 sky images to `images/sky/`
2. ✅ Add main photo of Richard
3. ✅ Update all text content in HTML
4. ✅ Customize colors in CSS
5. ✅ Set up MailChimp integration
6. ✅ Deploy to hosting service
7. ✅ Connect domain name
8. ✅ Test on mobile devices
9. ✅ Add gallery images
10. ✅ Enable analytics

## 📄 License & Credits

Created for the Live Like Richard Foundation
Honoring Richard Ham's Legacy

**Built with:**
- Vanilla JavaScript (no frameworks needed)
- CSS3 with modern features
- HTML5 semantic markup
- Google Fonts (Inter)

---

**Questions or need help?** Contact the development team or refer to the inline comments in the code files.
