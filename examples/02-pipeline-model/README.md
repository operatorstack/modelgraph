# Example 02: Pipeline Model

```
Input
  ↓
normalize
  ↓
State A
  ↓
tokenize
  ↓
State B
  ↓
count
  ↓
Output
```

A three-stage linear pipeline. The type changes along the chain
(`string -> string -> string[] -> number`) and every intermediate state is
recorded in the trace.

## Run

```bash
pnpm build
pnpm --filter @composable-model-graph/example-02-pipeline-model start
```
