#!/usr/bin/env python3
"""
Generate realistic sky images for each hour (00-23)
Showing a view from a wooden rooftop deck in Laguna Beach
with sun and moon moving through the sky
"""

from PIL import Image, ImageDraw, ImageFilter
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

def draw_deck(draw, width, height):
    """Draw wooden deck railing in foreground"""
    # Deck railing at bottom
    railing_height = int(height * 0.15)
    railing_y = height - railing_height
    
    # Wood colors
    wood_dark = (101, 67, 33)
    wood_light = (139, 90, 43)
    wood_medium = (120, 78, 38)
    
    # Draw deck floor
    for i in range(railing_y, height):
        shade = wood_dark if i % 20 < 10 else wood_medium
        draw.line([(0, i), (width, i)], fill=shade)
    
    # Draw vertical posts
    post_width = 8
    post_spacing = width // 12
    
    for i in range(13):
        x = i * post_spacing
        # Draw post with slight 3D effect
        draw.rectangle(
            [x - post_width//2, railing_y, x + post_width//2, height],
            fill=wood_dark
        )
        # Highlight edge
        draw.line(
            [(x - post_width//2, railing_y), (x - post_width//2, height)],
            fill=wood_light,
            width=2
        )
    
    # Top railing
    rail_height = 12
    draw.rectangle(
        [0, railing_y, width, railing_y + rail_height],
        fill=wood_dark
    )
    # Top highlight
    draw.rectangle(
        [0, railing_y, width, railing_y + 3],
        fill=wood_light
    )

# Generate images
width, height = 1920, 1080

for hour in range(24):
    hour_str = str(hour).zfill(2)
    
    # Create new image with RGBA for transparency support
    img = Image.new('RGBA', (width, height))
    draw = ImageDraw.Draw(img, 'RGBA')
    
    # Get colors for this hour
    top_color, mid_color, bottom_color = get_sky_colors(hour)
    
    # Draw gradient (three-color gradient for more realism)
    for y in range(height):
        if y < height // 2:
            # Top half: blend top to mid
            factor = (y / (height // 2))
            r = int(top_color[0] + (mid_color[0] - top_color[0]) * factor)
            g = int(top_color[1] + (mid_color[1] - top_color[1]) * factor)
            b = int(top_color[2] + (mid_color[2] - top_color[2]) * factor)
        else:
            # Bottom half: blend mid to bottom
            factor = ((y - height // 2) / (height // 2))
            r = int(mid_color[0] + (bottom_color[0] - mid_color[0]) * factor)
            g = int(mid_color[1] + (bottom_color[1] - mid_color[1]) * factor)
            b = int(mid_color[2] + (bottom_color[2] - mid_color[2]) * factor)
        
        # Draw horizontal line
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    
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
    
    # Draw wooden deck railing in foreground
    draw_deck(draw, width, height)
    
    # Add some clouds for daytime
    if 7 <= hour <= 18:
        # Simple wispy clouds
        cloud_color = (255, 255, 255, 60) if hour < 17 else (255, 200, 180, 80)
        import random
        random.seed(hour)  # Consistent clouds per hour
        
        for _ in range(random.randint(3, 7)):
            cx = random.randint(100, width - 100)
            cy = random.randint(50, height // 3)
            cw = random.randint(120, 250)
            ch = random.randint(40, 80)
            
            draw.ellipse([cx - cw//2, cy - ch//2, cx + cw//2, cy + ch//2], fill=cloud_color)
            draw.ellipse([cx - cw//3, cy - ch//3, cx + cw//3, cy + ch//3], fill=cloud_color)
    
    # Convert to RGB for JPEG
    img_rgb = img.convert('RGB')
    
    # Apply slight blur for more natural look
    img_rgb = img_rgb.filter(ImageFilter.GaussianBlur(radius=0.5))
    
    # Save image
    output_path = os.path.join(sky_dir, f"{hour_str}.jpg")
    img_rgb.save(output_path, 'JPEG', quality=90, optimize=True)
    print(f"Generated {output_path} - {'Sun' if sun_pos else 'Moon' if moon_pos else 'Stars'} visible")

print(f"\n✓ Successfully generated 24 sky images in {sky_dir}/")
print("Images range from 00.jpg (midnight) to 23.jpg (11 PM)")
