const originalProto = Array.prototype;
const arrayProto = Object.create(originalProto);
["push", "pop", "shift", "unshift"].forEach((method) => {
  arrayProto[method] = function () {
    originalProto[method].apply(this, arguments);
    console.log("调用了" + method);
  };
});
class LVue {
  constructor(options) {
    this.$options = options;
    this.$data = options.data;
    // 1.对data做响应式处理
    observe(this.$data);
    // 1.5 代理
    proxy(this);
    // 2.编译模板
    new Compile(options.el, this);
  }
}
// 数据响应式
function defineReactive(obj, key, val) {
  observe(val);
  const dep = new Dep();
  Object.defineProperty(obj, key, {
    get() {
      Dep.target && dep.addDep(Dep.target);
      return val;
    },
    set(newVal) {
      if (newVal != val) {
        val = newVal;
        dep.notify();
      }
    },
  });
}
function observe(obj) {
  if (typeof obj !== "object" || obj == null) {
    return;
  }
  if (Array.isArray(obj)) {
    // 覆盖原型
    obj.__proto__ = arrayProto;
    for (let i = 0; i < obj.length; i++) {
      observe(obj[i]);
    }
  }
  new Observe(obj);
}
class Observe {
  constructor(obj) {
    if (Array.isArray(obj)) {
      // todo
    } else {
      this.walk(obj);
    }
  }
  walk(obj) {
    for (const key in obj) {
      defineReactive(obj, key, obj[key]);
    }
  }
}
class Compile {
  constructor(el, vm) {
    this.$vm = vm;
    this.$el = document.querySelector(el);
    // 遍历宿主元素
    if (this.$el) {
      this.compile(this.$el);
    }
  }
  compile(el) {
    el.childNodes.forEach((node) => {
      if (this.isElm(node)) {
        // console.log("编译元素", node.nodeName);
        this.compileElement(node);
      } else if (this.isInter(node)) {
        // console.log('编译插值文本', node.textContent);
        this.compileText(node);
      }
      // 递归
      if (node.childNodes.length > 0) {
        this.compile(node);
      }
    });
  }
  isElm(node) {
    return node.nodeType === 1;
  }
  isInter(node) {
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent);
  }
  isDir(attrName) {
    return attrName.startsWith("l-");
  }
  isEvent(attrName) {
    return attrName.startsWith("@");
  }
  compileElement(node) {
    const attrs = node.attributes;
    Array.from(attrs).forEach((attr) => {
      const attrName = attr.name; // l-text
      const exp = attr.value;
      if (this.isDir(attrName)) {
        const dir = attrName.substr(2);
        this[dir] && this[dir](node, exp);
        //@事件处理
      } else if (this.isEvent(attrName)) {
        const dir = attrName.substr(1);
        this.eventHandler(node, exp, dir);
      }
    });
  }
  compileText(node) {
    this.text(node, RegExp.$1);
  }
  update(node, exp, dir) {
    let fn = this[dir + "Updater"];
    fn && fn(node, this.$vm[exp]);
    new Watch(this.$vm, exp, (val) => {
      fn && fn(node, val);
    });
  }
  eventHandler(node, exp, dir) {
    const fn = this.$vm.$options.methods && this.$vm.$options.methods[exp];
    node.addEventListener(dir, fn.bind(this.$vm));
  }
  modelUpdater(node, val) {
    node.value = val;
  }
  textUpdater(node, val) {
    node.textContent = val;
  }
  htmlUpdater(node, val) {
    node.innerHTML = val;
  }
  model(node, exp) {
    this.update(node, exp, "model");
    node.addEventListener("input", (e) => {
      this.$vm[exp] = e.target.value;
    });
  }
  // k-html
  html(node, exp) {
    this.update(node, exp, "html");
  }
  text(node, exp) {
    this.update(node, exp, "text");
  }
}
// 更新执行者Watcher
class Watch {
  constructor(vm, key, updater) {
    this.vm = vm;
    this.key = key;
    this.updater = updater;
    // 保存Watcher引用
    Dep.target = this;
    this.vm[this.key];
    Dep.target = null;
  }
  update() {
    this.updater.call(this.vm, this.vm[this.key]);
  }
}
class Dep {
  constructor() {
    this.dep = [];
  }
  // 订阅
  addDep(watch) {
    this.dep.push(watch);
  }
  // 发布
  notify() {
    this.dep.forEach((w) => w.update());
  }
}
function proxy(vm) {
  for (const key in vm.$data) {
    Object.defineProperty(vm, key, {
      get() {
        return vm.$data[key];
      },
      set(v) {
        vm.$data[key] = v;
      },
    });
  }
}
