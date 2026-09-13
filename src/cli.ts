#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { config } from './config.js';
import { discoverTasks, submitWork } from './gibwork.js';
import { loadState, markSeen, setInProgress, markCompleted, saveState } from './state.js';
import type { TaskFilter } from './types.js';

const program = new Command();

program
  .name('gibwork-agent')
  .description('Autonomous agent for discovering and working on Gibwork bounties')
  .version('1.0.0');

program
  .command('discover')
  .description('Discover and rank available Gibwork tasks')
  .option('--min-reward <n>', 'Minimum reward', String(config.minReward))
  .option('--max-reward <n>', 'Maximum reward', String(config.maxReward))
  .option('--tags <tags>', 'Comma-separated preferred tags')
  .option('--limit <n>', 'Max tasks to fetch', '25')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    try {
      console.log(chalk.bold.blue('\nGibwork Agent – Discovery\n'));
      console.log(`Environment : ${config.gibworkEnvironment}`);
      console.log(`Dry-run     : ${config.dryRun}`);
      console.log(`Skills      : ${config.skills.join(', ') || '(none set)'}`);

      const filter: Partial<TaskFilter> = {
        minReward: Number(opts.minReward),
        maxReward: Number(opts.maxReward),
        tags: opts.tags ? opts.tags.split(',').map((t: string) => t.trim()) : config.preferredTags,
        limit: Number(opts.limit),
      };

      const tasks = await discoverTasks(filter);

      if (opts.json) {
        console.log(JSON.stringify(tasks, null, 2));
        return;
      }

      if (tasks.length === 0) {
        console.log(chalk.yellow('\nNo matching tasks found.'));
        return;
      }

      console.log(chalk.green(`\nFound ${tasks.length} matching tasks:\n`));
      tasks.slice(0, 15).forEach((t, i) => {
        console.log(`${i + 1}. ${chalk.bold(t.title)}`);
        console.log(`   ID     : ${t.taskId}`);
        console.log(`   Reward : ${t.reward}`);
        console.log(`   Tags   : ${t.tags.join(', ') || '—'}`);
        console.log(`   Score  : ${t.score ?? 0}`);
        console.log(`   URL    : ${t.url}\n`);
      });
    } catch (err: any) {
      console.error(chalk.red('Error:'), err.message || err);
      process.exit(1);
    }
  });

program
  .command('status')
  .description('Show local agent state')
  .action(() => {
    const state = loadState();
    console.log(chalk.bold.blue('\nAgent State\n'));
    console.log(`Seen tasks     : ${state.seenTaskIds.length}`);
    console.log(`In progress    : ${Object.keys(state.inProgress).length}`);
    console.log(`Completed      : ${state.completed.length}`);
    console.log(`Last run       : ${state.lastRunAt || 'never'}`);

    if (Object.keys(state.inProgress).length > 0) {
      console.log(chalk.cyan('\nIn-progress tasks:'));
      Object.values(state.inProgress).forEach(p => {
        console.log(`  • ${p.taskId} [${p.status}] started ${p.startedAt}`);
      });
    }
  });

program
  .command('submit')
  .description('Submit work for a specific task')
  .requiredOption('--task <id>', 'Task ID')
  .requiredOption('--content <text>', 'Submission content / proof')
  .option('--dry-run', 'Force dry-run', config.dryRun)
  .action(async (opts) => {
    try {
      if (opts.dryRun) config.dryRun = true;

      console.log(chalk.bold.blue('\nSubmitting work...\n'));
      setInProgress(opts.task, {
        taskId: opts.task,
        startedAt: new Date().toISOString(),
        status: 'submitted',
        notes: 'Manual submission via CLI',
      });

      const result = await submitWork(opts.task, opts.content);
      markCompleted(opts.task);

      console.log(chalk.green('Submission result:'));
      console.log(JSON.stringify(result, null, 2));
    } catch (err: any) {
      console.error(chalk.red('Error:'), err.message || err);
      process.exit(1);
    }
  });

program
  .command('run')
  .description('Run one discovery + ranking cycle')
  .option('--limit <n>', 'Max tasks', '20')
  .action(async (opts) => {
    try {
      console.log(chalk.bold.blue('\nGibwork Agent – Cycle\n'));
      const state = loadState();
      state.lastRunAt = new Date().toISOString();
      saveState(state);

      const tasks = await discoverTasks({ limit: Number(opts.limit) });
      const newOnes = tasks.filter(t => !state.seenTaskIds.includes(t.taskId));

      console.log(`Total discovered : ${tasks.length}`);
      console.log(`New / unseen     : ${newOnes.length}`);

      newOnes.slice(0, 5).forEach(t => {
        markSeen(t.taskId);
        console.log(chalk.green(`  → New high-score task: ${t.title} (${t.reward}) score=${t.score}`));
      });

      console.log(chalk.cyan('\nCycle complete. Use `discover` or `submit` for next steps.'));
    } catch (err: any) {
      console.error(chalk.red('Error:'), err.message || err);
      process.exit(1);
    }
  });

program.parse();
