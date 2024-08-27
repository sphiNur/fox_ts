<script setup lang="ts">
import { watch } from 'vue';

// Define props for the component
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  }
});

// Define emits for the component
const emit = defineEmits(['close']);

// Watch for changes in the visible prop
watch(() => props.visible, (newValue) => {
  if (newValue) {
    // Show the modal when visible is true
    (document.getElementById('my_modal_3') as HTMLDialogElement).showModal();
  } else {
    // Close the modal when visible is false
    (document.getElementById('my_modal_3') as HTMLDialogElement).close();
  }
});

// Function to close the modal
function closeModal() {
  emit('close');
}
</script>

<template>
  <dialog id="my_modal_3" class="modal modal-bottom">
    <div class="modal-box p-4">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="closeModal">✕</button>
      </form>
      <h2 class="text-lg font-bold pb-8">{{ props.title }}</h2>
      <p class="py-4" v-if="props.content">{{ props.content }}</p>
      <slot></slot>
    </div>
  </dialog>
</template>