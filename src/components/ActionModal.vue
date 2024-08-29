<script setup lang="ts">
import { watch } from 'vue';

// Define props for the component
// visible: Controls the visibility of the modal
// title: The title text to be displayed in the modal header
// content: The main content text of the modal
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
// 'close' event is emitted when the modal is closed
const emit = defineEmits(['close']);

// Watch for changes in the visible prop
// This watcher controls the opening and closing of the modal
watch(() => props.visible, (newValue) => {
  if (newValue) {
    // Show the modal when visible is true
    // Uses the native showModal() method of the HTMLDialogElement
    (document.getElementById('my_modal_3') as HTMLDialogElement).showModal();
  } else {
    // Close the modal when visible is false
    // Uses the native close() method of the HTMLDialogElement
    (document.getElementById('my_modal_3') as HTMLDialogElement).close();
  }
});

// Function to close the modal
// This function emits the 'close' event to notify the parent component
function closeModal() {
  emit('close');
}
</script>

<template>
  <!-- Modal dialog with bottom positioning -->
  <dialog id="my_modal_3" class="modal modal-bottom">
    <!-- Modal content container -->
    <div class="modal-box p-4 max-h-80">
      <!-- Form for handling modal close action -->
      <form method="dialog">
        <!-- Close button in the top-right corner -->
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="closeModal">✕</button>
      </form>
      <!-- Modal title -->
      <h2 class="text-lg font-bold pb-8">{{ props.title }}</h2>
      <!-- Modal content, only shown if content prop is provided -->
      <p class="py-4" v-if="props.content">{{ props.content }}</p>
      <!-- Slot for additional custom content -->
      <slot></slot>
    </div>
  </dialog>
</template>