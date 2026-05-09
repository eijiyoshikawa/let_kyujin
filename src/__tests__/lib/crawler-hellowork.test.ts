import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { fetchKyujinByDataId } from "@/lib/crawler/hellowork"

describe("fetchKyujinByDataId", () => {
  const realFetch = globalThis.fetch
  const realEnv = { user: process.env.HELLOWORK_API_USER, pass: process.env.HELLOWORK_API_PASS }

  beforeEach(() => {
    process.env.HELLOWORK_API_USER = "test-user"
    process.env.HELLOWORK_API_PASS = "test-pass"
  })

  afterEach(() => {
    globalThis.fetch = realFetch
    process.env.HELLOWORK_API_USER = realEnv.user
    process.env.HELLOWORK_API_PASS = realEnv.pass
    vi.restoreAllMocks()
  })

  it("returns [] when API responds 404 (page out of range)", async () => {
    globalThis.fetch = vi.fn(
      async () =>
        new Response("Not Found", {
          status: 404,
          statusText: "Not Found",
        })
    ) as typeof fetch

    const jobs = await fetchKyujinByDataId("dummy-token", "M105", 5)
    expect(jobs).toEqual([])
  })

  it("re-throws on non-404 errors (e.g. 500)", async () => {
    globalThis.fetch = vi.fn(
      async () =>
        new Response("Internal Server Error", {
          status: 500,
          statusText: "Internal Server Error",
        })
    ) as typeof fetch

    await expect(
      fetchKyujinByDataId("dummy-token", "M100", 1)
    ).rejects.toThrow(/500/)
  })
})
