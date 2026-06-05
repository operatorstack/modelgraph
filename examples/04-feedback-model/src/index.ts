/**
 * Example 04: Feedback Model
 *
 *   Input -> Transform Chain -> Output -> Evaluation -> Feedback
 *                                                        ├── accept
 *                                                        ├── retry
 *                                                        ├── adjust
 *                                                        ├── reject
 *                                                        └── custom
 *
 * Evaluator and FeedbackResolver are both core primitives. The resolver maps
 * the evaluation status to a next action:
 *   pass -> accept, partial -> adjust, fail -> retry, unknown -> custom.
 */
import {
  createEvaluator,
  createFeedbackResolver,
  createModelGraph,
  createTransform,
  type EvaluationResult,
  type FeedbackAction,
} from "@composable-model-graph/core";

const clean = createTransform<string, string>({
  id: "clean",
  name: "Normalize",
  run: (input) => input.trim().toLowerCase(),
});

const exactMatch = createEvaluator<string, string>({
  id: "exact-match",
  name: "Exact match",
  evaluate: (output, target): EvaluationResult =>
    output === target ? { status: "pass" } : { status: "fail" },
});

const resolver = createFeedbackResolver<string, string>({
  resolve: (_run, evaluation): FeedbackAction => {
    switch (evaluation?.status) {
      case "pass":
        return { type: "accept", reason: "Evaluation passed." };
      case "partial":
        return { type: "adjust", reason: "Partially passed; adjust." };
      case "fail":
        return { type: "retry", reason: "Evaluation failed; retry." };
      default:
        return { type: "custom", reason: "Inconclusive; inspect." };
    }
  },
});

const graph = createModelGraph<string, string>({
  id: "feedback",
  name: "Feedback model",
  transforms: [clean],
  evaluator: exactMatch,
  feedback: resolver,
});

for (const target of ["hello", "goodbye"]) {
  const run = await graph.run("  HELLO  ", { target });
  console.log(
    `target=${JSON.stringify(target)} -> status=${run.evaluation?.status}, ` +
      `feedback=${run.feedback?.type} (${run.feedback?.reason})`,
  );
}
