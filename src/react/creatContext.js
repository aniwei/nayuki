import { REACT_CONTEXT_TYPE, REACT_PROVIDER_TYPE, REACT_CONTEXT_TYPE } from '../shared/elementTypes';

export default function createContext (defaultValue) {
  const context = {
    $$typeof: REACT_CONTEXT_TYPE,
    Provider: null,
    Consumer: null,
    currentValue: defaultValue
  };

  context.Provider = {
    $$typeof: REACT_PROVIDER_TYPE,
    _context: context,
  };

  context.Consumer = context;

  return context;
}