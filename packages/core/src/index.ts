/**
 * @composable-model-graph/core
 *
 * Generic primitives for building inspectable transformation graphs:
 *   input -> transforms -> output -> evaluation -> feedback
 */

export type {
  Metadata,
  RunContext,
  TraceStep,
  EvaluationStatus,
  Evidence,
  EvaluationResult,
  FeedbackActionType,
  FeedbackAction,
  GraphRun,
} from "./types.js";

export {
  type Transform,
  type TransformNode,
  type TransformDefinition,
  createTransform,
  toTransformNode,
} from "./Transform.js";

export { type RunContextOptions, createRunContext } from "./RunContext.js";

export { TraceRecorder, createTraceStep } from "./Trace.js";

export {
  type Evaluator,
  type EvaluatorDefinition,
  createEvaluator,
} from "./Evaluator.js";

export {
  type FeedbackResolver,
  type FeedbackResolverDefinition,
  createFeedbackResolver,
  feedbackAction,
} from "./Feedback.js";

export {
  type ModelGraph,
  type ModelGraphConfig,
  type RunOptions,
  type AnyTransform,
  createModelGraph,
} from "./ModelGraph.js";

export { TransformExecutionError } from "./errors.js";
