import { z } from 'zod';

export const TaskFilterSchema = z.object({
  minReward: z.number().optional(),
  maxReward: z.number().optional(),
  tags: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  verifiedOnly: z.boolean().optional(),
  limit: z.number().default(20),
});

export type TaskFilter = z.infer<typeof TaskFilterSchema>;

export interface DiscoveredTask {
  taskId: string;
  title: string;
  content: string;
  tags: string[];
  reward: string;
  mintAddress: string;
  minSubmissionAmount?: string;
  creator?: string;
  url: string;
  score?: number;
}

export interface AgentState {
  seenTaskIds: string[];
  inProgress: Record<string, {
    taskId: string;
    startedAt: string;
    status: 'evaluating' | 'working' | 'submitted' | 'failed';
    notes?: string;
    submissionId?: string;
  }>;
  completed: string[];
  lastRunAt?: string;
}

export interface SubmissionDraft {
  taskId: string;
  content: string;
  notes?: string;
}
