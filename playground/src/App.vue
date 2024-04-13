<template>
  <div class="root">
    <playground />
  </div>
</template>

<script setup lang="ts">
import Playground from './components/Playground.vue';
</script>

<style scoped lang="scss">
.root {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 20px;
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
