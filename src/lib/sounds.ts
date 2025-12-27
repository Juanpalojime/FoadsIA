class SoundManager {
    private enabled: boolean = true;
    private audioContext: AudioContext | null = null;

    constructor() {
        // Read initial preference safely
        try {
            const saved = localStorage.getItem('sound_enabled');
            this.enabled = saved !== 'false';
        } catch (e) {
            this.enabled = true;
        }
    }

    public setEnabled(enabled: boolean) {
        this.enabled = enabled;
        localStorage.setItem('sound_enabled', String(enabled));
    }

    public isEnabled() {
        return this.enabled;
    }

    private initContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }

    public playSuccess() {
        if (!this.enabled) return;
        this.initContext();
        if (this.audioContext?.state === 'suspended') {
            this.audioContext.resume();
        }
        if (!this.audioContext) return;

        const t = this.audioContext.currentTime;

        // Oscilador principal (tono agradable, "ding")
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, t); // A5
        osc.frequency.exponentialRampToValueAtTime(1760, t + 0.1); // A6 (Octava arriba rápido)

        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8); // Decay largo

        osc.start(t);
        osc.stop(t + 0.8);

        // Armónico sutil
        const osc2 = this.audioContext.createOscillator();
        const gain2 = this.audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(this.audioContext.destination);
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(880 * 2, t);
        gain2.gain.setValueAtTime(0.05, t);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        osc2.start(t);
        osc2.stop(t + 0.4);
    }

    public playError() {
        if (!this.enabled) return;
        this.initContext();
        if (this.audioContext?.state === 'suspended') {
            this.audioContext.resume();
        }
        if (!this.audioContext) return;

        const t = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.linearRampToValueAtTime(100, t + 0.3);

        gain.gain.setValueAtTime(0.1, t);
        gain.gain.linearRampToValueAtTime(0.001, t + 0.3);

        osc.start(t);
        osc.stop(t + 0.3);
    }

    public playClick() {
        if (!this.enabled) return;
        this.initContext();
        if (this.audioContext?.state === 'suspended') {
            this.audioContext.resume();
        }
        if (!this.audioContext) return;

        const t = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.frequency.setValueAtTime(600, t);
        gain.gain.setValueAtTime(0.02, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

        osc.start(t);
        osc.stop(t + 0.05);
    }

    public playTransition() {
        if (!this.enabled) return;
        this.initContext();
        if (this.audioContext?.state === 'suspended') {
            this.audioContext.resume();
        }
        if (!this.audioContext) return;

        const t = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.linearRampToValueAtTime(600, t + 0.1);
        gain.gain.setValueAtTime(0.02, t);
        gain.gain.linearRampToValueAtTime(0.001, t + 0.1);

        osc.start(t);
        osc.stop(t + 0.1);
    }
}

export const soundManager = new SoundManager();
