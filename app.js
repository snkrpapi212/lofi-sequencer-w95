/**
 * ============================================
 * Lo-Fi Sequencer 95 - Main Application (Expanded)
 * ============================================
 *
 * A Windows 95-style step sequencer with Web Audio API
 * for generating lo-fi hip hop sounds with artist-inspired presets
 */

class LoFiSequencer {
    /**
     * Initialize the sequencer
     * @param {Object} config - Configuration options
     */
    constructor(config = {}) {
        this.steps = config.steps || 128;  // Expanded to 128 steps (8 bars - full verse/chorus)
        this.tracks = config.tracks || 6;  // Expanded to 6 tracks
        this.bpm = config.bpm || 85;
        this.isPlaying = false;
        this.currentStep = 0;
        this.loopCount = 0;
        this.maxLoops = 0;  // 0 = infinite loops
        this.pattern = [];

        // Track names
        this.trackNames = ['Kick', 'Snare', 'Hi-Hat', 'Chord', 'Bass', 'FX'];

        // Initialize pattern grid
        for (let track = 0; track < this.tracks; track++) {
            this.pattern[track] = new Array(this.steps).fill(false);
        }

        // Audio context
        this.audioContext = null;
        this.nextNoteTime = 0;
        this.timerID = null;
        this.lookahead = 25.0; // milliseconds
        this.scheduleAheadTime = 0.1; // seconds;

        // DOM elements
        this.grid = null;
        this.playStopBtn = null;
        this.tempoSlider = null;
        this.tempoValue = null;
        this.clearBtn = null;
        this.statusText = null;
        this.presetSelect = null;
        this.loadPresetBtn = null;
        this.stepsSelect = null;
        this.loopSelect = null;

        // Define artist-inspired presets
        this.presets = this.createPresets();

        this.init();
    }

    /**
     * Create all artist-inspired presets
     */
    createPresets() {
        const createPattern = (kick, snare, hihat, chord, bass, fx) => {
            return [kick, snare, hihat, chord, bass, fx];
        };

        // Helper to create empty pattern
        const empty128 = () => new Array(128).fill(false);

        // Helper to create basic patterns for 128 steps (8 bars)
        const fourOnFloor = () => {
            const p = new Array(128).fill(false);
            for (let i = 0; i < 128; i += 4) p[i] = true;
            return p;
        };

        const eighthHats = () => {
            const p = new Array(128).fill(false);
            for (let i = 0; i < 128; i += 2) p[i] = true;
            return p;
        };

        const sixteenthHats = () => new Array(128).fill(true);

        const twoFourSnare = () => {
            const p = new Array(128).fill(false);
            for (let i = 4; i < 128; i += 16) { p[i] = true; }  // Every bar
            return p;
        };

        const boomBapKick = () => {
            const p = new Array(128).fill(false);
            // Classic boom bap kick pattern over 8 bars
            const pattern = [1,0,0,0, 0,0,1,0, 1,0,0,1, 0,0,1,0];  // 16 steps
            for (let i = 0; i < 128; i++) {
                p[i] = pattern[i % 16] === 1;
            }
            return p;
        };

        return {
            'The Weeknd (Blinding Lights)': {
                bpm: 171,
                pattern: createPattern(
                    // Kick - driving four-on-floor with syncopation
                    [true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false],
                    // Snare - clap on 2 and 4
                    [false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false],
                    // Hi-Hat - 16th notes with open accents
                    [true,true,true,true,true,true,true,false,true,true,true,true,true,true,true,false,true,true,true,true,true,true,true,false,true,true,true,true,true,true,true,true],
                    // Chord - synth stabs
                    [true,false,false,false,false,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],
                    // Bass - driving synth bass
                    [true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false],
                    // FX - whooshes and transitions
                    [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true]
                )
            },

            'Drake (Hotline Bling)': {
                bpm: 135,
                pattern: createPattern(
                    // Kick - trap-influenced kick pattern
                    [true,false,false,false,true,false,false,true,true,false,false,false,true,false,false,false,true,false,false,true,true,false,false,false,true,false,false,true,true,false,false,false],
                    // Snare - sharp snares
                    [false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false],
                    // Hi-Hat - rapid trap hats
                    [true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true],
                    // Chord - pads
                    [true,false,false,false,false,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],
                    // Bass - 808-style
                    [true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false],
                    // FX - ad-libs style hits
                    [false,false,true,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,false,false,true,false,false,false]
                )
            },

            'Lil Wayne (A Milli)': {
                bpm: 84,
                pattern: createPattern(
                    // Kick - New Orleans bounce style
                    [true,false,false,true,false,false,true,false,true,false,false,true,false,false,true,false,true,false,false,true,false,false,true,false,false,true,false,false,true,false,false,true,false],
                    // Snare - snappy snares
                    [false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false],
                    // Hi-Hat - 16th notes
                    sixteenthHats(),
                    // Chord - southern trap chords
                    [true,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],
                    // Bass - heavy 808s
                    [true,false,false,true,false,false,false,false,true,false,false,true,false,false,false,false,true,false,false,true,false,false,true,false,false,false,true,false,false,true,false,false,true],
                    // FX - vocal chop effects
                    [false,true,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,true,false,false]
                )
            },

            '50 Cent (In Da Club)': {
                bpm: 91,
                pattern: createPattern(
                    // Kick - iconic 50 Cent kick
                    [true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false],
                    // Snare - hard-hitting snares
                    [false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false],
                    // Hi-Hat - 8th notes
                    eighthHats(),
                    // Chord - minimal
                    [true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],
                    // Bass - G-Unit style
                    [true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false],
                    // FX - Yeah! ad-libs
                    [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true,false,false,false,false,false]
                )
            },

            'Jay-Z (Empire State)': {
                bpm: 91,
                pattern: createPattern(
                    // Kick - Jay-Z's signature
                    [true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false],
                    // Snare - crisp snares
                    [false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false],
                    // Hi-Hat - smooth hats
                    eighthHats(),
                    // Chord - orchestral hits
                    [true,false,false,false,false,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],
                    // Bass - rolling bass
                    [true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false],
                    // FX - New York atmosphere
                    [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true]
                )
            },

            'Kendrick Lamar (HUMBLE.)': {
                bpm: 150,
                pattern: createPattern(
                    // Kick - trap kick
                    [true,false,false,true,false,false,true,false,true,false,false,true,false,false,true,false,true,false,false,true,false,false,true,false,false,true,false,false,true,false,false,true,false],
                    // Snare - punchy
                    [false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false],
                    // Hi-Hat - very fast trap hats
                    sixteenthHats(),
                    // Chord - ominous
                    [true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],
                    // Bass - dark 808s
                    [true,false,false,true,false,false,false,false,true,false,false,true,false,false,false,false,true,false,false,true,false,false,true,false,false,false,true,false,false,true,false,false,true],
                    // FX - punchline effects
                    [false,false,true,false,false,false,false,false,false,true,false,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,true,false,false]
                )
            },

            'Tupac (California Love)': {
                bpm: 92,
                pattern: createPattern(
                    // Kick - West Coast funk
                    [true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false],
                    // Snare - funk snare
                    [false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false],
                    // Hi-Hat - G-Funk hats
                    eighthHats(),
                    // Chord - G-Funk synths
                    [true,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],
                    // Bass - funk bass
                    [true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false],
                    // FX - West Coast vibes
                    [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true]
                )
            },

            'Eminem (Lose Yourself)': {
                bpm: 171,
                pattern: createPattern(
                    // Kick - driving rock-rap beat
                    [true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false],
                    // Snare - rock snare
                    [false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false],
                    // Hi-Hat - fast hats
                    [true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true],
                    // Chord - piano stabs
                    [true,false,false,false,false,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],
                    // Bass - bass guitar
                    [true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false],
                    // FX - drum fills
                    [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false]
                )
            },

            'Biggie (Juicy)': {
                bpm: 95,
                bpm: 95,
                pattern: createPattern(
                    // Kick - boom bap classic
                    [true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false],
                    // Snare - classic snare
                    [false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false],
                    // Hi-Hat - crisp hats
                    eighthHats(),
                    // Chord - soul samples
                    [true,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],
                    // Bass - deep bass
                    [true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false],
                    // FX - vinyl crackle
                    [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false]
                )
            },

            'J. Cole (No Role Modelz)': {
                bpm: 80,
                pattern: createPattern(
                    // Kick - laid-back beat
                    [true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false],
                    // Snare - relaxed snare
                    [false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,true,false,false,false],
                    // Hi-Hat - smooth hats
                    eighthHats(),
                    // Chord - dreamy pads
                    [true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],
                    // Bass - smooth bass
                    [true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false,true,false,false,false],
                    // FX - atmospheric
                    [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false]
                )
            }
        };
    }

    /**
     * Initialize the application
     */
    init() {
        this.cacheDOM();
        this.renderGrid();
        this.populatePresets();
        this.populateSteps();
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
        this.stepsSelect = document.getElementById('stepsSelect');
        this.loopSelect = document.getElementById('loopSelect');
    }

    /**
     * Render the step sequencer grid
     */
    renderGrid() {
        this.grid.innerHTML = '';
        this.grid.style.gridTemplateColumns = `repeat(${this.steps}, 28px)`;
        this.grid.style.gridTemplateRows = `repeat(${this.tracks}, 28px)`;

        for (let track = 0; track < this.tracks; track++) {
            for (let step = 0; step < this.steps; step++) {
                const button = document.createElement('button');
                button.className = 'step-button';
                button.dataset.track = track;
                button.dataset.step = step;
                button.setAttribute('aria-label', `${this.trackNames[track]}, Step ${step + 1}`);
                this.grid.appendChild(button);
            }
        }

        // Render step numbers
        const stepNumbers = document.getElementById('stepNumbers');
        stepNumbers.innerHTML = '';
        stepNumbers.style.gridTemplateColumns = `repeat(${this.steps}, 28px)`;

        for (let step = 1; step <= this.steps; step++) {
            const number = document.createElement('div');
            number.className = 'step-number';
            number.textContent = step;
            stepNumbers.appendChild(number);
        }

        // Render track labels
        const trackLabels = document.getElementById('trackLabels');
        trackLabels.innerHTML = '';
        trackLabels.style.gridTemplateRows = `repeat(${this.tracks}, 28px)`;

        this.trackNames.forEach((name, track) => {
            const label = document.createElement('div');
            label.className = 'track-label';
            label.textContent = name;
            label.dataset.track = track;
            trackLabels.appendChild(label);
        });
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

        // Steps selector
        this.stepsSelect.addEventListener('change', (e) => {
            this.changeSteps(parseInt(e.target.value, 10));
        });

        // Loop selector
        this.loopSelect.addEventListener('change', (e) => {
            this.maxLoops = e.target.value === 'infinite' ? 0 : parseInt(e.target.value, 10);
            this.updateStatus(`Loop mode: ${e.target.value === 'infinite' ? 'Infinite' : e.target.value + ' times'}`);
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
     * Populate steps dropdown
     */
    populateSteps() {
        const stepsOptions = [
            { value: 16, text: '16 steps (1 bar)' },
            { value: 32, text: '32 steps (2 bars)' },
            { value: 64, text: '64 steps (4 bars)' },
            { value: 128, text: '128 steps (8 bars)' },
            { value: 256, text: '256 steps (16 bars)' },
            { value: 512, text: '512 steps (32 bars)' }
        ];
        stepsOptions.forEach(steps => {
            const option = document.createElement('option');
            option.value = steps.value;
            option.textContent = steps.text;
            option.selected = steps.value === this.steps;
            this.stepsSelect.appendChild(option);
        });
    }

    /**
     * Change the number of steps
     * @param {number} newSteps - New number of steps
     */
    changeSteps(newSteps) {
        // Preserve existing pattern data
        const oldPattern = this.pattern.map(track => [...track]);

        // Update steps
        this.steps = newSteps;

        // Reinitialize pattern array
        for (let track = 0; track < this.tracks; track++) {
            this.pattern[track] = new Array(this.steps).fill(false);
            // Copy over old pattern data
            for (let step = 0; step < Math.min(oldPattern[track].length, this.steps); step++) {
                this.pattern[track][step] = oldPattern[track][step];
            }
        }

        // Re-render grid
        this.renderGrid();

        this.updateStatus(`Pattern length: ${this.steps} steps`);
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

        this.updateStatus(`${this.trackNames[track]} at step ${step + 1} ${this.pattern[track][step] ? 'enabled' : 'disabled'}`);
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
        this.loopCount = 0;
        this.nextNoteTime = this.audioContext.currentTime;

        this.playStopBtn.innerHTML = '<span id="playIcon">■</span> Stop';
        this.playStopBtn.classList.add('playing');

        const loopMode = this.maxLoops === 0 ? 'Infinite' : `${this.maxLoops}x`;
        this.updateStatus(`Playing... (Loop: ${loopMode})`);

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

        const totalLoops = this.loopCount > 0 ? ` (${this.loopCount} loops)` : '';
        this.updateStatus(`Stopped${totalLoops}`);

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

        const oldStep = this.currentStep;
        this.currentStep = (this.currentStep + 1) % this.steps;

        // Check if we've completed a full loop (step went from last to first)
        if (this.currentStep === 0 && oldStep === this.steps - 1) {
            this.loopCount++;

            // Check if we've reached max loops
            if (this.maxLoops > 0 && this.loopCount >= this.maxLoops) {
                this.stop();
                return;
            }

            // Update status to show loop progress
            if (this.maxLoops > 0) {
                this.updateStatus(`Playing... Loop ${this.loopCount}/${this.maxLoops}`);
            }
        }
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
     * @param {number} track - The track number (0-5)
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
            case 4:
                this.playBass(time);
                break;
            case 5:
                this.playFX(time);
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
        const noiseBuffer = this.createNoiseBuffer(0.05);
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
     * Generate a warm, jazzy chord
     * @param {number} time - The time to play
     */
    playChord(time) {
        // C minor 7 chord with lo-fi character
        const chordFrequencies = [130.81, 155.56, 196.00, 233.08];

        chordFrequencies.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 2, time);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800 + (Math.random() * 200), time);
            filter.Q.setValueAtTime(1, time);

            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.1 - (i * 0.015), time + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.08 - (i * 0.012), time + 0.3);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 1.2);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.start(time);
            osc.stop(time + 1.3);
        });
    }

    /**
     * Generate deep bass (808 style)
     * @param {number} time - The time to play
     */
    playBass(time) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        // Sine wave for sub bass
        osc.type = 'sine';
        osc.frequency.setValueAtTime(65.41, time); // C2
        osc.frequency.exponentialRampToValueAtTime(32.70, time + 0.15);

        // Envelope for punch
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.6, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.4, time + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.8);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start(time);
        osc.stop(time + 0.9);
    }

    /**
     * Generate FX sounds (whooshes, impacts, etc.)
     * @param {number} time - The time to play
     */
    playFX(time) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        // White noise buffer
        const noise = this.audioContext.createBufferSource();
        const noiseBuffer = this.createNoiseBuffer(0.3);
        noise.buffer = noiseBuffer;

        // Bandpass filter for sweep
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(200, time);
        filter.frequency.exponentialRampToValueAtTime(2000, time + 0.15);
        filter.frequency.exponentialRampToValueAtTime(400, time + 0.3);
        filter.Q.setValueAtTime(10, time);

        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.25, time + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.35);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioContext.destination);

        noise.start(time);
        noise.stop(time + 0.4);
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
     * Get the current pattern
     * @returns {Array} The current pattern
     */
    getPattern() {
        return this.pattern.map(track => [...track]);
    }

    /**
     * Set the pattern
     * @param {Array} pattern - The pattern to set
     */
    setPattern(pattern) {
        if (pattern.length !== this.tracks) {
            throw new Error('Pattern must have exactly 6 tracks');
        }

        for (let track = 0; track < this.tracks; track++) {
            if (pattern[track].length !== this.steps) {
                throw new Error(`Each track must have exactly ${this.steps} steps`);
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
        steps: 128,
        tracks: 6,
        bpm: 85
    });

    console.log('Lo-Fi Sequencer 95 initialized successfully!');
});
