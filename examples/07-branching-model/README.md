# Example 07: Branching Model (future / advanced shape)

```
Input
  ├──▶ Transform B ──┐
  │                  ├──▶ Merge ──▶ Output
  └──▶ Transform C ──┘
```

Core v1 runs **linear** graphs only. Branching is documented as a future
shape. This example models a branch+merge as a single transform whose `run`
fans out to two sub-transforms (word count and char count) and merges the
results. The branch appears as one inspectable step in the trace.

## Run

```bash
pnpm build
pnpm --filter @composable-model-graph/example-07-branching-model start
```
