<script setup lang="ts">
// Import necessary components and functions
import HeaderTab from "@/components/HeaderTab.vue";
import PageDaily from "@/components/PageDaily.vue";
import PageSummary from "@/components/PageSummary.vue";
import { computed, onMounted, ref } from "vue";
import { useUserStore } from "@/PiniaStore";
import KeyboardAwareView from '@/components/KeyboardAwareView.vue';

// Initialize the current tab index
const currentTab = ref(0);

// Define the list of available tabs
const tabList = ['Daily', 'Summary'];

// Compute the current component to display based on the selected tab
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

// Function to switch to the Summary page
function switchToSummary() {
  currentTab.value = 1;
}

// Initialize the user store
const userStore = useUserStore();

// Execute when the component is mounted
onMounted(() => {
  // Get the Telegram Web App instance
  const tg = window.Telegram.WebApp;

  // Initialize Telegram WebApp
  tg.ready();

  // Get user ID from Telegram
  if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
    // Set the user ID in the store if available
    userStore.setUserId(tg.initDataUnsafe.user.id);
    console.log('Telegram User ID:', userStore.userId);
  } else {
    // Set a default user ID if not available
    userStore.setUserId(0);
    console.log('Unable to get Telegram User ID');
  }
});
</script>

<template>
  <KeyboardAwareView>
    <header>
      <!-- Render the header tab component -->
      <HeaderTab v-model:modelView="currentTab" :tabs="tabList" />
    </header>
    <div class="divider"></div>
    <main>
      <!-- Dynamically render the current tab component -->
      <component :is="TabComponent" @switch-to-summary="switchToSummary" />
    </main>
  </KeyboardAwareView>
</template>