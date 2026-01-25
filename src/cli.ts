#!/usr/bin/env node
/**
 * Skills Sync CLI
 *
 * Sync AI skills to Cursor, Claude, Codex and more
 */
import { fetch } from "./commands/fetch.js";
import { sync } from "./commands/sync.js";
import { status } from "./commands/status.js";
import { list } from "./commands/list.js";
import { sourceCommand } from "./commands/source.js";
import { targetCommand } from "./commands/target.js";
import { init } from "./commands/init.js";
import { showConfig } from "./commands/config.js";
import { bold, dim, red } from "./lib/colors.js";

import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function getVersion(): Promise<string> {
  try {
    const packagePath = join(__dirname, "..", "package.json");
    const content = await readFile(packagePath, "utf-8");
    const pkg = JSON.parse(content);
    return pkg.version;
  } catch {
    return "unknown";
  }
}

async function printHelp(): Promise<void> {
  const version = await getVersion();
  console.log(`
${bold("skillsync")} - Sync Agent Skills to various tools

${bold("Usage:")}
  skillsync <command> [options]

${bold("Commands:")}
  init               Initialize config (~/.skillsync/)
  fetch [source]     Fetch skills from Git
  sync               Sync to all enabled targets
  status             View sync status
  ls, list           List all skills
  config             Show configuration

  source             Manage skill sources
    add <name>       Add source (e.g., owner/repo)
    remove <name>    Remove source
    on <name>        Enable source
    off <name>       Disable source
    list             List sources

  target             Manage sync targets
    add <name>       Add target (e.g., cursor, claude)
    remove <name>    Remove target
    on <name>        Enable target
    off <name>       Disable target
    list             List targets

${bold("Examples:")}
  skillsync init
  skillsync source add anthropics/skills
  skillsync target add cursor
  skillsync fetch
  skillsync sync
  skillsync status

${bold("Version:")} ${version}
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case "init":
        await init();
        break;
      case "fetch":
        await fetch(args[1]);
        break;
      case "sync":
        await sync();
        break;
      case "status":
        await status();
        break;
      case "ls":
      case "list":
        await list();
        break;
      case "config":
        await showConfig();
        break;
      case "source":
        await sourceCommand(args.slice(1));
        break;
      case "target":
        await targetCommand(args.slice(1));
        break;
      case "help":
      case "--help":
      case "-h":
        await printHelp();
        break;
      case "version":
      case "--version":
      case "-v":
        console.log(await getVersion());
        break;
      default:
        if (command) {
          console.log(red(`Unknown command: ${command}\n`));
        }
        await printHelp();
        process.exit(command ? 1 : 0);
    }
  } catch (error) {
    console.error(red(`Error: ${error instanceof Error ? error.message : error}`));
    process.exit(1);
  }
}

main();
