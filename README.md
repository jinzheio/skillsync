# Skills Sync

> [中文文档](./README.zh-CN.md)

Sync **Agent Skills** to **Cursor**, **Claude**, **Codex**, and more.

## Quick Start

```bash
# 1. Fetch skills from Git and local sources
skills fetch

# 2. Sync to all enabled targets
skills sync

# 3. View status
skills status
```

### Adding Local Skills

```bash
# Add local skills directory (absolute or relative path)
skills source add ~/Projects/my-skills
skills source add ./local-skills

# Fetch to sync
skills fetch
```

## Commands

| Command | Description |
|---------|-------------|
| `skills fetch` | Fetch/update all skills from Git |
| `skills fetch -- anthropics/skills` | Fetch specific source |
| `skills sync` | Sync to all enabled targets |
| `skills status` | View sync status |
| `skills list` | List all skills |
| `skills config` | Show configuration |

**Backward compatible:**
- `npm run skills:fetch` still works
- `npm run skills:sync` still works
- `npm run skills:status` still works

## Configuration

Configuration is stored in `~/.skillsync/config.json`. You can manage it via CLI commands or edit it manually.

### Add New Skills Source

**Remote Sources (GitHub):**

```bash
skills source add owner/repo
# or
skills source add https://github.com/owner/repo
```

**Local Sources:**

```bash
# Add local skills directory (any path format)
skills source add ~/Projects/apple-mp/skills
skills source add ./my-local-skills
skills source add /absolute/path/to/skills
```

Any subdirectories in the path will be treated as individual skills and copied to `~/.skillsync/store/local/`.

**Conflict Resolution**: When fetching local sources, if a skill with the same name already exists in the local store with different content, you'll be prompted to choose:
- `yes` - Overwrite this specific skill
- `no` - Keep existing skill unchanged
- `yes for all` - Overwrite all remaining conflicts (new skills are still copied)
- `no for all` - Keep all existing skills unchanged when conflicts occur (new skills are still copied)

> **Note**: Both "for all" options only affect conflicting skills. New skills without conflicts are always copied.

> ⚠️ **Important**: If skills are in a subdirectory of the repository (e.g., `vercel-labs/agent-skills` has skills in `skills/` directory), you **must** configure `subdir: "skills"`, otherwise the synced content will be incorrect and AI tools won't recognize the skills.

### Enable/Disable Targets

```typescript
targets: {
  cursor: {
    path: join(home, ".cursor", "skills"),
    enabled: true,  // Set to false to disable
  },
}
```

## Directory Structure

```
~/.skillsync/store/
├── anthropics/skills/          # Remote source
│   ├── doc-analyzer/
│   └── ...
├── vercel-labs/agent-skills/   # Remote source
│   └── ...
└── local/                      # All local skills (flat structure)
    ├── apple-writer/
    ├── my-custom-skill/
    └── another-skill/
```

## Important Notes

- **Remote sources**: Each `fetch` will **completely overwrite** local content
- **Local sources**: Copied from source path with conflict detection during `fetch`
- **Updating local skills**: Re-run `skills fetch` to sync changes from source path
- **Local storage**: All local skills are stored in flat structure under `~/.skillsync/store/local/`

## Default Configuration

### Enabled Targets

- ✅ Antigravity (`~/.gemini/antigravity/skills/`)
- ✅ Codex (`~/.codex/skills/`)
- ✅ Claude (`~/.claude/skills/`)
- ✅ Cursor (`~/.cursor/skills/`)
- ✅ Copilot (`~/.copilot/skills/`)

### Disabled Targets

- Gemini (`~/.gemini/skills/`)
- Windsurf (`~/.windsurf/skills/`)

## Dependencies

- Node.js 18+
- Git
- tsx (auto-installed via npx)
