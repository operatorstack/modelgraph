/**
 * Example 02: Pipeline Model
 *
 *   Input -> normalize -> State A -> tokenize -> State B -> count -> Output
 *
 * A linear chain of three transforms where the type changes along the way
 * (string -> string -> string[] -> number). Each intermediate state is
 * recorded in the trace.
 */
import {
  createModelGraph,
  createTransform,
} from "@composable-model-graph/core";

const normalize = createTransform<string, string>({
  id: "normalize",
  name: "Normalize",
  run: (input) => input.trim().toLowerCase().replace(/\s+/g, " "),
});

const tokenize = createTransform<string, string[]>({
  id: "tokenize",
  name: "Tokenize",
  run: (input) => (input === "" ? [] : input.split(" ")),
});

const count = createTransform<string[], number>({
  id: "count",
  name: "Count tokens",
  run: (tokens) => tokens.length,
});

const graph = createModelGraph<string, number>({
  id: "pipeline",
  name: "Tokenize pipeline",
  transforms: [normalize, tokenize, count],
});

const run = await graph.run("  The   quick brown FOX  ");

console.log("input: ", JSON.stringify(run.input));
console.log("output:", run.output);
console.log("trace:");
for (const step of run.trace) {
  console.log(
    `  ${step.transformName}: ${JSON.stringify(step.input)} -> ${JSON.stringify(step.output)}`,
  );
}
