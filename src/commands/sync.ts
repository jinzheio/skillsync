/**
 * Sync command - sync skills to all enabled targets
 */
import { cp, rm, mkdir, readdir, stat } from "node:fs/promises";
import { join, basename } from "node:path";
import { readConfig } from "../lib/config.js";
import { STORE_DIR } from "../lib/paths.js";
import { green, red, dim, bold } from "../lib/colors.js";

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

export async function sync(): Promise<void> {
  const config = await readConfig();

  console.log(bold("\nSyncing skills to targets...\n"));

  // Get all skills from enabled sources
  const allSkills: string[] = [];
  for (const [name, source] of Object.entries(config.sources)) {
    if (!source.enabled) continue;

    const sourceDir = join(STORE_DIR, name);
    if (!(await exists(sourceDir))) continue;

    try {
      const items = await readdir(sourceDir, { withFileTypes: true });
      for (const item of items) {
        if (item.isDirectory()) {
          allSkills.push(join(sourceDir, item.name));
        }
      }
    } catch {
      // Ignore read errors
    }
  }

  // Add all skills from local directory (flat structure)
  const localDir = join(STORE_DIR, "local");
  if (await exists(localDir)) {
    try {
      const items = await readdir(localDir, { withFileTypes: true });
      for (const item of items) {
        if (item.isDirectory()) {
          allSkills.push(join(localDir, item.name));
        }
      }
    } catch {
      // Ignore read errors
    }
  }

  if (allSkills.length === 0) {
    console.log(dim("  No skills found. Run 'skillsync fetch' first.\n"));
    return;
  }

  const enabledSources = Object.values(config.sources).filter((s) => s.enabled).length;
  console.log(dim(`  Source: ${allSkills.length} skills from ${enabledSources} sources\n`));

  // Sync to each enabled target
  for (const [name, target] of Object.entries(config.targets)) {
    if (!target.enabled) {
      console.log(`  ${dim("○")} ${name.padEnd(15)} ${dim("disabled")}`);
      continue;
    }

    try {
      await mkdir(target.path, { recursive: true });

      // Clear target directory
      const existingFiles = await readdir(target.path);
      for (const file of existingFiles) {
        await rm(join(target.path, file), { recursive: true, force: true });
      }

      // Copy all skills
      for (const skillPath of allSkills) {
        const skillName = basename(skillPath);
        await cp(skillPath, join(target.path, skillName), { recursive: true });
      }

      console.log(`  ${green("✓")} ${name.padEnd(15)} ${green("synced")}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.log(`  ${red("✗")} ${name.padEnd(15)} ${red(msg)}`);
    }
  }

  console.log(bold("\nDone.\n"));
}
