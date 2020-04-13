import {   
  noop,
  EMPTY_OBJECT 
} from '../shared';

export default class Component {
  constructor (props, context, updater) {
    this.props = props || {};
    this.context = context || EMPTY_OBJECT;
    this.refs = {};
    this.updater = updater;

    this.state = this.state || {};
  }
  
  setState (state, callback = noop) {
    this.updater.enqueueSetState(this, state, callback);
  }

  forceUpdate (callback) {
    this.updater.enqueueForceUpdate(this, callback)
  }

  render () {
    throw new Error(`React Component render must be implatate`);
  }
}


Component.prototype.isReactComponent = EMPTY_OBJECT;