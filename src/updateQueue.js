import {
  NO_WORK,
  PENDING_WORK
} from './shared';

const updateQueue = [];

export function enqueueUpdateQueue (fiber) {
  if (fiber.status === NO_WORK) {
    fiber.status = PENDING_WORK;
    updateQueue.push(fiber);
  }
}

export function dequeueUpdateQueue () {
  return updateQueue.shift();
}

