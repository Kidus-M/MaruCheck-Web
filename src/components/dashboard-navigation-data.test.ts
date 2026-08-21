import { access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { navigationGroups } from "@/components/dashboard-navigation-data";

describe("dashboard navigation", () => {
  it("only links to dashboard pages included in the application source", async () => {
    const dashboardRoutes = fileURLToPath(new URL("../app/(dashboard)/", import.meta.url));
    const items = navigationGroups.flatMap((group) => group.items);

    await Promise.all(
      items.map(async ({ href }) => {
        const route = href === "/dashboard" ? "dashboard" : href.slice(1);
        await expect(access(`${dashboardRoutes}${route}/page.tsx`)).resolves.toBeUndefined();
      }),
    );
  });
});
