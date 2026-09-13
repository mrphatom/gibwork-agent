# gibwork-agent

**Production-ready autonomous agent for the Gibwork ecosystem.**

Discovers, ranks, tracks and submits work on Gibwork bounties.  
Designed to work as a CLI tool and as an MCP-powered agent for Claude Code / Codex.

Part of the coordinated tooling suite:
- `gibwork-github-bounty` → creates bounties from GitHub issues
- **gibwork-agent** → discovers & works on them
- `gibwork-orchestrator` → team control plane (create / review / approve)

---

## Features

- Task discovery with relevance scoring against your skills & preferred tags
- Local persistent state (seen / in-progress / completed)
- Dry-run mode for safe testing
- Submission flow using the official `@gibwork/sdk`
- Clean Zod-validated configuration
- Ready for MCP skill packaging / agent loops

---

## Quick Start

```bash
git clone https://github.com/mrphatom/gibwork-agent.git
cd gibwork-agent
npm install
cp .env.example .env
# edit .env – start with DRY_RUN=true
npm run build
```

### Common commands

```bash
# Discover & rank open bounties
npx tsx src/cli.ts discover --limit 20

# Run one agent cycle
npx tsx src/cli.ts run

# Show local agent state
npx tsx src/cli.ts status

# Submit work
npx tsx src/cli.ts submit --task <taskId> --content "Completed: https://..."
```

---

## Ecosystem Fit

1. Bounties are created by `gibwork-github-bounty` or `gibwork-orchestrator`
2. This agent discovers them, scores relevance, and can submit work
3. The orchestrator reviews submissions and releases payment

All three tools share the same wallet config style and dry-run philosophy.

---

## License

MIT
