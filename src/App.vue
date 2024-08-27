<script setup lang="ts">
import HeaderTab from "@/components/HeaderTab.vue";
import PageDaily from "@/components/PageDaily.vue";
import PageSummary from "@/components/PageSummary.vue";
import { computed, onMounted, ref } from "vue";

const currentTab = ref(0);
const tabList = ['Daily', 'Summary'];

const TabComponent = computed(() => {
  switch (currentTab.value) {
    case 0:
      return PageDaily;
    case 1:
      return PageSummary;
    default:
      return PageDaily;
  }
});

// 添加这个方法来切换到 Summary 页面
function switchToSummary() {
  currentTab.value = 1;
}

const userId = ref<number | null>(null);

onMounted(() => {
  const tg = window.Telegram.WebApp;

  // 初始化 Telegram WebApp
  tg.ready();

  // 获取用户 ID
  if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
    userId.value = tg.initDataUnsafe.user.id;
    console.log('Telegram 用户 ID:', userId.value);
  } else {
    userId.value = 0;
    console.log('无法获取 Telegram 用户 ID');
  }
});
</script>

<template>
  <header>
    <HeaderTab v-model:modelView="currentTab" :tabs="tabList" />
  </header>
  <div class="divider"></div>
  <main>
    <component :is="TabComponent" @switch-to-summary="switchToSummary" />
  </main>

  <div class="divider">{{ userId }}</div>
</template>