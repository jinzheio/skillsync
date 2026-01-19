/**
 * File comparison utilities for detecting directory differences
 */
import { readdir, stat, readFile } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";

// Files and directories to ignore during comparison
const IGNORE_PATTERNS = [
  ".DS_Store",
  ".git",
  "node_modules",
  "Thumbs.db",
  ".gitignore",
];

/**
 * Check if path exists and is a directory
 */
async function isDirectory(path: string): Promise<boolean> {
  try {
    const stats = await stat(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Calculate hash of file content
 */
async function hashFile(filePath: string): Promise<string> {
  try {
    const content = await readFile(filePath);
    return createHash("md5").update(content).digest("hex");
  } catch {
    return "";
  }
}

/**
 * Get all files recursively from a directory
 */
async function getAllFiles(
  dir: string,
  baseDir: string = dir
): Promise<Map<string, string>> {
  const files = new Map<string, string>();

  try {
    const items = await readdir(dir, { withFileTypes: true });

    for (const item of items) {
      // Skip ignored patterns
      if (IGNORE_PATTERNS.includes(item.name)) {
        continue;
      }

      const fullPath = join(dir, item.name);
      const relativePath = fullPath.replace(baseDir + "/", "");

      if (item.isDirectory()) {
        const subFiles = await getAllFiles(fullPath, baseDir);
        for (const [path, hash] of subFiles) {
          files.set(path, hash);
        }
      } else {
        const hash = await hashFile(fullPath);
        files.set(relativePath, hash);
      }
    }
  } catch {
    // Ignore read errors
  }

  return files;
}

/**
 * Compare two directories to check if they are equal
 * @param dir1 - First directory path
 * @param dir2 - Second directory path
 * @returns true if directories have identical content, false otherwise
 */
export async function areDirectoriesEqual(
  dir1: string,
  dir2: string
): Promise<boolean> {
  // Check if both are directories
  const isDir1 = await isDirectory(dir1);
  const isDir2 = await isDirectory(dir2);

  if (!isDir1 || !isDir2) {
    return false;
  }

  // Get all files with their hashes
  const files1 = await getAllFiles(dir1);
  const files2 = await getAllFiles(dir2);

  // Different number of files
  if (files1.size !== files2.size) {
    return false;
  }

  // Compare each file hash
  for (const [path, hash1] of files1) {
    const hash2 = files2.get(path);
    if (hash2 !== hash1) {
      return false;
    }
  }

  return true;
}
