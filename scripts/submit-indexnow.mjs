// Pushes every URL in the live sitemap to IndexNow, which shares submissions
// between Bing, Yandex, Seznam, Naver, and other participating engines. Bing's
// index also feeds ChatGPT search, Microsoft Copilot, and DuckDuckGo, so a
// submission there is the fastest way for a new page to become citable.
//
// The key is public by design: IndexNow proves ownership by fetching
// /<key>.txt from the same host, which lives in public/.

const INDEXNOW_KEY = "dc4c49d102c4eaa6bb282fb38ed4dc49";
const origin = new URL(process.argv[2] ?? process.env.DEPLOYMENT_URL ?? "https://marucheck.dev");

const sitemap = await fetch(new URL("/sitemap.xml", origin), {
  signal: AbortSignal.timeout(15_000),
});
if (!sitemap.ok) {
  console.error(`Could not read ${origin.origin}/sitemap.xml (HTTP ${sitemap.status}).`);
  process.exit(1);
}

const urlList = [...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((match) => match[1].trim())
  .filter((url) => new URL(url).host === origin.host);

if (urlList.length === 0) {
  console.error("The sitemap listed no URLs for this host; nothing was submitted.");
  process.exit(1);
}

const response = await fetch("https://api.indexnow.org/indexnow", {
  body: JSON.stringify({
    host: origin.host,
    key: INDEXNOW_KEY,
    keyLocation: `${origin.origin}/${INDEXNOW_KEY}.txt`,
    urlList,
  }),
  headers: { "Content-Type": "application/json; charset=utf-8" },
  method: "POST",
  signal: AbortSignal.timeout(15_000),
});

// 200 and 202 both mean accepted; 202 means the key is still being validated.
if (response.status !== 200 && response.status !== 202) {
  console.error(`IndexNow rejected the submission with HTTP ${response.status}.`);
  console.error(await response.text());
  process.exit(1);
}

console.log(`Submitted ${urlList.length} URLs to IndexNow (HTTP ${response.status}).`);
