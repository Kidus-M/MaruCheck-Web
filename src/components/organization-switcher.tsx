"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { authClient } from "@/lib/auth-client";
import { activateOrganization } from "@/lib/workspace-switch";
import type { Organization, OrganizationOption } from "@/lib/dashboard-types";

export function OrganizationSwitcher({
  activeOrganization,
  organizations,
}: {
  readonly activeOrganization: Organization;
  readonly organizations: readonly OrganizationOption[];
}) {
  const router = useRouter();
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [error, setError] = useState<string>();
  const [pendingId, setPendingId] = useState<string>();

  async function switchOrganization(organizationId: string) {
    if (pendingId) return;
    if (organizationId === activeOrganization.id) {
      detailsRef.current?.removeAttribute("open");
      return;
    }

    setError(undefined);
    setPendingId(organizationId);
    const switchError = await activateOrganization(
      organizationId,
      (input) => authClient.organization.setActive(input),
      () => {
        detailsRef.current?.removeAttribute("open");
        router.push("/dashboard");
        router.refresh();
      },
    );
    if (switchError) setError(switchError);
    setPendingId(undefined);
  }

  return (
    <details className="organization-switcher-menu" ref={detailsRef}>
      <summary className="organization-switcher" aria-label="Switch workspace">
        <span className="organization-switcher__seal" aria-hidden="true">
          {organizationInitial(activeOrganization.name)}
        </span>
        <span>
          <strong>{activeOrganization.name}</strong>
          <small>{activeOrganization.plan}</small>
        </span>
        <Icon name="chevron" />
      </summary>
      <div className="organization-switcher-menu__list">
        <p>Your workspaces</p>
        {organizations.map((organization) => {
          const active = organization.id === activeOrganization.id;
          return (
            <button
              aria-current={active ? "true" : undefined}
              disabled={pendingId !== undefined}
              key={organization.id}
              onClick={() => switchOrganization(organization.id)}
              type="button"
            >
              <span aria-hidden="true">{organizationInitial(organization.name)}</span>
              <span>
                <strong>{organization.name}</strong>
                <small>{active ? "Current workspace" : organization.slug}</small>
              </span>
              {active ? <Icon name="check" /> : null}
              {pendingId === organization.id ? <small>Switching…</small> : null}
            </button>
          );
        })}
        {error ? (
          <p className="organization-switcher-menu__error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </details>
  );
}

function organizationInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "M";
}
