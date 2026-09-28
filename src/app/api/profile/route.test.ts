import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ createClient: vi.fn(), fetch: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createClient,
}));
vi.mock("@/lib/data", async () => import("../../../lib/data"));

import { POST } from "./route";

let testNumber = 0;
const introduction =
  "I can write beginner Python. I have not used NumPy. I want to learn pandas. I know Git basics.";
const makeRequest = (body: unknown = { text: introduction, consent: true }) =>
  new Request("http://localhost/api/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
const suggested = {
  skills: ["python"],
  interests: ["data-ai"],
  goal: "Build a first ML project",
  evidence: [{ skill: "python", quote: "I can write beginner Python." }],
};
const providerResponse = (value: unknown) =>
  Response.json({
    candidates: [{ content: { parts: [{ text: JSON.stringify(value) }] } }],
  });

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("GEMINI_API_KEY", "unit-test-key-not-a-real-secret");
  vi.stubEnv("GEMINI_MODEL", "gemini-3.5-flash-lite");
  vi.stubGlobal("fetch", mocks.fetch);
  vi.spyOn(Date, "now").mockReturnValue(1_000_000 + ++testNumber * 61_000);
  mocks.createClient.mockResolvedValue(null);
  mocks.fetch.mockImplementation(async () => providerResponse(suggested));
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("profile assistance validates before sending learner text", () => {
  it("uses the verified default model when no model is configured", async () => {
    vi.stubEnv("GEMINI_MODEL", undefined);
    const response = await POST(makeRequest());
    expect(response.status).toBe(200);
    expect(mocks.fetch).toHaveBeenCalledWith(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
      expect.objectContaining({ method: "POST", cache: "no-store" }),
    );
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("rejects malformed JSON without contacting auth or Gemini", async () => {
    const response = await POST(
      new Request("http://localhost/api/profile", {
        method: "POST",
        body: "not JSON",
      }),
    );
    expect(response.status).toBe(400);
    expect(mocks.createClient).not.toHaveBeenCalled();
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it.each([
    { text: introduction, consent: false },
    { text: "short", consent: true },
    { text: "x".repeat(2501), consent: true },
    { text: introduction, consent: true, unexpected: "ignore this" },
  ])("rejects missing consent or an invalid description", async (input) => {
    const response = await POST(makeRequest(input));
    expect(response.status).toBe(400);
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it("rejects an oversized request", async () => {
    const response = await POST(
      makeRequest({ text: "x".repeat(16_001), consent: true }),
    );
    expect(response.status).toBe(413);
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it("keeps manual entry available when the API key is missing", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    const response = await POST(makeRequest());
    expect(response.status).toBe(503);
    expect((await response.json()).error).toContain(
      "select your skills manually",
    );
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it("requires a valid account when Supabase is configured", async () => {
    mocks.createClient.mockResolvedValue({
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: null }, error: null }),
      },
    });
    const response = await POST(makeRequest());
    expect(response.status).toBe(401);
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it("does not fall back to unauthenticated AI when session verification fails", async () => {
    mocks.createClient.mockRejectedValue(
      new Error("Session verification unavailable"),
    );
    const response = await POST(makeRequest());
    expect(response.status).toBe(401);
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
});

describe("profile suggestions must have affirmative evidence", () => {
  it.each([
    { text: "I don’t know Python.", skill: "python", quote: "know Python" },
    { text: "I haven’t used NumPy.", skill: "numpy", quote: "used NumPy" },
    { text: "I can’t use pandas.", skill: "pandas", quote: "use pandas" },
    {
      text: "I have no experience with Python.",
      skill: "python",
      quote: "experience with Python",
    },
  ])(
    "rejects negative evidence with typographic apostrophes or no experience: $text",
    async ({ text, skill, quote }) => {
      mocks.fetch.mockResolvedValue(
        providerResponse({
          ...suggested,
          skills: [skill],
          evidence: [{ skill, quote }],
        }),
      );
      const response = await POST(makeRequest({ text, consent: true }));
      expect(response.status).toBe(200);
      expect((await response.json()).skills).toEqual([]);
    },
  );

  it("preserves exact affirmative quotes, deduplicates skills and removes negative or aspirational evidence", async () => {
    mocks.fetch.mockResolvedValue(
      providerResponse({
        skills: ["python", "python", "numpy", "pandas", "git", "ml-project"],
        interests: ["data-ai", "data-ai"],
        goal: "Explore ML",
        evidence: [
          { skill: "python", quote: "I can write beginner Python." },
          { skill: "python", quote: "beginner Python" },
          { skill: "numpy", quote: "used NumPy" },
          { skill: "pandas", quote: "learn pandas" },
          { skill: "git", quote: "I know Git basics." },
          { skill: "ml-project", quote: "I built a machine learning project" },
        ],
      }),
    );
    const response = await POST(makeRequest());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      skills: ["python", "git"],
      interests: ["data-ai"],
      goal: "Explore ML",
      evidence: [
        { skill: "python", quote: "I can write beginner Python." },
        { skill: "git", quote: "I know Git basics." },
      ],
    });
    expect(response.headers.get("cache-control")).toBe("private, no-store");
  });

  it("does not retain skills without source evidence", async () => {
    mocks.fetch.mockResolvedValue(
      providerResponse({ ...suggested, evidence: [] }),
    );
    const response = await POST(makeRequest());
    expect(response.status).toBe(200);
    expect((await response.json()).skills).toEqual([]);
  });

  it("rejects an unknown skill instead of silently inventing an expertise field", async () => {
    mocks.fetch.mockResolvedValue(
      providerResponse({ ...suggested, skills: ["invented-expertise"] }),
    );
    const response = await POST(makeRequest());
    expect(response.status).toBe(502);
    expect((await response.json()).error).toContain("invalid suggestion");
  });

  it("rejects an unstructured provider response", async () => {
    mocks.fetch.mockResolvedValue(Response.json({ candidates: [] }));
    const response = await POST(makeRequest());
    expect(response.status).toBe(502);
  });

  it("rejects invalid generated JSON without crashing the route", async () => {
    mocks.fetch.mockResolvedValue(
      Response.json({
        candidates: [{ content: { parts: [{ text: "This is not JSON" }] } }],
      }),
    );
    const response = await POST(makeRequest());
    expect(response.status).toBe(502);
    expect((await response.json()).error).toContain("description is preserved");
  });
});

describe("upstream failures preserve the manual flow", () => {
  it.each([
    [400, 503, "configuration was rejected"],
    [401, 503, "key or its permissions"],
    [403, 503, "key or its permissions"],
    [404, 503, "model is not available"],
    [429, 429, "limit or quota"],
    [500, 502, "temporarily unavailable"],
    [503, 502, "temporarily unavailable"],
    [418, 502, "could not process"],
  ])(
    "handles provider status %i without leaking upstream details",
    async (upstream, expected, message) => {
      const privateProviderDetails = {
        error: `unit-test-key-not-a-real-secret ${introduction}`,
      };
      const upstreamResponse = Response.json(privateProviderDetails, {
        status: upstream as number,
      });
      const readProviderBody = vi.spyOn(upstreamResponse, "json");
      mocks.fetch.mockResolvedValue(upstreamResponse);
      const response = await POST(makeRequest());
      expect(response.status).toBe(expected);
      expect(response.headers.get("cache-control")).toBe("private, no-store");
      const result = await response.json();
      expect(result.error).toContain(message);
      expect(result.error).toMatch(/manual/i);
      expect(result.error).toContain("text is preserved");
      expect(result.error).not.toContain("unit-test-key-not-a-real-secret");
      expect(result.error).not.toContain(introduction);
      expect(readProviderBody).not.toHaveBeenCalled();
    },
  );

  it("returns a usable timeout response without waiting for a network call", async () => {
    const timeout = new Error("The mocked provider timed out");
    timeout.name = "TimeoutError";
    mocks.fetch.mockRejectedValue(timeout);
    const response = await POST(makeRequest());
    expect(response.status).toBe(504);
    expect((await response.json()).error).toContain("description is preserved");
  });

  it("limits repeated calls from one actor before contacting the provider again", async () => {
    for (let attempt = 0; attempt < 5; attempt++)
      expect((await POST(makeRequest())).status).toBe(200);
    const limited = await POST(makeRequest());
    expect(limited.status).toBe(429);
    expect(mocks.fetch).toHaveBeenCalledTimes(5);
  });
});
