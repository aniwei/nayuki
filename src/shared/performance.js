const now = Date.now();

export default typeof window === 'undefined' ?
  {
    now () {
      return Date.now() - now()
    }
  } : window.performance