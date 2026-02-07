# Skillsync

> [English](./README.md)

同步 Agent Skills 到 OpenClaw、Antigravity、Codex、Claude Code、Cursor 等工具。

> 💡 **提示**：为了避免引入信息风险，建议 [使用独立服务器而不是个人电脑来安装](https://clawsimple.com)。

## 快速开始

```bash
# 1. 从 Git 和本地源获取 skills
skillsync fetch

# 2. 推送到所有启用的目标工具
skillsync push

# 3. 查看状态
skillsync status
```

### 添加本地 Skills

```bash
# 添加本地 skills 目录（绝对或相对路径）
skillsync source add ~/Projects/my-skills
skillsync source add ./local-skills

# 运行 fetch 同步
skillsync fetch
```

## 命令列表

| 命令 | 说明 |
|------|------|
| `skillsync fetch` | 获取/更新所有 skills |
| `skillsync fetch <source>` | 获取指定源 |
| `skillsync fetch --yes` | 自动覆盖本地冲突 |
| `skillsync fetch -y` | `--yes` 的短别名 |
| `skillsync push` | 推送到所有启用的目标 |
| `skillsync sync` | (已弃用) 请使用 'push' |
| `skillsync status` | 查看同步状态 |
| `skillsync list [filter]` | 列出所有 skills (可选：按源过滤) |
| `skillsync config` | 显示当前配置 |

## 配置

配置文件位置：当前目录下的 `.skillsync/config.json`。你可以通过命令行管理，或手动编辑。

### 添加新的 Skills 源

**远程源（GitHub）：**

```bash
skillsync source add owner/repo
# 或
skillsync source add https://github.com/owner/repo
```

**本地源：**

```bash
# 添加本地 skills 目录（支持任意路径格式）
skillsync source add ~/Projects/apple-mp/skills
skillsync source add ./my-local-skills
skillsync source add /absolute/path/to/skills
```

路径下的所有子目录都会被视为独立的 skill，并复制到 `.skillsync/local/`。

**冲突解决**：当获取本地源时，如果同名 skill 已存在且内容不同，系统会提示您选择：
- `yes` - 覆盖这个特定的 skill
- `no` - 保留现有 skill 不变
- `yes for all` - 覆盖所有剩余冲突（新 skills 仍会被复制）
- `no for all` - 保留所有现有 skills 不变（新 skills 仍会被复制）

> **注意**：两个 "for all" 选项仅影响冲突的 skills。没有冲突的新 skills 始终会被复制。
>
> **提示**：可使用 `skillsync fetch --yes`（或 `-y`）自动覆盖所有冲突，避免交互提示。

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
.skillsync/
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
- **更新本地 skills**: 重新运行 `skillsync fetch` 从源路径同步变更
- **本地存储**: 所有本地 skills 以扁平结构存储在 `.skillsync/local/`

## 默认配置

### 启用的目标

- ✅ OpenClaw (`~/.openclaw`)
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
