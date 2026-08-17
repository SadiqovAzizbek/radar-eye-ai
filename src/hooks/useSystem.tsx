import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { dataService } from "@/lib/dataService";
import type { Snapshot } from "@/lib/types";

export interface Settings {
  audioAlerts: boolean;
  visualAlerts: boolean;
  threshold: number; // 0..1
  simulationMode: boolean;
  darkMode: boolean;
}

const DEFAULTS: Settings = {
  audioAlerts: false,
  visualAlerts: true,
  threshold: 0.6,
  simulationMode: true,
  darkMode: true,
};

const STORAGE_KEY = "smart-helmet.settings";

interface SystemContextValue {
  snapshot: Snapshot | null;
  running: boolean;
  start: () => void;
  stop: () => void;
  toggle: () => void;
  settings: Settings;
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  serviceName: string;
  alertFlash: boolean;
}

const SystemContext = createContext<SystemContextValue | null>(null);

function beep() {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = 880;
    gain.gain.value = 0.05;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
    osc.onended = () => void ctx.close();
  } catch {
    /* audio unavailable */
  }
}

export function SystemProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [running, setRunning] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [alertFlash, setAlertFlash] = useState(false);
  const wasDetected = useRef(false);

  // load persisted settings after hydration
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings({ ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
    document.documentElement.classList.toggle("dark", settings.darkMode);
    dataService.setThreshold(settings.threshold);
  }, [settings]);

  useEffect(() => dataService.subscribe(setSnapshot), []);

  // alerting on detection edge
  useEffect(() => {
    const detected = snapshot?.status.signal_detected ?? false;
    if (detected && !wasDetected.current) {
      if (settings.audioAlerts) beep();
      if (settings.visualAlerts) {
        setAlertFlash(true);
        setTimeout(() => setAlertFlash(false), 900);
      }
    }
    wasDetected.current = detected;
  }, [snapshot, settings.audioAlerts, settings.visualAlerts]);

  const start = useCallback(() => {
    dataService.start();
    setRunning(true);
  }, []);
  const stop = useCallback(() => {
    dataService.stop();
    setRunning(false);
  }, []);
  const toggle = useCallback(() => {
    if (dataService.isRunning()) stop();
    else start();
  }, [start, stop]);

  const setSetting = useCallback(
    <K extends keyof Settings>(key: K, value: Settings[K]) =>
      setSettings((s) => ({ ...s, [key]: value })),
    [],
  );

  const value = useMemo<SystemContextValue>(
    () => ({
      snapshot,
      running,
      start,
      stop,
      toggle,
      settings,
      setSetting,
      serviceName: dataService.name,
      alertFlash,
    }),
    [snapshot, running, start, stop, toggle, settings, setSetting, alertFlash],
  );

  return <SystemContext.Provider value={value}>{children}</SystemContext.Provider>;
}

export function useSystem() {
  const ctx = useContext(SystemContext);
  if (!ctx) throw new Error("useSystem must be used inside SystemProvider");
  return ctx;
}
