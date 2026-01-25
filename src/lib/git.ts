/**
 * Git URL parsing utilities
 */
import { expandPath } from "./paths.js";
import { resolve } from "node:path";

export interface ParsedGitUrl {
  name: string;      // owner/repo
  url: string;       // https://github.com/owner/repo
  subdir?: string;   // subdirectory path
}

/**
 * Check if input looks like a local file path
 */
export function isLocalPath(input: string): boolean {
  // Absolute paths
  if (input.startsWith('/') || input.startsWith('~/')) {
    return true;
  }
  
  // Relative paths
  if (input.startsWith('./') || input.startsWith('../')) {
    return true;
  }
  
  // Windows absolute paths
  if (/^[A-Za-z]:[\\/]/.test(input)) {
    return true;
  }
  
  return false;
}

/**
 * Detect if input is a remote URL or local path
 */
export function detectSourceType(input: string): 'remote' | 'local' {
  // URL format
  if (input.startsWith('http://') || input.startsWith('https://')) {
    return 'remote';
  }
  
  // Local path detection
  if (isLocalPath(input)) {
    return 'local';
  }
  
  // owner/repo format, treat as GitHub repository
  if (input.includes('/')) {
    return 'remote';
  }
  
  // Default to local for safety
  return 'local';
}

/**
 * Parse GitHub URL and extract owner/repo, URL, and optional subdir
 */
export function parseGitUrl(input: string): ParsedGitUrl {
  // GitHub tree URL: https://github.com/owner/repo/tree/branch/path/to/dir
  const treeMatch = input.match(/github\.com\/([^/]+\/[^/]+)\/tree\/[^/]+\/(.+)/);
  if (treeMatch) {
    const name = treeMatch[1].replace(/\.git$/, '');
    return {
      name,
      url: `https://github.com/${name}`,
      subdir: treeMatch[2],
    };
  }

  // Normal GitHub URL: https://github.com/owner/repo
  const urlMatch = input.match(/github\.com\/([^/]+\/[^/]+)/);
  if (urlMatch) {
    const name = urlMatch[1].replace(/\.git$/, '');
    return {
      name,
      url: `https://github.com/${name}`,
    };
  }

  // owner/repo format
  if (input.includes('/') && !input.startsWith('http')) {
    return {
      name: input,
      url: `https://github.com/${input}`,
    };
  }

  throw new Error('Invalid Git URL format');
}

/**
 * Get name for local source (absolute path)
 * Expands ~ and converts relative paths to absolute
 */
export function getLocalSourceName(input: string): string {
  const expanded = expandPath(input);

  // If already absolute, return as is
  if (expanded.startsWith('/')) {
    return expanded;
  }

  // Convert relative path to absolute path
  return resolve(process.cwd(), expanded);
}
