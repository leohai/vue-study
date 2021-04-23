export default {
  render(h) {
    let { matched } = this.$router;
    this.$vnode.data.routerView = true;
    let depth = 0;
    let parent = this.$parent;
    while (parent) {
      const vnodeData = parent.$vnode && parent.$vnode.data;
      if (vnodeData) {
        if (vnodeData.routerView) {
          depth++;
        }
      }
      parent = parent.$parent;
    }
    return h(matched[depth] ? matched[depth].component : null);
  },
};
