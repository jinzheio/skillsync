/**
 * Type definitions
 */

export type ConflictResolution = "yes" | "no" | "yes-all" | "no-all";

export interface Source {
  url?: string;
  subdir?: string;
  enabled: boolean;
  localPath?: string; // Track original local source path
}

export interface Target {
  path: string;
  enabled: boolean;
}

export interface Config {
  sources: Record<string, Source>;
  targets: Record<string, Target>;
}

export const DEFAULT_CONFIG: Config = {
  sources: {
    "anthropics/skills": {
      url: "https://github.com/anthropics/skills",
      enabled: true,
    },
    "vercel-labs/agent-skills": {
      url: "https://github.com/vercel-labs/agent-skills",
      subdir: "skills",
      enabled: true,
    },
  },
  targets: {},
};
