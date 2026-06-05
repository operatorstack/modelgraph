import { describe, expect, it } from "vitest";
import {
  createRunContext,
  createTransform,
  toTransformNode,
} from "@composable-model-graph/core";

describe("createTransform", () => {
  it("builds a transform from a definition and runs it", async () => {
    const upper = createTransform<string, string>({
      id: "upper",
      name: "Uppercase",
      description: "Uppercases a string",
      run: (input) => input.toUpperCase(),
    });

    expect(upper.id).toBe("upper");
    expect(upper.name).toBe("Uppercase");
    expect(upper.description).toBe("Uppercases a string");
    expect(await upper.run("hi", createRunContext())).toBe("HI");
  });

  it("supports async transforms", async () => {
    const t = createTransform<number, number>({
      id: "double",
      name: "Double",
      run: async (input) => input * 2,
    });
    expect(await t.run(21, createRunContext())).toBe(42);
  });

  it("wraps a transform in an identifiable node", () => {
    const t = createTransform<number, number>({
      id: "id",
      name: "Identity",
      run: (x) => x,
    });
    const node = toTransformNode(t);
    expect(node.id).toBe("id");
    expect(node.name).toBe("Identity");
    expect(node.transform).toBe(t);
  });
});
