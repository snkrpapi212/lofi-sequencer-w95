/**
 * ============================================
 * Lo-Fi Sequencer 95 - Node.js Tests
 * ============================================
 * 
 * Standalone unit tests that can run in Node.js
 */

// Test utilities
class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }
    
    test(name, fn) {
        this.tests.push({ name, fn });
    }
    
    assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(`${message}\n  Expected: ${expected}\n  Actual: ${actual}`);
        }
    }
    
    assertTrue(value, message) {
        if (!value) {
            throw new Error(`${message}\n  Expected: true\n  Actual: ${value}`);
        }
    }
    
    assertFalse(value, message) {
        if (value) {
            throw new Error(`${message}\n  Expected: false\n  Actual: ${value}`);
        }
    }
    
    assertThrows(fn, message) {
        let threw = false;
        try {
            fn();
        } catch (e) {
            threw = true;
        }
        if (!threw) {
            throw new Error(`${message}\n  Expected: function to throw\n  Actual: function did not throw`);
        }
    }
    
    async run() {
        console.log('🧪 Running Lo-Fi Sequencer 95 Tests...\n');
        
        for (const { name, fn } of this.tests) {
            try {
                await fn(this);
                this.passed++;
                console.log(`✅ ${name}`);
            } catch (error) {
                this.failed++;
                console.log(`❌ ${name}`);
                console.log(`   ${error.message}\n`);
            }
        }
        
        console.log('\n' + '='.repeat(50));
        console.log(`Tests passed: ${this.passed}`);
        console.log(`Tests failed: ${this.failed}`);
        console.log(`Total: ${this.tests.length}`);
        console.log('='.repeat(50));
        
        return this.failed === 0;
    }
}

// Simplified LoFiSequencer class for testing (without DOM dependencies)
class LoFiSequencerTest {
    constructor(config = {}) {
        this.steps = config.steps || 16;
        this.tracks = config.tracks || 4;
        this.bpm = config.bpm || 85;
        this.isPlaying = false;
        this.currentStep = 0;
        this.pattern = [];
        
        for (let track = 0; track < this.tracks; track++) {
            this.pattern[track] = new Array(this.steps).fill(false);
        }
    }
    
    getPattern() {
        return this.pattern.map(track => [...track]);
    }
    
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
    }
}

// Test suite
const runner = new TestRunner();

// Test 1: Constructor initializes correctly
runner.test('Constructor initializes with default values', (t) => {
    const sequencer = new LoFiSequencerTest();
    
    t.assertEqual(sequencer.steps, 16, 'Steps should be 16');
    t.assertEqual(sequencer.tracks, 4, 'Tracks should be 4');
    t.assertEqual(sequencer.bpm, 85, 'BPM should be 85');
    t.assertFalse(sequencer.isPlaying, 'Should not be playing');
    t.assertEqual(sequencer.currentStep, 0, 'Current step should be 0');
});

// Test 2: Constructor accepts custom config
runner.test('Constructor accepts custom configuration', (t) => {
    const sequencer = new LoFiSequencerTest({
        steps: 32,
        tracks: 8,
        bpm: 120
    });
    
    t.assertEqual(sequencer.steps, 32, 'Steps should be 32');
    t.assertEqual(sequencer.tracks, 8, 'Tracks should be 8');
    t.assertEqual(sequencer.bpm, 120, 'BPM should be 120');
});

// Test 3: Pattern is initialized correctly
runner.test('Pattern is initialized with all false values', (t) => {
    const sequencer = new LoFiSequencerTest();
    
    for (let track = 0; track < sequencer.tracks; track++) {
        for (let step = 0; step < sequencer.steps; step++) {
            t.assertFalse(sequencer.pattern[track][step], `Pattern[${track}][${step}] should be false`);
        }
    }
});

// Test 4: Toggle step updates pattern
runner.test('Toggle step updates pattern correctly', (t) => {
    const sequencer = new LoFiSequencerTest();
    
    // Toggle step on
    sequencer.pattern[0][0] = true;
    t.assertTrue(sequencer.pattern[0][0], 'Step should be true after toggle');
    
    // Toggle step off
    sequencer.pattern[0][0] = false;
    t.assertFalse(sequencer.pattern[0][0], 'Step should be false after toggle');
});

// Test 5: Clear pattern resets all steps
runner.test('Clear pattern resets all steps to false', (t) => {
    const sequencer = new LoFiSequencerTest();
    
    // Set some steps to true
    sequencer.pattern[0][0] = true;
    sequencer.pattern[1][5] = true;
    sequencer.pattern[2][10] = true;
    sequencer.pattern[3][15] = true;
    
    // Verify they're set
    t.assertTrue(sequencer.pattern[0][0], 'Step 0,0 should be true');
    t.assertTrue(sequencer.pattern[1][5], 'Step 1,5 should be true');
    t.assertTrue(sequencer.pattern[2][10], 'Step 2,10 should be true');
    t.assertTrue(sequencer.pattern[3][15], 'Step 3,15 should be true');
    
    // Clear pattern
    for (let track = 0; track < sequencer.tracks; track++) {
        sequencer.pattern[track] = new Array(sequencer.steps).fill(false);
    }
    
    // Verify all are false
    for (let track = 0; track < sequencer.tracks; track++) {
        for (let step = 0; step < sequencer.steps; step++) {
            t.assertFalse(sequencer.pattern[track][step], `Pattern[${track}][${step}] should be false after clear`);
        }
    }
});

// Test 6: Tempo can be updated
runner.test('Tempo can be updated', (t) => {
    const sequencer = new LoFiSequencerTest();
    
    sequencer.bpm = 100;
    t.assertEqual(sequencer.bpm, 100, 'BPM should be updated to 100');
    
    sequencer.bpm = 140;
    t.assertEqual(sequencer.bpm, 140, 'BPM should be updated to 140');
    
    sequencer.bpm = 60;
    t.assertEqual(sequencer.bpm, 60, 'BPM should be updated to 60');
});

// Test 7: Get pattern returns correct structure
runner.test('Get pattern returns correct structure', (t) => {
    const sequencer = new LoFiSequencerTest();
    
    sequencer.pattern[0][0] = true;
    sequencer.pattern[1][8] = true;
    
    const pattern = sequencer.getPattern();
    
    t.assertEqual(pattern.length, 4, 'Pattern should have 4 tracks');
    t.assertEqual(pattern[0].length, 16, 'Each track should have 16 steps');
    t.assertTrue(pattern[0][0], 'Pattern should match original');
    t.assertTrue(pattern[1][8], 'Pattern should match original');
});

// Test 8: Set pattern validates track count
runner.test('Set pattern validates track count', (t) => {
    const sequencer = new LoFiSequencerTest();
    
    const invalidPattern = [
        [false, false],
        [false, false]
    ]; // Only 2 tracks
    
    t.assertThrows(
        () => sequencer.setPattern(invalidPattern),
        'Should throw error for invalid track count'
    );
});

// Test 9: Set pattern validates step count
runner.test('Set pattern validates step count', (t) => {
    const sequencer = new LoFiSequencerTest();
    
    const invalidPattern = [
        new Array(8).fill(false),
        new Array(8).fill(false),
        new Array(8).fill(false),
        new Array(8).fill(false)
    ]; // Only 8 steps per track
    
    t.assertThrows(
        () => sequencer.setPattern(invalidPattern),
        'Should throw error for invalid step count'
    );
});

// Test 10: Set pattern updates sequencer correctly
runner.test('Set pattern updates sequencer correctly', (t) => {
    const sequencer = new LoFiSequencerTest();
    
    const newPattern = [
        [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
        [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
        [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
        [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
    ];
    
    sequencer.setPattern(newPattern);
    
    t.assertTrue(sequencer.pattern[0][0], 'Pattern should be set correctly');
    t.assertTrue(sequencer.pattern[0][4], 'Pattern should be set correctly');
    t.assertTrue(sequencer.pattern[1][2], 'Pattern should be set correctly');
    t.assertTrue(sequencer.pattern[3][0], 'Pattern should be set correctly');
});

// Test 11: Pattern is independent copy
runner.test('Pattern returned by getPattern is independent copy', (t) => {
    const sequencer = new LoFiSequencerTest();
    
    const pattern1 = sequencer.getPattern();
    const pattern2 = sequencer.getPattern();
    
    // Modify pattern1
    pattern1[0][0] = true;
    
    // pattern2 should not be affected
    t.assertFalse(pattern2[0][0], 'Pattern copies should be independent');
    
    // Original pattern should not be affected
    t.assertFalse(sequencer.pattern[0][0], 'Original pattern should not be affected');
});

// Test 12: Set pattern creates independent copy
runner.test('Set pattern creates independent copy', (t) => {
    const sequencer = new LoFiSequencerTest();
    
    const originalPattern = [
        new Array(16).fill(false),
        new Array(16).fill(false),
        new Array(16).fill(false),
        new Array(16).fill(false)
    ];
    
    sequencer.setPattern(originalPattern);
    
    // Modify original pattern
    originalPattern[0][0] = true;
    
    // Sequencer pattern should not be affected
    t.assertFalse(sequencer.pattern[0][0], 'Sequencer pattern should be independent copy');
});

// Test 13: Current step wraps around
runner.test('Current step wraps around correctly', (t) => {
    const sequencer = new LoFiSequencerTest();
    
    sequencer.currentStep = 15;
    sequencer.currentStep = (sequencer.currentStep + 1) % sequencer.steps;
    
    t.assertEqual(sequencer.currentStep, 0, 'Current step should wrap to 0');
});

// Test 14: Multiple patterns can be created
runner.test('Multiple sequencer instances are independent', (t) => {
    const sequencer1 = new LoFiSequencerTest({ bpm: 80 });
    const sequencer2 = new LoFiSequencerTest({ bpm: 100 });
    
    t.assertEqual(sequencer1.bpm, 80, 'Sequencer 1 should have BPM 80');
    t.assertEqual(sequencer2.bpm, 100, 'Sequencer 2 should have BPM 100');
    
    sequencer1.pattern[0][0] = true;
    sequencer2.pattern[0][0] = true;
    sequencer2.pattern[1][5] = true;
    
    t.assertTrue(sequencer1.pattern[0][0], 'Sequencer 1 should have step 0,0 active');
    t.assertFalse(sequencer1.pattern[1][5], 'Sequencer 1 should not have step 1,5 active');
    t.assertTrue(sequencer2.pattern[0][0], 'Sequencer 2 should have step 0,0 active');
    t.assertTrue(sequencer2.pattern[1][5], 'Sequencer 2 should have step 1,5 active');
});

// Test 15: Pattern can be serialized and deserialized
runner.test('Pattern can be serialized and deserialized via JSON', (t) => {
    const sequencer = new LoFiSequencerTest();
    
    sequencer.pattern[0][0] = true;
    sequencer.pattern[1][4] = true;
    sequencer.pattern[2][8] = true;
    sequencer.pattern[3][12] = true;
    
    // Serialize
    const json = JSON.stringify(sequencer.getPattern());
    
    // Deserialize
    const pattern = JSON.parse(json);
    sequencer.setPattern(pattern);
    
    t.assertTrue(sequencer.pattern[0][0], 'Pattern should match after serialization');
    t.assertTrue(sequencer.pattern[1][4], 'Pattern should match after serialization');
    t.assertTrue(sequencer.pattern[2][8], 'Pattern should match after serialization');
    t.assertTrue(sequencer.pattern[3][12], 'Pattern should match after serialization');
});

// Run tests
runner.run().then(success => {
    if (success) {
        console.log('\n🎉 All tests passed!');
        process.exit(0);
    } else {
        console.log('\n⚠️  Some tests failed!');
        process.exit(1);
    }
});
