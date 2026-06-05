# 02 - Model Shapes

A "model shape" is a recurring way of composing the primitives. The same core
runs all of them; the shape is a pattern, not a new abstraction.

## 1. Linear Transform Model

```
Input ───▶ Transform ───▶ Output
```

A single transform. See [example 01](../examples/01-linear-transform).

## 2. Pipeline Model

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

A linear chain. Each intermediate state is recorded in the trace. See
[example 02](../examples/02-pipeline-model).

## 3. Evaluated Model

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

See [example 03](../examples/03-evaluated-model).

## 4. Feedback Model

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

See [example 04](../examples/04-feedback-model).

## 5. Input Data Building Model

The most important shape. Documented in detail in
[03-input-data-building-model.md](03-input-data-building-model.md).

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

## 6. Mathematical Model

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

This is only **one instance** of the generic graph: the transforms happen to
be dense layers and the evaluation happens to be a numeric loss. The library
does not ship numeric layers — you implement transforms like these in a
consumer.

## 7. Branching Model (future / advanced)

```
Input
  ├──▶ Transform B ──┐
  │                  ├──▶ Merge ──▶ Output
  └──▶ Transform C ──┘
```

Core v1 runs linear graphs only. Branching is documented as a future shape; it
can be modeled today as a single branch+merge transform. See
[example 07](../examples/07-branching-model).

## 8. Comparison Model

```
Input
  ├──▶ Graph A ──▶ Output A ──┐
  │                           ├──▶ Compare / Evaluate
  └──▶ Graph B ──▶ Output B ──┘
```

Run two separate graphs on the same input and compare. See
[example 08](../examples/08-comparison-model).

## 9. Lifecycle Model

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
primitives to model a lifecycle.

Some systems do not improve by generating better outputs directly. They improve
by making the lifecycle visible:

- what happened?
- what signals were measured?
- what violated expectations?
- what should update next?
