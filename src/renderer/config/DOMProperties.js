import { DANGEROUSLY_SET_INNER_HTML, HTML, CHILDREN, STYLE, STYLE_NAME_FLOAT } from '../../shared';

const { freeze } = Object;

export function updateDOMProperties (
  tag,
  element,
  pendingProps,
  memoizedProps,
) {
  memoizedProps = memoizedProps || {};

  for (let propName in { ...memoizedProps, ...pendingProps } ) {
    let prop = memoizedProps[propName];
    let nextProp = pendingProps[propName];

    const isEventProperty = propName[0] === 'o' && propName[1] === 'n';

    if (prop === nextProp) {

    } else if (propName === STYLE) {

      if (nextProp) { 
        freeze(nextProp);
        setValueForStyles(element, nextProp);
      }

    } else if (propName === CHILDREN) {
      const canSetTextContent = tag !== 'textarea' || nextProp !== '';
      const typeofProp = typeof nextProp;

      if (canSetTextContent && prop !== nextProp) {
        if (typeofProp === 'string' || typeofProp === 'number') {
          setTextContent(element, nextProp);
        }
      }
    } else if (isEventProperty) {
      propName = propName.slice(2).toLowerCase();

      if (typeof prop === 'function') {
        element.removeEventListener(propName, prop, false);
      }

      if (typeof nextProp === 'function') {
        element.addEventListener(propName, nextProp, false);
      }

    } else if (nextProp !== null) {
      setValueForProperty(element, propName, nextProp);
    }
  }
}

export function setDOMProperties (
  tag, 
  element, 
  rootContainerElement, 
  nextProps,
) {
  for (let propName in nextProps) {
    if (nextProps.hasOwnProperty(propName)) {
      const nextProp = nextProps[propName];

      if (propName === STYLE) {
        if (nextProp) {
          Object.freeze(nextProp);
        }

        setValueForStyles(element, nextProp);
      } else if (propName === CHILDREN) {
        const canSetTextContent = tag !== 'textarea' || nextProp !== '';
        const typeofProp = typeof nextProp;

        if (canSetTextContent) {
          if (typeofProp === 'string' || typeofProp === 'number') {
            setTextContent(element, nextProp);
          }
        }
      } else if (/^[oO][nN]/.test(propName)) {
        element.addEventListener(propName.replace(/[oO][nN]/, '').toLowerCase(), nextProp, false);
      } else if (nextProp !== null) {
        setValueForProperty(element, propName, nextProp);
      } 
    }
  }
}
  
export function setValueForStyles (
  element,
  styles
) {
  const style = element.style;

  for (let styleName in styles) {
    if (styleName === STYLE_NAME_FLOAT) {
      styleName = 'cssFloat';
    }

    style[styleName] = styles[styleName];
  }
}

export function setTextContent (
  element,
  content
) {
  element.innerText = content;
}

export function setValueForProperty (
  element, 
  propName, 
  value
) {
  if (value === null) {
    element.removeAttribute(propName, value);
  } else {
    element.setAttribute(propName, value);
  }
}

function shouldIgnoreAttribute (name) {
  if (name.length > 2 && name.slice(0, 2).toLowerCase() === 'on') {
    return true;
  }

  return false;
}