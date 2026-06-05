# Example 05: Input Data Building Model

This is the most important example. It shows how to turn raw state into useful
state through explicit, inspectable transforms.

```
Raw Input Data
  ↓
Normalize
  ↓
Data State 1  (CleanData)
  ↓
Extract / Pick
  ↓
Data State 2  (ExtractedData)
  ↓
Structure
  ↓
Built Data
  ↓
Evaluate
  ↓
Feedback
```

Formula:

```
D0 = raw input data
D1 = normalize(D0)
D2 = extract(D1)
D3 = structure(D2)

BuiltData  = D3
Evaluation = E(D3)
```

> Input Data Building is the process of turning raw state into useful state
> through explicit, inspectable transforms.

## Input

```json
{ "text": "  Composable Model Graph builds explicit transformations  " }
```

## Output

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

The evaluator passes when `count > 0`.

## Run

```bash
pnpm build
pnpm --filter @composable-model-graph/example-05-input-data-building start
```
