import type { RunContext } from "./types.js";

/**
 * A Transform maps an input to an output. It is the atomic unit of work in a
 * model graph: the thing that maps input to output.
 */
export interface Transform<I, O> {
  /** Stable identifier, unique within a graph. */
  readonly id: string;
  /** Human-readable name. */
  readonly name: string;
  /** Optional description of what the transform does. */
  readonly description?: string;
  /** Map an input to an output, optionally asynchronously. */
  run(input: I, context: RunContext): O | Promise<O>;
}

/**
 * A thin wrapper that keeps a transform identifiable inside a graph. Useful
 * when wrapping a bare function or annotating an existing transform without
 * mutating it.
 */
export interface TransformNode<I, O> {
  readonly id: string;
  readonly name: string;
  readonly transform: Transform<I, O>;
}

/** Definition object for {@link createTransform}. */
export interface TransformDefinition<I, O> {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  run(input: I, context: RunContext): O | Promise<O>;
}

/** Create a {@link Transform} from a plain definition object. */
export function createTransform<I, O>(
  definition: TransformDefinition<I, O>,
): Transform<I, O> {
  return {
    id: definition.id,
    name: definition.name,
    description: definition.description,
    run: definition.run,
  };
}

/** Wrap a transform in a {@link TransformNode} for identifiable composition. */
export function toTransformNode<I, O>(
  transform: Transform<I, O>,
): TransformNode<I, O> {
  return {
    id: transform.id,
    name: transform.name,
    transform,
  };
}
