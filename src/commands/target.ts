/**
 * Target command - manage sync targets
 */
import { readConfig, addTarget, removeTarget, setTargetEnabled } from "../lib/config.js";
import { KNOWN_TARGETS, collapsePath } from "../lib/paths.js";
import { green, red, dim, bold } from "../lib/colors.js";

export async function targetCommand(args: string[]): Promise<void> {
  const subcommand = args[0];

  switch (subcommand) {
    case "add":
      await targetAdd(args.slice(1));
      break;
    case "remove":
    case "rm":
      await targetRemove(args[1]);
      break;
    case "on":
      await targetSetEnabled(args[1], true);
      break;
    case "off":
      await targetSetEnabled(args[1], false);
      break;
    case "list":
    case "ls":
    default:
      await targetList();
      break;
  }
}

async function targetAdd(args: string[]): Promise<void> {
  const name = args[0];
  const customPath = args[1];

  if (!name) {
    console.log(red("Error: Target name required"));
    console.log(dim("\nKnown targets:"));
    for (const [k, v] of Object.entries(KNOWN_TARGETS)) {
      console.log(dim(`  ${k.padEnd(15)} ${collapsePath(v)}`));
    }
    console.log(dim("\nUsage:"));
    console.log(dim("  skillsync target add cursor           # Add known target"));
    console.log(dim("  skillsync target add myapp ~/path     # Add custom target"));
    process.exit(1);
  }

  try {
    // Check if already exists
    const config = await readConfig();
    if (config.targets[name]) {
      // Already exists, enable it
      await setTargetEnabled(name, true);
      console.log(green(`\n✓ Enabled existing target: ${name}\n`));
      return;
    }

    // Add new target
    await addTarget(name, customPath);
    const path = customPath || KNOWN_TARGETS[name];
    console.log(green(`\n✓ Added target: ${name}`));
    console.log(dim(`  Path: ${collapsePath(path)}\n`));
  } catch (error) {
    console.log(red(`\n✗ ${error instanceof Error ? error.message : error}\n`));
    process.exit(1);
  }
}

async function targetRemove(name: string): Promise<void> {
  if (!name) {
    console.log(red("Error: Target name required"));
    process.exit(1);
  }

  try {
    await removeTarget(name);
    console.log(green(`\n✓ Removed target: ${name}\n`));
  } catch (error) {
    console.log(red(`\n✗ ${error instanceof Error ? error.message : error}\n`));
    process.exit(1);
  }
}

async function targetSetEnabled(name: string, enabled: boolean): Promise<void> {
  if (!name) {
    console.log(red("Error: Target name required"));
    process.exit(1);
  }

  try {
    await setTargetEnabled(name, enabled);
    const status = enabled ? "enabled" : "disabled";
    console.log(green(`\n✓ Target ${name} ${status}\n`));
  } catch (error) {
    console.log(red(`\n✗ ${error instanceof Error ? error.message : error}\n`));
    process.exit(1);
  }
}

async function targetList(): Promise<void> {
  const config = await readConfig();

  console.log(bold("\nTargets\n"));

  // Configured targets
  const configured = Object.entries(config.targets);
  if (configured.length > 0) {
    console.log(bold("Configured:"));
    for (const [name, target] of configured) {
      const symbol = target.enabled ? green("✓") : dim("○");
      const status = target.enabled ? "" : dim(" (disabled)");
      console.log(`  ${symbol} ${name.padEnd(15)} ${dim(collapsePath(target.path))}${status}`);
    }
    console.log();
  }

  // Available predefined targets (not configured)
  const configuredNames = new Set(Object.keys(config.targets));
  const available = Object.keys(KNOWN_TARGETS).filter(k => !configuredNames.has(k));

  if (available.length > 0) {
    console.log(bold("Available (not configured):"));
    console.log(dim(`  ${available.join(", ")}`));
    console.log();
  }

  console.log(dim(`Known targets: ${Object.keys(KNOWN_TARGETS).join(", ")}`));
  console.log();
}
