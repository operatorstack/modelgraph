import { describe, expect, it } from "vitest";
import {
  createEvaluator,
  createRunContext,
  type EvaluationResult,
} from "@composable-model-graph/core";

describe("createEvaluator", () => {
  it("builds an evaluator that returns an EvaluationResult", async () => {
    const evaluator = createEvaluator<number, number>({
      id: "close-enough",
      name: "Close enough",
      evaluate: (output, target): EvaluationResult => {
        const error = Math.abs(output - (target ?? 0));
        return {
          status: error < 0.5 ? "pass" : "fail",
          error,
          evidence: [{ label: "abs-error", value: error }],
        };
      },
    });

    const ctx = createRunContext({ target: 1 });
    const result = await evaluator.evaluate(1.1, 1, ctx);
    expect(result.status).toBe("pass");
    expect(result.error).toBeCloseTo(0.1, 5);
    expect(result.evidence?.[0]?.label).toBe("abs-error");
  });

  it("handles an undefined target", async () => {
    const evaluator = createEvaluator<string>({
      id: "non-empty",
      name: "Non-empty",
      evaluate: (output): EvaluationResult =>
        output.length > 0 ? { status: "pass" } : { status: "fail" },
    });
    const result = await evaluator.evaluate("x", undefined, createRunContext());
    expect(result.status).toBe("pass");
  });
});
