#!/usr/bin/env python3
"""
Generate realistic sky images for each hour (00-23)
Overlaying time-of-day lighting effects on the background image
with sun and moon moving through the sky
"""

from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import os
import math

# Create sky directory if it doesn't exist
sky_dir = "images/sky"
os.makedirs(sky_dir, exist_ok=True)

# Define color schemes for different times of day
def get_sky_colors(hour):
    """Return top, middle, and bottom colors for sky gradient based on hour"""
    
    # Night (0-4): Deep starry night
    if hour == 0:
        return ((5, 10, 30), (10, 15, 40), (15, 20, 45))
    elif hour == 1:
        return ((8, 12, 32), (12, 18, 42), (16, 22, 47))
    elif hour == 2:
        return ((10, 14, 34), (14, 20, 44), (18, 24, 49))
    elif hour == 3:
        return ((12, 16, 36), (16, 22, 46), (20, 26, 51))
    elif hour == 4:
        return ((15, 20, 40), (20, 28, 50), (25, 32, 55))
    
    # Dawn/Pre-sunrise (5): First light
    elif hour == 5:
        return ((30, 35, 70), (80, 60, 100), (120, 80, 110))
    
    # Sunrise (6): Golden sunrise
    elif hour == 6:
        return ((255, 180, 120), (255, 140, 90), (255, 100, 70))
    
    # Early morning (7): Warm morning light
    elif hour == 7:
        return ((135, 180, 230), (200, 160, 140), (255, 190, 150))
    
    # Morning (8): Clear morning
    elif hour == 8:
        return ((100, 160, 230), (130, 180, 235), (160, 200, 240))
    
    # Mid-morning (9): Bright morning
    elif hour == 9:
        return ((90, 150, 225), (120, 180, 235), (150, 200, 245))
    
    # Late morning (10-11): Beautiful blue sky
    elif hour in [10, 11]:
        return ((70, 130, 225), (100, 160, 235), (135, 190, 250))
    
    # Noon-Early afternoon (12-14): Peak sun
    elif hour in [12, 13, 14]:
        return ((60, 120, 220), (90, 150, 230), (120, 180, 245))
    
    # Mid-afternoon (15): Still bright
    elif hour == 15:
        return ((80, 140, 220), (110, 170, 235), (140, 195, 248))
    
    # Late afternoon (16): Starting to warm
    elif hour == 16:
        return ((100, 150, 215), (150, 175, 220), (200, 185, 200))
    
    # Golden hour (17): Beautiful golden light
    elif hour == 17:
        return ((120, 160, 210), (240, 180, 140), (255, 160, 100))
    
    # Sunset (18): Spectacular sunset
    elif hour == 18:
        return ((255, 160, 100), (255, 120, 90), (250, 90, 120))
    
    # Post-sunset/Dusk (19): Purple hour
    elif hour == 19:
        return ((120, 80, 140), (90, 60, 110), (60, 40, 90))
    
    # Evening twilight (20): Deep twilight
    elif hour == 20:
        return ((50, 45, 90), (35, 35, 70), (25, 25, 55))
    
    # Night (21-23): Deep night
    elif hour == 21:
        return ((20, 25, 60), (15, 20, 50), (12, 16, 42))
    elif hour == 22:
        return ((12, 18, 50), (10, 15, 42), (8, 12, 36))
    else:  # 23
        return ((8, 12, 40), (7, 10, 35), (6, 8, 32))

def get_sun_position(hour):
    """Calculate sun position based on hour (returns None if sun is not visible)"""
    if hour < 6 or hour > 19:
        return None
    
    # Sun rises at 6, sets at 19 (approximate)
    # Map to arc across sky
    progress = (hour - 6) / 13.0  # 0 to 1
    angle = math.pi * progress  # 0 to π
    
    # Position along arc
    x = 0.15 + (progress * 0.7)  # 15% to 85% across width
    y = 0.85 - (math.sin(angle) * 0.55)  # Arc height
    
    return (x, y)

def get_moon_position(hour):
    """Calculate moon position based on hour (returns None if moon is not visible)"""
    if 6 <= hour <= 18:
        return None
    
    # Moon visible from 19 to 5
    # Adjust hour for calculation
    if hour >= 19:
        moon_hour = hour - 19  # 0-5 for 19-23
    else:
        moon_hour = hour + 5  # 5-10 for 0-5
    
    progress = moon_hour / 11.0
    angle = math.pi * progress
    
    x = 0.15 + (progress * 0.7)
    y = 0.85 - (math.sin(angle) * 0.45)
    
    return (x, y)

def draw_sun(draw, width, height, position, hour):
    """Draw the sun at given position"""
    x = int(width * position[0])
    y = int(height * position[1])
    
    # Vary sun size and intensity by time
    if hour == 6:
        radius = 40
        color = (255, 200, 100)
        glow = (255, 180, 80, 100)
    elif hour == 18:
        radius = 45
        color = (255, 150, 80)
        glow = (255, 120, 60, 120)
    elif 12 <= hour <= 15:
        radius = 50
        color = (255, 240, 200)
        glow = (255, 250, 220, 80)
    else:
        radius = 45
        color = (255, 230, 180)
        glow = (255, 220, 160, 90)
    
    # Draw glow
    for i in range(4, 0, -1):
        glow_radius = radius + (i * 20)
        draw.ellipse(
            [x - glow_radius, y - glow_radius, x + glow_radius, y + glow_radius],
            fill=glow
        )
    
    # Draw sun
    draw.ellipse(
        [x - radius, y - radius, x + radius, y + radius],
        fill=color
    )

def draw_moon(draw, width, height, position, hour):
    """Draw the moon at given position"""
    x = int(width * position[0])
    y = int(height * position[1])
    radius = 35
    
    # Moon color - slightly warm white
    color = (240, 240, 250)
    glow = (220, 225, 240, 60)
    
    # Draw glow
    for i in range(3, 0, -1):
        glow_radius = radius + (i * 15)
        draw.ellipse(
            [x - glow_radius, y - glow_radius, x + glow_radius, y + glow_radius],
            fill=glow
        )
    
    # Draw moon
    draw.ellipse(
        [x - radius, y - radius, x + radius, y + radius],
        fill=color
    )
    
    # Add some moon texture (simple craters)
    crater_color = (210, 210, 220)
    draw.ellipse([x - 10, y - 8, x - 2, y], fill=crater_color)
    draw.ellipse([x + 5, y - 12, x + 12, y - 5], fill=crater_color)
    draw.ellipse([x - 5, y + 5, x + 2, y + 12], fill=crater_color)

def draw_stars(draw, width, height, hour, num_stars=150):
    """Draw stars for night sky"""
    if 6 <= hour <= 18:
        return
    
    # More stars visible during deepest night
    if 0 <= hour <= 4 or 21 <= hour <= 23:
        opacity = 255
        num_stars = 200
    else:  # Twilight hours
        opacity = 100
        num_stars = 80
    
    import random
    random.seed(42)  # Consistent star positions
    
    for _ in range(num_stars):
        x = random.randint(0, width)
        y = random.randint(0, int(height * 0.6))  # Upper portion of sky
        size = random.choice([1, 1, 1, 2, 2, 3])  # Varying sizes
        brightness = random.randint(180, 255)
        
        color = (brightness, brightness, brightness, opacity)
        draw.ellipse([x, y, x + size, y + size], fill=color)

def get_lighting_adjustment(hour):
    """Return brightness and color tint adjustments for the hour"""
    # Returns (brightness_factor, color_overlay_rgb, overlay_opacity)
    
    # Night (0-4): Dark with blue tint
    if hour in [0, 1, 2, 3, 4]:
        return (0.15, (5, 15, 40), 0.7)
    
    # Dawn (5): Starting to lighten, purple-blue tint
    elif hour == 5:
        return (0.35, (40, 50, 90), 0.6)
    
    # Sunrise (6): Golden warm glow
    elif hour == 6:
        return (0.75, (255, 180, 120), 0.4)
    
    # Early morning (7): Warm light
    elif hour == 7:
        return (0.9, (255, 230, 200), 0.25)
    
    # Morning to afternoon (8-15): Full brightness, minimal tint
    elif 8 <= hour <= 15:
        return (1.0, (255, 255, 250), 0.1)
    
    # Late afternoon (16): Slight warm tint
    elif hour == 16:
        return (0.95, (255, 240, 220), 0.15)
    
    # Golden hour (17): Beautiful golden light
    elif hour == 17:
        return (0.85, (255, 200, 140), 0.35)
    
    # Sunset (18): Rich warm colors
    elif hour == 18:
        return (0.65, (255, 140, 100), 0.5)
    
    # Dusk (19): Purple hour
    elif hour == 19:
        return (0.4, (120, 80, 140), 0.6)
    
    # Evening (20-23): Deep blue night
    else:
        return (0.2, (15, 20, 50), 0.7)

# Load the background image
background_path = "images/richard-main.jpg"
if not os.path.exists(background_path):
    print(f"Error: Background image not found at {background_path}")
    print("Please ensure richard-main.jpg exists in the images/ directory")
    exit(1)

base_img = Image.open(background_path)
width, height = base_img.size
print(f"Loaded background image: {width}x{height}")

# Generate images
for hour in range(24):
    hour_str = str(hour).zfill(2)
    
    # Start with a copy of the background image
    img = base_img.copy().convert('RGBA')
    
    # Get lighting adjustments for this hour
    brightness, tint_color, tint_opacity = get_lighting_adjustment(hour)
    
    # Adjust brightness
    enhancer = ImageEnhance.Brightness(img)
    img = enhancer.enhance(brightness)
    
    # Create color overlay layer
    overlay = Image.new('RGBA', (width, height), tint_color + (int(255 * tint_opacity),))
    
    # Blend the overlay with the image
    img = Image.alpha_composite(img, overlay)
    
    # Create a transparent layer for sky elements (sun/moon/stars)
    sky_layer = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(sky_layer, 'RGBA')
    
    # Add stars for night hours
    draw_stars(draw, width, height, hour)
    
    # Add sun if visible
    sun_pos = get_sun_position(hour)
    if sun_pos:
        draw_sun(draw, width, height, sun_pos, hour)
    
    # Add moon if visible
    moon_pos = get_moon_position(hour)
    if moon_pos:
        draw_moon(draw, width, height, moon_pos, hour)
    
    # Composite sky elements onto the image
    img = Image.alpha_composite(img, sky_layer)
    
    # Convert to RGB for JPEG
    img_rgb = img.convert('RGB')
    
    # Apply slight blur for more natural look
    img_rgb = img_rgb.filter(ImageFilter.GaussianBlur(radius=0.5))
    
    # Save image
    output_path = os.path.join(sky_dir, f"{hour_str}.jpg")
    img_rgb.save(output_path, 'JPEG', quality=90, optimize=True)
    
    elements = []
    if sun_pos:
        elements.append('Sun')
    if moon_pos:
        elements.append('Moon')
    if not sun_pos and not moon_pos:
        elements.append('Stars')
    
    print(f"Generated {output_path} - Brightness: {brightness:.2f}, {', '.join(elements)}")

print(f"\n✓ Successfully generated 24 sky images in {sky_dir}/")
print("Images range from 00.jpg (midnight) to 23.jpg (11 PM)")
print("Each image overlays time-of-day lighting on richard-main.jpg")
