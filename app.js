/**
 * ============================================
 * Lo-Fi Sequencer 95 - Main Application
 * ============================================
 * 
 * A Windows 95-style step sequencer with Web Audio API
 * for generating lo-fi hip hop sounds.
 */

class LoFiSequencer {
    /**
     * Initialize the sequencer
     * @param {Object} config - Configuration options
     */
    constructor(config = {}) {
        this.steps = config.steps || 16;
        this.tracks = config.tracks || 4;
        this.bpm = config.bpm || 85;
        this.isPlaying = false;
        this.currentStep = 0;
        this.pattern = [];

        // Initialize pattern grid
        for (let track = 0; track < this.tracks; track++) {
            this.pattern[track] = new Array(this.steps).fill(false);
        }

        // Audio context
        this.audioContext = null;
        this.nextNoteTime = 0;
        this.timerID = null;
        this.lookahead = 25.0; // milliseconds
        this.scheduleAheadTime = 0.1; // seconds

        // DOM elements
        this.grid = null;
        this.playStopBtn = null;
        this.tempoSlider = null;
        this.tempoValue = null;
        this.clearBtn = null;
        this.statusText = null;
        this.presetSelect = null;
        this.loadPresetBtn = null;

        // Define presets
        this.presets = {
            'Classic Lo-Fi': {
                bpm: 85,
                pattern: [
                    // Kick - classic lo-fi beat
                    [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
                    // Snare - on beats 2 and 4
                    [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
                    // Hi-Hat - 8th notes
                    [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
                    // Chord - occasional stabs
                    [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false]
                ]
            },
            'Boom Bap': {
                bpm: 90,
                pattern: [
                    // Kick - heavy boom bap pattern
                    [true, false, false, true, false, false, true, false, true, false, false, true, false, false, true, false],
                    // Snare - classic 2 and 4 with some syncopation
                    [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
                    // Hi-Hat - tight 16th notes
                    [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
                    // Chord - occasional hits
                    [false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false]
                ]
            },
            'Trap': {
                bpm: 140,
                pattern: [
                    // Kick - trap hi-hat rolls pattern
                    [true, false, false, true, false, false, true, false, true, false, false, true, false, false, true, false],
                    // Snare - heavy on 3 and 7
                    [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
                    // Hi-Hat - rapid trap hats
                    [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
                    // Chord - atmospheric stabs
                    [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false]
                ]
            },
            'House': {
                bpm: 124,
                pattern: [
                    // Kick - four-on-the-floor
                    [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
                    // Snare - clap on 2 and 4
                    [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
                    // Hi-Hat - off-beat hats
                    [false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true],
                    // Chord - house chord stabs
                    [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false]
                ]
            },
            'Minimal Techno': {
                bpm: 126,
                pattern: [
                    // Kick - minimal kick pattern
                    [true, false, false, false, false, false, false, true, false, false, false, false, false, false, true, false],
                    // Snare - occasional clap
                    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false],
                    // Hi-Hat - sparse techno hats
                    [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
                    // Chord - minimal texture
                    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
                ]
            },
            'Downtempo': {
                bpm: 75,
                pattern: [
                    // Kick - slow and deep
                    [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
                    // Snare - relaxed snare
                    [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
                    // Hi-Hat - sparse hats
                    [true, false, false, false, false, false, true, false, false, false, true, false, false, false, false, false],
                    // Chord - rich chords
                    [true, false, false, false, false, false, true, false, false, false, false, false, true, false, false, false]
                ]
            },
            'Ambient': {
                bpm: 65,
                pattern: [
                    // Kick - very sparse
                    [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
                    // Snare - almost none
                    [false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false],
                    // Hi-Hat - distant
                    [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
                    // Chord - drifting pads
                    [true, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false]
                ]
            },
            'Reggaeton': {
                bpm: 95,
                pattern: [
                    // Kick - dem bow pattern
                    [true, false, false, true, false, false, true, false, true, false, false, true, false, false, true, false],
                    // Snare - reggaeton snare
                    [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
                    // Hi-Hat - dem bow hats
                    [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
                    // Chord - occasional
                    [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false]
                ]
            }
        };

        this.init();
    }
    
    /**
     * Initialize the application
     */
    init() {
        this.cacheDOM();
        this.renderGrid();
        this.populatePresets();
        this.bindEvents();
        this.updateStatus('Ready to make beats...');
    }
    
    /**
     * Cache DOM elements for better performance
     */
    cacheDOM() {
        this.grid = document.getElementById('sequencerGrid');
        this.playStopBtn = document.getElementById('playStopBtn');
        this.tempoSlider = document.getElementById('tempoSlider');
        this.tempoValue = document.getElementById('tempoValue');
        this.clearBtn = document.getElementById('clearBtn');
        this.statusText = document.getElementById('statusText');
        this.presetSelect = document.getElementById('presetSelect');
        this.loadPresetBtn = document.getElementById('loadPresetBtn');
    }
    
    /**
     * Render the step sequencer grid
     */
    renderGrid() {
        this.grid.innerHTML = '';
        
        for (let track = 0; track < this.tracks; track++) {
            for (let step = 0; step < this.steps; step++) {
                const button = document.createElement('button');
                button.className = 'step-button';
                button.dataset.track = track;
                button.dataset.step = step;
                button.setAttribute('aria-label', `Track ${track}, Step ${step}`);
                this.grid.appendChild(button);
            }
        }
        
        // Render step numbers
        const stepNumbers = document.getElementById('stepNumbers');
        stepNumbers.innerHTML = '';
        for (let step = 1; step <= this.steps; step++) {
            const number = document.createElement('div');
            number.className = 'step-number';
            number.textContent = step;
            stepNumbers.appendChild(number);
        }
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Grid button clicks
        this.grid.addEventListener('click', (e) => {
            if (e.target.classList.contains('step-button')) {
                this.toggleStep(e.target);
            }
        });
        
        // Play/Stop button
        this.playStopBtn.addEventListener('click', () => {
            this.togglePlay();
        });
        
        // Tempo slider
        this.tempoSlider.addEventListener('input', (e) => {
            this.bpm = parseInt(e.target.value, 10);
            this.tempoValue.textContent = this.bpm;
        });
        
        // Clear button
        this.clearBtn.addEventListener('click', () => {
            this.clearPattern();
        });

        // Load preset button
        this.loadPresetBtn.addEventListener('click', () => {
            this.loadPreset();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePlay();
            }
        });
    }
    
    /**
     * Toggle a step on/off
     * @param {HTMLElement} button - The button element
     */
    toggleStep(button) {
        const track = parseInt(button.dataset.track, 10);
        const step = parseInt(button.dataset.step, 10);
        
        this.pattern[track][step] = !this.pattern[track][step];
        button.classList.toggle('active', this.pattern[track][step]);
        
        // Play sound immediately for feedback
        if (this.pattern[track][step]) {
            this.playTrack(track, this.audioContext.currentTime);
        }
        
        const trackNames = ['Kick', 'Snare', 'Hi-Hat', 'Chord'];
        this.updateStatus(`${trackNames[track]} at step ${step + 1} ${this.pattern[track][step] ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Toggle play/stop
     */
    togglePlay() {
        if (this.isPlaying) {
            this.stop();
        } else {
            this.play();
        }
    }
    
    /**
     * Start the sequencer
     */
    play() {
        // Initialize audio context on first play
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // Resume audio context if suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        this.isPlaying = true;
        this.currentStep = 0;
        this.nextNoteTime = this.audioContext.currentTime;
        
        this.playStopBtn.innerHTML = '<span id="playIcon">■</span> Stop';
        this.playStopBtn.classList.add('playing');
        this.updateStatus('Playing...');
        
        // Start the scheduler
        this.scheduler();
    }
    
    /**
     * Stop the sequencer
     */
    stop() {
        this.isPlaying = false;
        
        if (this.timerID) {
            clearTimeout(this.timerID);
            this.timerID = null;
        }
        
        this.playStopBtn.innerHTML = '<span id="playIcon">▶</span> Play';
        this.playStopBtn.classList.remove('playing');
        this.updateStatus('Stopped');
        
        // Clear current step indicator
        this.clearCurrentStepIndicator();
    }
    
    /**
     * Scheduler - determines when to play notes
     */
    scheduler() {
        // While there are notes that will need to play before the next interval,
        // schedule them and advance the pointer
        while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
            this.scheduleNote(this.currentStep, this.nextNoteTime);
            this.advanceNote();
        }
        
        if (this.isPlaying) {
            this.timerID = setTimeout(() => this.scheduler(), this.lookahead);
        }
    }
    
    /**
     * Advance to the next note
     */
    advanceNote() {
        const secondsPerBeat = 60.0 / this.bpm;
        this.nextNoteTime += 0.25 * secondsPerBeat; // 16th notes
        this.currentStep = (this.currentStep + 1) % this.steps;
    }
    
    /**
     * Schedule a note to play
     * @param {number} stepNumber - The step number
     * @param {number} time - The time to play the note
     */
    scheduleNote(stepNumber, time) {
        // Push visual update to the queue
        setTimeout(() => {
            this.updateVisuals(stepNumber);
        }, (time - this.audioContext.currentTime) * 1000);
        
        // Play tracks that have notes at this step
        for (let track = 0; track < this.tracks; track++) {
            if (this.pattern[track][stepNumber]) {
                this.playTrack(track, time);
            }
        }
    }
    
    /**
     * Update visual indicators
     * @param {number} stepNumber - The current step number
     */
    updateVisuals(stepNumber) {
        // Clear previous current step indicator
        this.clearCurrentStepIndicator();
        
        // Set new current step indicator
        const buttons = this.grid.querySelectorAll('.step-button');
        buttons.forEach((button, index) => {
            const step = parseInt(button.dataset.step, 10);
            if (step === stepNumber) {
                button.classList.add('current');
                
                // Add trigger animation if active
                if (button.classList.contains('active')) {
                    button.classList.add('triggered');
                    setTimeout(() => button.classList.remove('triggered'), 100);
                }
            }
        });
    }
    
    /**
     * Clear current step indicator
     */
    clearCurrentStepIndicator() {
        const buttons = this.grid.querySelectorAll('.step-button');
        buttons.forEach(button => {
            button.classList.remove('current');
        });
    }
    
    /**
     * Play a track
     * @param {number} track - The track number (0-3)
     * @param {number} time - The time to play
     */
    playTrack(track, time) {
        switch (track) {
            case 0:
                this.playKick(time);
                break;
            case 1:
                this.playSnare(time);
                break;
            case 2:
                this.playHiHat(time);
                break;
            case 3:
                this.playChord(time);
                break;
        }
    }
    
    /**
     * Generate a deep, soft kick drum
     * @param {number} time - The time to play
     */
    playKick(time) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        // Lowpass filter for warmth
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, time);
        filter.frequency.exponentialRampToValueAtTime(50, time + 0.1);
        
        // Oscillator for the kick
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);
        
        // Envelope
        gain.gain.setValueAtTime(0.8, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
        
        // Connect nodes
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioContext.destination);
        
        // Start and stop
        osc.start(time);
        osc.stop(time + 0.3);
    }
    
    /**
     * Generate a crisp snare hit
     * @param {number} time - The time to play
     */
    playSnare(time) {
        // Noise component
        const noise = this.audioContext.createBufferSource();
        const noiseBuffer = this.createNoiseBuffer();
        noise.buffer = noiseBuffer;
        
        const noiseFilter = this.audioContext.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.setValueAtTime(1000, time);
        
        const noiseGain = this.audioContext.createGain();
        noiseGain.gain.setValueAtTime(0.3, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.audioContext.destination);
        
        // Tone component
        const osc = this.audioContext.createOscillator();
        const oscGain = this.audioContext.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, time);
        osc.frequency.exponentialRampToValueAtTime(150, time + 0.1);
        
        oscGain.gain.setValueAtTime(0.4, time);
        oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
        
        osc.connect(oscGain);
        oscGain.connect(this.audioContext.destination);
        
        // Start and stop
        noise.start(time);
        noise.stop(time + 0.2);
        osc.start(time);
        osc.stop(time + 0.15);
    }
    
    /**
     * Generate a tight closed hi-hat
     * @param {number} time - The time to play
     */
    playHiHat(time) {
        const noise = this.audioContext.createBufferSource();
        const noiseBuffer = this.createNoiseBuffer(0.05); // Shorter buffer for hi-hat
        noise.buffer = noiseBuffer;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(7000, time);
        filter.frequency.exponentialRampToValueAtTime(5000, time + 0.05);
        
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioContext.destination);
        
        noise.start(time);
        noise.stop(time + 0.1);
    }
    
    /**
     * Generate a warm, jazzy chord (lo-fi piano/Rhodes style)
     * @param {number} time - The time to play
     */
    playChord(time) {
        // C minor 7 chord with lo-fi character
        const chordFrequencies = [130.81, 155.56, 196.00, 233.08]; // C3, Eb3, G3, Bb3
        
        chordFrequencies.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            // Use triangle waves for warmth
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 2, time); // Slight detune for lo-fi feel
            
            // Lowpass filter for mellow tone
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800 + (Math.random() * 200), time);
            filter.Q.setValueAtTime(1, time);
            
            // ADSR envelope with slow attack for soft feel
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.1 - (i * 0.015), time + 0.05); // Attack
            gain.gain.exponentialRampToValueAtTime(0.08 - (i * 0.012), time + 0.3); // Decay
            gain.gain.exponentialRampToValueAtTime(0.01, time + 1.2); // Release
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.start(time);
            osc.stop(time + 1.3);
        });
    }
    
    /**
     * Create a noise buffer for snare and hi-hat
     * @param {number} duration - Duration in seconds
     * @returns {AudioBuffer} Noise buffer
     */
    createNoiseBuffer(duration = 0.5) {
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        return buffer;
    }
    
    /**
     * Clear the entire pattern
     */
    clearPattern() {
        // Clear pattern array
        for (let track = 0; track < this.tracks; track++) {
            this.pattern[track] = new Array(this.steps).fill(false);
        }
        
        // Update visual buttons
        const buttons = this.grid.querySelectorAll('.step-button');
        buttons.forEach(button => {
            button.classList.remove('active');
        });
        
        this.updateStatus('Pattern cleared');
    }
    
    /**
     * Update the status text
     * @param {string} text - Status message
     */
    updateStatus(text) {
        this.statusText.textContent = text;
    }

    /**
     * Populate the preset dropdown with available presets
     */
    populatePresets() {
        // Clear existing options except the first one
        while (this.presetSelect.options.length > 1) {
            this.presetSelect.remove(1);
        }

        // Add each preset to the dropdown
        Object.keys(this.presets).forEach(presetName => {
            const option = document.createElement('option');
            option.value = presetName;
            option.textContent = presetName;
            this.presetSelect.appendChild(option);
        });
    }

    /**
     * Load the selected preset
     */
    loadPreset() {
        const selectedPreset = this.presetSelect.value;

        if (!selectedPreset) {
            this.updateStatus('Please select a preset first');
            return;
        }

        const preset = this.presets[selectedPreset];

        if (!preset) {
            this.updateStatus('Preset not found');
            return;
        }

        // Set the BPM
        this.bpm = preset.bpm;
        this.tempoSlider.value = preset.bpm;
        this.tempoValue.textContent = preset.bpm;

        // Set the pattern
        this.setPattern(preset.pattern);

        this.updateStatus(`Loaded preset: ${selectedPreset} (${preset.bpm} BPM)`);
    }
    
    /**
     * Get the current pattern (useful for saving/loading)
     * @returns {Array} The current pattern
     */
    getPattern() {
        return this.pattern.map(track => [...track]);
    }
    
    /**
     * Set the pattern (useful for saving/loading)
     * @param {Array} pattern - The pattern to set
     */
    setPattern(pattern) {
        if (pattern.length !== this.tracks) {
            throw new Error('Pattern must have exactly 4 tracks');
        }
        
        for (let track = 0; track < this.tracks; track++) {
            if (pattern[track].length !== this.steps) {
                throw new Error('Each track must have exactly 16 steps');
            }
            this.pattern[track] = [...pattern[track]];
        }
        
        // Update visual buttons
        const buttons = this.grid.querySelectorAll('.step-button');
        buttons.forEach(button => {
            const track = parseInt(button.dataset.track, 10);
            const step = parseInt(button.dataset.step, 10);
            button.classList.toggle('active', this.pattern[track][step]);
        });
        
        this.updateStatus('Pattern loaded');
    }
}

// Initialize the sequencer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.sequencer = new LoFiSequencer({
        steps: 16,
        tracks: 4,
        bpm: 85
    });
    
    console.log('Lo-Fi Sequencer 95 initialized successfully!');
});
