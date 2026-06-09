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

/**
 * A connection says one transform feeds another: the output of `from` becomes
 * (part of) the input of `to`. A list of transforms with no connections runs as
 * a straight line. Adding connections lets the same transforms form a branch
 * (one feeds several) or a merge (several feed one).
 */
export interface Connection {
  readonly from: string;
  readonly to: string;
}

/** Options accepted by {@link ModelGraph.run}. */
export interface RunOptions extends RunContextOptions {
  /** Reuse an existing context instead of creating one from options. */
  readonly context?: RunContext;
}

/**
 * A ModelGraph is the composition of transforms. It runs them, records every
 * intermediate state in a trace, and optionally evaluates the output and
 * resolves feedback.
 *
 * With no connections the transforms run in order (a straight line). With
 * connections they run as a branch/merge graph: a transform runs once every
 * transform feeding it has produced output; a transform fed by several others
 * receives the list of their outputs. Cycles are not allowed here; repeating a
 * run is a concern for the layer above this one.
 */
export interface ModelGraph<I, O> {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly transforms: readonly AnyTransform[];
  readonly connections?: readonly Connection[];
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
  /**
   * Optional connections between transforms. When omitted (or empty) the
   * transforms run as a straight line in array order. When present the graph
   * runs as a branch/merge graph.
   */
  readonly connections?: readonly Connection[];
  /**
   * Optional id of the transform that receives the graph input. Defaults to the
   * single transform with no incoming connection.
   */
  readonly start?: string;
  /**
   * Optional id of the transform whose output is the graph output. Defaults to
   * the single transform with no outgoing connection.
   */
  readonly end?: string;
  readonly evaluator?: Evaluator<O, unknown>;
  readonly feedback?: FeedbackResolver<I, O>;
}

/** Apply optional evaluation + feedback to a base run. Shared by both runners. */
async function finishRun<I, O>(
  baseRun: GraphRun<I, O>,
  context: RunContext,
  evaluator: Evaluator<O, unknown> | undefined,
  feedback: FeedbackResolver<I, O> | undefined,
): Promise<GraphRun<I, O>> {
  if (!evaluator) {
    return baseRun;
  }

  const evaluation = await evaluator.evaluate(
    baseRun.output,
    context.target,
    context,
  );
  const evaluatedRun: GraphRun<I, O> = { ...baseRun, evaluation };

  if (!feedback) {
    return evaluatedRun;
  }

  const action = await feedback.resolve(evaluatedRun, evaluation, context);
  return { ...evaluatedRun, feedback: action };
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

    const baseRun: GraphRun<I, O> = {
      graphId: this.id,
      context,
      input,
      output: current as O,
      trace,
    };

    return finishRun(baseRun, context, this.evaluator, this.feedback);
  }
}

/**
 * Runs transforms connected as a branch/merge graph. A transform runs once
 * every transform feeding it has produced output; transforms whose inputs are
 * all ready run together. A transform fed by several others receives the list
 * of their outputs (in connection order).
 */
class GraphModelGraph<I, O> implements ModelGraph<I, O> {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly transforms: readonly AnyTransform[];
  readonly connections: readonly Connection[];
  readonly evaluator?: Evaluator<O, unknown>;
  readonly feedback?: FeedbackResolver<I, O>;

  private readonly byId: Map<string, AnyTransform>;
  private readonly incoming: Map<string, string[]>;
  private readonly outgoing: Map<string, string[]>;
  private readonly startId: string;
  private readonly endId: string;

  constructor(config: ModelGraphConfig<I, O>) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.transforms = config.transforms;
    this.connections = config.connections ?? [];
    this.evaluator = config.evaluator;
    this.feedback = config.feedback;

    this.byId = new Map();
    for (const t of this.transforms) {
      if (this.byId.has(t.id)) {
        throw new Error(
          `Graph "${this.id}" has two transforms with id "${t.id}".`,
        );
      }
      this.byId.set(t.id, t);
    }

    this.incoming = new Map(this.transforms.map((t) => [t.id, [] as string[]]));
    this.outgoing = new Map(this.transforms.map((t) => [t.id, [] as string[]]));
    for (const c of this.connections) {
      if (!this.byId.has(c.from)) {
        throw new Error(
          `Graph "${this.id}" connection references unknown transform "${c.from}".`,
        );
      }
      if (!this.byId.has(c.to)) {
        throw new Error(
          `Graph "${this.id}" connection references unknown transform "${c.to}".`,
        );
      }
      this.outgoing.get(c.from)!.push(c.to);
      this.incoming.get(c.to)!.push(c.from);
    }

    this.startId = resolveSingle({
      graphId: this.id,
      explicit: config.start,
      candidates: this.transforms
        .filter((t) => this.incoming.get(t.id)!.length === 0)
        .map((t) => t.id),
      role: "start (a transform with no incoming connection)",
    });

    this.endId = resolveSingle({
      graphId: this.id,
      explicit: config.end,
      candidates: this.transforms
        .filter((t) => this.outgoing.get(t.id)!.length === 0)
        .map((t) => t.id),
      role: "end (a transform with no outgoing connection)",
    });
  }

  async run(input: I, options: RunOptions = {}): Promise<GraphRun<I, O>> {
    const context = options.context ?? createRunContext(options);
    const trace: TraceStep[] = [];
    const outputs = new Map<string, unknown>();
    const done = new Set<string>();
    let stepIndex = 0;

    const ready = (id: string): boolean =>
      !done.has(id) &&
      this.incoming.get(id)!.every((src) => done.has(src));

    const inputFor = (id: string): unknown => {
      if (id === this.startId) return input;
      const sources = this.incoming.get(id)!;
      // A single feeder passes its output straight through; several feeders
      // (a merge) hand over the list of their outputs, in connection order.
      return sources.length === 1
        ? outputs.get(sources[0]!)
        : sources.map((src) => outputs.get(src));
    };

    while (done.size < this.transforms.length) {
      const wave = this.transforms
        .map((t) => t.id)
        .filter((id) => ready(id))
        .sort();

      if (wave.length === 0) {
        throw new Error(
          `Graph "${this.id}" cannot make progress: the connections form a ` +
            `cycle or leave transforms unreachable. Cycles are not supported; ` +
            `repeating a run belongs to the layer above the graph.`,
        );
      }

      const records = await Promise.all(
        wave.map(async (id) => {
          const transform = this.byId.get(id)!;
          const stepInput = inputFor(id);
          const startedAt = Date.now();
          let output: unknown;
          try {
            output = await transform.run(stepInput, context);
          } catch (cause) {
            throw new TransformExecutionError({
              graphId: this.id,
              transformId: transform.id,
              transformName: transform.name,
              stepIndex: stepIndex++,
              cause,
            });
          }
          const finishedAt = Date.now();
          return { id, transform, stepInput, output, startedAt, finishedAt };
        }),
      );

      for (const r of records) {
        outputs.set(r.id, r.output);
        done.add(r.id);
        trace.push(
          createTraceStep({
            transformId: r.transform.id,
            transformName: r.transform.name,
            input: r.stepInput,
            output: r.output,
            startedAt: r.startedAt,
            finishedAt: r.finishedAt,
          }),
        );
      }
    }

    const baseRun: GraphRun<I, O> = {
      graphId: this.id,
      context,
      input,
      output: outputs.get(this.endId) as O,
      trace,
    };

    return finishRun(baseRun, context, this.evaluator, this.feedback);
  }
}

function resolveSingle(params: {
  graphId: string;
  explicit: string | undefined;
  candidates: string[];
  role: string;
}): string {
  if (params.explicit !== undefined) return params.explicit;
  if (params.candidates.length === 1) return params.candidates[0]!;
  throw new Error(
    `Graph "${params.graphId}" needs exactly one ${params.role}, but found ` +
      `${params.candidates.length}: [${params.candidates.join(", ")}]. ` +
      `Set it explicitly.`,
  );
}

/**
 * Create a {@link ModelGraph} from a configuration object. With no connections
 * the transforms run as a straight line; with connections they run as a
 * branch/merge graph.
 */
export function createModelGraph<I, O>(
  config: ModelGraphConfig<I, O>,
): ModelGraph<I, O> {
  if (config.connections && config.connections.length > 0) {
    return new GraphModelGraph<I, O>(config);
  }
  return new LinearModelGraph<I, O>(config);
}
