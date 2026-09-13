import { createGibworkClient } from '@gibwork/sdk/node';
import { config, assertWallet } from './config.js';
import type { DiscoveredTask, TaskFilter } from './types.js';
import chalk from 'chalk';

let client: ReturnType<typeof createGibworkClient> | null = null;

function getClient() {
  assertWallet();
  if (!client) {
    if (!config.solanaPrivateKey) {
      throw new Error('No private key');
    }
    client = createGibworkClient({
      privateKey: config.solanaPrivateKey,
      production: config.gibworkEnvironment === 'production',
    });
  }
  return client;
}

export async function discoverTasks(filter: Partial<TaskFilter> = {}): Promise<DiscoveredTask[]> {
  const gibwork = getClient();

  const result = await (gibwork as any).tasks.listAvailable?.({ page: 1, limit: filter.limit || 30 })
    || await (gibwork as any).tasks.list?.({ page: 1, limit: filter.limit || 30 });

  const tasks: any[] = Array.isArray(result) ? result : (result?.tasks || result?.data || []);

  const scored: DiscoveredTask[] = tasks.map((t: any) => {
    const tags: string[] = t.tags || [];
    const reward = parseFloat(t.payment?.amount || t.reward || t.amount || '0');
    const title = t.title || '';
    const content = t.content || t.description || '';

    let score = 0;
    const preferred = new Set([...config.preferredTags, ...config.skills].map(s => s.toLowerCase()));
    tags.forEach(tag => {
      if (preferred.has(tag.toLowerCase())) score += 3;
    });
    preferred.forEach(skill => {
      if (title.toLowerCase().includes(skill) || content.toLowerCase().includes(skill)) score += 1;
    });
    if (reward >= config.minReward && reward <= config.maxReward) score += 2;

    return {
      taskId: t.taskId || t.id,
      title,
      content,
      tags,
      reward: String(reward),
      mintAddress: t.payment?.mintAddress || t.mint || '',
      minSubmissionAmount: t.minSubmissionAmount,
      creator: t.creator || t.owner,
      url: `https://gib.work/task/${t.taskId || t.id}`,
      score,
    };
  });

  return scored
    .filter(t => {
      const r = parseFloat(t.reward);
      if (filter.minReward && r < filter.minReward) return false;
      if (filter.maxReward && r > filter.maxReward) return false;
      if (filter.tags && filter.tags.length > 0) {
        const has = filter.tags.some(tag => t.tags.map(x => x.toLowerCase()).includes(tag.toLowerCase()));
        if (!has) return false;
      }
      return true;
    })
    .sort((a, b) => (b.score || 0) - (a.score || 0));
}

export async function submitWork(taskId: string, content: string, idempotencyKey?: string) {
  if (config.dryRun) {
    console.log(chalk.yellow('[DRY-RUN] Would submit work for task'), taskId);
    return { status: 'dry-run', taskId, content };
  }

  const gibwork = getClient();
  const key = idempotencyKey || crypto.randomUUID();

  const intent = await (gibwork as any).submissions.create(taskId, {
    content,
    idempotencyKey: key,
  });

  return intent;
}

export async function getTask(taskId: string) {
  const gibwork = getClient();
  return (gibwork as any).tasks.get?.(taskId) || (gibwork as any).tasks.list?.({ id: taskId });
}
