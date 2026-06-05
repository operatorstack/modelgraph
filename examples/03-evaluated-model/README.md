# Example 03: Evaluated Model

```
Input
  ↓
Transform Chain
  ↓
Output
  ↓
Evaluator
  ↓
EvaluationResult
```

The graph normalizes a string, then an `exactMatch` evaluator judges the
output against a target supplied through the run context.

## Run

```bash
pnpm build
pnpm --filter @composable-model-graph/example-03-evaluated-model start
```
