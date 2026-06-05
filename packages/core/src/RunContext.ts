import type { Metadata, RunContext } from "./types.js";

/** Options accepted by {@link createRunContext}. */
export interface RunContextOptions {
  /** Provide an explicit run id; one is generated when omitted. */
  readonly runId?: string;
  readonly metadata?: Metadata;
  readonly target?: unknown;
}

/** Generate a reasonably-unique run id without external dependencies. */
function generateRunId(): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `run_${Date.now().toString(36)}_${random}`;
}

/** Create a {@link RunContext}, generating a run id when none is supplied. */
export function createRunContext(options: RunContextOptions = {}): RunContext {
  return {
    runId: options.runId ?? generateRunId(),
    metadata: options.metadata,
    target: options.target,
  };
}
