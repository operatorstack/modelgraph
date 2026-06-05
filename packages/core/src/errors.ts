/**
 * Error thrown when a transform fails during a graph run. Carries enough
 * context to locate the failure within the graph.
 */
export class TransformExecutionError extends Error {
  readonly graphId: string;
  readonly transformId: string;
  readonly transformName: string;
  readonly stepIndex: number;
  override readonly cause?: unknown;

  constructor(params: {
    graphId: string;
    transformId: string;
    transformName: string;
    stepIndex: number;
    cause: unknown;
  }) {
    const causeMessage =
      params.cause instanceof Error
        ? params.cause.message
        : String(params.cause);
    super(
      `Transform "${params.transformName}" (id: ${params.transformId}) ` +
        `failed at step ${params.stepIndex} in graph "${params.graphId}": ` +
        causeMessage,
    );
    this.name = "TransformExecutionError";
    this.graphId = params.graphId;
    this.transformId = params.transformId;
    this.transformName = params.transformName;
    this.stepIndex = params.stepIndex;
    this.cause = params.cause;
  }
}
