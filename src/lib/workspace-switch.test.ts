import { describe, expect, it, vi } from "vitest";
import { activateOrganization } from "./workspace-switch";

describe("workspace switching", () => {
  it("activates the selected organization before navigating", async () => {
    const setActive = vi.fn().mockResolvedValue({ error: null });
    const onActivated = vi.fn();

    const error = await activateOrganization("organization-2", setActive, onActivated);

    expect(error).toBeUndefined();
    expect(setActive).toHaveBeenCalledWith({ organizationId: "organization-2" });
    expect(onActivated).toHaveBeenCalledOnce();
  });

  it("keeps the current workspace when Better Auth rejects the switch", async () => {
    const setActive = vi.fn().mockResolvedValue({ error: { message: "Membership required" } });
    const onActivated = vi.fn();

    const error = await activateOrganization("organization-2", setActive, onActivated);

    expect(error).toBe("Membership required");
    expect(onActivated).not.toHaveBeenCalled();
  });

  it("returns a useful message when the request fails", async () => {
    const setActive = vi.fn().mockRejectedValue(new Error("network failure"));

    const error = await activateOrganization("organization-2", setActive, vi.fn());

    expect(error).toBe("The workspace could not be changed. Please try again.");
  });
});
