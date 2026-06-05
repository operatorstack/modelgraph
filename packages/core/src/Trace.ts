import type { TraceStep } from "./types.js";

/**
 * A small mutable recorder for building up a trace during a graph run. The
 * trace exposes every intermediate state so a run is fully inspectable.
 */
export class TraceRecorder {
  private readonly steps: TraceStep[] = [];

  /** Record a completed transform step. */
  record(step: TraceStep): void {
    this.steps.push(step);
  }

  /** Return an immutable snapshot of the recorded steps, in order. */
  toArray(): TraceStep[] {
    return [...this.steps];
  }

  /** Number of recorded steps. */
  get length(): number {
    return this.steps.length;
  }
}

/** Build a {@link TraceStep} from its parts. */
export function createTraceStep(params: {
  transformId: string;
  transformName: string;
  input: unknown;
  output: unknown;
  startedAt: number;
  finishedAt: number;
}): TraceStep {
  return {
    transformId: params.transformId,
    transformName: params.transformName,
    input: params.input,
    output: params.output,
    startedAt: params.startedAt,
    finishedAt: params.finishedAt,
  };
}
