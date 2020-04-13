import { scheduleUpdate } from './scheduler';

const ReactHook = {
  ReactCurrentHookFiber: null,
  ReactCurrentHookCursor: 0,
  ReactCurrentHookContextId: 0,
  get ReactHookContextId () {
    return `@${this.ReactCurrentHookContextId++}`;
  },
  get ReactCurrentHooks () {
    const cursor = ReactHook.ReactCurrentHookCursor++;
    const fiber = ReactHook.ReactCurrentHookFiber;
    let hooks = fiber.memoizedHooks;

    if (!hooks) {
      hooks = fiber.memoizedHooks = createMemoizedHooks();
    }

    if (cursor >= hooks.defaults.length) {
      hooks.defaults.push([]);
    }

    return [hooks.defaults[cursor], fiber];
  }
}

const [
  DEFAULT,
  EFFECT,
  LAYOUT
] = 'DEFAULT EFFECT LAYOUT'.split(' ');

function createMemoizedHooks () {
  let defaultHooks = null;
  let effectHooks = null;
  let layoutHooks = null;

  return {
    get defaults () {
      return defaultHooks || (defaultHooks = new Hooks(DEFAULT));
    },

    get effects () {
      return effectHooks || (effectHooks = new Hooks(EFFECT));
    },

    get layouts () {
      return layoutHooks || (layoutHooks = new Hooks(LAYOUT));
    }
  }
}

class Hooks extends Array {
  constructor (type) {
    super();
    this.type = type;
  }
}

export function resetReactCurrentHookCursor () {
  ReactHook.ReactCurrentHookCursor = 0;
}

export function useMemo (callback, dependens) {
  const [hook] = ReactHook.ReactCurrentHooks;

  if (isChanged(hook[1], deps)) {
    hook[1] = deps
    return (hook[0] = cb())
  }
  return hook[0]
}

export function useCallback (callback, dependens) {
  return useMemo(() => callback, dependoens);
}

export function useEffect (callback, dependons) {
  return 
}

export function useContext(context, selector) {
  const [hooks, fiber] = ReactHook.ReactCurrentHooks;
  const value = fiber.context[context.id];

  const selected = selector ? selector(value) : value;

  if (selected === null) {
    return defaultValue;
  }

  if (hooks[0] !== selected) {
    hooks[0] = selected;
  } 

  return hooks[0];
}

export function createContext(defaultValue) {
  const id = ReactHook.ReactHookContextId;
  const context = {
    id,
    defaultValue,
    Consumer (props, context) {
      if (typeof props.children === 'function') {
        return props.children(context[id])
      } else {
        // 
      }
    },
    Provider (props) {
      const currentFiber = ReactHook.ReactCurrentHookFiber;

      currentFiber.context = currentFiber.context || (currentFiber.context = {});
      currentFiber.context[id] = props.value;
      
      return props.children;
    }
  }

  return context;
}

export function useState (initialState) {
  return useReducer(null, initialState);
}

export function useReducer (reducer, initialState) {
  const [hooks, fiber] = ReactHook.ReactCurrentHooks;

  const setter = function (value) {
    let result;

    if (typeof reducer === 'function') {
      result = reducer(hooks[0], value);
    } else if (typeof value === 'function') {
      result = value(hooks[0]);
    } else {
      result = value;
    }

    if (result !== hooks[0]) {
      hooks[0] = result;
      scheduleUpdate(fiber);
    }
  }

  if (hooks.length) {
    return [
      hooks[0],
      setter
    ]
  }

  return [
    hooks[0] = initialState,
    setter
  ]
}

export default ReactHook;