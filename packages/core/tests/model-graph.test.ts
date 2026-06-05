import { describe, expect, it } from "vitest";
import {
  createEvaluator,
  createFeedbackResolver,
  createModelGraph,
  createTransform,
  TransformExecutionError,
  type EvaluationResult,
} from "@composable-model-graph/core";

const trim = createTransform<string, string>({
  id: "trim",
  name: "Trim",
  run: (input) => input.trim(),
});

const lower = createTransform<string, string>({
  id: "lower",
  name: "Lowercase",
  run: (input) => input.toLowerCase(),
});

describe("ModelGraph", () => {
  it("runs transforms in order and returns the final output", async () => {
    const graph = createModelGraph<string, string>({
      id: "clean",
      name: "Clean string",
      transforms: [trim, lower],
    });

    const run = await graph.run("  HeLLo  ");
    expect(run.output).toBe("hello");
    expect(run.input).toBe("  HeLLo  ");
    expect(run.graphId).toBe("clean");
  });

  it("records a trace step for every transform with intermediate state", async () => {
    const graph = createModelGraph<string, string>({
      id: "clean",
      name: "Clean string",
      transforms: [trim, lower],
    });

    const run = await graph.run("  HeLLo  ");
    expect(run.trace).toHaveLength(2);

    const [first, second] = run.trace;
    expect(first?.transformId).toBe("trim");
    expect(first?.input).toBe("  HeLLo  ");
    expect(first?.output).toBe("HeLLo");
    expect(first?.startedAt).toBeTypeOf("number");
    expect(first?.finishedAt).toBeGreaterThanOrEqual(first!.startedAt);

    expect(second?.transformId).toBe("lower");
    expect(second?.input).toBe("HeLLo");
    expect(second?.output).toBe("hello");
  });

  it("attaches an evaluation result when an evaluator is present", async () => {
    const nonEmpty = createEvaluator<string>({
      id: "non-empty",
      name: "Non-empty string",
      evaluate: (output): EvaluationResult =>
        output.length > 0
          ? { status: "pass", score: 1 }
          : { status: "fail", score: 0 },
    });

    const graph = createModelGraph<string, string>({
      id: "clean",
      name: "Clean string",
      transforms: [trim, lower],
      evaluator: nonEmpty,
    });

    const run = await graph.run("  HeLLo  ");
    expect(run.evaluation?.status).toBe("pass");
    expect(run.evaluation?.score).toBe(1);
    expect(run.feedback).toBeUndefined();
  });

  it("returns a feedback action when a feedback resolver is present", async () => {
    const evaluator = createEvaluator<string>({
      id: "always-pass",
      name: "Always pass",
      evaluate: (): EvaluationResult => ({ status: "pass" }),
    });

    const resolver = createFeedbackResolver<string, string>({
      resolve: (_run, evaluation) =>
        evaluation?.status === "pass" ? { type: "accept" } : { type: "retry" },
    });

    const graph = createModelGraph<string, string>({
      id: "clean",
      name: "Clean string",
      transforms: [trim, lower],
      evaluator,
      feedback: resolver,
    });

    const run = await graph.run("  HeLLo  ");
    expect(run.feedback?.type).toBe("accept");
  });

  it("passes the run target through context to the evaluator", async () => {
    const matchTarget = createEvaluator<string, string>({
      id: "match",
      name: "Match target",
      evaluate: (output, target): EvaluationResult =>
        output === target ? { status: "pass" } : { status: "fail" },
    });

    const graph = createModelGraph<string, string>({
      id: "clean",
      name: "Clean string",
      transforms: [trim, lower],
      evaluator: matchTarget,
    });

    const run = await graph.run("  HeLLo  ", { target: "hello" });
    expect(run.evaluation?.status).toBe("pass");
    expect(run.context.target).toBe("hello");
  });

  it("throws a TransformExecutionError with context on failure", async () => {
    const boom = createTransform<string, string>({
      id: "boom",
      name: "Explode",
      run: () => {
        throw new Error("kaboom");
      },
    });

    const graph = createModelGraph<string, string>({
      id: "failing",
      name: "Failing graph",
      transforms: [trim, boom],
    });

    await expect(graph.run("  hi  ")).rejects.toBeInstanceOf(
      TransformExecutionError,
    );

    try {
      await graph.run("  hi  ");
      expect.unreachable("expected the run to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(TransformExecutionError);
      const typed = error as TransformExecutionError;
      expect(typed.graphId).toBe("failing");
      expect(typed.transformId).toBe("boom");
      expect(typed.stepIndex).toBe(1);
      expect(typed.message).toContain("kaboom");
      expect((typed.cause as Error).message).toBe("kaboom");
    }
  });

  it("generates a run id when none is provided", async () => {
    const graph = createModelGraph<string, string>({
      id: "clean",
      name: "Clean string",
      transforms: [trim],
    });
    const run = await graph.run("hi");
    expect(run.context.runId).toMatch(/^run_/);
  });
});
