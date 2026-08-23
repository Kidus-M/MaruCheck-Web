import type { SVGProps } from "react";

export type IconName =
  | "alert"
  | "arrow"
  | "branch"
  | "check"
  | "chevron"
  | "command"
  | "contracts"
  | "coverage"
  | "findings"
  | "github"
  | "google"
  | "memory"
  | "organization"
  | "overview"
  | "projects"
  | "runs"
  | "search";

const paths: Record<IconName, React.ReactNode> = {
  alert: <path d="M12 3 2.8 19h18.4L12 3Zm0 5.5v5m0 3v.1" />,
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  branch: <path d="M6 3v12a3 3 0 0 0 3 3h9M15 5l3-2 3 2M18 3v7" />,
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 6 6 6-6 6" />,
  command: <path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6Z" />,
  contracts: <path d="M6 3h9l3 3v15H6V3Zm8 0v4h4M9 12h6m-6 4h4" />,
  coverage: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 4v5m8 3h-5m-3 8v-5M4 12h5" />
    </>
  ),
  findings: <path d="M12 3 3 7v5c0 5 3.5 8 9 9 5.5-1 9-4 9-9V7l-9-4Zm0 5v5m0 3v.1" />,
  github: (
    <path d="M12 1C5.923 1 1 5.923 1 12c0 4.867 3.149 8.979 7.521 10.436.55.096.756-.233.756-.522 0-.262-.014-1.128-.014-2.178-3.06.664-3.706-1.478-3.706-1.478-.5-1.274-1.221-1.613-1.221-1.613-1-.684.076-.67.076-.67 1.105.078 1.685 1.133 1.685 1.133.98 1.68 2.572 1.194 3.2.913.098-.71.384-1.194.698-1.468-2.442-.278-5.01-1.221-5.01-5.432 0-1.2.429-2.182 1.132-2.952-.113-.278-.49-1.398.108-2.91 0 0 .923-.296 3.025 1.128A10.5 10.5 0 0 1 12 6.03c.935.004 1.876.126 2.754.37 2.1-1.424 3.022-1.128 3.022-1.128.599 1.512.222 2.632.109 2.91.705.77 1.13 1.752 1.13 2.952 0 4.222-2.572 5.151-5.022 5.424.394.34.746 1.01.746 2.037 0 1.47-.013 2.654-.013 3.017 0 .292.198.623.762.518C19.858 20.975 23 16.865 23 12c0-6.077-4.923-11-11-11Z" />
  ),
  google: (
    <>
      <path
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.45a5.52 5.52 0 0 1-2.4 3.58v2.93h3.88c2.27-2.09 3.56-5.17 3.56-8.75Z"
        fill="#4285f4"
      />
      <path
        d="M12 24c3.24 0 5.95-1.07 7.93-2.98l-3.88-2.93c-1.07.72-2.44 1.14-4.05 1.14-3.13 0-5.78-2.11-6.73-4.95H1.26v3.02A12 12 0 0 0 12 24Z"
        fill="#34a853"
      />
      <path
        d="M5.27 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.55.37-2.28V6.7H1.26A12 12 0 0 0 0 12c0 1.94.46 3.78 1.26 5.3l4.01-3.02Z"
        fill="#fbbc05"
      />
      <path
        d="M12 4.77c1.76 0 3.34.61 4.58 1.8l3.43-3.43A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.26 6.7l4.01 3.02C6.22 6.88 8.87 4.77 12 4.77Z"
        fill="#ea4335"
      />
    </>
  ),
  memory: <path d="M5 5h14v14H5V5Zm3-2v4m8-4v4M8 11h8m-8 4h5" />,
  organization: (
    <path d="M12 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM6 20v-2a6 6 0 0 1 12 0v2M4 9a2.5 2.5 0 0 0 0 5m16-5a2.5 2.5 0 0 1 0 5" />
  ),
  overview: <path d="M4 4h6v6H4V4Zm10 0h6v10h-6V4ZM4 14h6v6H4v-6Zm10 4h6v2h-6v-2Z" />,
  projects: <path d="M4 6h6l2 2h8v11H4V6Zm0 5h16" />,
  runs: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m10 8 6 4-6 4V8Z" />
    </>
  ),
  search: <path d="m20 20-4.5-4.5m2.5-5A7.5 7.5 0 1 1 3 10.5a7.5 7.5 0 0 1 15 0Z" />,
};

export function Icon({ name, ...props }: { readonly name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
