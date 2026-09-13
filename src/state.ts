import fs from 'fs';
import path from 'path';
import { config } from './config.js';
import type { AgentState } from './types.js';

const STATE_FILE = 'agent-state.json';

function ensureDir() {
  if (!fs.existsSync(config.stateDir)) {
    fs.mkdirSync(config.stateDir, { recursive: true });
  }
}

export function loadState(): AgentState {
  ensureDir();
  const file = path.join(config.stateDir, STATE_FILE);
  if (!fs.existsSync(file)) {
    return { seenTaskIds: [], inProgress: {}, completed: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8')) as AgentState;
  } catch {
    return { seenTaskIds: [], inProgress: {}, completed: [] };
  }
}

export function saveState(state: AgentState) {
  ensureDir();
  const file = path.join(config.stateDir, STATE_FILE);
  fs.writeFileSync(file, JSON.stringify(state, null, 2));
}

export function markSeen(taskId: string) {
  const state = loadState();
  if (!state.seenTaskIds.includes(taskId)) {
    state.seenTaskIds.push(taskId);
    if (state.seenTaskIds.length > 500) {
      state.seenTaskIds = state.seenTaskIds.slice(-500);
    }
    saveState(state);
  }
}

export function setInProgress(taskId: string, data: AgentState['inProgress'][string]) {
  const state = loadState();
  state.inProgress[taskId] = data;
  saveState(state);
}

export function markCompleted(taskId: string) {
  const state = loadState();
  delete state.inProgress[taskId];
  if (!state.completed.includes(taskId)) {
    state.completed.push(taskId);
  }
  saveState(state);
}
