// ========================================
// Audio Player for MIDI Melody
// Using Web Audio API to synthesize the melody
// ========================================

class MelodyPlayer {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
        this.currentTimeout = null;
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.playIcon = document.querySelector('.play-icon');
        this.pauseIcon = document.querySelector('.pause-icon');
        
        // Original melody from our MIDI file
        // (pitch, start_time, duration, velocity)
        this.melody = [
            {pitch: 60, time: 0.0, duration: 0.5, velocity: 90},   // C
            {pitch: 64, time: 0.5, duration: 0.5, velocity: 90},   // E
            {pitch: 67, time: 1.0, duration: 0.5, velocity: 95},   // G
            {pitch: 69, time: 1.5, duration: 0.5, velocity: 95},   // A
            {pitch: 67, time: 2.0, duration: 1.0, velocity: 100},  // G
            {pitch: 64, time: 3.0, duration: 0.5, velocity: 90},   // E
            {pitch: 67, time: 3.5, duration: 0.5, velocity: 90},   // G
            {pitch: 72, time: 4.0, duration: 1.5, velocity: 100},  // C2
            {pitch: 69, time: 6.0, duration: 0.5, velocity: 85},   // A
            {pitch: 67, time: 6.5, duration: 0.5, velocity: 85},   // G
            {pitch: 64, time: 7.0, duration: 0.5, velocity: 90},   // E
            {pitch: 60, time: 7.5, duration: 0.5, velocity: 90},   // C
            {pitch: 64, time: 8.0, duration: 2.0, velocity: 95},   // E
            {pitch: 67, time: 10.0, duration: 0.5, velocity: 85},  // G
            {pitch: 69, time: 10.5, duration: 0.5, velocity: 85},  // A
            {pitch: 72, time: 11.0, duration: 2.0, velocity: 90},  // C2
        ];
        
        // Bass accompaniment
        this.bass = [
            {pitch: 48, time: 0.0, duration: 2.0, velocity: 70},
            {pitch: 48, time: 2.0, duration: 2.0, velocity: 70},
            {pitch: 55, time: 4.0, duration: 2.0, velocity: 70},
            {pitch: 52, time: 6.0, duration: 2.0, velocity: 70},
            {pitch: 48, time: 8.0, duration: 2.0, velocity: 70},
            {pitch: 55, time: 10.0, duration: 2.0, velocity: 70},
            {pitch: 48, time: 12.0, duration: 1.0, velocity: 70},
        ];
        
        this.tempo = 100; // BPM
        this.beatDuration = 60 / this.tempo; // seconds per beat
        
        this.init();
    }
    
    init() {
        this.playPauseBtn.addEventListener('click', () => {
            if (this.isPlaying) {
                this.stop();
            } else {
                this.play();
            }
        });
    }
    
    async play() {
        // Create audio context on user interaction
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        
        this.isPlaying = true;
        this.updateButtonState();
        
        const startTime = this.audioContext.currentTime;
        
        // Play all melody notes
        this.melody.forEach(note => {
            this.playNote(
                note.pitch,
                startTime + (note.time * this.beatDuration),
                note.duration * this.beatDuration,
                note.velocity / 127
            );
        });
        
        // Play all bass notes
        this.bass.forEach(note => {
            this.playNote(
                note.pitch,
                startTime + (note.time * this.beatDuration),
                note.duration * this.beatDuration,
                note.velocity / 127 * 0.6 // Bass quieter
            );
        });
        
        // Auto-reset after melody finishes
        const totalDuration = 13 * this.beatDuration * 1000; // ~13 seconds in ms
        this.currentTimeout = setTimeout(() => {
            this.stop();
        }, totalDuration);
    }
    
    playNote(midiNote, startTime, duration, velocity) {
        // Convert MIDI note to frequency
        const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);
        
        // Create oscillator for the note
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        // Use a warm sine wave for a gentle, uplifting sound
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        
        // Create envelope (ADSR)
        const now = startTime;
        const attackTime = 0.05;
        const releaseTime = 0.1;
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(velocity * 0.3, now + attackTime);
        gainNode.gain.linearRampToValueAtTime(velocity * 0.25, now + duration - releaseTime);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);
        
        // Add subtle reverb effect
        const convolver = this.audioContext.createConvolver();
        const dryGain = this.audioContext.createGain();
        const wetGain = this.audioContext.createGain();
        
        dryGain.gain.value = 0.7;
        wetGain.gain.value = 0.3;
        
        // Create impulse for reverb
        const impulseLength = this.audioContext.sampleRate * 2;
        const impulse = this.audioContext.createBuffer(2, impulseLength, this.audioContext.sampleRate);
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < impulseLength; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / impulseLength, 2);
            }
        }
        convolver.buffer = impulse;
        
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(dryGain);
        gainNode.connect(convolver);
        convolver.connect(wetGain);
        dryGain.connect(this.audioContext.destination);
        wetGain.connect(this.audioContext.destination);
        
        // Start and stop
        oscillator.start(now);
        oscillator.stop(now + duration);
    }
    
    stop() {
        this.isPlaying = false;
        this.updateButtonState();
        
        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
            this.currentTimeout = null;
        }
        
        // Note: Can't stop already scheduled notes, but they'll finish naturally
        // Future improvement: track all oscillators to stop them immediately
    }
    
    updateButtonState() {
        if (this.isPlaying) {
            this.playIcon.style.display = 'none';
            this.pauseIcon.style.display = 'block';
            this.playPauseBtn.setAttribute('aria-label', 'Pause music');
        } else {
            this.playIcon.style.display = 'block';
            this.pauseIcon.style.display = 'none';
            this.playPauseBtn.setAttribute('aria-label', 'Play music');
        }
    }
}

// Initialize player when page loads
let melodyPlayer;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        melodyPlayer = new MelodyPlayer();
    });
} else {
    melodyPlayer = new MelodyPlayer();
}
