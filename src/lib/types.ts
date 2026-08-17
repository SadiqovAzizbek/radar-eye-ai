// Shared data contracts. These mirror the future backend / WebSocket payloads
// so the UI never depends on how the data is produced.

export type SignalStrength = "NONE" | "LOW" | "MEDIUM" | "HIGH";
export type SourceKind = "SIM" | "SDR";

/** GET /api/status  — also the WebSocket "status" frame */
export interface StatusFrame {
  timestamp: string;
  signal_detected: boolean;
  confidence: number; // 0..1
  signal_strength: SignalStrength;
  direction: number | null; // bearing in degrees, null when unknown
  source: SourceKind;
  band: string; // e.g. "2.4 GHz"
}

/** GET /api/detections */
export interface DetectionRecord {
  id: string;
  timestamp: string;
  confidence: number;
  signal_strength: SignalStrength;
  band: string;
  direction: number | null;
  classification: string;
  source: SourceKind;
}

/** GET /api/spectrum */
export interface SpectrumFrame {
  timestamp: string;
  start_mhz: number;
  stop_mhz: number;
  bins: number[]; // dBm values, low..high frequency
  noise_floor: number;
  source: SourceKind;
}

/** GET /api/system */
export interface SystemFrame {
  timestamp: string;
  mode: "SIMULATION" | "LIVE";
  uptime_s: number;
  cpu_load: number; // 0..1
  battery: number; // 0..1
  temperature_c: number;
  link_latency_ms: number;
  sdr_connected: boolean;
  services: { name: string; status: "OK" | "DEGRADED" | "OFFLINE"; detail: string }[];
}

export interface Snapshot {
  status: StatusFrame;
  spectrum: SpectrumFrame;
  system: SystemFrame;
  detections: DetectionRecord[];
}

/**
 * Any data provider must satisfy this. `simulationService` implements it today;
 * a `backendService` (REST + WebSocket) can replace it without UI changes.
 */
export interface DataService {
  readonly name: string;
  start(): void;
  stop(): void;
  isRunning(): boolean;
  setThreshold(t: number): void;
  getStatus(): Promise<StatusFrame>;
  getSpectrum(): Promise<SpectrumFrame>;
  getSystem(): Promise<SystemFrame>;
  getDetections(): Promise<DetectionRecord[]>;
  /** Push channel — stands in for the future WebSocket subscription. */
  subscribe(listener: (snapshot: Snapshot) => void): () => void;
}
