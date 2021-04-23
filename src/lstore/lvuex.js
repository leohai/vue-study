let Vue;
class Store {
  constructor(options) {
    this._mutations = options.mutations;
    this._actions = options.actions;
    this._wrapperGetters = options.getters;
    let computed = {};
    this.getters = {};
    const store = this;
    for (const key in this._wrapperGetters) {
      computed[key] = function () {
        return store._wrapperGetters[key](store.state);
      };
      Object.defineProperty(store.getters, key, {
        get: () => {
          return store._vm[key];
        },
      });
    }
    this._vm = new Vue({
      data: {
        $$state: options.state,
      },
      computed,
    });
    this.commit = this.commit.bind(this);
    this.dispatch = this.dispatch.bind(this);
  }
  get state() {
    return this._vm._data.$$state;
  }
  set state(v) {
    console.error("你造吗？你这样不好！");
  }
  commit(type, payload) {
    const entry = this._mutations[type];
    if (entry) {
      entry(this.state, payload);
    }
  }
  dispatch(type, payload) {
    const entry = this._actions[type];
    if (entry) {
      entry(this, payload);
    }
  }
}

function install(_vue) {
  Vue = _vue;
  Vue.mixin({
    beforeCreate() {
      const store = this.$options.store;
      if (store) {
        Vue.prototype.$store = store;
      }
    },
  });
}
export default { Store, install };
