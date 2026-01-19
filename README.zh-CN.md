# Skills Sync

> [English](./README.md)

同步 Agent Skills 到 Antigravity、Codex、Claude Code、Cursor 等工具。

## 快速开始

```bash
# 1. 从 Git 和本地源获取 skills
skills fetch

# 2. 同步到所有启用的目标工具
skills sync

# 3. 查看状态
skills status
```

### 添加本地 Skills

```bash
# 添加本地 skills 目录（绝对或相对路径）
skills source add ~/Projects/my-skills
skills source add ./local-skills

# 运行 fetch 同步
skills fetch
```

## 命令列表

| 命令 | 说明 |
|------|------|
| `skills fetch` | 获取/更新所有 skills |
| `skills fetch -- anthropics/skills` | 获取指定源 |
| `skills sync` | 同步到所有启用的目标 |
| `skills status` | 查看同步状态 |
| `skills list` | 列出所有 skills |
| `skills config` | 显示当前配置 |

**向后兼容:**
- `npm run skills:fetch` 仍然可用
- `npm run skills:sync` 仍然可用
- `npm run skills:status` 仍然可用

## 配置

配置文件位置：`~/.skillsync/config.json`。你可以通过命令行管理，或手动编辑。

### 添加新的 Skills 源

**远程源（GitHub）：**

```bash
skills source add owner/repo
# 或
skills source add https://github.com/owner/repo
```

**本地源：**

```bash
# 添加本地 skills 目录（支持任意路径格式）
skills source add ~/Projects/apple-mp/skills
skills source add ./my-local-skills
skills source add /absolute/path/to/skills
```

路径下的所有子目录都会被视为独立的 skill，并复制到 `~/.skillsync/store/local/`。

**冲突解决**：当获取本地源时，如果同名 skill 已存在且内容不同，系统会提示您选择：
- `yes` - 覆盖这个特定的 skill
- `no` - 保留现有 skill 不变
- `yes for all` - 覆盖所有剩余冲突（新 skills 仍会被复制）
- `no for all` - 保留所有现有 skills 不变（新 skills 仍会被复制）

> **注意**：两个 "for all" 选项仅影响冲突的 skills。没有冲突的新 skills 始终会被复制。

> ⚠️ **重要**: 如果 skills 在仓库的子目录中（如 [`vercel-labs/agent-skills`](https://github.com/vercel-labs/agent-skills) 的 skills 在 `skills/` 目录下），需要配置 `subdir: "skills"`，否则AI 工具无法识别 skills。

### 启用/禁用目标

```typescript
targets: {
  cursor: {
    path: join(home, ".cursor", "skills"),
    enabled: true,  // 改为 false 禁用
  },
}
```

## 目录结构

```
~/.skillsync/store/
├── anthropics/skills/          # 远程源
│   ├── doc-analyzer/
│   └── ...
├── vercel-labs/agent-skills/   # 远程源
│   └── ...
└── local/                      # 所有本地 skills（扁平结构）
    ├── apple-writer/
    ├── my-custom-skill/
    └── another-skill/
```

## 重要说明

- **远程源**: 每次 `fetch` 会**完全覆盖**本地内容
- **本地源**: 在 `fetch` 时从源路径复制，带冲突检测
- **更新本地 skills**: 重新运行 `skills fetch` 从源路径同步变更
- **本地存储**: 所有本地 skills 以扁平结构存储在 `~/.skillsync/store/local/`

## 默认配置

### 启用的目标

- ✅ Antigravity (`~/.gemini/antigravity/skills/`)
- ✅ Codex (`~/.codex/skills/`)
- ✅ Claude (`~/.claude/skills/`)
- ✅ Cursor (`~/.cursor/skills/`)
- ✅ Copilot (`~/.copilot/skills/`)

### 已禁用目标

- Gemini (`~/.gemini/skills/`)
- Windsurf (`~/.windsurf/skills/`)

## 依赖

- Node.js 18+
- Git
- tsx (通过 npx 自动安装)
