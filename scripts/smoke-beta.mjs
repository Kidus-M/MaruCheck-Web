const rawOrigin = process.argv[2] ?? process.env.BETA_URL;
if (!rawOrigin) {
  console.error("Beta smoke test requires a URL argument or BETA_URL.");
  process.exit(1);
}

const origin = new URL(rawOrigin);
if (origin.protocol !== "https:" && !["127.0.0.1", "localhost"].includes(origin.hostname)) {
  console.error("Beta smoke test requires HTTPS except for a local server.");
  process.exit(1);
}

const protectionSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const headers = protectionSecret
  ? {
      "x-vercel-protection-bypass": protectionSecret,
      "x-vercel-set-bypass-cookie": "true",
    }
  : {};
const checks = [
  ["/api/health/live", '"status":"alive"'],
  ["/api/health/ready", '"status":"ready"'],
  ["/", "Independent QA for AI-generated software"],
  ["/docs/production-feedback", "Production feedback"],
  ["/sign-in", "Sign in to your workspace"],
];

for (const [path, expected] of checks) {
  const response = await fetch(new URL(path, origin), {
    headers,
    redirect: "follow",
    signal: AbortSignal.timeout(15_000),
  });
  const body = await response.text();
  if (!response.ok || !body.includes(expected)) {
    console.error(`${path} failed beta smoke verification with HTTP ${response.status}.`);
    process.exit(1);
  }
  if (response.headers.get("x-content-type-options") !== "nosniff") {
    console.error(`${path} is missing the required X-Content-Type-Options header.`);
    process.exit(1);
  }
  console.log(`${path} passed.`);
}

console.log(`Beta smoke verification passed for ${origin.origin}.`);
