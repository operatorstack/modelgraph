# @composable-model-graph/core

Generic primitives for building inspectable transformation graphs:

```
input → transforms → output → evaluation → feedback
```

This package has **no dependency** on any other package in the ecosystem.

## Install

```bash
pnpm add @composable-model-graph/core
```

## Exports

- `Transform`, `TransformNode`, `createTransform`, `toTransformNode`
- `ModelGraph`, `createModelGraph`, `RunOptions`, `AnyTransform`
- `Evaluator`, `createEvaluator`
- `FeedbackResolver`, `createFeedbackResolver`, `feedbackAction`
- `RunContext`, `createRunContext`
- `TraceRecorder`, `createTraceStep`, `TraceStep`
- `GraphRun`, `EvaluationResult`, `Evidence`, `EvaluationStatus`,
  `FeedbackAction`, `FeedbackActionType`
- `TransformExecutionError`

## Example

```ts
import {
  createModelGraph,
  createTransform,
} from "@composable-model-graph/core";

const trim = createTransform<string, string>({
  id: "trim",
  name: "Trim",
  run: (input) => input.trim(),
});

const lower = createTransform<string, string>({
  id: "lower",
  name: "Lowercase",
  run: (input) => input.toLowerCase(),
});

const graph = createModelGraph<string, string>({
  id: "clean",
  name: "Clean string",
  transforms: [trim, lower],
});

const run = await graph.run("  HeLLo  ");
run.output; // "hello"
run.trace.length; // 2 — every intermediate state
```

Core v1 runs **linear** graphs. Branching is an example/extension. See the
[docs](../../docs/01-core-primitives.md).
