# Skills Sync

> [中文文档](./README.zh-CN.md)

Sync **Agent Skills** to **Cursor**, **Claude**, **Codex**, and more.

## Features

- 🔄 Sync skills to multiple AI coding tools (Cursor, Claude, Codex, Copilot, etc.)
- 🌐 Support for remote Git repositories and local skill directories
- 🔀 Intelligent conflict resolution for local skills
- ⚙️ Flexible configuration via CLI or config file
- 🚀 Easy-to-use command-line interface

## Installation

```bash
npm install -g skillsync
```

## Quick Start

```bash
# 1. Fetch skills from Git and local sources
skillsync fetch

# 2. Push to all enabled targets
skillsync push

# 3. View status
skillsync status
```

### Adding Local Skills

```bash
# Add local skills directory (absolute or relative path)
skillsync source add ~/Projects/my-skills
skillsync source add ./local-skills

# Fetch to sync
skillsync fetch
```

## Commands

| Command | Description |
|---------|-------------|
| `skillsync fetch` | Fetch/update all skills from sources |
| `skillsync fetch <source>` | Fetch specific source |
| `skillsync push` | Push to all enabled targets |
| `skillsync sync` | (deprecated) Use 'push' instead |
| `skillsync status` | View sync status |
| `skillsync list` | List all skills |
| `skillsync config` | Show configuration |
| `skillsync source add <path>` | Add a new skills source |
| `skillsync source remove <path>` | Remove a skills source |
| `skillsync source list` | List all sources |

## Configuration

Configuration is stored in `~/.skillsync/config.json`. You can manage it via CLI commands or edit it manually.

### Add New Skills Source

**Remote Sources (GitHub):**

```bash
skillsync source add owner/repo
# or
skillsync source add https://github.com/owner/repo
```

**Local Sources:**

```bash
# Add local skills directory (any path format)
skillsync source add ~/Projects/apple-mp/skills
skillsync source add ./my-local-skills
skillsync source add /absolute/path/to/skills
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

## How It Works

1. **Fetch**: Skills are fetched from configured sources (Git repos and local directories)
   - Remote sources: Cloned/updated from Git repositories
   - Local sources: Copied from your local directories with conflict detection

2. **Store**: All skills are stored in `~/.skillsync/store/`
   - Remote sources maintain their repository structure
   - Local sources are stored in a flat structure under `local/`

3. **Sync**: Skills are copied to enabled target directories
   - Each target has its own directory structure
   - Existing skills are overwritten, new skills are added

## Important Notes

- **Remote sources**: Each `fetch` will **completely overwrite** local content
- **Local sources**: Copied from source path with intelligent conflict detection
- **Updating local skills**: Re-run `skillsync fetch` to sync changes from source path
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

## Requirements

- Node.js 18+
- Git

## License

MIT © [Jinzhe](https://github.com/jinzheio)

## Repository

- [GitHub](https://github.com/jinzheio/skillsync)
- [Issues](https://github.com/jinzheio/skillsync/issues)
