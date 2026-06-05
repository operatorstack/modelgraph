/**
 * Example 03: Evaluated Model
 *
 *   Input -> Transform Chain -> Output -> Evaluator -> EvaluationResult
 *
 * After the transform chain produces an output, an evaluator judges it. The
 * evaluator here is built directly from the core `createEvaluator` primitive:
 * it passes when the output exactly matches the target from the run context.
 */
import {
  createEvaluator,
  createModelGraph,
  createTransform,
  type EvaluationResult,
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
    output === target
      ? { status: "pass", score: 1 }
      : { status: "fail", score: 0 },
});

const graph = createModelGraph<string, string>({
  id: "evaluated",
  name: "Evaluated model",
  transforms: [clean],
  evaluator: exactMatch,
});

const run = await graph.run("  HELLO  ", { target: "hello" });

console.log("output:    ", JSON.stringify(run.output));
console.log("evaluation:", run.evaluation);
