import document from './document';

export default typeof window === 'undefined' ?
  document : window.document;