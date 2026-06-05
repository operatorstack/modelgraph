import { createRunContext, type RunContextOptions } from "./RunContext.js";
import { TransformExecutionError } from "./errors.js";
import { createTraceStep } from "./Trace.js";
import type { Transform } from "./Transform.js";
import type { Evaluator } from "./Evaluator.js";
import type { FeedbackResolver } from "./Feedback.js";
import type { GraphRun, RunContext, TraceStep } from "./types.js";

/** A transform with erased input/output types, used for internal storage. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyTransform = Transform<any, any>;

/** Options accepted by {@link ModelGraph.run}. */
export interface RunOptions extends RunContextOptions {
  /** Reuse an existing context instead of creating one from options. */
  readonly context?: RunContext;
}

/**
 * A ModelGraph is the composition of transforms. It runs them in order,
 * records every intermediate state in a trace, and optionally evaluates the
 * output and resolves feedback.
 *
 * Core v1 supports linear graphs only. Branching is an example/extension.
 */
export interface ModelGraph<I, O> {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly transforms: readonly AnyTransform[];
  readonly evaluator?: Evaluator<O, unknown>;
  readonly feedback?: FeedbackResolver<I, O>;
  run(input: I, options?: RunOptions): Promise<GraphRun<I, O>>;
}

/** Configuration for {@link createModelGraph}. */
export interface ModelGraphConfig<I, O> {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly transforms: readonly AnyTransform[];
  readonly evaluator?: Evaluator<O, unknown>;
  readonly feedback?: FeedbackResolver<I, O>;
}

class LinearModelGraph<I, O> implements ModelGraph<I, O> {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly transforms: readonly AnyTransform[];
  readonly evaluator?: Evaluator<O, unknown>;
  readonly feedback?: FeedbackResolver<I, O>;

  constructor(config: ModelGraphConfig<I, O>) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.transforms = config.transforms;
    this.evaluator = config.evaluator;
    this.feedback = config.feedback;
  }

  async run(input: I, options: RunOptions = {}): Promise<GraphRun<I, O>> {
    const context = options.context ?? createRunContext(options);
    const trace: TraceStep[] = [];

    let current: unknown = input;
    for (let stepIndex = 0; stepIndex < this.transforms.length; stepIndex++) {
      const transform = this.transforms[stepIndex]!;
      const stepInput = current;
      const startedAt = Date.now();
      try {
        current = await transform.run(stepInput, context);
      } catch (cause) {
        throw new TransformExecutionError({
          graphId: this.id,
          transformId: transform.id,
          transformName: transform.name,
          stepIndex,
          cause,
        });
      }
      const finishedAt = Date.now();
      trace.push(
        createTraceStep({
          transformId: transform.id,
          transformName: transform.name,
          input: stepInput,
          output: current,
          startedAt,
          finishedAt,
        }),
      );
    }

    const output = current as O;

    const baseRun: GraphRun<I, O> = {
      graphId: this.id,
      context,
      input,
      output,
      trace,
    };

    if (!this.evaluator) {
      return baseRun;
    }

    const evaluation = await this.evaluator.evaluate(
      output,
      context.target,
      context,
    );
    const evaluatedRun: GraphRun<I, O> = { ...baseRun, evaluation };

    if (!this.feedback) {
      return evaluatedRun;
    }

    const feedback = await this.feedback.resolve(
      evaluatedRun,
      evaluation,
      context,
    );
    return { ...evaluatedRun, feedback };
  }
}

/** Create a linear {@link ModelGraph} from a configuration object. */
export function createModelGraph<I, O>(
  config: ModelGraphConfig<I, O>,
): ModelGraph<I, O> {
  return new LinearModelGraph<I, O>(config);
}
