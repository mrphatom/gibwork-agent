import 'dotenv/config';
import { z } from 'zod';

const ConfigSchema = z.object({
  solanaPrivateKey: z.string().optional(),
  gibworkEnvironment: z.enum(['stage', 'production']).default('stage'),
  dryRun: z.boolean().default(true),
  minReward: z.number().default(10),
  maxReward: z.number().default(500),
  preferredTags: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  maxConcurrent: z.number().default(3),
  stateDir: z.string().default('./state'),
  discordWebhookUrl: z.string().optional(),
});

function parseList(value: string | undefined, fallback: string[] = []): string[] {
  if (!value) return fallback;
  return value.split(',').map(s => s.trim()).filter(Boolean);
}

export const config = ConfigSchema.parse({
  solanaPrivateKey: process.env.SOLANA_PRIVATE_KEY || process.env.GIBWORK_PRIVATE_KEY,
  gibworkEnvironment: (process.env.GIBWORK_ENVIRONMENT as any) || 'stage',
  dryRun: process.env.DRY_RUN === 'true' || process.env.DRY_RUN === '1' || !process.env.SOLANA_PRIVATE_KEY,
  minReward: Number(process.env.MIN_REWARD || 10),
  maxReward: Number(process.env.MAX_REWARD || 500),
  preferredTags: parseList(process.env.PREFERRED_TAGS),
  skills: parseList(process.env.SKILLS),
  maxConcurrent: Number(process.env.MAX_CONCURRENT || 3),
  stateDir: process.env.STATE_DIR || './state',
  discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL,
});

export function assertWallet() {
  if (!config.solanaPrivateKey && !config.dryRun) {
    throw new Error('SOLANA_PRIVATE_KEY is required when DRY_RUN is not enabled');
  }
}

export function doctorReport(): string[] {
  return [
    `Environment    : ${config.gibworkEnvironment}`,
    `Dry-run        : ${config.dryRun}`,
    `Wallet present : ${config.solanaPrivateKey ? 'yes' : 'no'}`,
    `Skills         : ${config.skills.join(', ') || '(none)'}`,
    `Preferred tags : ${config.preferredTags.join(', ') || '(none)'}`,
    `Reward range   : ${config.minReward} – ${config.maxReward}`,
    `State dir      : ${config.stateDir}`,
  ];
}
