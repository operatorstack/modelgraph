# 00 - Overview

Composable Model Graph is a TypeScript library ecosystem for building
**inspectable transformation graphs**.

## The generic shape

```
input → transforms → output → evaluation → feedback
```

A model graph makes transformation chains explicit, records intermediate
state, evaluates outputs, and can return feedback actions.

## The six concepts

| Concept        | Definition                              |
| -------------- | --------------------------------------- |
| **Transform**  | the thing that maps input to output     |
| **Data**       | the thing that flows through transforms |
| **Graph**      | the composition of transforms           |
| **Trace**      | recorded intermediate state             |
| **Evaluation** | judgment of output quality              |
| **Feedback**   | next action suggested by evaluation     |

```
            ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
  input ──▶ │ Transform A │──▶│ Transform B │──▶│ Transform C │──▶ output
            └─────────────┘   └─────────────┘   └─────────────┘
                  │                 │                 │
                  ▼                 ▼                 ▼
            ┌───────────────────────────────────────────────┐
            │                    Trace                        │
            │   step 0          step 1          step 2        │
            └───────────────────────────────────────────────┘
                                                    │
                                                    ▼
                                              ┌───────────┐
                                     output ─▶│ Evaluator │─▶ Evaluation
                                              └───────────┘        │
                                                                   ▼
                                                            ┌────────────┐
                                                            │  Feedback  │
                                                            └────────────┘
```

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

## The library

The library is a single package, `@composable-model-graph/core`, which defines
the generic primitives and nothing else. Domain-specific building blocks belong
in consumers built on top of it. See [05-package-ecosystem.md](05-package-ecosystem.md).
