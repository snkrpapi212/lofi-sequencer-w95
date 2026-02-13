# Lo-Fi Sequencer 95 🎵

A Windows 95-style step sequencer for creating lo-fi hip hop beats in your browser.

![Windows 95 Aesthetic](https://img.shields.io/badge/style-Windows%2095-blue) 
![Web Audio API](https://img.shields.io/badge/audio-Web%20Audio%20API-green)
![License](https://img.shields.io/badge/license-MIT-yellow)

## ✨ Features

- **16-Step × 4-Track Grid** - Create rhythmic patterns across four instruments
- **Web Audio API** - All sounds generated in real-time, no audio files needed
- **Windows 95 Aesthetic** - Authentic retro computing vibes with gray borders and classic buttons
- **Real-time Tempo Control** - Adjust BPM from 60-140 (default 85)
- **Visual Feedback** - Purple glow for active beats, yellow highlight for current step
- **Responsive Design** - Works on desktop and mobile devices

## 🎹 Instruments

| Track | Instrument | Sound Character |
|-------|-----------|-----------------|
| 1 | Kick | Deep, soft, thumpy kick drum |
| 2 | Snare | Crisp snare hit with noise layer |
| 3 | Hi-Hat | Tight, closed hi-hat |
| 4 | Chord | Warm, jazzy chord (lo-fi piano/Rhodes style) |

## 🚀 Getting Started

### Prerequisites

- A modern web browser with Web Audio API support
- No build process or dependencies required!

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/snkrpapi212/lofi-sequencer-w95.git
   ```

2. Navigate to the project directory:
   ```bash
   cd lofi-sequencer-w95
   ```

3. Open `index.html` in your web browser:
   ```bash
   # On macOS
   open index.html
   
   # On Linux
   xdg-open index.html
   
   # On Windows
   start index.html
   ```

Or simply open `index.html` by double-clicking it in your file explorer.

### Usage

1. **Click grid buttons** to toggle beats on/off (purple glow = active)
2. Click **Play** (or press Spacebar) to start the sequencer
3. Adjust **Tempo** slider to change the speed
4. Click **Stop** to pause playback
5. Use **Clear All** to reset the pattern

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Toggle Play/Stop |

## 🎨 Design

The sequencer features an authentic Windows 95 aesthetic:

- Classic 3D beveled borders
- System font styling
- Gray color scheme (#c0c0c0)
- Title bar with minimize/maximize/close buttons
- Animated rain-on-window background effect
- Purple glow for active beats (purple was a popular accent color in the 90s)
- Yellow highlight for the current playing step

## 🔧 Technical Details

### Architecture

The application uses vanilla JavaScript (no frameworks) with a class-based architecture:

- `LoFiSequencer` - Main sequencer class
- Web Audio API for sound synthesis
- CSS Grid for the step sequencer layout
- RequestAnimationFrame-style scheduling for precise timing

### Sound Generation

All sounds are synthesized using the Web Audio API:

- **Kick**: Sine oscillator with pitch envelope + lowpass filter
- **Snare**: White noise (filtered) + triangle oscillator
- **Hi-Hat**: Highpass-filtered white noise with short decay
- **Chord**: 4 detuned triangle oscillators (C minor 7) with slow attack

### Timing

The sequencer uses a lookahead scheduler for precise timing:

- Lookahead: 25ms
- Schedule ahead time: 100ms
- All notes scheduled in advance to ensure accuracy

## 🧪 Testing

Run the unit tests:

```bash
# Using Node.js
npm test

# Or open tests/sequencer.test.html in a browser
```

Test coverage includes:
- Pattern initialization
- Step toggling
- Pattern clearing
- Tempo adjustment
- Pattern save/load functionality

## 📁 Project Structure

```
lofi-sequencer-w95/
├── index.html              # Main HTML file
├── style.css              # Windows 95 styling
├── app.js                 # Sequencer logic
├── tests/
│   ├── sequencer.test.js   # Unit tests
│   └── test.html          # Browser test runner
├── README.md              # This file
└── LICENSE                # MIT License
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Windows 95 design inspiration
- Web Audio API documentation
- The lo-fi hip hop community

## 🎧 Tips for Great Lo-Fi Beats

1. **Keep it simple** - Start with just a kick and snare pattern
2. **Use space** - Leave gaps for the groove to breathe
3. **Add swing** - The 4/4 grid creates a straight beat; experiment with off-beat hi-hats
4. **Layer chords** - Add sparse chord hits for harmonic depth
5. **Experiment with tempo** - 75-90 BPM is the sweet spot for lo-fi

## 📧 Contact

For questions or feedback, open an issue on GitHub.

---

Made with ❤️ and vintage computing vibes
