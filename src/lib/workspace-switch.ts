interface SetActiveResult {
  readonly error?: { readonly message?: string } | null;
}

type SetActiveOrganization = (input: {
  readonly organizationId: string;
}) => Promise<SetActiveResult>;

export async function activateOrganization(
  organizationId: string,
  setActive: SetActiveOrganization,
  onActivated: () => void,
): Promise<string | undefined> {
  try {
    const result = await setActive({ organizationId });
    if (result.error) {
      return result.error.message ?? "The workspace could not be changed.";
    }
    onActivated();
    return undefined;
  } catch {
    return "The workspace could not be changed. Please try again.";
  }
}
