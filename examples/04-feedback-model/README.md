# Example 04: Feedback Model

```
Input
  ↓
Transform Chain
  ↓
Output
  ↓
Evaluation
  ↓
Feedback
  ├── accept
  ├── retry
  ├── adjust
  ├── reject
  └── custom
```

Runs the evaluated graph twice with different targets and shows how the
default feedback resolver turns each evaluation into a next action
(`pass -> accept`, `fail -> retry`).

## Run

```bash
pnpm build
pnpm --filter @composable-model-graph/example-04-feedback-model start
```
