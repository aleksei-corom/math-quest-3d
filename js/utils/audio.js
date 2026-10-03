// Sistema de audio del juego
const AudioSystem = {
    sounds: {},
    enabled: true,
    volume: 0.5,
    
    init() {
        // Crear sonidos con Web Audio API (sin archivos externos)
        this.sounds = {
            click: this.createBeep(800, 0.1),
            correct: this.createBeep(1000, 0.2, 'sine'),
            wrong: this.createBeep(200, 0.3, 'sawtooth'),
            pickup: this.createBeep(600, 0.15),
            levelUp: this.createMelody([523, 659, 784, 1047], 0.15),
            victory: this.createMelody([523, 659, 784, 1047, 1319], 0.2),
            footstep: this.createFootstep()
        };
    },
    
    createFootstep() {
        return () => {
            if (!this.enabled) return;
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const bufferSize = ctx.sampleRate * 0.06;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            
            // Ruido filtrado para simular paso suave
            for (let i = 0; i < bufferSize; i++) {
                const t = i / bufferSize;
                data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 30) * 0.3;
            }
            
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 400 + Math.random() * 200;
            
            const gain = ctx.createGain();
            gain.gain.value = this.volume * 0.15;
            
            source.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            source.start();
        };
    },
    
    createBeep(freq, duration, type = 'square') {
        return () => {
            if (!this.enabled) return;
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = type;
            osc.frequency.value = freq;
            gain.gain.value = this.volume;
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start();
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
            osc.stop(ctx.currentTime + duration);
        };
    },
    
    createMelody(freqs, noteDuration) {
        return () => {
            if (!this.enabled) return;
            freqs.forEach((freq, i) => {
                setTimeout(() => {
                    this.createBeep(freq, noteDuration, 'sine')();
                }, i * noteDuration * 1000);
            });
        };
    },
    
    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    },
    
    // Reproducir música de fondo
    playBGM() {
        if (!this.bgm) {
            this.bgm = new Audio('assets/gamer_music.mp3');
            this.bgm.loop = true;
            this.bgm.volume = this.volume * 0.5; // Música un poco más baja
        }
        
        if (this.enabled) {
            // Manejar la promesa de reproducción (política de autoplay de navegadores)
            const playPromise = this.bgm.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("No se pudo auto-reproducir el audio: ", error);
                });
            }
        }
    },
    
    stopBGM() {
        if (this.bgm) {
            this.bgm.pause();
            this.bgm.currentTime = 0;
        }
    },
    
    toggle() {
        this.enabled = !this.enabled;
        if (this.bgm) {
            if (this.enabled) {
                this.bgm.play().catch(e => console.log(e));
            } else {
                this.bgm.pause();
            }
        }
        return this.enabled;
    },
    
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        if (this.bgm) {
            this.bgm.volume = this.volume * 0.5;
        }
    }
};

window.AudioSystem = AudioSystem;