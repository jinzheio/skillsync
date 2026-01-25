/**
 * Git utilities tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getLocalSourceName, isLocalPath, detectSourceType } from './git.js';

describe('Git Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getLocalSourceName', () => {
    it('should expand ~ to absolute path', () => {
      const result = getLocalSourceName('~/Projects/skills');
      expect(result).toMatch(/^\/.*\/Projects\/skills$/);
      expect(result).not.toContain('~');
    });

    it('should convert relative path to absolute', () => {
      const result = getLocalSourceName('./my-skills');
      expect(result).toMatch(/^\/.*\/my-skills$/);
      expect(result.startsWith('./')).toBe(false);
    });

    it('should keep absolute path as is', () => {
      const absolutePath = '/usr/local/skills';
      const result = getLocalSourceName(absolutePath);
      expect(result).toBe(absolutePath);
    });

    it('should handle ../ relative paths', () => {
      const result = getLocalSourceName('../parent-skills');
      expect(result).toMatch(/^\/.*\/parent-skills$/);
      expect(result.startsWith('..')).toBe(false);
    });
  });

  describe('isLocalPath', () => {
    it('should detect absolute paths', () => {
      expect(isLocalPath('/usr/local/skills')).toBe(true);
      expect(isLocalPath('~/Projects/skills')).toBe(true);
    });

    it('should detect relative paths', () => {
      expect(isLocalPath('./my-skills')).toBe(true);
      expect(isLocalPath('../parent-skills')).toBe(true);
    });

    it('should detect Windows absolute paths', () => {
      expect(isLocalPath('C:\\Projects\\skills')).toBe(true);
      expect(isLocalPath('D:/skills')).toBe(true);
    });

    it('should return false for GitHub URLs', () => {
      expect(isLocalPath('owner/repo')).toBe(false);
      expect(isLocalPath('https://github.com/owner/repo')).toBe(false);
    });
  });

  describe('detectSourceType', () => {
    it('should detect remote URLs', () => {
      expect(detectSourceType('https://github.com/owner/repo')).toBe('remote');
      expect(detectSourceType('http://example.com/repo')).toBe('remote');
    });

    it('should detect GitHub shorthand', () => {
      expect(detectSourceType('owner/repo')).toBe('remote');
    });

    it('should detect local paths', () => {
      expect(detectSourceType('/usr/local/skills')).toBe('local');
      expect(detectSourceType('~/Projects/skills')).toBe('local');
      expect(detectSourceType('./my-skills')).toBe('local');
    });
  });
});
