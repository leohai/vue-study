import Link from "./lrouter-link";
import View from "./lrouter-view";
let Vue;

class lvueRouter {
  constructor(options) {
    this.$option = options;
    window.addEventListener("hashchange", this.onHashChange.bind(this));
    this.current = window.location.hash.slice(1) || "/";
    Vue.util.defineReactive(this, "matched", []);
    this.match();
    // this.routerMap = {};
    // options.routes.forEach((route) => (this.routerMap[route.path] = route));
  }
  onHashChange() {
    this.matched = [];
    this.current = window.location.hash.slice(1);
    this.match();
  }
  match(routes) {
    routes = routes || this.$option.routes;
    for (const route of routes) {
      if (route.path === "/" && this.current === "/") {
        this.matched.push(route);
        if (route.children) {
          this.match(route.children);
        }
        return;
      } else if (route.path !== "/" && this.current.indexOf(route.path) != -1) {
        this.matched.push(route);
        if (route.children) {
          this.match(route.children);
        }
        return;
      }
    }
  }
}

lvueRouter.install = function (_Vue) {
  Vue = _Vue;
  Vue.mixin({
    beforeCreate: function () {
      const router = this.$options.router;
      if (router) {
        Vue.prototype.$router = router;
      }
    },
  });
  Vue.component("router-link", Link);
  Vue.component("router-view", View);
};
export default lvueRouter;
