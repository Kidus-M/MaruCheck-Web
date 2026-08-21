import { expect, test } from "@playwright/test";

test("client navigation reveals product and documentation content without a reload", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: /Test what your AI/i }),
  ).toBeVisible();

  const primaryNavigation = page.getByRole("navigation", { name: "Primary navigation" });
  await primaryNavigation.getByRole("link", { name: "Product" }).click();
  await expect(page).toHaveURL(/\/product$/u);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "A verifier with a contract, a memory, and the authority to say no.",
    }),
  ).toBeVisible();

  await primaryNavigation.getByRole("link", { name: "Docs" }).click();
  await expect(page).toHaveURL(/\/docs$/u);
  await expect(page.getByRole("heading", { level: 1, name: "Build a release proof loop." })).toBeVisible();
  await page.getByRole("link", { name: "Production feedback" }).first().click();
  await expect(page.getByRole("heading", { level: 1, name: "Production feedback" })).toBeVisible();
});

test("mobile navigation exposes docs and beta sign-in", async ({ page }) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  const mobileNavigation = page.getByRole("navigation", { name: "Mobile navigation" });
  await expect(mobileNavigation).toBeVisible();
  await mobileNavigation.getByRole("link", { name: /Docs/u }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Build a release proof loop." })).toBeVisible();

  await page.getByRole("link", { name: "Sign in" }).first().click();
  await expect(page.getByRole("heading", { level: 2, name: "Sign in to your workspace" })).toBeVisible();
});

test("liveness, readiness, and security headers are deployable", async ({ request }) => {
  const liveness = await request.get("/api/health/live");
  const readiness = await request.get("/api/health/ready");

  expect(liveness.ok()).toBe(true);
  expect((await liveness.json()).status).toBe("alive");
  expect(readiness.ok()).toBe(true);
  expect((await readiness.json()).status).toBe("ready");
  expect(readiness.headers()["cache-control"]).toBe("no-store");
  expect(readiness.headers()["x-content-type-options"]).toBe("nosniff");
  expect(readiness.headers()["x-frame-options"]).toBe("DENY");
});
