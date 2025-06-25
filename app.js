// FocusFlow - AI-Powered Focus Music Generator
class FocusFlowApp {
    constructor() {
        this.audioContext = null;
        this.masterGainNode = null;
        this.reverbNode = null;
        this.highPassFilter = null;
        this.lowPassFilter = null;
        this.activeSounds = new Map();
        this.currentPreset = null;
        this.isPlaying = false;
        this.timer = {
            isActive: false,
            isPaused: false,
            duration: 25 * 60, // 25 minutes in seconds
            remaining: 25 * 60,
            interval: null
        };
        this.stats = {
            totalFocusTime: 0,
            sessionsCompleted: 0,
            distractionCount: 0
        };
        this.visualizer = {
            canvas: null,
            ctx: null,
            analyser: null,
            animationId: null
        };
        
        this.soundData = {
            "sound_categories": [
                {
                    "id": "ambient",
                    "name": "Ambient Tones",
                    "sounds": [
                        {"id": "white_noise", "name": "White Noise", "frequency": 200},
                        {"id": "brown_noise", "name": "Brown Noise", "frequency": 100},
                        {"id": "pink_noise", "name": "Pink Noise", "frequency": 150},
                        {"id": "ambient_drone", "name": "Ambient Drone", "frequency": 80}
                    ]
                },
                {
                    "id": "nature",
                    "name": "Nature Sounds",
                    "sounds": [
                        {"id": "rain", "name": "Gentle Rain", "frequency": 180},
                        {"id": "forest", "name": "Forest Ambience", "frequency": 120},
                        {"id": "ocean", "name": "Ocean Waves", "frequency": 90},
                        {"id": "thunder", "name": "Distant Thunder", "frequency": 60},
                        {"id": "birds", "name": "Forest Birds", "frequency": 300},
                        {"id": "wind", "name": "Gentle Wind", "frequency": 150}
                    ]
                },
                {
                    "id": "urban",
                    "name": "Urban Ambience",
                    "sounds": [
                        {"id": "coffee_shop", "name": "Coffee Shop", "frequency": 200},
                        {"id": "library", "name": "Library Whispers", "frequency": 80},
                        {"id": "traffic", "name": "Gentle Traffic", "frequency": 110}
                    ]
                },
                {
                    "id": "instrumental",
                    "name": "Instrumental",
                    "sounds": [
                        {"id": "piano", "name": "Lo-fi Piano", "frequency": 220},
                        {"id": "guitar", "name": "Ambient Guitar", "frequency": 180},
                        {"id": "synth", "name": "Soft Synth Pads", "frequency": 160}
                    ]
                }
            ],
            "presets": [
                {
                    "id": "deep_focus",
                    "name": "Deep Focus",
                    "description": "Minimal, drone-based sounds for intense concentration",
                    "sounds": {
                        "brown_noise": 0.3,
                        "ambient_drone": 0.2,
                        "synth": 0.1
                    },
                    "tempo": 70,
                    "reverb": 0.2
                },
                {
                    "id": "creative_flow",
                    "name": "Creative Flow",
                    "description": "Nature sounds with soft instruments for creative work",
                    "sounds": {
                        "forest": 0.4,
                        "piano": 0.3,
                        "wind": 0.2,
                        "guitar": 0.2
                    },
                    "tempo": 85,
                    "reverb": 0.4
                },
                {
                    "id": "morning_energy",
                    "name": "Morning Energy",
                    "description": "Brighter sounds to energize your morning routine",
                    "sounds": {
                        "birds": 0.3,
                        "piano": 0.4,
                        "pink_noise": 0.2
                    },
                    "tempo": 95,
                    "reverb": 0.3
                },
                {
                    "id": "study_session",
                    "name": "Study Session",
                    "description": "Steady, non-distracting sounds for learning",
                    "sounds": {
                        "library": 0.3,
                        "white_noise": 0.3,
                        "rain": 0.2
                    },
                    "tempo": 75,
                    "reverb": 0.1
                },
                {
                    "id": "meditation",
                    "name": "Meditation",
                    "description": "Minimal, calming sounds for mindfulness",
                    "sounds": {
                        "ocean": 0.4,
                        "ambient_drone": 0.1,
                        "wind": 0.2
                    },
                    "tempo": 60,
                    "reverb": 0.5
                },
                {
                    "id": "coding_zone",
                    "name": "Coding Zone",
                    "description": "Structured, rhythmic sounds for programming",
                    "sounds": {
                        "coffee_shop": 0.2,
                        "synth": 0.3,
                        "brown_noise": 0.2,
                        "piano": 0.1
                    },
                    "tempo": 80,
                    "reverb": 0.2
                }
            ],
            "pricing_tiers": [
                {
                    "name": "Free",
                    "price": "$0/month",
                    "features": [
                        "Basic sound library",
                        "Simple presets",
                        "Basic timer",
                        "Session tracking"
                    ]
                },
                {
                    "name": "Focus Pro",
                    "price": "$8/month",
                    "features": [
                        "All Free features",
                        "Premium sound library",
                        "AI recommendations",
                        "Advanced analytics",
                        "Custom presets",
                        "Export session data"
                    ]
                },
                {
                    "name": "Team",
                    "price": "$5/user/month",
                    "features": [
                        "All Focus Pro features",
                        "Team analytics",
                        "Shared presets",
                        "Admin dashboard",
                        "Priority support"
                    ]
                }
            ]
        };

        this.init();
    }

    async init() {
        await this.initAudio();
        this.initVisualizer();
        this.renderSoundCategories();
        this.renderPresets();
        this.renderPricingTiers();
        this.setupEventListeners();
        this.updateStats();
        this.generateAIRecommendation();
        
        // Start with a default preset
        this.applyPreset(this.soundData.presets[0]);
    }

    async initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create master gain node
            this.masterGainNode = this.audioContext.createGain();
            this.masterGainNode.gain.value = 0.5;
            
            // Create reverb node
            await this.createReverbNode();
            
            // Create filters
            this.createFilters();
            
            // Connect audio chain
            this.masterGainNode.connect(this.reverbNode);
            this.reverbNode.connect(this.highPassFilter);
            this.highPassFilter.connect(this.lowPassFilter);
            this.lowPassFilter.connect(this.audioContext.destination);
            
        } catch (error) {
            console.error('Failed to initialize audio:', error);
        }
    }

    async createReverbNode() {
        const convolver = this.audioContext.createConvolver();
        const impulseResponse = await this.createImpulseResponse(2, 2, false);
        convolver.buffer = impulseResponse;
        
        this.reverbNode = this.audioContext.createGain();
        const dryGain = this.audioContext.createGain();
        const wetGain = this.audioContext.createGain();
        
        dryGain.gain.value = 0.8;
        wetGain.gain.value = 0.2;
        
        // Dry path
        this.reverbNode.connect(dryGain);
        
        // Wet path
        this.reverbNode.connect(convolver);
        convolver.connect(wetGain);
        
        // Mix both paths
        const mixNode = this.audioContext.createGain();
        dryGain.connect(mixNode);
        wetGain.connect(mixNode);
        
        this.reverbNode = mixNode;
    }

    createImpulseResponse(duration, decay, reverse) {
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * duration;
        const impulse = this.audioContext.createBuffer(2, length, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                const n = reverse ? length - i : i;
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
            }
        }
        
        return impulse;
    }

    createFilters() {
        this.highPassFilter = this.audioContext.createBiquadFilter();
        this.highPassFilter.type = 'highpass';
        this.highPassFilter.frequency.value = 100;
        
        this.lowPassFilter = this.audioContext.createBiquadFilter();
        this.lowPassFilter.type = 'lowpass';
        this.lowPassFilter.frequency.value = 8000;
    }

    generateSound(soundId, frequency) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const noiseNode = this.audioContext.createBufferSource();
        
        switch (soundId) {
            case 'white_noise':
                noiseNode.buffer = this.createNoiseBuffer('white');
                noiseNode.loop = true;
                noiseNode.connect(gainNode);
                noiseNode.start();
                break;
            case 'brown_noise':
                noiseNode.buffer = this.createNoiseBuffer('brown');
                noiseNode.loop = true;
                noiseNode.connect(gainNode);
                noiseNode.start();
                break;
            case 'pink_noise':
                noiseNode.buffer = this.createNoiseBuffer('pink');
                noiseNode.loop = true;
                noiseNode.connect(gainNode);
                noiseNode.start();
                break;
            case 'ambient_drone':
                oscillator.type = 'sine';
                oscillator.frequency.value = frequency;
                oscillator.connect(gainNode);
                oscillator.start();
                break;
            case 'rain':
            case 'forest':
            case 'ocean':
            case 'thunder':
            case 'wind':
                noiseNode.buffer = this.createFilteredNoise(soundId, frequency);
                noiseNode.loop = true;
                noiseNode.connect(gainNode);
                noiseNode.start();
                break;
            case 'birds':
                // Multiple oscillators for bird sounds
                for (let i = 0; i < 3; i++) {
                    const birdOsc = this.audioContext.createOscillator();
                    birdOsc.type = 'sine';
                    birdOsc.frequency.value = frequency + (Math.random() * 200 - 100);
                    birdOsc.connect(gainNode);
                    birdOsc.start();
                    
                    // Frequency modulation for chirping effect
                    const lfo = this.audioContext.createOscillator();
                    const lfoGain = this.audioContext.createGain();
                    lfo.frequency.value = 0.1 + Math.random() * 0.5;
                    lfo.type = 'sine';
                    lfoGain.gain.value = 50;
                    lfo.connect(lfoGain);
                    lfoGain.connect(birdOsc.frequency);
                    lfo.start();
                }
                break;
            default:
                // Default to sine wave for other sounds
                oscillator.type = 'sine';
                oscillator.frequency.value = frequency;
                oscillator.connect(gainNode);
                oscillator.start();
                break;
        }
        
        gainNode.gain.value = 0;
        gainNode.connect(this.masterGainNode);
        
        return { gainNode, oscillator, noiseNode };
    }

    createNoiseBuffer(type) {
        const bufferSize = this.audioContext.sampleRate * 2;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        let b0, b1, b2, b3, b4, b5, b6;
        b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
        
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            
            switch (type) {
                case 'white':
                    output[i] = white * 0.3;
                    break;
                case 'brown':
                    b0 = 0.99886 * b0 + white * 0.0555179;
                    output[i] = b0 * 3.5;
                    break;
                case 'pink':
                    b0 = 0.99765 * b0 + white * 0.0990460;
                    b1 = 0.96300 * b1 + white * 0.2965164;
                    b2 = 0.57000 * b2 + white * 1.0526913;
                    output[i] = (b0 + b1 + b2 + white * 0.1848) * 0.11;
                    break;
            }
        }
        
        return buffer;
    }

    createFilteredNoise(soundType, frequency) {
        const bufferSize = this.audioContext.sampleRate * 2;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            let sample = Math.random() * 2 - 1;
            
            // Apply different filtering based on sound type
            switch (soundType) {
                case 'rain':
                    sample = sample * 0.7 * (1 + Math.sin(i * 0.01) * 0.3);
                    break;
                case 'ocean':
                    sample = sample * 0.5 * (1 + Math.sin(i * 0.001) * 0.5);
                    break;
                case 'forest':
                    sample = sample * 0.4 * (1 + Math.sin(i * 0.005) * 0.2);
                    break;
                default:
                    sample = sample * 0.3;
            }
            
            output[i] = sample;
        }
        
        return buffer;
    }

    initVisualizer() {
        this.visualizer.canvas = document.getElementById('visualizer');
        this.visualizer.ctx = this.visualizer.canvas.getContext('2d');
        
        if (this.audioContext) {
            this.visualizer.analyser = this.audioContext.createAnalyser();
            this.visualizer.analyser.fftSize = 256;
            this.masterGainNode.connect(this.visualizer.analyser);
            this.startVisualizer();
        }
    }

    startVisualizer() {
        const draw = () => {
            if (!this.isPlaying) {
                this.visualizer.animationId = requestAnimationFrame(draw);
                this.drawStaticVisualizer();
                return;
            }

            const bufferLength = this.visualizer.analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            this.visualizer.analyser.getByteFrequencyData(dataArray);
            
            const canvas = this.visualizer.canvas;
            const ctx = this.visualizer.ctx;
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = 100;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw circular visualizer
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            for (let i = 0; i < bufferLength; i++) {
                const angle = (i / bufferLength) * 2 * Math.PI;
                const amplitude = dataArray[i] / 255;
                const x = centerX + Math.cos(angle) * (radius + amplitude * 30);
                const y = centerY + Math.sin(angle) * (radius + amplitude * 30);
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.closePath();
            ctx.stroke();
            
            // Add glow effect
            ctx.shadowColor = '#3b82f6';
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.shadowBlur = 0;
            
            this.visualizer.animationId = requestAnimationFrame(draw);
        };
        
        draw();
    }

    drawStaticVisualizer() {
        const canvas = this.visualizer.canvas;
        const ctx = this.visualizer.ctx;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 100;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw static circle
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();
    }

    renderSoundCategories() {
        const container = document.getElementById('soundCategories');
        container.innerHTML = '';
        
        this.soundData.sound_categories.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'sound-category';
            
            categoryDiv.innerHTML = `
                <div class="category-header">${category.name}</div>
                ${category.sounds.map(sound => `
                    <div class="sound-item" data-sound-id="${sound.id}">
                        <div class="sound-info">
                            <button class="sound-toggle" data-sound-id="${sound.id}"></button>
                            <span class="sound-name">${sound.name}</span>
                        </div>
                        <div class="sound-controls">
                            <input type="range" class="sound-volume volume-slider" 
                                   data-sound-id="${sound.id}" min="0" max="100" value="0">
                        </div>
                    </div>
                `).join('')}
            `;
            
            container.appendChild(categoryDiv);
        });
    }

    renderPresets() {
        const container = document.getElementById('presetGrid');
        container.innerHTML = '';
        
        this.soundData.presets.forEach(preset => {
            const presetDiv = document.createElement('div');
            presetDiv.className = 'preset-card';
            presetDiv.dataset.presetId = preset.id;
            
            presetDiv.innerHTML = `
                <div class="preset-name">${preset.name}</div>
                <div class="preset-description">${preset.description}</div>
            `;
            
            container.appendChild(presetDiv);
        });
    }

    renderPricingTiers() {
        const container = document.getElementById('pricingTiers');
        container.innerHTML = '';
        
        this.soundData.pricing_tiers.forEach((tier, index) => {
            const tierDiv = document.createElement('div');
            tierDiv.className = `pricing-tier ${index === 1 ? 'featured' : ''}`;
            
            tierDiv.innerHTML = `
                <div class="tier-name">${tier.name}</div>
                <div class="tier-price">${tier.price}</div>
                <ul class="tier-features">
                    ${tier.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
                <button class="btn btn--primary btn--full-width">
                    ${tier.name === 'Free' ? 'Current Plan' : 'Choose Plan'}
                </button>
            `;
            
            container.appendChild(tierDiv);
        });
    }

    setupEventListeners() {
        // Master play/pause
        document.getElementById('masterPlayBtn').addEventListener('click', () => {
            this.togglePlayPause();
        });
        
        // Master volume
        document.getElementById('masterVolume').addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            this.masterGainNode.gain.value = volume;
            document.querySelector('.volume-value').textContent = `${e.target.value}%`;
        });
        
        // Sound toggles and volumes
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('sound-toggle')) {
                this.toggleSound(e.target.dataset.soundId);
            }
        });
        
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('sound-volume')) {
                this.adjustSoundVolume(e.target.dataset.soundId, e.target.value / 100);
            }
        });
        
        // Presets
        document.addEventListener('click', (e) => {
            if (e.target.closest('.preset-card')) {
                const presetId = e.target.closest('.preset-card').dataset.presetId;
                const preset = this.soundData.presets.find(p => p.id === presetId);
                this.applyPreset(preset);
            }
        });
        
        // Timer controls
        document.getElementById('startTimerBtn').addEventListener('click', () => {
            this.startTimer();
        });
        
        document.getElementById('pauseTimerBtn').addEventListener('click', () => {
            this.pauseTimer();
        });
        
        document.getElementById('resetTimerBtn').addEventListener('click', () => {
            this.resetTimer();
        });
        
        document.getElementById('sessionType').addEventListener('change', (e) => {
            const duration = parseInt(e.target.value);
            this.timer.duration = duration * 60;
            this.timer.remaining = duration * 60;
            this.updateTimerDisplay();
        });
        
        // Distraction tracking
        document.getElementById('distractionBtn').addEventListener('click', () => {
            this.stats.distractionCount++;
            this.updateStats();
        });
        
        // Settings modal
        document.getElementById('settingsBtn').addEventListener('click', () => {
            document.getElementById('settingsModal').classList.remove('hidden');
        });
        
        document.getElementById('closeSettingsBtn').addEventListener('click', () => {
            document.getElementById('settingsModal').classList.add('hidden');
        });
        
        // Upgrade modal
        document.getElementById('upgradeBtn').addEventListener('click', () => {
            document.getElementById('upgradeModal').classList.remove('hidden');
        });
        
        document.getElementById('closeUpgradeBtn').addEventListener('click', () => {
            document.getElementById('upgradeModal').classList.add('hidden');
        });
        
        // Audio settings
        document.getElementById('reverbSlider').addEventListener('input', (e) => {
            // Reverb adjustment would be implemented here
        });
        
        document.getElementById('tempoSlider').addEventListener('input', (e) => {
            document.getElementById('tempoValue').textContent = `${e.target.value} BPM`;
        });
        
        document.getElementById('highPassSlider').addEventListener('input', (e) => {
            this.highPassFilter.frequency.value = e.target.value;
        });
        
        document.getElementById('lowPassSlider').addEventListener('input', (e) => {
            this.lowPassFilter.frequency.value = e.target.value;
        });
        
        // AI recommendation
        document.getElementById('applyRecommendationBtn').addEventListener('click', () => {
            // Apply the recommended preset
            const recommendedPreset = this.soundData.presets[Math.floor(Math.random() * this.soundData.presets.length)];
            this.applyPreset(recommendedPreset);
        });
        
        // Close modals on backdrop click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.add('hidden');
            }
        });
    }

    togglePlayPause() {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        this.isPlaying = !this.isPlaying;
        
        const playIcon = document.querySelector('.play-icon');
        const pauseIcon = document.querySelector('.pause-icon');
        
        if (this.isPlaying) {
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
        } else {
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
        }
        
        // Update all active sounds
        this.activeSounds.forEach((sound, soundId) => {
            if (this.isPlaying) {
                sound.gainNode.gain.setTargetAtTime(sound.volume || 0.3, this.audioContext.currentTime, 0.1);
            } else {
                sound.gainNode.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.1);
            }
        });
    }

    toggleSound(soundId) {
        const toggle = document.querySelector(`[data-sound-id="${soundId}"].sound-toggle`);
        const volumeSlider = document.querySelector(`[data-sound-id="${soundId}"].sound-volume`);
        const soundItem = document.querySelector(`[data-sound-id="${soundId}"].sound-item`);
        
        if (this.activeSounds.has(soundId)) {
            // Stop sound
            const sound = this.activeSounds.get(soundId);
            sound.gainNode.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.1);
            setTimeout(() => {
                if (sound.oscillator) sound.oscillator.stop();
                if (sound.noiseNode) sound.noiseNode.stop();
            }, 100);
            
            this.activeSounds.delete(soundId);
            toggle.classList.remove('active');
            soundItem.classList.remove('active');
            volumeSlider.value = 0;
        } else {
            // Start sound
            const soundInfo = this.findSoundInfo(soundId);
            if (soundInfo) {
                const sound = this.generateSound(soundId, soundInfo.frequency);
                sound.volume = 0.3;
                this.activeSounds.set(soundId, sound);
                
                if (this.isPlaying) {
                    sound.gainNode.gain.setTargetAtTime(sound.volume, this.audioContext.currentTime, 0.1);
                }
                
                toggle.classList.add('active');
                soundItem.classList.add('active');
                volumeSlider.value = 30;
            }
        }
    }

    adjustSoundVolume(soundId, volume) {
        if (this.activeSounds.has(soundId)) {
            const sound = this.activeSounds.get(soundId);
            sound.volume = volume;
            if (this.isPlaying) {
                sound.gainNode.gain.setTargetAtTime(volume, this.audioContext.currentTime, 0.1);
            }
        }
    }

    findSoundInfo(soundId) {
        for (const category of this.soundData.sound_categories) {
            const sound = category.sounds.find(s => s.id === soundId);
            if (sound) return sound;
        }
        return null;
    }

    applyPreset(preset) {
        // Clear current sounds
        this.activeSounds.forEach((sound, soundId) => {
            const toggle = document.querySelector(`[data-sound-id="${soundId}"].sound-toggle`);
            const soundItem = document.querySelector(`[data-sound-id="${soundId}"].sound-item`);
            const volumeSlider = document.querySelector(`[data-sound-id="${soundId}"].sound-volume`);
            
            if (sound.oscillator) sound.oscillator.stop();
            if (sound.noiseNode) sound.noiseNode.stop();
            
            toggle.classList.remove('active');
            soundItem.classList.remove('active');
            volumeSlider.value = 0;
        });
        this.activeSounds.clear();
        
        // Apply preset sounds
        Object.entries(preset.sounds).forEach(([soundId, volume]) => {
            const soundInfo = this.findSoundInfo(soundId);
            if (soundInfo) {
                const sound = this.generateSound(soundId, soundInfo.frequency);
                sound.volume = volume;
                this.activeSounds.set(soundId, sound);
                
                const toggle = document.querySelector(`[data-sound-id="${soundId}"].sound-toggle`);
                const soundItem = document.querySelector(`[data-sound-id="${soundId}"].sound-item`);
                const volumeSlider = document.querySelector(`[data-sound-id="${soundId}"].sound-volume`);
                
                toggle.classList.add('active');
                soundItem.classList.add('active');
                volumeSlider.value = volume * 100;
                
                if (this.isPlaying) {
                    sound.gainNode.gain.setTargetAtTime(volume, this.audioContext.currentTime, 0.1);
                }
            }
        });
        
        // Update UI
        document.querySelectorAll('.preset-card').forEach(card => {
            card.classList.remove('active');
        });
        document.querySelector(`[data-preset-id="${preset.id}"]`).classList.add('active');
        
        this.currentPreset = preset;
    }

    startTimer() {
        if (this.timer.isActive) return;
        
        this.timer.isActive = true;
        this.timer.isPaused = false;
        
        document.getElementById('startTimerBtn').classList.add('hidden');
        document.getElementById('pauseTimerBtn').classList.remove('hidden');
        
        this.timer.interval = setInterval(() => {
            if (!this.timer.isPaused) {
                this.timer.remaining--;
                this.updateTimerDisplay();
                this.updateTimerProgress();
                
                if (this.timer.remaining <= 0) {
                    this.completeSession();
                }
            }
        }, 1000);
    }

    pauseTimer() {
        this.timer.isPaused = !this.timer.isPaused;
        
        const pauseBtn = document.getElementById('pauseTimerBtn');
        pauseBtn.textContent = this.timer.isPaused ? 'Resume' : 'Pause';
    }

    resetTimer() {
        this.timer.isActive = false;
        this.timer.isPaused = false;
        this.timer.remaining = this.timer.duration;
        
        if (this.timer.interval) {
            clearInterval(this.timer.interval);
        }
        
        document.getElementById('startTimerBtn').classList.remove('hidden');
        document.getElementById('pauseTimerBtn').classList.add('hidden');
        document.getElementById('pauseTimerBtn').textContent = 'Pause';
        
        this.updateTimerDisplay();
        this.updateTimerProgress();
    }

    completeSession() {
        this.resetTimer();
        this.stats.sessionsCompleted++;
        this.stats.totalFocusTime += this.timer.duration / 60; // Convert to minutes
        this.updateStats();
        
        // Show completion notification
        alert('Focus session completed! Great work!');
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timer.remaining / 60);
        const seconds = this.timer.remaining % 60;
        document.getElementById('timerDisplay').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateTimerProgress() {
        const progress = (this.timer.duration - this.timer.remaining) / this.timer.duration;
        const circumference = 2 * Math.PI * 50; // radius is 50
        const offset = circumference - (progress * circumference);
        
        document.querySelector('.progress-circle').style.strokeDashoffset = offset;
    }

    updateStats() {
        const hours = Math.floor(this.stats.totalFocusTime / 60);
        const minutes = this.stats.totalFocusTime % 60;
        
        document.getElementById('totalFocusTime').textContent = `${hours}h ${Math.floor(minutes)}m`;
        document.getElementById('sessionsCompleted').textContent = this.stats.sessionsCompleted;
        document.getElementById('distractionCount').textContent = this.stats.distractionCount;
    }

    generateAIRecommendation() {
        const recommendations = [
            "Based on your focus patterns, try the 'Deep Focus' preset for optimal concentration.",
            "Your best focus time appears to be in the morning. Consider using 'Morning Energy' preset.",
            "You've had great success with nature sounds. Try the 'Creative Flow' preset today.",
            "Your distraction count is low today! The 'Coding Zone' preset might help maintain this focus.",
            "Consider taking a short break every 45 minutes for optimal productivity.",
            "Your session completion rate is excellent. Try extending to 90-minute sessions for deep work."
        ];
        
        const randomRecommendation = recommendations[Math.floor(Math.random() * recommendations.length)];
        document.querySelector('#aiRecommendation p').textContent = randomRecommendation;
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FocusFlowApp();
});