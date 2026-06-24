class GpComponent extends HTMLElement {
  constructor() {
    super();
    this._store = null;
    this._t = null;
    this._unsubscribe = null;
    this._boundEvents = [];
  }

  static get observedAttributes() {
    return [];
  }

  get store() {
    return this._store;
  }

  set store(s) {
    this._store = s;
  }

  get t() {
    return this._t;
  }

  set t(val) {
    this._t = val;
  }

  connectedCallback() {
    if (!this._connected) {
      this._connected = true;
      this.render();
      this.bindEvents();
    }
  }

  disconnectedCallback() {
    this._connected = false;
    this._boundEvents.forEach(unbind => unbind());
    this._boundEvents = [];
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }
  }

  render() {}

  bindEvents() {}

  updateTranslations(t) {
    this.t = t;
    this.render();
    this.bindEvents();
  }

  subscribeToStore(callback) {
    if (this._unsubscribe) {
      this._unsubscribe();
    }
    this._unsubscribe = this.store?.subscribe(callback);
  }

  delegateEvent(selector, event, handler) {
    this.addEventListener(event, e => {
      const target = e.target.closest(selector);
      if (target && target.getRootNode() === this) {
        handler.call(this, e, target);
      }
    });
  }
}

export { GpComponent };
