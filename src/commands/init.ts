/**
 * Init command - initialize config
 */
import { stat } from "node:fs/promises";
import { readConfig } from "../lib/config.js";
import { CONFIG_FILE, CONFIG_DIR } from "../lib/paths.js";
import { dim, bold } from "../lib/colors.js";

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

export async function init(): Promise<void> {
  const configExists = await exists(CONFIG_FILE);

  if (configExists) {
    console.log(dim(`\nConfig already exists: ${CONFIG_FILE}\n`));
    return;
  }

  // Create config with defaults
  await readConfig();

  console.log(bold("\n✓ Initialized skillsync\n"));
  console.log(dim(`Config: ${CONFIG_FILE}`));
  console.log(dim(`Store:  ${CONFIG_DIR}/store/\n`));

  console.log("Default sources:");
  console.log(dim("  • anthropics/skills"));
  console.log(dim("  • vercel-labs/agent-skills\n"));

  console.log("Default targets:");
  console.log(dim("  • cursor, claude, copilot, codex\n"));

  console.log(bold("Next steps:"));
  console.log(dim("  skillsync fetch    # Download skills"));
  console.log(dim("  skillsync push     # Push to targets"));
  console.log(dim("  skillsync status   # Check status\n"));
}
