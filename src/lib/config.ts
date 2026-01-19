/**
 * Config management - read/write JSON config
 */
import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { CONFIG_DIR, CONFIG_FILE, STORE_DIR, KNOWN_TARGETS, expandPath } from "./paths.js";
import { Config, DEFAULT_CONFIG } from "./types.js";

// Check if path exists
async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

// Ensure config directory exists
export async function ensureConfigDir(): Promise<void> {
  await mkdir(CONFIG_DIR, { recursive: true });
  await mkdir(STORE_DIR, { recursive: true });
}

// Read config
export async function readConfig(): Promise<Config> {
  await ensureConfigDir();

  if (!(await exists(CONFIG_FILE))) {
    // Create default config with some targets enabled
    const config: Config = {
      ...DEFAULT_CONFIG,
      targets: {
        cursor: { path: KNOWN_TARGETS.cursor, enabled: true },
        claude: { path: KNOWN_TARGETS.claude, enabled: true },
        codex: { path: KNOWN_TARGETS.codex, enabled: true },
        antigravity: { path: KNOWN_TARGETS.antigravity, enabled: true },
        copilot: { path: KNOWN_TARGETS.copilot, enabled: true },
      },
    };
    await writeConfig(config);
    return config;
  }

  try {
    const content = await readFile(CONFIG_FILE, "utf-8");
    return JSON.parse(content) as Config;
  } catch {
    // If config is corrupted, return default
    return DEFAULT_CONFIG;
  }
}

// Write config
export async function writeConfig(config: Config): Promise<void> {
  await ensureConfigDir();
  await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// Add source
export async function addSource(
  name: string,
  url?: string,
  subdir?: string,
  localPath?: string
): Promise<void> {
  const config = await readConfig();

  if (config.sources[name]) {
    throw new Error(`Source "${name}" already exists`);
  }

  // Build source object with only defined properties
  const source: any = { enabled: true };
  if (url !== undefined) source.url = url;
  if (subdir !== undefined) source.subdir = subdir;
  if (localPath !== undefined) source.localPath = localPath;

  config.sources[name] = source;

  await writeConfig(config);
}

// Remove source
export async function removeSource(name: string): Promise<void> {
  const config = await readConfig();

  if (!config.sources[name]) {
    throw new Error(`Source "${name}" not found`);
  }

  delete config.sources[name];
  await writeConfig(config);
}

// Enable/disable source
export async function setSourceEnabled(name: string, enabled: boolean): Promise<void> {
  const config = await readConfig();

  if (!config.sources[name]) {
    throw new Error(`Source "${name}" not found`);
  }

  config.sources[name].enabled = enabled;
  await writeConfig(config);
}

// Add target
export async function addTarget(name: string, path?: string): Promise<void> {
  const config = await readConfig();

  if (config.targets[name]) {
    throw new Error(`Target "${name}" already exists`);
  }

  // Use known path or provided path
  const targetPath = path ? expandPath(path) : KNOWN_TARGETS[name];
  if (!targetPath) {
    throw new Error(`Unknown target "${name}". Please provide a path.`);
  }

  config.targets[name] = {
    path: targetPath,
    enabled: true,
  };

  await writeConfig(config);
}

// Remove target
export async function removeTarget(name: string): Promise<void> {
  const config = await readConfig();

  if (!config.targets[name]) {
    throw new Error(`Target "${name}" not found`);
  }

  delete config.targets[name];
  await writeConfig(config);
}

// Enable/disable target
export async function setTargetEnabled(name: string, enabled: boolean): Promise<void> {
  const config = await readConfig();

  if (!config.targets[name]) {
    throw new Error(`Target "${name}" not found`);
  }

  config.targets[name].enabled = enabled;
  await writeConfig(config);
}
