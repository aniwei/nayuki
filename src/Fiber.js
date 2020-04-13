import { HOST_ROOT, FUNCTION_COMPONENT, HOST_COMPONENT, CLASS_COMPONENT } from './shared/workTags';
import { NO_EFFECT } from './shared/effectTags';
import { NO_WORK } from './shared';

function createFiberNode (tag, pendingProps, key) {
  return {
    tag,
    pendingProps,
    key,
    effectTag: NO_EFFECT,
    type: null,
    elementType: null,
    
    stateNode: null,
    update: null,
    
    memoizedProps: null,
    memoizedState: null,

    memoizedFibers: null,
    memoizedReactElements: null,
    pendingReactElements: null,
    pendingFibers: null,

    return: null,
    child: null,

    status: NO_WORK,
  }
}

export function cloneFiber (fiber) {
  const { tag, pendingProps, key } = fiber;
  const created = createFiber(tag, pendingProps, key);

  created.stateNode = fiber.stateNode;
  created.memoizedProps = fiber.memoizedProps;
  created.pendingFibers = fiber.pendingFibers;
  created.memoizedFibers = fiber.memoizedFibers;
  created.memoizedState = fiber.memoizedFibers;


  created.type = fiber.type;
  created.elementType = fiber.elementType;
  created.effectTag = NO_EFFECT;

  return created;
}

export function createFiber (tag, pendingProps, key) {
  return createFiberNode(tag, pendingProps, key);
}

export function createFiberFromText (content) {
  const fiber = createFiber(HOST_TEXT, content, null);
  return fiber;
}

export function createFiberFromElement(element) {
  const owner = element._owner;
  const type = element.type;
  const key = element.key;
  const pendingProps = element.props;
  const fiber = createFiberFromTypeAndProps(type, key, pendingProps, owner);
  
  return fiber;
}

export function createFiberFromFragment(elements, key) {
  var fiber = createFiber(Fragment, elements);
  return fiber;
}

function createFiberFromTypeAndProps(
  type, // React$ElementType
  key, 
  pendingProps,
  owner
) {
  let fiber;
  let fiberTag = FUNCTION_COMPONENT;;
  const resolvedType = type;
  if (typeof type === 'function') {
    const prototype = type.prototype;
    if (prototype && prototype.isReactComponent) {
      fiberTag = CLASS_COMPONENT;
    } 
  } else if (typeof type === 'string') {
    fiberTag = HOST_COMPONENT;
  }

  fiber = createFiber(fiberTag, pendingProps, key);
  fiber.elementType = type;
  fiber.type = resolvedType;

  return fiber;
}

export function createRootFiber (container) {
  const uninitializedFiber = createFiberNode(HOST_ROOT, null, null);

  const root = {
    containerInfo: container,
    workInProgress: uninitializedFiber
  }

  uninitializedFiber.stateNode = root;

  return root;
}

export function createWorkInProgress () {

}

