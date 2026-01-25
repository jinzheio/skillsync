/**
 * Source command - manage skill sources
 */
import { readConfig, addSource, removeSource, setSourceEnabled } from "../lib/config.js";
import { detectSourceType, parseGitUrl, getLocalSourceName } from "../lib/git.js";
import { green, red, dim, bold } from "../lib/colors.js";

export async function sourceCommand(args: string[]): Promise<void> {
  const subcommand = args[0];

  switch (subcommand) {
    case "add":
      await sourceAdd(args.slice(1));
      break;
    case "remove":
    case "rm":
      await sourceRemove(args[1]);
      break;
    case "on":
      await sourceSetEnabled(args[1], true);
      break;
    case "off":
      await sourceSetEnabled(args[1], false);
      break;
    case "list":
    case "ls":
    default:
      await sourceList();
      break;
  }
}

async function sourceAdd(args: string[]): Promise<void> {
  const input = args[0];

  if (!input) {
    console.log(red("Error: Source required"));
    console.log(dim("\nUsage:"));
    console.log(dim("  skillsync source add <url>           # GitHub URL"));
    console.log(dim("  skillsync source add owner/repo      # GitHub shorthand"));
    console.log(dim("  skillsync source add ~/path          # Local path"));
    console.log(dim("\nOptions:"));
    console.log(dim("  --subdir <path>   Subdirectory within repository"));
    process.exit(1);
  }

  // Check for --subdir flag
  let manualSubdir: string | undefined;
  const subdirIndex = args.indexOf("--subdir");
  if (subdirIndex !== -1 && args[subdirIndex + 1]) {
    manualSubdir = args[subdirIndex + 1];
  }

  try {
    const type = detectSourceType(input);

    if (type === 'remote') {
      const parsed = parseGitUrl(input);
      const subdir = manualSubdir || parsed.subdir;

      // Check if already exists
      const config = await readConfig();
      if (config.sources[parsed.name]) {
        // Already exists, enable it
        await setSourceEnabled(parsed.name, true);
        console.log(green(`\n✓ Enabled existing source: ${parsed.name}\n`));
        return;
      }

      // Add new source
      await addSource(parsed.name, parsed.url, subdir);
      console.log(green(`\n✓ Added source: ${parsed.name}`));
      if (parsed.url) console.log(dim(`  URL: ${parsed.url}`));
      if (subdir) console.log(dim(`  Subdir: ${subdir}`));
      console.log(dim("\nRun 'skillsync fetch' to download skills.\n"));
    } else {
      // Local source: validate path exists and store with localPath
      const fullPath = getLocalSourceName(input);
      
      // Check if path exists
      const { stat } = await import("node:fs/promises");
      try {
        const stats = await stat(fullPath);
        if (!stats.isDirectory()) {
          throw new Error(`Path is not a directory: ${fullPath}`);
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          throw new Error(`Path does not exist: ${fullPath}`);
        }
        throw error;
      }

      const config = await readConfig();
      if (config.sources[fullPath]) {
        await setSourceEnabled(fullPath, true);
        console.log(green(`\n✓ Enabled existing source: ${fullPath}\n`));
        return;
      }

      // Add with localPath property
      await addSource(fullPath, undefined, undefined, fullPath);
      console.log(green(`\n✓ Added local source: ${fullPath}`));
      console.log(dim(`  Run 'skillsync fetch' to sync skills.\n`));
    }
  } catch (error) {
    console.log(red(`\n✗ ${error instanceof Error ? error.message : error}\n`));
    process.exit(1);
  }
}

async function sourceRemove(name: string): Promise<void> {
  if (!name) {
    console.log(red("Error: Source name required"));
    process.exit(1);
  }

  try {
    await removeSource(name);
    console.log(green(`\n✓ Removed source: ${name}\n`));
  } catch (error) {
    console.log(red(`\n✗ ${error instanceof Error ? error.message : error}\n`));
    process.exit(1);
  }
}

async function sourceSetEnabled(name: string, enabled: boolean): Promise<void> {
  if (!name) {
    console.log(red("Error: Source name required"));
    process.exit(1);
  }

  try {
    await setSourceEnabled(name, enabled);
    const status = enabled ? "enabled" : "disabled";
    console.log(green(`\n✓ Source ${name} ${status}\n`));
  } catch (error) {
    console.log(red(`\n✗ ${error instanceof Error ? error.message : error}\n`));
    process.exit(1);
  }
}

async function sourceList(): Promise<void> {
  const config = await readConfig();

  console.log(bold("\nSources\n"));

  const entries = Object.entries(config.sources);
  if (entries.length === 0) {
    console.log(dim("  No sources configured.\n"));
    console.log(dim("  Add a source: skillsync source add anthropics/skills\n"));
    return;
  }

  for (const [name, source] of entries) {
    const symbol = source.enabled ? green("✓") : dim("○");
    const status = source.enabled ? "" : dim(" (disabled)");

    console.log(`  ${symbol} ${bold(name)}${status}`);
    if (source.url) {
      console.log(`    ${dim(source.url)}`);
    }
    if (source.subdir) {
      console.log(`    ${dim(`Subdir: ${source.subdir}`)}`);
    }
    if (source.localPath) {
      console.log(`    ${dim(`Local: ${source.localPath}`)}`);
    }
  }

  console.log();
}
