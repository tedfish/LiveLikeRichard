#!/usr/bin/env python3
"""
Generate realistic time-of-day variants of the restaurant image for each section.
Creates 12 images corresponding to hours: 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 1, 3
"""

from PIL import Image, ImageEnhance, ImageFilter, ImageDraw
import colorsys
import math

def rgb_to_hsv(r, g, b):
    """Convert RGB to HSV"""
    return colorsys.rgb_to_hsv(r/255.0, g/255.0, b/255.0)

def hsv_to_rgb(h, s, v):
    """Convert HSV to RGB"""
    r, g, b = colorsys.hsv_to_rgb(h, s, v)
    return int(r * 255), int(g * 255), int(b * 255)

def get_sky_color_for_hour(hour, position):
    """
    Get sky color based on hour and vertical position (0=top, 1=bottom)
    Returns (r, g, b) tuple
    """
    colors = {
        5: {  # Dawn - early morning blue with warm horizon
            'top': (50, 80, 140),
            'horizon': (255, 180, 120),
            'bottom': (180, 140, 100)
        },
        7: {  # Morning - bright clear sky
            'top': (100, 150, 220),
            'horizon': (150, 200, 240),
            'bottom': (200, 220, 240)
        },
        9: {  # Mid-morning - full daylight
            'top': (80, 140, 230),
            'horizon': (120, 180, 240),
            'bottom': (180, 210, 245)
        },
        11: {  # Late morning - bright midday approaching
            'top': (70, 130, 240),
            'horizon': (100, 170, 250),
            'bottom': (160, 200, 250)
        },
        13: {  # Afternoon - peak brightness
            'top': (60, 120, 250),
            'horizon': (90, 160, 255),
            'bottom': (140, 190, 255)
        },
        15: {  # Mid-afternoon - still bright
            'top': (70, 130, 240),
            'horizon': (110, 175, 245),
            'bottom': (170, 205, 250)
        },
        17: {  # Golden hour - warm golden light
            'top': (120, 140, 200),
            'horizon': (255, 200, 120),
            'bottom': (240, 170, 100)
        },
        19: {  # Sunset/dusk - deep blue with warm glow
            'top': (30, 50, 100),
            'horizon': (200, 120, 80),
            'bottom': (80, 60, 80)
        },
        21: {  # Evening - dark blue twilight
            'top': (15, 25, 60),
            'horizon': (40, 50, 90),
            'bottom': (30, 35, 60)
        },
        23: {  # Night - deep dark blue
            'top': (10, 15, 40),
            'horizon': (20, 25, 50),
            'bottom': (15, 20, 45)
        },
        1: {  # Late night - darkest blue
            'top': (5, 10, 35),
            'horizon': (15, 20, 45),
            'bottom': (10, 15, 40)
        },
        3: {  # Pre-dawn - very dark with hint of warmth
            'top': (8, 12, 38),
            'horizon': (25, 30, 55),
            'bottom': (20, 25, 50)
        }
    }
    
    color_set = colors.get(hour, colors[13])
    
    # Interpolate between top, horizon, and bottom
    if position < 0.35:  # Top portion
        local_pos = position / 0.35
        r = int(color_set['top'][0] + (color_set['horizon'][0] - color_set['top'][0]) * local_pos)
        g = int(color_set['top'][1] + (color_set['horizon'][1] - color_set['top'][1]) * local_pos)
        b = int(color_set['top'][2] + (color_set['horizon'][2] - color_set['top'][2]) * local_pos)
    else:  # Bottom portion
        local_pos = (position - 0.35) / 0.65
        r = int(color_set['horizon'][0] + (color_set['bottom'][0] - color_set['horizon'][0]) * local_pos)
        g = int(color_set['horizon'][1] + (color_set['bottom'][1] - color_set['horizon'][1]) * local_pos)
        b = int(color_set['horizon'][2] + (color_set['bottom'][2] - color_set['horizon'][2]) * local_pos)
    
    return (r, g, b)

def get_lighting_params(hour):
    """
    Get lighting parameters for each hour
    Returns dict with brightness, warmth, contrast, saturation, glow_strength
    """
    params = {
        5: {'brightness': 0.55, 'warmth': 0.15, 'contrast': 1.1, 'saturation': 1.2, 'glow': 0.2},
        7: {'brightness': 0.85, 'warmth': 0.05, 'contrast': 1.15, 'saturation': 1.15, 'glow': 0.0},
        9: {'brightness': 1.0, 'warmth': 0.0, 'contrast': 1.2, 'saturation': 1.1, 'glow': 0.0},
        11: {'brightness': 1.05, 'warmth': -0.02, 'contrast': 1.25, 'saturation': 1.05, 'glow': 0.0},
        13: {'brightness': 1.1, 'warmth': -0.03, 'contrast': 1.3, 'saturation': 1.0, 'glow': 0.0},
        15: {'brightness': 1.0, 'warmth': 0.02, 'contrast': 1.2, 'saturation': 1.1, 'glow': 0.0},
        17: {'brightness': 0.75, 'warmth': 0.12, 'contrast': 1.25, 'saturation': 1.35, 'glow': 0.15},
        19: {'brightness': 0.55, 'warmth': 0.1, 'contrast': 1.25, 'saturation': 1.3, 'glow': 0.55},
        21: {'brightness': 0.45, 'warmth': 0.08, 'contrast': 1.2, 'saturation': 1.2, 'glow': 0.65},
        23: {'brightness': 0.40, 'warmth': 0.05, 'contrast': 1.2, 'saturation': 1.15, 'glow': 0.70},
        1: {'brightness': 0.35, 'warmth': 0.03, 'contrast': 1.15, 'saturation': 1.1, 'glow': 0.75},
        3: {'brightness': 0.35, 'warmth': 0.04, 'contrast': 1.15, 'saturation': 1.1, 'glow': 0.70}
    }
    return params.get(hour, params[13])

def create_sky_gradient(width, height, hour):
    """Create realistic sky gradient for the hour"""
    gradient = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(gradient)
    
    for y in range(height):
        position = y / height
        color = get_sky_color_for_hour(hour, position)
        draw.line([(0, y), (width, y)], fill=color)
    
    return gradient

def create_ambient_glow(width, height, glow_strength):
    """Create warm ambient restaurant lighting glow"""
    glow = Image.new('RGB', (width, height), (255, 200, 130))
    mask = Image.new('L', (width, height), 0)
    mask_draw = ImageDraw.Draw(mask)
    
    # Create multiple light sources where tables/umbrellas are
    center_y = int(height * 0.55)
    light_positions = [
        (int(width * 0.25), center_y),
        (int(width * 0.45), center_y),
        (int(width * 0.65), center_y),
        (int(width * 0.85), center_y)
    ]
    
    base_intensity = int(80 * glow_strength)
    for x, y in light_positions:
        mask_draw.ellipse([
            x - 200, y - 120,
            x + 200, y + 120
        ], fill=base_intensity)
    
    # Blur for soft lighting effect
    mask = mask.filter(ImageFilter.GaussianBlur(radius=100))
    
    return Image.composite(glow, Image.new('RGB', (width, height), (0, 0, 0)), mask)

def apply_vignette(img, strength=0.3):
    """Apply subtle vignette effect"""
    width, height = img.size
    vignette = Image.new('L', (width, height), 255)
    vignette_draw = ImageDraw.Draw(vignette)
    
    edge_distance = min(width, height) // 3
    for i in range(edge_distance):
        alpha = int(255 * (1 - (i / edge_distance) * strength))
        vignette_draw.rectangle([
            i, i, width - i - 1, height - i - 1
        ], outline=alpha)
    
    vignette = vignette.filter(ImageFilter.GaussianBlur(radius=60))
    
    # Darken edges
    vignette_overlay = Image.new('RGB', (width, height), (0, 0, 0))
    return Image.composite(img, vignette_overlay, vignette)

def create_restaurant_variant(input_path, output_path, hour):
    """Create time-specific variant of restaurant image"""
    print(f"\n{'='*60}")
    print(f"Creating variant for {hour}:00")
    print(f"{'='*60}")
    
    img = Image.open(input_path).convert('RGB')
    width, height = img.size
    
    params = get_lighting_params(hour)
    
    # Step 1: Adjust base brightness
    print(f"  Adjusting brightness to {params['brightness']:.2f}...")
    brightness = ImageEnhance.Brightness(img)
    img = brightness.enhance(params['brightness'])
    
    # Step 2: Apply color temperature shift
    print(f"  Applying warmth adjustment ({params['warmth']:+.2f})...")
    pixels = img.load()
    for y in range(height):
        for x in range(width):
            r, g, b = pixels[x, y]
            h, s, v = rgb_to_hsv(r, g, b)
            
            # Adjust hue for warmth/coolness
            if params['warmth'] != 0:
                h = (h + params['warmth']) % 1.0
            
            # Adjust saturation and value based on brightness of pixel
            if v > 0.6:  # Bright areas (sky)
                s = min(s * params['saturation'], 1.0)
                v = v * (0.5 + params['brightness'] * 0.5)
            elif v > 0.3:  # Mid-tones
                s = min(s * (params['saturation'] * 0.9), 1.0)
                v = v * (0.7 + params['brightness'] * 0.3)
            else:  # Shadows
                v = v * (0.5 + params['brightness'] * 0.5)
            
            r, g, b = hsv_to_rgb(h, s, v)
            pixels[x, y] = (r, g, b)
    
    # Step 3: Blend with sky gradient
    print(f"  Creating sky gradient...")
    sky_gradient = create_sky_gradient(width, height, hour)
    img = Image.blend(img, sky_gradient, alpha=0.35)
    
    # Step 4: Add restaurant lighting glow for evening/night
    if params['glow'] > 0:
        print(f"  Adding ambient glow (strength: {params['glow']:.2f})...")
        glow_layer = create_ambient_glow(width, height, params['glow'])
        img = Image.blend(img, glow_layer, alpha=params['glow'])
    
    # Step 5: Adjust contrast
    print(f"  Enhancing contrast to {params['contrast']:.2f}...")
    contrast = ImageEnhance.Contrast(img)
    img = contrast.enhance(params['contrast'])
    
    # Step 6: Final saturation adjustment
    print(f"  Final saturation adjustment to {params['saturation']:.2f}...")
    color = ImageEnhance.Color(img)
    img = color.enhance(params['saturation'])
    
    # Step 7: Apply vignette
    print(f"  Applying vignette...")
    vignette_strength = 0.2 + (1.0 - params['brightness']) * 0.2
    img = apply_vignette(img, vignette_strength)
    
    # Save
    print(f"  Saving to {output_path}...")
    img.save(output_path, 'JPEG', quality=92, optimize=True)
    print(f"  ✓ Complete!")

def main():
    input_file = 'images/sky/restaurant-with-a-view.jpg'
    hours = [5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 1, 3]
    
    print("\n" + "="*60)
    print("RESTAURANT IMAGE TIME VARIANT GENERATOR")
    print("="*60)
    print(f"Source: {input_file}")
    print(f"Generating {len(hours)} time-specific variants")
    print("="*60)
    
    for hour in hours:
        output_file = f'images/sky/{hour:02d}.jpg'
        create_restaurant_variant(input_file, output_file, hour)
    
    print("\n" + "="*60)
    print("ALL VARIANTS GENERATED SUCCESSFULLY!")
    print("="*60)
    print("\nGenerated images:")
    for hour in hours:
        time_label = "AM" if hour < 12 else "PM"
        display_hour = hour if hour <= 12 else hour - 12
        if display_hour == 0:
            display_hour = 12
        print(f"  • {hour:02d}.jpg - {display_hour}:00 {time_label}")
    print()

if __name__ == '__main__':
    main()
