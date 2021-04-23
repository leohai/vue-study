<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about/info">About</router-link>
      <div @click="$store.commit('add')">count: {{ $store.state.count }}</div>
      <div @click="$store.dispatch('add')">
        async count: {{ $store.state.count }}
      </div>
      <div>double count: {{ $store.getters.doubleCount }}</div>
    </div>
    <router-view />
  </div>
</template>
<script>
export default {
  created() {},
};
</script>

<style lang="scss"></style>
