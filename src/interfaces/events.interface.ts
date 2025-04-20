import { AnalysisResult } from './analysis.interface';

// Event handler type with proper typing for event data
export type StateEventHandler<T = unknown> = (data?: T) => void;

// Define the available event types with their data types
export type StateEventMap = {
  'analysis:completed': AnalysisResult;
  'analysis:error': Error;
  'analysis:started': void;
  'options:changed': Record<string, unknown>;
  'panel:visibility-changed': boolean;
};

// Type for the event name
export type StateEventType = keyof StateEventMap;
