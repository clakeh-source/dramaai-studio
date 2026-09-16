import { describe, expect, it } from "vitest";
import { seedSeries } from "@/data/seed";
import { studioStateSchema } from "@/services/repository";

describe("studio persistence schema", () => {
  it("accepts complete studio data", () => {
    expect(studioStateSchema.safeParse({ series: [seedSeries()] }).success).toBe(true);
  });

  it("rejects malformed nested data before it reaches a view", () => {
    expect(studioStateSchema.safeParse({ series: [{}] }).success).toBe(false);
    expect(
      studioStateSchema.safeParse({
        series: [{ ...seedSeries(), episodes: [{ id: "broken" }] }],
      }).success,
    ).toBe(false);
  });
});
