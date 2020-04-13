import { NO_EFFECT, DELETION, UPDATE, PLACEMENT } from './shared/effectTags';
import { HOST_COMPONENT, HOST_TEXT, HOST_ROOT, HOST_PORTAL } from './shared/workTags';
import { INTERNAL_EVENT_HANDLERS_KEY } from './shared';
import { updateDOMProperties } from './renderer/config/DOMProperties';
import appendChildToContainer from './renderer/config/appendChildToContainer';

const commitQueue = [];

export function push (workInProgress) {
  if (workInProgress.effectTag & NO_EFFECT) {
    // nothing to do
  } else {
    commitQueue.push(workInProgress);
  }
}

export function commitAllWork () {
  let workInProgress = commitQueue.shift();  
  
  while (workInProgress) {
    const { effectTag, tag } = workInProgress;

    if (tag === HOST_COMPONENT || tag === HOST_TEXT || tag === HOST_ROOT) {
      if (effectTag & PLACEMENT) {
        commitPlacement(workInProgress);
        workInProgress.effectTag &= ~PLACEMENT;
      } else if (effectTag & UPDATE) {
        commitUpdate(workInProgress);
        workInProgress.effectTag &= ~UPDATE;
      } else if (effectTag & DELETION) {
        commitDeletion(workInProgress);
        workInProgress.effectTag &= ~DELETION;
      }
    }

    workInProgress.memoizedProps = workInProgress.pendingProps;

    workInProgress = commitQueue.shift();
  }
}

function commitDeletion (workInProgress) {
  const { stateNode, type, pendingProps, memoizedProps } = workInProgress;
  const instance = stateNode;  

  instance[INTERNAL_EVENT_HANDLERS_KEY] = null;
  updateDOMProperties(type, instance, {}, memoizedProps);
  instance.parentNode.removeChild(instance);
}

function commitUpdate (workInProgress) {
  const { stateNode, type, pendingProps, memoizedProps } = workInProgress;
  const instance = stateNode;  

  instance[INTERNAL_EVENT_HANDLERS_KEY] = pendingProps;
  updateDOMProperties(type, instance, pendingProps, memoizedProps);
}

function commitPlacement (workInProgress) {
  const parentFiber = getHostParentFiber(workInProgress);
  const { tag, stateNode } = parentFiber;

  let parent;
  let isContainer;

  if (tag === HOST_COMPONENT) {
    parent = stateNode;
      isContainer = false;
  } else if (tag === HOST_ROOT) {
    parent = stateNode.containerInfo;
    isContainer = true;
  } else {

  }

  const before = getHostSibling(workInProgress);
  let node = workInProgress;
  while (true) {
    const isHost = node.tag === HOST_COMPONENT || node.tag === HOST_TEXT;

    if (isHost) {
      const stateNode = isHost ? 
        node.stateNode : 
        node.stateNode.instance;

      if (before) {
        if (isContainer) {
          insertInContainerBefore(parent, stateNode, before);
        } else {
          insertBefore(parent, stateNode, before);
        }
      } else {
        if (isContainer) {
          appendChildToContainer(parent, stateNode);
        } else {
          appendChild(parent, stateNode);
        }
      }
    } else if (node.tag === HOST_PORTAL) {

    } else if (node.child !== null) {
      node.child.return = node;
      node = node.child;
      continue;
    }

    if (node === workInProgress) {
      return;
    }

    while (node.sibling === null) {
      if (node.return === null || node.return === workInProgress) {
        return;
      }

      node = node.return;
    }

    node.sibling.return = node.return;
    node = node.sibling;
  }
}

function isHostParent(fiber) {
  return fiber.tag === HOST_COMPONENT || fiber.tag === HOST_ROOT || fiber.tag === HOST_PORTAL;
}


function getHostSibling(fiber) {
  let node = fiber;
  siblings: while (true) {
    while (node.sibling === null) {
      if (node.return === null || isHostParent(node.return)) {
        return null;
      }

      node = node.return;
    }

    node.sibling.return = node.return;
    node = node.sibling;

    while (node.tag !== HOST_COMPONENT && node.tag !== HOST_TEXT) {
      if (node.effectTag & PLACEMENT) {
        continue siblings;
      }
      
      if (node.child === null || node.tag === HOST_PORTAL) {
        continue siblings;
      } else {
        node.child.return = node;
        node = node.child;
      }
    }

    if (!(node.effectTag & PLACEMENT)) {
      return node.stateNode;
    }
  }
}

function getPublicInstance(instance) {
  return instance;
}

function getHostParentFiber(fiber) {
  let parent = fiber.return;

  while (parent !== null) {
    if (isHostParent(parent)) {
      return parent;
    }
    parent = parent.return;
  }
}