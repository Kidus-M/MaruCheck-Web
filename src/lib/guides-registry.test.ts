import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { renderLlmsTxt } from "@/lib/agent-files";
import { GUIDE_SLUGS, GUIDES, guidePath } from "@/lib/guides-registry";
import { absoluteUrl, SITE_NAME } from "@/lib/seo";

describe("guides registry", () => {
  it.each(GUIDE_SLUGS)("%s has a title that fits a search result", (slug) => {
    // Google truncates around 60 characters; the " · MaruCheck" suffix may be cut,
    // but the question itself must survive.
    expect(GUIDES[slug].title.length).toBeLessThanOrEqual(60);
    expect(`${GUIDES[slug].title} · ${SITE_NAME}`.length).toBeLessThanOrEqual(72);
  });

  it.each(GUIDE_SLUGS)("%s has a description that is not truncated", (slug) => {
    expect(GUIDES[slug].description.length).toBeGreaterThanOrEqual(110);
    expect(GUIDES[slug].description.length).toBeLessThanOrEqual(160);
  });

  it.each(GUIDE_SLUGS)("%s has standalone FAQ answers", (slug) => {
    expect(GUIDES[slug].faq.length).toBeGreaterThanOrEqual(3);
    for (const item of GUIDES[slug].faq) {
      expect(item.question.endsWith("?")).toBe(true);
      const words = item.answer.split(/\s+/).length;
      expect(words).toBeGreaterThanOrEqual(35);
      expect(words).toBeLessThanOrEqual(70);
    }
  });

  it("keeps every title and question unique across guides", () => {
    const titles = GUIDE_SLUGS.map((slug) => GUIDES[slug].title);
    const questions = GUIDE_SLUGS.flatMap((slug) => GUIDES[slug].faq.map((item) => item.question));
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(questions).size).toBe(questions.length);
  });

  it("publishes every guide in the sitemap and llms.txt", () => {
    const sitemapUrls = sitemap().map((entry) => entry.url);
    const llms = renderLlmsTxt();

    expect(sitemapUrls).toContain(absoluteUrl("/guides"));
    for (const slug of GUIDE_SLUGS) {
      expect(sitemapUrls).toContain(absoluteUrl(guidePath(slug)));
      expect(llms).toContain(absoluteUrl(guidePath(slug)));
    }
  });
});
