import { describe, expect, it } from "vitest";
import { getNextJobStatus, isActiveJob } from "@/lib/craftsman";

describe("Craftsman request status flow", () => {
  it("moves an accepted request through execution in the required order", () => {
    expect(getNextJobStatus("new")).toBe("accepted");
    expect(getNextJobStatus("accepted")).toBe("on_way");
    expect(getNextJobStatus("on_way")).toBe("arrived");
    expect(getNextJobStatus("arrived")).toBe("in_progress");
    expect(getNextJobStatus("in_progress")).toBe("completed");
  });

  it("does not advance completed or rejected requests", () => {
    expect(getNextJobStatus("completed")).toBeNull();
    expect(getNextJobStatus("cancelled")).toBeNull();
  });

  it("counts only accepted requests still being executed as active", () => {
    expect(isActiveJob("new")).toBe(false);
    expect(isActiveJob("accepted")).toBe(true);
    expect(isActiveJob("on_way")).toBe(true);
    expect(isActiveJob("arrived")).toBe(true);
    expect(isActiveJob("in_progress")).toBe(true);
    expect(isActiveJob("completed")).toBe(false);
    expect(isActiveJob("cancelled")).toBe(false);
  });
});
