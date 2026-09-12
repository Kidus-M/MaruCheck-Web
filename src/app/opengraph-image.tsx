import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const contentType = "image/png";
export const size = { height: 630, width: 1200 };

const INK = "#101720";
const PANEL = "#17212b";
const PAPER = "#f3f4ef";
const INDIGO = "#455ab5";

/**
 * Social card shared by every public page. Rendered from brand tokens rather
 * than a static asset so the tagline and wordmark cannot fall out of sync.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: PANEL,
          color: PAPER,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          padding: "72px 80px",
          width: "100%",
        }}
      >
        <div style={{ alignItems: "center", display: "flex", gap: 18 }}>
          <div
            style={{
              background: INDIGO,
              borderRadius: 999,
              height: 26,
              width: 26,
            }}
          />
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5 }}>{SITE_NAME}</div>
          <div
            style={{
              border: `1px solid rgba(243,244,239,0.28)`,
              borderRadius: 999,
              color: "rgba(243,244,239,0.72)",
              fontSize: 20,
              letterSpacing: 1.6,
              padding: "6px 16px",
            }}
          >
            OPEN SOURCE / MIT
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              fontSize: 88,
              fontWeight: 700,
              letterSpacing: -2.5,
              lineHeight: 1.02,
            }}
          >
            Test what your AI didn&rsquo;t.
          </div>
          <div
            style={{
              color: "rgba(243,244,239,0.66)",
              fontSize: 30,
              lineHeight: 1.4,
              maxWidth: 900,
            }}
          >
            Independent verification for AI-coded software. Approved behavior, a real diff, and a
            release decision you can inspect.
          </div>
        </div>

        <div
          style={{
            alignItems: "center",
            borderTop: "1px solid rgba(243,244,239,0.16)",
            color: "rgba(243,244,239,0.6)",
            display: "flex",
            fontSize: 24,
            gap: 24,
            paddingTop: 26,
          }}
        >
          <span style={{ color: PAPER }}>marucheck.dev</span>
          <span style={{ color: INDIGO }}>/</span>
          <span>intent → risk → verification → evidence</span>
        </div>
        <div style={{ background: INK, display: "none" }} />
      </div>
    ),
    size,
  );
}
