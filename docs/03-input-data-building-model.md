# 03 - Input Data Building Model

This is the most important model shape to understand, because it captures the
core mental model of the whole ecosystem.

```
Raw Input Data
  ↓
Normalize
  ↓
Data State 1
  ↓
Extract / Pick
  ↓
Data State 2
  ↓
Structure
  ↓
Built Data
  ↓
Evaluate
  ↓
Feedback
```

## The key distinction

- **Data is not the transform.**
- **Data flows through transforms.**
- **The graph turns raw state into useful state.**
- **The trace exposes each intermediate state.**

A transform is a verb (normalize, extract, structure). Data is a noun (the raw
text, the clean text, the extracted words, the built record). The graph is the
ordered composition of the verbs; the trace is the recording of every noun
along the way.

## Formula

```
D0 = raw input data
D1 = normalize(D0)
D2 = extract(D1)
D3 = structure(D2)

BuiltData  = D3
Evaluation = E(D3)
```

## In one line

> Input Data Building is the process of turning raw state into useful state
> through explicit, inspectable transforms.

## Worked example

Input:

```json
{ "text": "  Composable Model Graph builds explicit transformations  " }
```

Transforms:

- `normalizeText` — trim, lowercase, collapse whitespace
- `extractWords` — split into words
- `buildWordData` — structure into `{ words, count }`

Output:

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

Evaluator: pass if `count > 0`.

Trace:

```
RawInput      { text: "  Composable Model Graph builds explicit transformations  " }
   ↓ normalizeText
CleanData     "composable model graph builds explicit transformations"
   ↓ extractWords
ExtractedData ["composable","model","graph","builds","explicit","transformations"]
   ↓ buildWordData
BuiltData     { words: [...], count: 6 }
```

See the runnable version in
[example 05](../examples/05-input-data-building).
