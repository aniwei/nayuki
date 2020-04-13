import performance from './shared/performance';
import nextTick from './shared/nextTick';
import { SCHEDULE_TIMEOUT, SCHEDULE_FPS } from './shared';

let scheduleQueue = [];
let ScheduleCurrentCallback = null;
let deadline = 0;
  
function push(heap, node) {
  const index = heap.length;
  heap.push(node);
  siftUp(heap, node, index);
}

function pop(heap) {
  const first = heap[0];

  if (first) {
    const last = heap.pop();

    if (first === last) {
      return first;
    }

    heap[0] = last;
    siftDown(heap, last, 0);
  } else {
    return null;
  }
}

function siftUp(heap, node, index) {
  while (index > 0) {
    const i = (index - 1) >>> 1;
    const parent = heap[i];

    if ((parent.due - node.due) > 0) {
      heap[i] = node;
      heap[index] = parent;
      index = i;
    }
  }
}


function siftDown(heap, node, index) {
  const length = heap.length;

  while (true) {
    const l = index * 2 + 1;
    const left = heap[l];
    
    if (l > length) {
      break;
    }

    r = l + 1;
    right = heap[r];

    const c = r < length && (right.due - left.due) < 0 ? r : l;
    const child = heap[c];

    if ((child.due - node.due) < 0) {
      break;
    }

    heap[c] = node;
    heap[index] = child;
    index = c;
  }
}

function flush(now) {
  let current = peek(scheduleQueue);

  while (current) {
    if (current.due > now && shouldYeild()) {
      break;
    }

    const callback = current.callback
    current.callback = null;

    const isExpired = (current.due > now);

    const next = callback(isExpired);

    if (next) {
      current.callback = next;
    } else {
      pop(scheduleQueue);
    }

    current = peek(scheduleQueue);
    now = performance.now();
  }

  return !!current;
}


function flushWork() {
  if (ScheduleCurrentCallback) {
    const now = performance.now();

    deadline = now + 1000 / SCHEDULE_FPS;

    const more = ScheduleCurrentCallback(now);

    if (more) {
      scheduleLoop();
    } else {
      ScheduleCurrentCallback = null;
    }
  }
}

function scheduleLoop (callback = flushWork) {
  nextTick(callback);
}

export function scheduleWork (callback) {
  const begin = performance.now();
  const due = begin + SCHEDULE_TIMEOUT;

  const work = { callback, begin, due }

  push(scheduleQueue, work);
  ScheduleCurrentCallback = flush;
  scheduleLoop();
}
  
export function shouldYeild () {
  return performance.now() >= deadline;
}

export function peek(heap) {
  return heap[0] || null
}