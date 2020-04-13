import ReactElement from './ReactElement';
import { isFunction, isUndefined, isArray } from '../shared/is';
import { resolveDefaultProps, keys } from '../shared';

export default function createElement (
  type, 
  properties, 
  ...children
) {
  const { length } = children;
  const { key, ref, ...props } = properties || {};

  if (length > 0) {
    if (length === 1) {
      props.children = children[0];

      if (isArray(props.children)) {
        if (props.children.length === 1) {
          props.children = props.children[0];
        }
      }
    } else {
      props.children = children;
    }
  } 

  return ReactElement(
    type, 
    { ...props },
    key,
    ref
  );
}