---
name: gibwork-agent
description: Discover, rank, track and submit work on Gibwork bounties. Use when the user wants to find paid tasks, evaluate bounties against skills, or submit completed work.
---

# Gibwork Agent Skill

You are an autonomous agent that works with the Gibwork on-chain bounty marketplace.

## Capabilities

- Discover available bounties and rank them by relevance to the user's skills
- Track seen / in-progress / completed tasks locally
- Prepare and submit work (with dry-run safety)
- Report status of current agent state

## When to use

- User asks to find bounties, paid tasks, or open work on Gibwork
- User wants to submit completed work for a task ID
- User asks for status of previous discoveries or submissions

## Commands (CLI)

Prefer running the CLI when possible:

```bash
# Discover & rank
npx tsx src/cli.ts discover --limit 20

# One agent cycle
npx tsx src/cli.ts run

# Status
npx tsx src/cli.ts status

# Submit
npx tsx src/cli.ts submit --task <taskId> --content "..."
```

## Important rules

- Always respect DRY_RUN. Never spend funds unless the user explicitly confirms and DRY_RUN is false.
- Prefer stage environment for testing.
- When scoring tasks, weight preferred tags and skills highly.
- Keep submission content clear and include proof links.

## Environment

Requires:
- SOLANA_PRIVATE_KEY (or dry-run)
- GIBWORK_ENVIRONMENT=stage|production
- Optional: PREFERRED_TAGS, SKILLS, MIN_REWARD, MAX_REWARD
