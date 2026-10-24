import { describe, expect, it } from "vitest";
import { canTransition, humanOnly, nextStatuses, statuses, transition } from "./contentWorkflow";

describe("content workflow", () => {
  it("cannot skip review: draft cannot go straight to approved", () => {
    expect(canTransition("draft", "approved")).toBe(false);
    expect(() => transition("draft", "ready_to_publish")).toThrow();
  });
  it("follows the normal path", () => {
    let s = transition("draft", "in_review");
    s = transition(s, "approved");
    s = transition(s, "ready_to_publish");
    expect(s).toBe("ready_to_publish");
  });
  it("changes requested must go back through review", () => {
    expect(nextStatuses("changes_requested")).toEqual(["in_review"]);
  });
  it("has no published status, and every status can move somewhere", () => {
    expect((statuses as readonly string[]).includes("published")).toBe(false);
    statuses.forEach((s) => expect(nextStatuses(s).length).toBeGreaterThan(0));
  });
  it("marks approval steps as human-only", () => {
    expect(humanOnly).toContain("approved");
  });
});
