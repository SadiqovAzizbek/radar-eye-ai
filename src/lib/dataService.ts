import { simulationService } from "./simulationService";
import type { DataService } from "./types";

/**
 * Single swap point for the whole app.
 *
 * Today: simulationService (in-browser RF simulator).
 * Later: backendService — REST (/api/status, /api/detections, /api/spectrum,
 * /api/system) plus a WebSocket push channel — implementing the same
 * DataService interface. No UI component imports the simulator directly.
 */
export const dataService: DataService = simulationService;
