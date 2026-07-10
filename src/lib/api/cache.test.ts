import { beforeEach, describe, expect, it, vi } from "vitest";

import { cachedFetch, clearCache } from "./cache";

describe("cachedFetch", () => {
  beforeEach(() => {
    clearCache();
  });

  it("parses and returns the response body", async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ value: 42 }),
      ok: true,
    });
    const result = await cachedFetch(
      "https://example.com/a",
      (json) => json as { value: number },
      fetchFn
    );
    expect(result.value).toBe(42);
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("caches responses by URL and does not refetch", async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ value: 1 }),
      ok: true,
    });
    await cachedFetch("https://example.com/b", (json) => json, fetchFn);
    await cachedFetch("https://example.com/b", (json) => json, fetchFn);
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("throws on a non-ok response", async () => {
    const fetchFn = vi.fn().mockResolvedValue({ ok: false, status: 404 });
    await expect(
      cachedFetch("https://example.com/missing", (json) => json, fetchFn)
    ).rejects.toThrow(/404/u);
  });
});
