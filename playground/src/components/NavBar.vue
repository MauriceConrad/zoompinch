<template>
  <div class="nav-bar">
    <div class="title">
      <h1>Zoompinch</h1>
    </div>
    <div class="actions">
      <a href="https://github.com/MauriceConrad/zoompinch" target="_blank">
        <n-icon size="medium">
          <logo-github />
        </n-icon>
        <span> GitHub </span>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LogoGithub } from '@vicons/ionicons5';
import { NIcon } from 'naive-ui';
</script>

<style scoped lang="scss">
.nav-bar {
  border-bottom: 1px solid #ddd;
  padding: 10px 20px;
  display: grid;
  color: #444;
  grid-template-columns: auto auto;
  .title {
    justify-self: center start;
    place-self: center start;
    h1 {
      margin: 0;
      font-size: 1.6em;
    }
  }
  .actions {
    justify-self: center end;
    place-self: center end;
    a {
      text-decoration: inherit;
      color: inherit;
      display: flex;
      place-items: center;
      gap: 5px;
    }
  }
}
</style>
