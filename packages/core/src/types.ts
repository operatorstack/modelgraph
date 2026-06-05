/**
 * Shared, dependency-free types for the Composable Model Graph core.
 *
 * These describe the generic shape:
 *   input -> transforms -> output -> evaluation -> feedback
 */

/** Arbitrary, JSON-ish metadata attached to a run. */
export type Metadata = Record<string, unknown>;

/**
 * Context threaded through every transform, evaluator, and feedback resolver
 * during a single graph run.
 */
export interface RunContext {
  /** Unique identifier for this run. */
  readonly runId: string;
  /** Optional free-form metadata for the run. */
  readonly metadata?: Metadata;
  /** Optional expected target, used by evaluators that compare against truth. */
  readonly target?: unknown;
}

/** A single recorded step in a graph run's trace. */
export interface TraceStep {
  /** Identifier of the transform that produced this step. */
  readonly transformId: string;
  /** Human-readable name of the transform. */
  readonly transformName: string;
  /** Input handed to the transform. */
  readonly input: unknown;
  /** Output produced by the transform. */
  readonly output: unknown;
  /** Epoch milliseconds when the transform started. */
  readonly startedAt: number;
  /** Epoch milliseconds when the transform finished. */
  readonly finishedAt: number;
}

/** Status of an evaluation. */
export type EvaluationStatus = "pass" | "fail" | "partial" | "unknown";

/** A single piece of supporting evidence for an evaluation. */
export interface Evidence {
  /** Short label describing what this evidence is. */
  readonly label: string;
  /** The evidence value. */
  readonly value: unknown;
  /** Optional source/provenance of the evidence. */
  readonly source?: string;
}

/** The judgment of an output's quality. */
export interface EvaluationResult {
  readonly status: EvaluationStatus;
  /** Optional numeric score (semantics are evaluator-defined). */
  readonly score?: number;
  /** Optional error magnitude (e.g. numeric distance from target). */
  readonly error?: number;
  /** Optional human-readable messages. */
  readonly messages?: string[];
  /** Optional structured evidence supporting the judgment. */
  readonly evidence?: Evidence[];
}

/** The kinds of next action feedback can suggest. */
export type FeedbackActionType =
  | "accept"
  | "retry"
  | "adjust"
  | "reject"
  | "custom";

/** The next action suggested by feedback resolution. */
export interface FeedbackAction {
  readonly type: FeedbackActionType;
  /** Optional human-readable reason. */
  readonly reason?: string;
  /** Optional structured payload (e.g. adjustment hints). */
  readonly payload?: Metadata;
}

/** The full, inspectable result of running a graph. */
export interface GraphRun<I, O> {
  /** Identifier of the graph that produced this run. */
  readonly graphId: string;
  /** The run context used. */
  readonly context: RunContext;
  /** The original input. */
  readonly input: I;
  /** The final output. */
  readonly output: O;
  /** Every recorded intermediate state, in order. */
  readonly trace: TraceStep[];
  /** Evaluation of the output, if the graph has an evaluator. */
  readonly evaluation?: EvaluationResult;
  /** Suggested next action, if the graph has a feedback resolver. */
  readonly feedback?: FeedbackAction;
}
