# 06 - Examples

Each example is a runnable workspace package under `examples/`. Build the
packages once, then run any example with pnpm.

```bash
pnpm install
pnpm build
pnpm --filter @composable-model-graph/example-05-input-data-building start
```

| #   | Example                                                      | Shape               |
| --- | ------------------------------------------------------------ | ------------------- |
| 01  | [01-linear-transform](../examples/01-linear-transform)       | Linear transform    |
| 02  | [02-pipeline-model](../examples/02-pipeline-model)           | Pipeline            |
| 03  | [03-evaluated-model](../examples/03-evaluated-model)         | Evaluated           |
| 04  | [04-feedback-model](../examples/04-feedback-model)           | Feedback            |
| 05  | [05-input-data-building](../examples/05-input-data-building) | Input Data Building |
| 07  | [07-branching-model](../examples/07-branching-model)         | Branching (future)  |
| 08  | [08-comparison-model](../examples/08-comparison-model)       | Comparison          |

Every example is built on `@composable-model-graph/core` alone.

## Highlights

### 05 - Input Data Building

The most important example. Turns

```json
{ "text": "  Composable Model Graph builds explicit transformations  " }
```

into

```json
{
  "words": [
    "composable",
    "model",
    "graph",
    "builds",
    "explicit",
    "transformations"
  ],
  "count": 6
}
```

and prints the trace `RawInput -> CleanData -> ExtractedData -> BuiltData`.

## Running everything

```bash
# every example exposes a `start` script
pnpm --filter "@composable-model-graph/example-*" -r start
```
