/**
 * Path constants and utilities
 */
import { homedir } from "node:os";
import { join } from "node:path";

export const HOME = homedir();
export const CONFIG_DIR = join(process.cwd(), ".skillsync");
export const CONFIG_FILE = join(CONFIG_DIR, "config.json");
export const STORE_DIR = CONFIG_DIR;

// Known target paths
export const KNOWN_TARGETS: Record<string, string> = {
  cursor: join(HOME, ".cursor", "skills"),
  claude: join(HOME, ".claude", "skills"),
  codex: join(HOME, ".codex", "skills"),
  antigravity: join(HOME, ".gemini", "antigravity", "skills"),
  gemini: join(HOME, ".gemini", "skills"),
  copilot: join(HOME, ".copilot", "skills"),
  windsurf: join(HOME, ".windsurf", "skills"),
  openclaw: join(HOME, ".openclaw"),
};

// Expand ~ in paths
export function expandPath(path: string): string {
  if (path.startsWith("~/")) {
    return join(HOME, path.slice(2));
  }
  return path;
}

// Collapse home dir to ~
export function collapsePath(path: string): string {
  if (path.startsWith(HOME)) {
    return "~" + path.slice(HOME.length);
  }
  return path;
}
