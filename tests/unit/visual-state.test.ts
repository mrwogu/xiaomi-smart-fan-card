import { describe, expect, it } from "vitest";
import { getAirflowAxis } from "../../src/state/visual-state";

describe("getAirflowAxis", () => {
  it.each([
    [undefined, undefined, "still"],
    [false, false, "still"],
    [true, false, "horizontal"],
    [false, true, "vertical"],
    [true, true, "dual"],
  ] as const)("returns %s for horizontal=%s vertical=%s", (horizontal, vertical, expected) => {
    expect(getAirflowAxis(horizontal, vertical)).toBe(expected);
  });
});
