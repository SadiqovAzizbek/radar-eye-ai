import type {
  DataService,
  DetectionRecord,
  SignalStrength,
  Snapshot,
  SpectrumFrame,
  StatusFrame,
  SystemFrame,
} from "./types";

const BINS = 96;
const START_MHZ = 2400;
const STOP_MHZ = 2483;
const NOISE_FLOOR = -92;
const TICK_MS = 400;

const CLASSES = [
  "FPV VIDEO DOWNLINK",
  "CONTROL UPLINK (FHSS)",
  "TELEMETRY BURST",
  "UNKNOWN EMITTER",
];

function strengthFor(peak: number): SignalStrength {
  if (peak < -80) return "NONE";
  if (peak < -68) return "LOW";
  if (peak < -52) return "MEDIUM";
  return "HIGH";
}

function rid() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

/**
 * Deterministic-enough RF simulator. Produces the exact frames the real
 * SDR pipeline will emit. No hardware, no browser radio access.
 */
class SimulationService implements DataService {
  readonly name = "simulationService";

  private running = false;
  private timer: ReturnType<typeof setInterval> | null = null;
  private listeners = new Set<(s: Snapshot) => void>();
  private threshold = 0.6;
  private startedAt = Date.now();
  private tick = 0;
  private detections: DetectionRecord[] = [];
  private emitter: { center: number; width: number; power: number; life: number } | null = null;
  private bins: number[] = new Array(BINS).fill(NOISE_FLOOR);
  private status: StatusFrame = {
    timestamp: new Date().toISOString(),
    signal_detected: false,
    confidence: 0,
    signal_strength: "NONE",
    direction: null,
    source: "SIM",
    band: "2.4 GHz",
  };

  start() {
    if (this.running) return;
    this.running = true;
    this.startedAt = Date.now() - this.tick * TICK_MS;
    this.timer = setInterval(() => this.step(), TICK_MS);
    this.step();
  }

  stop() {
    this.running = false;
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.emitter = null;
    this.bins = new Array(BINS).fill(NOISE_FLOOR);
    this.status = {
      ...this.status,
      timestamp: new Date().toISOString(),
      signal_detected: false,
      confidence: 0,
      signal_strength: "NONE",
      direction: null,
    };
    this.emit();
  }

  isRunning() {
    return this.running;
  }

  setThreshold(t: number) {
    this.threshold = t;
  }

  async getStatus() {
    return this.status;
  }
  async getSpectrum() {
    return this.buildSpectrum();
  }
  async getSystem() {
    return this.buildSystem();
  }
  async getDetections() {
    return this.detections;
  }

  subscribe(listener: (s: Snapshot) => void) {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  // --- internals -----------------------------------------------------------

  private step() {
    this.tick += 1;

    if (this.emitter) {
      this.emitter.life -= 1;
      this.emitter.center += (Math.random() - 0.5) * 1.5;
      this.emitter.power += (Math.random() - 0.5) * 3;
      if (this.emitter.life <= 0) this.emitter = null;
    } else if (Math.random() < 0.07) {
      this.emitter = {
        center: START_MHZ + 8 + Math.random() * (STOP_MHZ - START_MHZ - 16),
        width: 2 + Math.random() * 7,
        power: -74 + Math.random() * 32,
        life: 12 + Math.floor(Math.random() * 40),
      };
    }

    const span = STOP_MHZ - START_MHZ;
    const next: number[] = [];
    for (let i = 0; i < BINS; i++) {
      const mhz = START_MHZ + (i / (BINS - 1)) * span;
      let v = NOISE_FLOOR + Math.random() * 6 - 3;
      if (this.emitter) {
        const d = (mhz - this.emitter.center) / this.emitter.width;
        v += (this.emitter.power - NOISE_FLOOR) * Math.exp(-d * d * 2.2);
      }
      // gentle smoothing against the previous frame
      next.push((this.bins[i] ?? NOISE_FLOOR) * 0.35 + v * 0.65);
    }
    this.bins = next;

    const peak = Math.max(...this.bins);
    const strength = strengthFor(peak);
    const rawConfidence = Math.max(0, Math.min(1, (peak - NOISE_FLOOR) / 42));
    const detected = this.emitter !== null && rawConfidence >= this.threshold;

    this.status = {
      timestamp: new Date().toISOString(),
      signal_detected: detected,
      confidence: Number(rawConfidence.toFixed(2)),
      signal_strength: detected ? strength : rawConfidence > 0.25 ? "LOW" : "NONE",
      direction: null, // requires a directional antenna array — phase 2 hardware
      source: "SIM",
      band: "2.4 GHz",
    };

    if (detected && this.tick % 6 === 0) {
      const record: DetectionRecord = {
        id: rid(),
        timestamp: this.status.timestamp,
        confidence: this.status.confidence,
        signal_strength: strength,
        band: `${(this.emitter!.center / 1000).toFixed(3)} GHz`,
        direction: null,
        classification: CLASSES[Math.floor(Math.random() * CLASSES.length)]!,
        source: "SIM",
      };
      this.detections = [record, ...this.detections].slice(0, 120);
    }

    this.emit();
  }

  private buildSpectrum(): SpectrumFrame {
    return {
      timestamp: new Date().toISOString(),
      start_mhz: START_MHZ,
      stop_mhz: STOP_MHZ,
      bins: this.bins,
      noise_floor: NOISE_FLOOR,
      source: "SIM",
    };
  }

  private buildSystem(): SystemFrame {
    const uptime = this.running ? Math.floor((Date.now() - this.startedAt) / 1000) : 0;
    return {
      timestamp: new Date().toISOString(),
      mode: "SIMULATION",
      uptime_s: uptime,
      cpu_load: this.running ? 0.24 + Math.random() * 0.22 : 0.04,
      battery: Math.max(0.12, 0.94 - uptime / 20000),
      temperature_c: 38 + (this.running ? Math.random() * 6 : 0),
      link_latency_ms: this.running ? 12 + Math.round(Math.random() * 18) : 0,
      sdr_connected: false,
      services: [
        {
          name: "SIGNAL PIPELINE",
          status: this.running ? "OK" : "OFFLINE",
          detail: this.running ? "FFT stream nominal" : "Stopped by operator",
        },
        {
          name: "AI CLASSIFIER",
          status: this.running ? "OK" : "OFFLINE",
          detail: "Model uav-rf-v0.1 (simulated inference)",
        },
        { name: "SDR RECEIVER", status: "OFFLINE", detail: "No RTL-SDR device attached" },
        { name: "HUD LINK", status: "DEGRADED", detail: "Software HUD only — no helmet display" },
        { name: "TELEMETRY API", status: "OK", detail: "/api/status • /api/detections" },
      ],
    };
  }

  private snapshot(): Snapshot {
    return {
      status: this.status,
      spectrum: this.buildSpectrum(),
      system: this.buildSystem(),
      detections: this.detections,
    };
  }

  private emit() {
    const snap = this.snapshot();
    this.listeners.forEach((l) => l(snap));
  }
}

export const simulationService: DataService = new SimulationService();
