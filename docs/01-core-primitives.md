# 01 - Core Primitives

All primitives live in `@composable-model-graph/core` and have no dependency on
any other package.

## Transform

The atomic unit of work: the thing that maps input to output.

```ts
interface Transform<I, O> {
  id: string;
  name: string;
  description?: string;
  run(input: I, context: RunContext): O | Promise<O>;
}
```

Create one with the `createTransform` factory:

```ts
const trim = createTransform<string, string>({
  id: "trim",
  name: "Trim",
  run: (input) => input.trim(),
});
```

`TransformNode<I, O>` is a thin wrapper that keeps a transform identifiable
inside a graph (`toTransformNode`).

## ModelGraph

The composition of transforms. Core v1 runs them **linearly**.

```ts
interface ModelGraph<I, O> {
  id: string;
  name: string;
  transforms: readonly AnyTransform[];
  evaluator?: Evaluator<O, unknown>;
  feedback?: FeedbackResolver<I, O>;
  run(input: I, options?: RunOptions): Promise<GraphRun<I, O>>;
}
```

```
run(input):
  current = input
  for each transform:
     before  = current
     current = transform.run(before, context)
     trace.push({ before, current, timings })
  output = current
  evaluation = evaluator?.evaluate(output, target, context)
  feedback   = feedback?.resolve(run, evaluation, context)
```

## GraphRun

The full, inspectable result of a run.

```ts
interface GraphRun<I, O> {
  graphId: string;
  context: RunContext;
  input: I;
  output: O;
  trace: TraceStep[];
  evaluation?: EvaluationResult;
  feedback?: FeedbackAction;
}
```

## TraceStep

One recorded intermediate state.

```ts
interface TraceStep {
  transformId: string;
  transformName: string;
  input: unknown;
  output: unknown;
  startedAt: number;
  finishedAt: number;
}
```

## RunContext

Threaded through every transform, evaluator, and resolver.

```ts
interface RunContext {
  runId: string;
  metadata?: Record<string, unknown>;
  target?: unknown;
}
```

`createRunContext()` generates a `runId` when one is not supplied. The `target`
is how evaluators receive the expected value.

## Evaluator

The judgment of output quality.

```ts
interface Evaluator<O, T = unknown> {
  id: string;
  name: string;
  evaluate(
    output: O,
    target: T | undefined,
    context: RunContext,
  ): EvaluationResult | Promise<EvaluationResult>;
}

interface EvaluationResult {
  status: "pass" | "fail" | "partial" | "unknown";
  score?: number;
  error?: number;
  messages?: string[];
  evidence?: Evidence[];
}

interface Evidence {
  label: string;
  value: unknown;
  source?: string;
}
```

## Feedback

The next action suggested by an evaluation.

```ts
interface FeedbackResolver<I, O> {
  resolve(
    run: GraphRun<I, O>,
    evaluation: EvaluationResult | undefined,
    context: RunContext,
  ): FeedbackAction | Promise<FeedbackAction>;
}

interface FeedbackAction {
  type: "accept" | "retry" | "adjust" | "reject" | "custom";
  reason?: string;
  payload?: Record<string, unknown>;
}
```

## Errors

A failed transform throws a `TransformExecutionError` carrying `graphId`,
`transformId`, `transformName`, `stepIndex`, and the original `cause`.

## Factories

- `createTransform`
- `createEvaluator`
- `createFeedbackResolver`
- `createRunContext`
- `createModelGraph`
