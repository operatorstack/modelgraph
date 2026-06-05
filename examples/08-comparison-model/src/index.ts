/**
 * Example 08: Comparison Model
 *
 *   Input
 *     ├──▶ Graph A ──▶ Output A ──┐
 *     │                           ├──▶ Compare / Evaluate
 *     └──▶ Graph B ──▶ Output B ──┘
 *
 * Run two separate graphs on the same input and compare their outputs. Each
 * graph is a normal linear model graph; comparison happens outside them.
 */
import {
  createModelGraph,
  createTransform,
} from "@composable-model-graph/core";

const lowercase = createTransform<string, string>({
  id: "lowercase",
  name: "Lowercase",
  run: (input) => input.trim().toLowerCase(),
});

const uppercase = createTransform<string, string>({
  id: "uppercase",
  name: "Uppercase",
  run: (input) => input.trim().toUpperCase(),
});

const graphA = createModelGraph<string, string>({
  id: "graph-a",
  name: "Graph A (lowercase)",
  transforms: [lowercase],
});

const graphB = createModelGraph<string, string>({
  id: "graph-b",
  name: "Graph B (uppercase)",
  transforms: [uppercase],
});

const input = "  Composable Model Graph  ";
const [runA, runB] = await Promise.all([graphA.run(input), graphB.run(input)]);

console.log("input:    ", JSON.stringify(input));
console.log("output A: ", JSON.stringify(runA.output));
console.log("output B: ", JSON.stringify(runB.output));
console.log("equal?    ", runA.output === runB.output);
console.log("longer:   ", runA.output.length >= runB.output.length ? "A" : "B");
