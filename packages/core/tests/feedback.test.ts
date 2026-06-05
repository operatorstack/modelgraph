import { describe, expect, it } from "vitest";
import {
  createFeedbackResolver,
  createRunContext,
  feedbackAction,
  type GraphRun,
} from "@composable-model-graph/core";

const fakeRun: GraphRun<string, string> = {
  graphId: "g",
  context: createRunContext({ runId: "run_test" }),
  input: "in",
  output: "out",
  trace: [],
};

describe("createFeedbackResolver", () => {
  it("resolves an evaluation into a feedback action", async () => {
    const resolver = createFeedbackResolver<string, string>({
      resolve: (_run, evaluation) => {
        if (evaluation?.status === "pass") return feedbackAction("accept");
        return feedbackAction("retry", { reason: "not passing" });
      },
    });

    const accept = await resolver.resolve(
      fakeRun,
      { status: "pass" },
      fakeRun.context,
    );
    expect(accept.type).toBe("accept");

    const retry = await resolver.resolve(
      fakeRun,
      { status: "fail" },
      fakeRun.context,
    );
    expect(retry.type).toBe("retry");
    expect(retry.reason).toBe("not passing");
  });
});

describe("feedbackAction", () => {
  it("constructs a feedback action with optional fields", () => {
    const action = feedbackAction("adjust", {
      reason: "tune",
      payload: { delta: 0.1 },
    });
    expect(action.type).toBe("adjust");
    expect(action.reason).toBe("tune");
    expect(action.payload).toEqual({ delta: 0.1 });
  });
});
