import { describe, expect, it } from "vitest";
import { createModelGraph, createTransform } from "@composable-model-graph/core";

const start = createTransform<number, number>({
  id: "start",
  name: "Start",
  run: (input) => input,
});

const plusOne = createTransform<number, number>({
  id: "plus-one",
  name: "Plus one",
  run: (input) => input + 1,
});

const timesTen = createTransform<number, number>({
  id: "times-ten",
  name: "Times ten",
  run: (input) => input * 10,
});

const sum = createTransform<number[], number>({
  id: "sum",
  name: "Sum",
  run: (inputs) => inputs.reduce((a, b) => a + b, 0),
});

describe("ModelGraph connections (branch/merge)", () => {
  it("still runs as a straight line when no connections are given", async () => {
    const graph = createModelGraph<number, number>({
      id: "linear",
      name: "Linear",
      transforms: [start, plusOne, timesTen],
    });
    const run = await graph.run(2);
    // (2 + 1) * 10
    expect(run.output).toBe(30);
    expect(run.trace).toHaveLength(3);
  });

  it("runs both sides of a branch and a merge receives the ordered list", async () => {
    const graph = createModelGraph<number, number>({
      id: "branch-merge",
      name: "Branch then merge",
      transforms: [start, plusOne, timesTen, sum],
      connections: [
        { from: "start", to: "plus-one" },
        { from: "start", to: "times-ten" },
        { from: "plus-one", to: "sum" },
        { from: "times-ten", to: "sum" },
      ],
    });

    const run = await graph.run(2);
    // sum receives [start->plus-one = 3, start->times-ten = 20] in connection order
    expect(run.output).toBe(23);

    const sumStep = run.trace.find((s) => s.transformId === "sum");
    expect(sumStep?.input).toEqual([3, 20]);
    expect(run.trace).toHaveLength(4);
  });

  it("rejects connections that form a cycle", async () => {
    const a = createTransform<number, number>({
      id: "a",
      name: "A",
      run: (input) => input,
    });
    const b = createTransform<number, number>({
      id: "b",
      name: "B",
      run: (input) => input,
    });

    expect(() =>
      createModelGraph<number, number>({
        id: "cyclic",
        name: "Cyclic",
        transforms: [start, a, b],
        connections: [
          { from: "start", to: "a" },
          { from: "a", to: "b" },
          { from: "b", to: "a" },
        ],
      }),
    ).toThrow(/exactly one end/);
  });

  it("errors at run time when a cycle has no clean start/end pin", async () => {
    const graph = createModelGraph<number, number>({
      id: "cyclic-pinned",
      name: "Cyclic pinned",
      transforms: [start, plusOne, timesTen],
      start: "start",
      end: "times-ten",
      connections: [
        { from: "start", to: "plus-one" },
        { from: "plus-one", to: "times-ten" },
        { from: "times-ten", to: "plus-one" },
      ],
    });

    await expect(graph.run(1)).rejects.toThrow(/cycle/);
  });

  it("rejects a connection that references an unknown transform", async () => {
    expect(() =>
      createModelGraph<number, number>({
        id: "bad-ref",
        name: "Bad ref",
        transforms: [start, plusOne],
        connections: [{ from: "start", to: "missing" }],
      }),
    ).toThrow(/unknown transform/);
  });
});
