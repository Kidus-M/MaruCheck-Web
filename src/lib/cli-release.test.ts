import { describe, expect, it, vi } from "vitest";
import { cliRelease, fetchCliRelease } from "./cli-release";
import { MARUCHECK_CLI_FALLBACK_VERSION } from "./public-release";

const fallback = cliRelease(MARUCHECK_CLI_FALLBACK_VERSION);

function respondWith(body: unknown, status = 200): typeof fetch {
  return vi.fn(async () => new Response(JSON.stringify(body), { status })) as typeof fetch;
}

describe("fetchCliRelease", () => {
  it("advertises the version npm tags latest", async () => {
    const fetcher = respondWith({ name: "marucheck", version: "9.4.2" });

    await expect(fetchCliRelease(fetcher)).resolves.toEqual({
      spec: "marucheck@9.4.2",
      version: "9.4.2",
    });
    expect(fetcher).toHaveBeenCalledWith(
      "https://registry.npmjs.org/marucheck/latest",
      expect.objectContaining({ next: { revalidate: 3_600 } }),
    );
  });

  it("falls back to the pinned version when the registry fails", async () => {
    await expect(fetchCliRelease(respondWith({ error: "Not found" }, 404))).resolves.toEqual(
      fallback,
    );
    await expect(
      fetchCliRelease(vi.fn(async () => Promise.reject(new Error("offline"))) as typeof fetch),
    ).resolves.toEqual(fallback);
  });

  it("ignores versions that are not plain releases", async () => {
    await expect(fetchCliRelease(respondWith({ version: "1.0.0-beta.1" }))).resolves.toEqual(
      fallback,
    );
    await expect(fetchCliRelease(respondWith({ version: 7 }))).resolves.toEqual(fallback);
  });
});
