# Composable Model Graph

A TypeScript library ecosystem for building inspectable transformation graphs.

## Core shape

```
input → transforms → output → evaluation → feedback
```

A model graph makes transformation chains explicit, records intermediate state,
evaluates outputs, and can return feedback actions.

## What it is

- typed transforms
- inspectable graph runs
- traceable intermediate states
- evaluation-first outputs
- optional feedback actions

## What it is not

- not an ML framework
- not an agent framework
- not a workflow engine
- not a harness
- not LangChain
- not a graph database

## The six concepts

| Concept        | Definition                              |
| -------------- | --------------------------------------- |
| **Transform**  | the thing that maps input to output     |
| **Data**       | the thing that flows through transforms |
| **Graph**      | the composition of transforms           |
| **Trace**      | recorded intermediate state             |
| **Evaluation** | judgment of output quality              |
| **Feedback**   | next action suggested by evaluation     |

## Quick start

```bash
pnpm install
pnpm build
pnpm test
```

```ts
import {
  createModelGraph,
  createTransform,
} from "@composable-model-graph/core";

const normalize = createTransform<string, string>({
  id: "normalize",
  name: "Normalize",
  run: (input) => input.trim().toLowerCase(),
});

const tokenize = createTransform<string, string[]>({
  id: "tokenize",
  name: "Tokenize",
  run: (input) => (input === "" ? [] : input.split(/\s+/)),
});

const graph = createModelGraph<string, string[]>({
  id: "tokens",
  name: "Tokenizer",
  transforms: [normalize, tokenize],
});

const run = await graph.run("  Hello   World  ");
console.log(run.output); // ["hello", "world"]
console.log(run.trace); // every intermediate state
```

## The library

The library is a single package: the model graph.

- **`@composable-model-graph/core`** — `Transform`, `ModelGraph`, `Evaluator`,
  `FeedbackResolver`, `TraceStep`, `RunContext`, `GraphRun`, and the
  `createTransform` / `createEvaluator` / `createFeedbackResolver` /
  `createModelGraph` / `createRunContext` factories.

It has no dependencies and depends on no harness package. Domain-specific
building blocks (numeric layers, data transforms, evaluator/feedback libraries)
are intentionally out of scope — they belong in consumers built on top of these
primitives.

## Model shapes

### 1. Linear Transform Model

```
Input ───▶ Transform ───▶ Output
```

### 2. Pipeline Model

```
Input
  ↓
Transform A
  ↓
State A
  ↓
Transform B
  ↓
State B
  ↓
Transform C
  ↓
Output
```

### 3. Evaluated Model

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

### 4. Feedback Model

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

### 5. Input Data Building Model

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

- Data is not the transform.
- Data flows through transforms.
- The graph turns raw state into useful state.
- The trace exposes each intermediate state.

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

See [docs/03-input-data-building-model.md](docs/03-input-data-building-model.md).

### 6. Mathematical Model

```
Input Vector
  ↓
Dense Layer
  ↓
Activation
  ↓
Hidden Representation
  ↓
Dense Layer
  ↓
Prediction
  ↓
Loss / Error
```

This is only one illustrative instance of the generic graph. The library does
not ship numeric layers; you implement transforms like these in a consumer.

### 7. Branching Model (future / advanced)

```
Input
  ├──▶ Transform B ──┐
  │                  ├──▶ Merge ──▶ Output
  └──▶ Transform C ──┘
```

Core v1 runs linear graphs only; branching is documented as a future shape.

### 8. Comparison Model

```
Input
  ├──▶ Graph A ──▶ Output A ──┐
  │                           ├──▶ Compare / Evaluate
  └──▶ Graph B ──▶ Output B ──┘
```

### 9. Lifecycle Model

```
Raw Run Data
  ↓
Extract Signals
  ↓
Measured State
  ↓
Evaluate
  ↓
Evaluation Result
  ↓
Resolve Feedback
  ↓
Next Action
```

Composable Model Graph does not define what a "run" is. It only provides the
primitives to model a lifecycle. Some systems improve not by generating better
outputs directly, but by making the lifecycle visible: what happened, what
signals were measured, what violated expectations, and what should update next.

## Examples

Runnable examples live in [`examples/`](examples). Build first, then run any
example:

```bash
pnpm build
pnpm --filter @composable-model-graph/example-05-input-data-building start
```

See [docs/06-examples.md](docs/06-examples.md) for the full list.

## Documentation

- [00 - Overview](docs/00-overview.md)
- [01 - Core Primitives](docs/01-core-primitives.md)
- [02 - Model Shapes](docs/02-model-shapes.md)
- [03 - Input Data Building Model](docs/03-input-data-building-model.md)
- [04 - Evaluation and Feedback](docs/04-evaluation-and-feedback.md)
- [05 - The Library](docs/05-package-ecosystem.md)
- [06 - Examples](docs/06-examples.md)

## Repository layout

```
composable-model-graph/
  package.json
  pnpm-workspace.yaml
  tsconfig.base.json
  vitest.config.ts
  README.md
  packages/
    core/
  examples/
    01-linear-transform/ ... 08-comparison-model/
  docs/
    00-overview.md ... 06-examples.md
```

## Development

```bash
pnpm install      # install dependencies
pnpm build        # build all packages (tsc -b project references)
pnpm test         # run the full vitest suite
pnpm lint         # eslint
pnpm format       # prettier --write
```

## License

MIT
