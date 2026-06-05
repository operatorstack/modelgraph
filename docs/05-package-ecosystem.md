# 05 - The Library

The library is a single package: the model graph.

```
@composable-model-graph/core   (no dependencies)
```

## `@composable-model-graph/core`

The generic primitives, and only the generic primitives:

- `Transform`, `TransformNode`, `createTransform`, `toTransformNode`
- `ModelGraph`, `createModelGraph`, `RunOptions`, `AnyTransform`
- `Evaluator`, `createEvaluator`
- `FeedbackResolver`, `createFeedbackResolver`, `feedbackAction`
- `RunContext`, `createRunContext`
- `TraceRecorder`, `createTraceStep`, `TraceStep`
- `GraphRun`, `EvaluationResult`, `Evidence`, `EvaluationStatus`,
  `FeedbackAction`, `FeedbackActionType`
- `TransformExecutionError`

## What is intentionally out of scope

Domain-specific building blocks — numeric layers, data-shaping helpers,
evaluator/feedback libraries — are **not** part of the library. They are
trivial to build on top of the primitives (see the `examples/`) and belong in
the consumers that need them. Keeping the library to just the model graph keeps
the surface small, generic, and harness-free.

## Naming conventions

Public language is software/AI generic. Use:

```
Transform · ModelGraph · Node · Evaluator · Evaluation · Feedback · Run · Trace
```

Avoid in public APIs: TransferFunction, Harness, Agent, Workflow, Backprop,
Skill, Goal.
