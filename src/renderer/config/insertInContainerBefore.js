import { COMMENT_NODE } from '../../shared/HTMLNodeType';

export default function insertInContainerBefore (
  container, 
  child, 
  beforeChild,
) {
  if (container.nodeType === COMMENT_NODE) {
    const parent = container.parentNode || container.return;

    parent.insertBefore(child, beforeChild);
  } else {
    container.insertBefore(child, beforeChild);
  }
}