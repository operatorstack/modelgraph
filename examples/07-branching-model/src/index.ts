/**
 * Example 07: Branching Model (advanced / future shape)
 *
 *   Input
 *     ├──▶ Transform B ──┐
 *     │                  ├──▶ Merge ──▶ Output
 *     └──▶ Transform C ──┘
 *
 * Core v1 runs LINEAR graphs only. Branching is documented as a future shape.
 * Until core supports it natively, you can model a branch+merge as a single
 * transform whose `run` fans out to sub-transforms and combines their results.
 * The branch therefore appears as one inspectable step in the trace.
 */
import {
  createModelGraph,
  createTransform,
  type RunContext,
  type Transform,
} from "@composable-model-graph/core";

const wordCount = createTransform<string, number>({
  id: "word-count",
  name: "Branch B: word count",
  run: (text) => (text.trim() === "" ? 0 : text.trim().split(/\s+/).length),
});

const charCount = createTransform<string, number>({
  id: "char-count",
  name: "Branch C: char count",
  run: (text) => text.replace(/\s/g, "").length,
});

interface Merged {
  words: number;
  chars: number;
}

/** Build a branch+merge transform from two parallel branches. */
function branchMerge<I, A, B, O>(
  branchA: Transform<I, A>,
  branchB: Transform<I, B>,
  merge: (a: A, b: B) => O,
): Transform<I, O> {
  return createTransform<I, O>({
    id: "branch-merge",
    name: "Branch + merge",
    run: async (input: I, context: RunContext) => {
      const [a, b] = await Promise.all([
        branchA.run(input, context),
        branchB.run(input, context),
      ]);
      return merge(a, b);
    },
  });
}

const graph = createModelGraph<string, Merged>({
  id: "branching",
  name: "Branching model",
  transforms: [
    branchMerge(wordCount, charCount, (words, chars) => ({ words, chars })),
  ],
});

const run = await graph.run("composable model graph");
console.log("output:", JSON.stringify(run.output));
console.log("note:  branch+merge appears as a single trace step in core v1");
