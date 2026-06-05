/**
 * Example 05: Input Data Building Model (the important one)
 *
 *   Raw Input Data
 *     ↓ normalizeText
 *   Clean Data
 *     ↓ extractWords
 *   Extracted Data
 *     ↓ buildWordData
 *   Built Data
 *     ↓ evaluate (count > 0)
 *   Evaluation
 *
 * Input Data Building is the process of turning raw state into useful state
 * through explicit, inspectable transforms:
 *
 *   D0 = raw input data
 *   D1 = normalize(D0)
 *   D2 = extract(D1)
 *   D3 = structure(D2)   (BuiltData)
 *   Evaluation = E(D3)
 *
 * Data is not the transform. Data flows through transforms. The graph turns
 * raw state into useful state, and the trace exposes each intermediate state.
 * Built entirely on the core model-graph primitives.
 */
import {
  createEvaluator,
  createModelGraph,
  createTransform,
  type EvaluationResult,
} from "@composable-model-graph/core";

interface RawInput {
  text: string;
}

interface BuiltData {
  words: string[];
  count: number;
}

// D1 = normalize(D0): trim, lowercase, collapse whitespace
const normalizeText = createTransform<RawInput, string>({
  id: "normalize-text",
  name: "Normalize text",
  run: (input) => input.text.replace(/\s+/g, " ").trim().toLowerCase(),
});

// D2 = extract(D1)
const extractWords = createTransform<string, string[]>({
  id: "extract-words",
  name: "Extract words",
  run: (clean) => (clean === "" ? [] : clean.split(" ")),
});

// D3 = structure(D2) = BuiltData
const buildWordData = createTransform<string[], BuiltData>({
  id: "build-word-data",
  name: "Build word data",
  run: (words) => ({ words, count: words.length }),
});

const graph = createModelGraph<RawInput, BuiltData>({
  id: "input-data-building",
  name: "Input data building",
  transforms: [normalizeText, extractWords, buildWordData],
  // Evaluation = E(D3): pass if count > 0
  evaluator: createEvaluator<BuiltData>({
    id: "non-empty",
    name: "Non-empty word data",
    evaluate: (built): EvaluationResult =>
      built.count > 0
        ? { status: "pass", score: 1 }
        : { status: "fail", score: 0 },
  }),
});

const run = await graph.run({
  text: "  Composable Model Graph builds explicit transformations  ",
});

console.log("Built data:", JSON.stringify(run.output));
console.log("Evaluation:", run.evaluation?.status);
console.log();
console.log("Trace (RawInput -> CleanData -> ExtractedData -> BuiltData):");
const labels = ["RawInput", "CleanData", "ExtractedData", "BuiltData"];
console.log(`  ${labels[0]}: ${JSON.stringify(run.input)}`);
run.trace.forEach((step, i) => {
  console.log(`  ${labels[i + 1]}: ${JSON.stringify(step.output)}`);
});
