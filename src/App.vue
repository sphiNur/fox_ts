<script setup lang="ts">
import HeaderTab from "@/components/HeaderTab.vue";
import Daily from "@/components/Daily.vue";
import Summary from "@/components/icons/Summary.vue";
import {computed, ref} from "vue";

const currentTab = ref(0); // Reactive state for the current tab index
const tabList = ['Daily', 'Summary']; // List of tabs

const TabComponent = computed(() => {
  switch (currentTab.value) {
    case 0:
      return Daily;
    case 1:
      return Summary;
    default:
      return Daily;
  }
});
</script>

<template>
  <header>
    <HeaderTab v-model:model-view="currentTab" :tabs="tabList"/>
  </header>

  <main>
    <component :is="TabComponent"/>
  </main>
</template>

<style scoped>

</style>
