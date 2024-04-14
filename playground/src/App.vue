<template>
  <div class="root">
    <!-- <nav-bar /> -->
    <playground />
  </div>
</template>

<script setup lang="ts">
import NavBar from './components/NavBar.vue';
import Playground from './components/Playground.vue';
</script>

<style scoped lang="scss">
.root {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 0px;
  display: grid;
  grid-template-rows: auto 1fr;
}
</style>

<style lang="scss">
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
#app {
  width: 100%;
  height: 100%;
}
</style>
