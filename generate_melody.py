#!/usr/bin/env python3
"""
Generate an original, uplifting melody MIDI file
Inspired by the message "Everything's Gonna Be Alright"
"""

from midiutil import MIDIFile
import os

# Create output directory
audio_dir = "audio"
os.makedirs(audio_dir, exist_ok=True)

# Create MIDI file with one track
midi = MIDIFile(1)

# Track settings
track = 0
channel = 0
time = 0
tempo = 100  # BPM - moderate, uplifting tempo
volume = 100

# Add track name and tempo
midi.addTrackName(track, time, "Everything's Gonna Be Alright")
midi.addTempo(track, time, tempo)

# Define a simple, uplifting chord progression melody
# Using C major scale for brightness and positivity
# Notes: C=60, D=62, E=64, F=65, G=67, A=69, B=71, C2=72

melody = [
    # Phrase 1: "Everything's gonna be..."
    (60, 0.0, 0.5, 90),   # C
    (64, 0.5, 0.5, 90),   # E
    (67, 1.0, 0.5, 95),   # G
    (69, 1.5, 0.5, 95),   # A
    (67, 2.0, 1.0, 100),  # G (hold)
    
    # Phrase 2: "...alright"
    (64, 3.0, 0.5, 90),   # E
    (67, 3.5, 0.5, 90),   # G
    (72, 4.0, 1.5, 100),  # C2 (hold - uplifting resolution)
    
    # Phrase 3: Simple hopeful response
    (69, 6.0, 0.5, 85),   # A
    (67, 6.5, 0.5, 85),   # G
    (64, 7.0, 0.5, 90),   # E
    (60, 7.5, 0.5, 90),   # C
    (64, 8.0, 2.0, 95),   # E (hold)
    
    # Phrase 4: Gentle ending
    (67, 10.0, 0.5, 85),  # G
    (69, 10.5, 0.5, 85),  # A
    (72, 11.0, 2.0, 90),  # C2 (final resolution)
]

# Add melody notes
for pitch, start_time, duration, vel in melody:
    midi.addNote(track, channel, pitch, start_time, duration, vel)

# Add simple bass accompaniment (root notes)
bass_notes = [
    (48, 0.0, 2.0, 70),   # C
    (48, 2.0, 2.0, 70),   # C
    (55, 4.0, 2.0, 70),   # G
    (52, 6.0, 2.0, 70),   # E
    (48, 8.0, 2.0, 70),   # C
    (55, 10.0, 2.0, 70),  # G
    (48, 12.0, 1.0, 70),  # C (final)
]

for pitch, start_time, duration, vel in bass_notes:
    midi.addNote(track, channel, pitch, start_time, duration, vel)

# Write MIDI file
output_path = os.path.join(audio_dir, "melody.mid")
with open(output_path, "wb") as output_file:
    midi.writeFile(output_file)

print(f"✓ Generated MIDI file: {output_path}")
print("Duration: ~13 seconds")
print("This is an original, uplifting melody in C major")
