import type { EvaluationResult, RunContext } from "./types.js";

/**
 * An Evaluator judges the quality of an output, optionally against a target.
 * It is the "judgment of output quality" stage of the generic shape.
 *
 * @typeParam O - the output type being evaluated
 * @typeParam T - the target/expected type (defaults to unknown)
 */
export interface Evaluator<O, T = unknown> {
  readonly id: string;
  readonly name: string;
  evaluate(
    output: O,
    target: T | undefined,
    context: RunContext,
  ): EvaluationResult | Promise<EvaluationResult>;
}

/** Definition object for {@link createEvaluator}. */
export interface EvaluatorDefinition<O, T = unknown> {
  readonly id: string;
  readonly name: string;
  evaluate(
    output: O,
    target: T | undefined,
    context: RunContext,
  ): EvaluationResult | Promise<EvaluationResult>;
}

/** Create an {@link Evaluator} from a plain definition object. */
export function createEvaluator<O, T = unknown>(
  definition: EvaluatorDefinition<O, T>,
): Evaluator<O, T> {
  return {
    id: definition.id,
    name: definition.name,
    evaluate: definition.evaluate,
  };
}
