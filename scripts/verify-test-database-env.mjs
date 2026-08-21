const pooledUrl = process.env.TEST_DATABASE_URL;
const directUrl = process.env.TEST_DATABASE_URL_UNPOOLED;
if (!pooledUrl || !directUrl || process.env.ALLOW_TEST_DATABASE_MUTATIONS !== "true") {
  console.error(
    "Database integration tests require TEST_DATABASE_URL, TEST_DATABASE_URL_UNPOOLED, and ALLOW_TEST_DATABASE_MUTATIONS=true for an isolated branch.",
  );
  process.exit(1);
}

for (const [name, rawUrl] of [
  ["TEST_DATABASE_URL", pooledUrl],
  ["TEST_DATABASE_URL_UNPOOLED", directUrl],
]) {
  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    console.error(`${name} is not a valid URL.`);
    process.exit(1);
  }
  if (!url.hostname.endsWith(".neon.tech") || url.searchParams.get("sslmode") !== "require") {
    console.error(`${name} must target a TLS-enabled Neon branch.`);
    process.exit(1);
  }
}

if (!new URL(pooledUrl).hostname.includes("-pooler.")) {
  console.error("TEST_DATABASE_URL must use the pooled Neon endpoint.");
  process.exit(1);
}
if (new URL(directUrl).hostname.includes("-pooler.")) {
  console.error("TEST_DATABASE_URL_UNPOOLED must use the direct Neon endpoint.");
  process.exit(1);
}
