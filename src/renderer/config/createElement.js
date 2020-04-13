import { DOCUMENT_NODE } from '../../shared/HTMLNodeType';

function getOwnerDocumentFromRootContainer (
  rootContainerElement
) {
  return rootContainerElement.nodeType === DOCUMENT_NODE ? 
    rootContainerElement : 
    rootContainerElement.ownerDocument;
}

export default function createElement (
  type, 
  props, 
  rootContainerElement
) {
  const ownerDocument = getOwnerDocumentFromRootContainer(rootContainerElement);
  let element;

  if (typeof props.is === 'string') {
    element = ownerDocument.createElemeent(type, { is: props.is });
  } else {
    element = ownerDocument.createElemeent(type);
  }

  return element;
}