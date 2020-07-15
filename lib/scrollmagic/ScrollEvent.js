class ScrollEvent {
  constructor(type, namespace, target, vars) {
    this.vars = vars || {};

    for (let key in this.vars) {
      this[key] = this.vars[key];
    }

    this.type = type;
    this.target = this.currentTarget = target;
    this.namespace = namespace || '';
    this.timeStamp = this.timestamp = Date.now();
  }
}

export default ScrollEvent;
