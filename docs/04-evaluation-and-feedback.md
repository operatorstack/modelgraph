# 04 - Evaluation and Feedback

Composable Model Graph is **evaluation-first**: the point of making a
transformation chain explicit is to be able to judge its output and decide what
to do next.

## Evaluation

An evaluator turns an output (and optional target) into an `EvaluationResult`.

```
output ──▶ Evaluator ──▶ EvaluationResult { status, score?, error?, messages?, evidence? }
```

Status values:

| status    | meaning                             |
| --------- | ----------------------------------- |
| `pass`    | output meets expectations           |
| `partial` | output partially meets expectations |
| `fail`    | output does not meet expectations   |
| `unknown` | cannot judge (e.g. missing target)  |

Evidence keeps an evaluation inspectable: each `Evidence` item carries a
`label`, a `value`, and an optional `source`.

### Building evaluators

`createEvaluator` from core is all you need. Common evaluators are a few lines
each — build them in your consumer:

- exact match — strict equality against the target
- threshold — a numeric comparison (e.g. `count > 0`, `score >= 0.8`)
- numeric error — mean absolute error between vectors
- shape — required keys and primitive types
- composite — combine several evaluators with `all` / `any` semantics

See [example 03](../examples/03-evaluated-model) for an inline evaluator.

## Feedback

A feedback resolver turns a run plus its evaluation into a next action.

```
Evaluation ──▶ FeedbackResolver ──▶ FeedbackAction { type, reason?, payload? }
```

Action types: `accept`, `retry`, `adjust`, `reject`, `custom`.

### A common default mapping

A typical resolver maps the evaluation status straight to a next action:

```
pass    ──▶ accept
partial ──▶ adjust
fail    ──▶ retry
unknown ──▶ custom (inspect)
```

Build it with `createFeedbackResolver`. See
[example 04](../examples/04-feedback-model) for an inline resolver. A
score-driven variant can decide from the numeric `score` instead:

```
score >= acceptAt ──▶ accept
score >= adjustAt ──▶ adjust
otherwise         ──▶ retry
```

## How the graph wires them

When a graph has an evaluator, `run()` attaches `evaluation`. When it also has a
feedback resolver, `run()` attaches `feedback`. Both are optional and the trace
is always recorded regardless.

```
input → transforms → output → [evaluation] → [feedback]
```
