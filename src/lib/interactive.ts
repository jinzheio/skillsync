/**
 * Interactive CLI utilities for user prompts
 */
import * as readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";

export type ConflictResolution = "yes" | "no" | "yes-all" | "no-all";

/**
 * Prompt user to resolve a conflict for a specific skill
 * @param skillName - Name of the conflicting skill
 * @returns User's choice
 */
export async function promptConflictResolution(
  skillName: string
): Promise<ConflictResolution> {
  const rl = readline.createInterface({ input, output });

  return new Promise((resolve) => {
    console.log(
      `\n⚠️  Skill "${skillName}" already exists with different content.`
    );
    rl.question(
      "Overwrite? (yes/no/yes-all/no-all): ",
      (answer: string) => {
        rl.close();

        const normalized = answer.trim().toLowerCase();

        // Accept various forms
        if (["yes", "y"].includes(normalized)) {
          resolve("yes");
        } else if (["no", "n"].includes(normalized)) {
          resolve("no");
        } else if (["yes-all", "yes all", "ya", "all"].includes(normalized)) {
          resolve("yes-all");
        } else if (["no-all", "no all", "na", "none"].includes(normalized)) {
          resolve("no-all");
        } else {
          // Invalid input, treat as "no" for safety
          console.log(`  Invalid input "${answer}", treating as "no"`);
          resolve("no");
        }
      }
    );
  });
}
