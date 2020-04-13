import { enqueueUpdateQueue, dequeueUpdateQueue } from './updateQueue';
import { scheduleWork, shouldYeild } from './scheduleQueue';
import { HOST_ROOT, FUNCTION_COMPONENT, CLASS_COMPONENT, HOST_COMPONENT } from './shared/workTags';
import { updateHostRoot, updateFunctionComponent, updateHostComponent, updateClassComponent } from './reconciler';
import { commitAllWork } from './commitQueue';
import { NO_EFFECT } from './shared/effectTags';
import { NO_WORK } from './shared';

let workInProgress = null;
let pendingCommitWorkInProgress = null;

export function scheduleUpdate (fiber) {
  enqueueUpdateQueue(fiber);
  
  scheduleWork(performWork);
}

function workLoop (isExpired) {
  if (!workInProgress) {
    workInProgress = dequeueUpdateQueue();
  }

  while (workInProgress && (!shouldYeild() || !isExpired)) {
    workInProgress = performUnitOfWork(workInProgress);
  }

  if (pendingCommitWorkInProgress) {
    commitAllWork();
    pendingCommitWorkInProgress = null;
  }
}

function performWork (isExpired) {
  workLoop(isExpired);

  if (isExpired && workInProgress) {
    return performWork;
  }
}

function performUnitOfWork (workInProgress) {
  beginWork(workInProgress);

  workInProgress.status = NO_WORK;

  if (workInProgress.child) {
    return workInProgress.child;
  }

  let node = workInProgress;

  while (node) {
    completeWork(node);
    if (node.sibling) {
      return node.sibling;
    }

    node = node.return;
  }
}

function completeWork (workInProgress) {
  if (!workInProgress.return) {
    pendingCommitWorkInProgress = workInProgress;
  }
}


function beginWork (workInProgress) {
  const { tag } = workInProgress;

  switch (tag) {
    case HOST_ROOT: {
      return updateHostRoot(workInProgress);
    }

    case FUNCTION_COMPONENT: {
      return updateFunctionComponent(workInProgress);
    }

    case CLASS_COMPONENT: {
      return updateClassComponent(workInProgress);
    }

    case HOST_COMPONENT: {
      return updateHostComponent(workInProgress);
    }
  }
}