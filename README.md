# gibwork-agent

**Production-ready autonomous agent for the Gibwork ecosystem.**

Discovers, ranks, tracks and submits work on Gibwork bounties.  
Ships with an MCP-compatible skill for Claude Code / Codex.

Part of the coordinated tooling suite:

| Tool | Role |
|------|------|
| [gibwork-github-bounty](https://github.com/mrphatom/gibwork-github-bounty) | Creates bounties from labeled GitHub issues |
| **gibwork-agent** (this repo) | Discovers & works on them |
| [gibwork-orchestrator](https://github.com/mrphatom/gibwork-orchestrator) | Team control plane (create / review / approve) |

See [ECOSYSTEM.md](https://github.com/mrphatom/gibwork-github-bounty/blob/main/ECOSYSTEM.md) for the full workflow.

---

## Features

- Task discovery with relevance scoring against skills & preferred tags
- Local persistent state (seen / in-progress / completed)
- Dry-run mode for safe testing
- Official `@gibwork/sdk` integration
- Zod-validated configuration
- MCP skill definition included
- Scheduled discovery GitHub Action

---

## Quick Start

```bash
git clone https://github.com/mrphatom/gibwork-agent.git
cd gibwork-agent
npm install
cp .env.example .env
# start with DRY_RUN=true
npm run build
```

### CLI

```bash
npx tsx src/cli.ts discover --limit 20
npx tsx src/cli.ts run
npx tsx src/cli.ts status
npx tsx src/cli.ts submit --task <taskId> --content "Completed: https://..."
```

### MCP / Claude Code / Codex skill

A skill definition lives at `skills/gibwork-agent/SKILL.md`.

After installing the official Gibwork CLI you can also register related MCP tools:

```bash
npm install -g @gibwork/cli @gibwork/mcp
gibwork --profile production mcp install claude   # or codex
```

Then point your agent at this skill directory or copy `SKILL.md` into your skills path.

---

## GitHub Actions

- **CI** – typecheck + build on every push/PR
- **Periodic Discovery** – runs every 6 hours (or manually) and executes one agent cycle

Required secrets/vars for the discovery Action:
- `SOLANA_PRIVATE_KEY` (secret)
- `GIBWORK_ENVIRONMENT`, `DRY_RUN`, `PREFERRED_TAGS`, `SKILLS` (vars)

---

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `SOLANA_PRIVATE_KEY` | Wallet key | required unless dry-run |
| `GIBWORK_ENVIRONMENT` | `stage` / `production` | `stage` |
| `DRY_RUN` | Skip real writes | `true` if no key |
| `MIN_REWARD` / `MAX_REWARD` | Reward filter | 10 / 500 |
| `PREFERRED_TAGS` | Comma list | — |
| `SKILLS` | Comma list used for scoring | — |
| `STATE_DIR` | Local state directory | `./state` |

---

## License

MIT
