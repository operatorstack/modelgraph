/**
 * Example 01: Linear Transform Model
 *
 *   Input ───▶ Transform ───▶ Output
 *
 * The simplest model graph: a single transform mapping a string to a string.
 */
import {
  createModelGraph,
  createTransform,
} from "@composable-model-graph/core";

const clean = createTransform<string, string>({
  id: "clean",
  name: "Trim + lowercase",
  run: (input) => input.trim().toLowerCase(),
});

const graph = createModelGraph<string, string>({
  id: "linear-transform",
  name: "Linear transform",
  transforms: [clean],
});

const run = await graph.run("  Composable Model Graph  ");

console.log("input: ", JSON.stringify(run.input));
console.log("output:", JSON.stringify(run.output));
console.log("trace: ", run.trace.map((s) => s.transformName).join(" -> "));
