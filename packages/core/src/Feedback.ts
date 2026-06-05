import type {
  EvaluationResult,
  FeedbackAction,
  GraphRun,
  RunContext,
} from "./types.js";

/**
 * A FeedbackResolver maps a completed run plus its evaluation to a suggested
 * next action. It is the "next action suggested by evaluation" stage.
 */
export interface FeedbackResolver<I = unknown, O = unknown> {
  resolve(
    run: GraphRun<I, O>,
    evaluation: EvaluationResult | undefined,
    context: RunContext,
  ): FeedbackAction | Promise<FeedbackAction>;
}

/** Definition object for {@link createFeedbackResolver}. */
export interface FeedbackResolverDefinition<I = unknown, O = unknown> {
  resolve(
    run: GraphRun<I, O>,
    evaluation: EvaluationResult | undefined,
    context: RunContext,
  ): FeedbackAction | Promise<FeedbackAction>;
}

/** Create a {@link FeedbackResolver} from a plain definition object. */
export function createFeedbackResolver<I = unknown, O = unknown>(
  definition: FeedbackResolverDefinition<I, O>,
): FeedbackResolver<I, O> {
  return { resolve: definition.resolve };
}

/** Convenience constructor for a {@link FeedbackAction}. */
export function feedbackAction(
  type: FeedbackAction["type"],
  options: { reason?: string; payload?: Record<string, unknown> } = {},
): FeedbackAction {
  return {
    type,
    reason: options.reason,
    payload: options.payload,
  };
}
