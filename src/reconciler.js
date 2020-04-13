import { HOST_ROOT } from './shared/workTags';
import { NO_EFFECT, DELETION, PLACEMENT, UPDATE, REF, PERFORMED_WORK } from './shared/effectTags';
import { isArray, isString } from './shared/is';
import { createFiberFromElement, cloneFiber } from './Fiber'
import { ReactCurrentRoot } from './renderer';
import { updateDOMProperties } from './renderer/config/DOMProperties';
import { shallowEqual, NO_WORK, EMPTY_REFS } from './shared';
import { push } from './commitQueue';
import ReactHook, { resetReactCurrentHookCursor, useState } from './ReactHook';
import createInstance from './renderer/config/createInstance';
import classComponentUpdater from './classComponentUpdater';


export function updateHostComponent (workInProgress) {
  const nextProps = workInProgress.pendingProps;
  const children = nextProps.children;
  const typeofChildren = typeof children;

  const isDirectTextChild = typeofChildren === 'string' || typeofChildren === 'number';
  let nextChildren = nextProps.children;

  let instance = workInProgress.stateNode;

  if (isDirectTextChild) {
    nextChildren = null;
  }

  if (instance === null) {
    const type = workInProgress.type;
    const nextProps = workInProgress.pendingProps;
    const memoizedProps = workInProgress.memoizedProps;
    const rootContainerInstance = getRootHostContainer();
    
    instance = workInProgress.stateNode = createInstance(
      type,
      nextProps,
      rootContainerInstance,
      workInProgress,
    );

    updateDOMProperties(type, instance, nextProps, memoizedProps);
  } else {
    const nextProps = workInProgress.pendingProps;
    const memoizedProps = workInProgress.memoizedProps;

    if (shallowEqual(memoizedProps, nextProps)) {
      cloneFiber(workInProgress);

      return workInProgress.child;
    }
  }

  reconcileChildren(workInProgress, nextChildren);
  return workInProgress.child;
}

export function updateFunctionComponent (workInProgress) {
  const { stateNode, memoizedProps, pendingProps } = workInProgress;
  let instance = stateNode;

  if (
    instance && 
    workInProgress.status === NO_WORK && 
    shallowEqual(memoizedProps, pendingProps)
  ) {
    return cloneChildren(workInProgress);
  }

  if (workInProgress.return && workInProgress.return.context) {
    workInProgress.context = workInProgress.return.context
  }

  ReactHook.ReactCurrentHookFiber = workInProgress;
  resetReactCurrentHookCursor();
  
  let children = workInProgress.type(workInProgress.pendingProps, workInProgress.context);
  if (isString(children)) {
    children = createText(children)
  }

  workInProgress.stateNode = workInProgress;
  
  reconcileChildren(workInProgress, children);

  return workInProgress.child;
}

export function updateHostRoot (workInProgress) {
  const update = workInProgress.update;
  const payload = update.payload;

  const pendingProps = workInProgress.pendingProps;
  const memoizedState = workInProgress.memoizedState;
  const children = memoizedState !== null ? memoizedState.element : null;

  let resultState;

  if (typeof payload === 'function') {
    resultState = payload.call(instance, prevState, nextProps);
  } else {
    resultState = payload;
  }

  workInProgress.memoizedState = resultState;

  const nextState = workInProgress.memoizedState;
  const nextChildren = nextState.element;

  if (children === nextChildren) {

  } else {
    reconcileChildren(workInProgress, nextChildren);
  }

  return workInProgress.child;
}

export function updateClassComponent (workInProgress) {
  let nextProps = workInProgress.pendingProps;
  const Component = workInProgress.type;
  const instance = workInProgress.stateNode;

  let shouldUpdate = false;

  ReactHook.ReactCurrentHookFiber = workInProgress;
  resetReactCurrentHookCursor();

  if (instance === null) {
    workInProgress.effectTag |= PLACEMENT;

    // constructe 
    const instance = new Component(nextProps);

    workInProgress.memoizedState = (
        instance.state !== null && 
        instance.state !== undefined
      ) ? instance.state : null;

    instance.updater = classComponentUpdater;
    workInProgress.stateNode = instance;
    instance._reactInternalFiber = workInProgress;

    instance.props = nextProps;
    instance.state = workInProgress.memoizedState;
    instance.refs = EMPTY_REFS;

    processUpdate(workInProgress, instance);
    applyDerivedStateFromProps(workInProgress, Component, nextProps);

    if (typeof instance.componentDidMount === 'function') {
      workInProgress.effectTag |= UPDATE;
    }

    shouldUpdate = true;
  } else {
    shouldUpdate = updateClassInstance(workInProgress, Component, nextProps);
  }

  return finishClassComponent(workInProgress, Component, shouldUpdate);
}

function updateClassInstance(workInProgress, Component, nextProps) {
  const instance = workInProgress.stateNode;
  const oldProps = workInProgress.memoizedProps;
  
  instance.props = oldProps;

  const oldState = workInProgress.memoizedState;
  let newState = instance.state = oldState;

  processUpdate(workInProgress, instance);
  
  newState = workInProgress.memoizedState;

  applyDerivedStateFromProps(workInProgress, Component, nextProps);
  

  let shouldUpdate = checkShouldComponentUpdate(workInProgress, Component, oldProps, nextProps, oldState, newState);

  if (shouldUpdate) {
    if (typeof instance.componentDidUpdate === 'function') {
      workInProgress.effectTag |= UPDATE;
    }
    if (typeof instance.getSnapshotBeforeUpdate === 'function') {
      workInProgress.effectTag |= SNAPSHOT;
    }
  } else {
    if (typeof instance.componentDidUpdate === 'function') {
      if (oldProps !== current.memoizedProps || oldState !== current.memoizedState) {
        workInProgress.effectTag |= UPDATE;
      }
    }
    if (typeof instance.getSnapshotBeforeUpdate === 'function') {
      if (oldProps !== current.memoizedProps || oldState !== current.memoizedState) {
        workInProgress.effectTag |= SNAPSHOT;
      }
    }

    workInProgress.memoizedProps = nextProps;
    workInProgress.memoizedState = newState;
  }

  instance.props = nextProps;
  instance.state = newState;

  instance._reactInternalFiber = workInProgress;

  return shouldUpdate;
}

function finishClassComponent(workInProgress, Component, shouldUpdate) {
  const ref = workInProgress.ref;
  if (ref !== null) {
    workInProgress.effectTag |= REF;
  }

  if (!shouldUpdate) {
    return bailoutOnAlreadyFinishedWork(current, workInProgress);
  }

  const instance = workInProgress.stateNode;
  const nextChildren = instance.render();
  
  workInProgress.effectTag |= PERFORMED_WORK;

  // if (current !== null) {
  //   workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren);
  // } else {
  //   reconcileChildren(current, workInProgress, nextChildren);
  // }

  reconcileChildren(workInProgress, nextChildren);
  workInProgress.memoizedState = instance.state;

  return workInProgress.child;
}

function applyDerivedStateFromProps(workInProgress, Component, nextProps) {
  const getDerivedStateFromProps = Component.getDerivedStateFromProps;
  if (typeof getDerivedStateFromProps === 'function') {
    const memoizedState = workInProgress.memoizedState;
    const nextState = getDerivedStateFromProps(nextProps, memoizedState);

    instance.state = workInProgress.memoizedState = nextState === null || nextState === undefined ? 
      memoizedState : 
      { ...memoizedState, partialState };
  }
}

function processUpdate (
	workInProgress,
	instance
) {
  let resultState = null;
  const update = workInProgress.update;
		
	if (update !== null) {
    const payload = update.payload;
    if (typeof payload === 'function') {
      resultState =  payload.call(instance, prevState, nextProps);
    } else {

    }
    
    resultState = payload;
    workInProgress.memoizedState = resultState;
    instance.state = workInProgress.memoizedState;
  }
}

function checkShouldComponentUpdate(workInProgress, Component, oldProps, newProps, oldState, newState) {
  const instance = workInProgress.stateNode;
  if (typeof instance.shouldComponentUpdate === 'function') {
    const shouldUpdate = instance.shouldComponentUpdate(newProps, newState);
  
    return shouldUpdate;
  }

  if (Component.prototype && Component.prototype.isPureReactComponent) {
    return !shallowEqual(oldProps, newProps) || 
      !shallowEqual(oldState, newState);
  }

  return true;
}

function createPendingReactElements (children) {
  const pendingKeys = {};

  children.forEach((child, index) => {
    if (isArray(child)) {
      child.filter(child => child).forEach((child, i) => {
        pendingKeys[createReactElementKey(index, i, child.key)] = child;
      });
    } else {
      pendingKeys[createReactElementKey(0, null, child.key)] = child;
    }
  });
  
  return pendingKeys;
}

function createChild(returnFiber, newChild) {
  // 判断是否是纯文本
  if (typeof newChild === 'string' || typeof newChild === 'number') {
    const created = createFiberFromText('' + newChild);
    created.return = returnFiber;
    return created;
  }

  // 如果是对象
  if (typeof newChild === 'object' && newChild !== null) {
    // TODO 根据 $$typeof 构建 fiber
    if (newChild.$$typeof) {
      const created = createFiberFromElement(newChild);
      created.return = returnFiber;
      return created;
    }
  }

  // 如果是数组
  if (isArray(newChild)) {
    const created = createFiberFromElement(newChild, null);
    created.return = returnFiber;
    return created;
  }

  return null;
}

function createReactElementKey (index, next, key) {
  if (key !== null && next !== null) {
    return `.${index}.${key}`;
  } else if (next !== null) {
    return `.${index}.${next}`
  } else if (key !== null) {
    return `.${key}`;
  } else {
    return `.${index}`;
  }
}

function reconcileChildren (workInProgress, children) {
  if (children) {
    const memoizedReactElements = workInProgress.memoizedReactElements;
    const memoizedReactFibers = workInProgress.memoizedReactFibers;
    const pendingReactElements = workInProgress.pendingReactElements = createPendingReactElements([children]);

    const reactElements = {};
    const pendingReactFibers = {};

    // 标记删除
    for (const key in memoizedReactElements) {
      const newChild = pendingReactElements[key];
      const child = memoizedReactElements[key];
      const fiber = memoizedReactFibers[key];

      if (
        newChild &&
        newChild.type === child.type
      ) { 
        reactElements[key] = child;
      } else {
        fiber.effectTag |= DELETION;

        push(fiber);
      }
    }

    let prevChild = null;

    for (const key in pendingReactElements) {
      let newFiber;
      let newChild = pendingReactElements[key];
      const child = reactElements[key];

      // 如果
      if (child) {
        const alternate = memoizedReactFibers[key];
        newFiber = createChild(workInProgress, newChild);
        newFiber.effectTag |= UPDATE;
        newFiber.memoizedProps = alternate.memoizedProps;
        newFiber.memoizedReactFibers = alternate.memoizedReactFibers;
        newFiber.memoizedReactElements = alternate.memoizedReactElements;
        newFiber.stateNode = alternate.stateNode;
        

        // debugger;

        // if (shouldPlace(newChild)) {
        //   newChild.effectTag |= PLACEMENT;
        // }
      } else {
        newFiber = createChild(workInProgress, newChild);
        newFiber.effectTag |= PLACEMENT;
      }

      push(newFiber);
      pendingReactFibers[key] = newFiber;
      

      if (prevChild) {
        prevChild.sibling = newFiber;
      } else {
        workInProgress.child = newFiber;
      }

      prevChild = newFiber;
    }


    workInProgress.memoizedReactFibers = pendingReactFibers;
    workInProgress.memoizedReactElements = workInProgress.pendingReactElements;

    if (prevChild) {
      prevChild.sibling = null;
    }
  }
}

function cloneChildren (fiber) {
  if (fiber.child) {
    const child = fiber.child;

    const newChild = cloneFiber(child);
    newChild.return = fiber;
    newChild.sibling = null;

    fiber.child = newChild;
  }
}

function getRootHostContainer () {
  const root = ReactCurrentRoot.current.internalRoot;
  return root.containerInfo;
}