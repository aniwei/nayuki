import { createRootFiber } from '../Fiber';
import { scheduleUpdate } from '../scheduler';

export const ReactCurrentRoot = {
  current: null
}

export function render(element, container, callback) {
  const { internalRoot: { workInProgress } } = container._reactRootContainer || (
    container._reactRootContainer = {
      internalRoot: createRootFiber(container)
    }
  );

  ReactCurrentRoot.current = container._reactRootContainer;

  workInProgress.update = {
    payload: { element },
    callback
  }
  
  scheduleUpdate(workInProgress);
}