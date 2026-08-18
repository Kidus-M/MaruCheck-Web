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
  memory: <path d="M5 5h14v14H5V5Zm3-2v4m8-4v4M8 11h8m-8 4h5" />,
  organization: <path d="M12 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6ZM6 20v-2a6 6 0 0 1 12 0v2M4 9a2.5 2.5 0 0 0 0 5m16-5a2.5 2.5 0 0 1 0 5" />,
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
