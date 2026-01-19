/**
 * Fetch command - fetch skills from Git repositories and local sources
 */
import { execSync } from "node:child_process";
import { cp, rm, mkdir, stat, rename, readdir } from "node:fs/promises";
import { join } from "node:path";
import { readConfig } from "../lib/config.js";
import { STORE_DIR } from "../lib/paths.js";
import { green, red, dim, bold, yellow } from "../lib/colors.js";
import type { Source, ConflictResolution } from "../lib/types.js";
import { promptConflictResolution } from "../lib/interactive.js";
import { areDirectoriesEqual } from "../lib/file-compare.js";

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

function isLocalSource(source: Source): boolean {
  return !!source.localPath;
}

async function fetchRemoteSource(
  name: string,
  source: Source
): Promise<void> {
  if (!source.url) {
    console.log(`  ${dim("○")} ${name.padEnd(30)} ${dim("no URL")}`);
    return;
  }

  const targetDir = join(STORE_DIR, name);

  try {
    // Ensure parent directory exists
    await mkdir(join(STORE_DIR, name.split("/")[0]), { recursive: true });

    // Delete if exists
    if (await exists(targetDir)) {
      await rm(targetDir, { recursive: true, force: true });
    }

    // Clone repository
    const tempDir = `${targetDir}_temp`;
    execSync(`git clone --depth 1 "${source.url}" "${tempDir}"`, {
      stdio: "pipe",
    });

    // If subdir exists, keep only subdirectory
    if (source.subdir) {
      const subdirPath = join(tempDir, source.subdir);
      if (await exists(subdirPath)) {
        await cp(subdirPath, targetDir, { recursive: true });
      } else {
        throw new Error(`Subdir "${source.subdir}" not found`);
      }
      await rm(tempDir, { recursive: true, force: true });
    } else {
      await rename(tempDir, targetDir);
      // Remove .git directory
      const gitDir = join(targetDir, ".git");
      if (await exists(gitDir)) {
        await rm(gitDir, { recursive: true, force: true });
      }
    }

    console.log(`  ${green("✓")} ${name.padEnd(30)} ${green("fetched")}`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.log(`  ${red("✗")} ${name.padEnd(30)} ${red(msg.split("\n")[0])}`);
  }
}

async function fetchLocalSource(name: string, source: Source): Promise<void> {
  if (!source.localPath) {
    console.log(
      `  ${dim("○")} ${name.padEnd(30)} ${dim("no local path")}`
    );
    return;
  }

  const localStoreDir = join(STORE_DIR, "local");
  await mkdir(localStoreDir, { recursive: true });

  try {
    // Check if source path exists
    if (!(await exists(source.localPath))) {
      throw new Error(`Local path does not exist: ${source.localPath}`);
    }

    // Read all subdirectories from source path (each is a skill)
    const items = await readdir(source.localPath, { withFileTypes: true });
    const skills = items.filter((item) => item.isDirectory());

    if (skills.length === 0) {
      console.log(
        `  ${yellow("⚠")} ${name.padEnd(30)} ${yellow("no skills found")}`
      );
      return;
    }

    let copied = 0;
    let skipped = 0;
    let conflictResolution: ConflictResolution | null = null;

    for (const skill of skills) {
      const skillName = skill.name;
      const sourcePath = join(source.localPath, skillName);
      const targetPath = join(localStoreDir, skillName);

      // Check if skill already exists
      if (await exists(targetPath)) {
        // Compare content
        const areEqual = await areDirectoriesEqual(sourcePath, targetPath);

        if (areEqual) {
          // Same content, skip silently
          skipped++;
          continue;
        }

        // Different content - handle conflict
        if (conflictResolution === "yes-all") {
          // Overwrite without asking
          await rm(targetPath, { recursive: true, force: true });
          await cp(sourcePath, targetPath, { recursive: true });
          copied++;
        } else if (conflictResolution === "no-all") {
          // Skip without asking
          skipped++;
        } else {
          // Ask user
          const response = await promptConflictResolution(skillName);

          if (response === "yes") {
            await rm(targetPath, { recursive: true, force: true });
            await cp(sourcePath, targetPath, { recursive: true });
            copied++;
          } else if (response === "no") {
            skipped++;
          } else if (response === "yes-all") {
            conflictResolution = "yes-all";
            await rm(targetPath, { recursive: true, force: true });
            await cp(sourcePath, targetPath, { recursive: true });
            copied++;
          } else if (response === "no-all") {
            conflictResolution = "no-all";
            skipped++;
          }
        }
      } else {
        // New skill, copy directly
        await cp(sourcePath, targetPath, { recursive: true });
        copied++;
      }
    }

    const summary = [];
    if (copied > 0) summary.push(`${copied} copied`);
    if (skipped > 0) summary.push(`${skipped} skipped`);

    console.log(
      `  ${green("✓")} ${name.padEnd(30)} ${green(summary.join(", "))}`
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.log(`  ${red("✗")} ${name.padEnd(30)} ${red(msg.split("\n")[0])}`);
  }
}

export async function fetch(sourceName?: string): Promise<void> {
  const config = await readConfig();

  const sources = sourceName
    ? { [sourceName]: config.sources[sourceName] }
    : config.sources;

  if (sourceName && !config.sources[sourceName]) {
    console.log(red(`Error: Source "${sourceName}" not found`));
    process.exit(1);
  }

  console.log(bold("\nFetching skills...\n"));

  for (const [name, source] of Object.entries(sources)) {
    // Skip disabled sources
    if (!source.enabled) {
      console.log(`  ${dim("○")} ${name.padEnd(30)} ${dim("disabled")}`);
      continue;
    }

    if (isLocalSource(source)) {
      await fetchLocalSource(name, source);
    } else {
      await fetchRemoteSource(name, source);
    }
  }

  console.log(`\n${dim(`Stored at: ${STORE_DIR}`)}\n`);
}
