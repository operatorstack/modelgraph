# Example 08: Comparison Model

```
Input
  ├──▶ Graph A ──▶ Output A ──┐
  │                           ├──▶ Compare / Evaluate
  └──▶ Graph B ──▶ Output B ──┘
```

Runs two independent linear graphs (lowercase vs uppercase) on the same input
and compares their outputs. Comparison happens outside the graphs.

## Run

```bash
pnpm build
pnpm --filter @composable-model-graph/example-08-comparison-model start
```
