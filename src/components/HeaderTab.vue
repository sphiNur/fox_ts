<script setup lang="ts">
import {ref, defineProps, defineEmits, watch} from "vue";

const props = defineProps({
  tabs: {
    type: Array as () => string[],
    required: true
  },
  modelView: {
    type: Number,
    default: 1,
    required: true,
  }
})

const emit = defineEmits(['update:modelView']);

const activeTab = ref(props.modelView)

watch(() => props.modelView, (newVal) => {
  activeTab.value = newVal;
})

function handleTabChange(index: number) {
  activeTab.value = index;
  emit('update:modelView', index);
}
</script>

<template>
<div role="tablist" class="tabs tabs-boxed">
  <a
      v-for="(tab, index) in tabs"
      :key="index"
      role="tab"
      class="tab"
      :class="{ 'tab-active': activeTab === index }"
      @click="handleTabChange(index)"
  >
    {{ tab }}
  </a>
</div>
</template>

<style scoped>

</style>