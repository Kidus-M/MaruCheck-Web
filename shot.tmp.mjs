import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
for (const [url, name, y] of [
  ["http://localhost:3478/", "home-definition", 900],
  ["http://localhost:3478/", "home-faq", 99999],
  ["http://localhost:3478/faq", "faq-page", 0],
  ["http://localhost:3478/docs/qa-memory", "qa-memory", 0],
  ["http://localhost:3478/docs/getting-started", "docs-faq", 99999],
]) {
  await p.goto(url, { waitUntil: "networkidle" });
  await p.evaluate((yy) => window.scrollTo(0, yy), y);
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `C:/Users/hp/AppData/Local/Temp/claude/C--Users-hp-Desktop-work-personal-MaruCheck/46349c9b-3612-4c75-b34c-85260e4330d2/scratchpad/${name}.png` });
}
await b.close();
