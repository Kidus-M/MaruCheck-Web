export type SignupMode = "allowlist" | "locked" | "open";

export interface EnvironmentInspection {
  readonly errors: readonly string[];
  readonly ready: boolean;
  readonly signupMode: SignupMode;
  readonly warnings: readonly string[];
}

type EnvironmentInput = Readonly<Record<string, string | undefined>>;

export function inspectProductionEnvironment(
  environment: EnvironmentInput,
  options: { readonly production: boolean },
): EnvironmentInspection {
  const errors: string[] = [];
  const warnings: string[] = [];
  const databaseUrl = parsedUrl(environment.DATABASE_URL);
  if (databaseUrl === undefined || !["postgres:", "postgresql:"].includes(databaseUrl.protocol)) {
    errors.push("DATABASE_URL must be a valid PostgreSQL connection URL.");
  } else if (options.production) {
    if (!databaseUrl.hostname.endsWith(".neon.tech")) {
      errors.push("DATABASE_URL must target the selected Neon project.");
    } else if (!databaseUrl.hostname.includes("-pooler.")) {
      errors.push("DATABASE_URL must use the pooled Neon endpoint for the web runtime.");
    }
    if (databaseUrl.searchParams.get("sslmode") !== "require") {
      errors.push("DATABASE_URL must require TLS with sslmode=require.");
    }
  }

  validateSecret(environment.BETTER_AUTH_SECRET, "BETTER_AUTH_SECRET", errors);
  if (options.production || environment.CRON_SECRET) {
    validateSecret(environment.CRON_SECRET, "CRON_SECRET", errors);
  }

  const authUrl = parsedUrl(environment.BETTER_AUTH_URL);
  if (authUrl === undefined) {
    errors.push("BETTER_AUTH_URL must be an absolute application URL.");
  } else if (options.production && authUrl.protocol !== "https:") {
    errors.push("BETTER_AUTH_URL must use HTTPS outside local development.");
  }

  if (Boolean(environment.GITHUB_CLIENT_ID) !== Boolean(environment.GITHUB_CLIENT_SECRET)) {
    errors.push("GitHub OAuth requires both GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.");
  }
  if (Boolean(environment.GOOGLE_CLIENT_ID) !== Boolean(environment.GOOGLE_CLIENT_SECRET)) {
    errors.push("Google OAuth requires both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.");
  }

  const directUrl = parsedUrl(environment.DATABASE_URL_UNPOOLED);
  if (directUrl?.hostname.includes("-pooler.")) {
    warnings.push(
      "DATABASE_URL_UNPOOLED points to a pooled endpoint; migrations should use direct Neon.",
    );
  }

  const signupPolicy = resolveSignupPolicy(environment, options);
  const signupMode =
    signupPolicy === null ? "open" : signupPolicy.size > 0 ? "allowlist" : "locked";
  if (signupMode === "locked") {
    warnings.push(
      "New account creation is locked until MARUCHECK_ALLOWED_SIGNUP_EMAILS is configured.",
    );
  } else if (signupMode === "open" && options.production) {
    warnings.push("Open account creation is enabled in production.");
  }

  const invalidEmails = allowedSignupEmailValues(environment).filter((email) => !isEmail(email));
  if (invalidEmails.length > 0) {
    errors.push("MARUCHECK_ALLOWED_SIGNUP_EMAILS contains one or more invalid email addresses.");
  }

  return { errors, ready: errors.length === 0, signupMode, warnings };
}

/** Null means open registration; an empty set means registration is locked. */
export function resolveSignupPolicy(
  environment: EnvironmentInput,
  options: { readonly production: boolean },
): ReadonlySet<string> | null {
  if (environment.MARUCHECK_OPEN_SIGNUPS?.trim().toLowerCase() === "true") return null;
  const emails = allowedSignupEmailValues(environment).filter(isEmail);
  if (emails.length > 0) return new Set(emails);
  return options.production ? new Set() : null;
}

function allowedSignupEmailValues(environment: EnvironmentInput): string[] {
  return [
    ...new Set(
      (environment.MARUCHECK_ALLOWED_SIGNUP_EMAILS ?? "")
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(value);
}

function parsedUrl(value: string | undefined): URL | undefined {
  if (!value) return undefined;
  try {
    return new URL(value);
  } catch {
    return undefined;
  }
}

function validateSecret(
  value: string | undefined,
  name: "BETTER_AUTH_SECRET" | "CRON_SECRET",
  errors: string[],
): void {
  const normalized = value?.trim().toLowerCase() ?? "";
  if (
    !value ||
    value.length < 32 ||
    ["change", "example", "replace", "secret"].some((marker) => normalized.includes(marker))
  ) {
    errors.push(`${name} must be a non-placeholder secret of at least 32 characters.`);
  }
}
