<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useWindowSize } from '@vueuse/core';

const { height } = useWindowSize();
const keyboardHeight = ref(0);

function handleResize() {
    const newHeight = window.innerHeight;
    if (newHeight < height.value) {
        keyboardHeight.value = height.value - newHeight;
    } else {
        keyboardHeight.value = 0;
    }
}

onMounted(() => {
    window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
});
</script>

<template>
    <div class="keyboard-aware-view" :style="{ paddingBottom: `${keyboardHeight}px` }">
        <slot></slot>
    </div>
</template>

<style scoped>
.keyboard-aware-view {
    min-height: 100%;
    display: flex;
    flex-direction: column;
}
</style>