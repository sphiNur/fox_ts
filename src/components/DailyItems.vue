<script setup lang="ts">
import { computed } from "vue";

// Define the props interface
interface Props {
  name: string;
  modelValue: number | string | any[];
  type?: string;
  onEditClick?: () => void;
}

// Set default props
const props = withDefaults(defineProps<Props>(), {
  type: 'number'
});

// Define emits
const emit = defineEmits(['update:modelValue']);

// Computed property for two-way binding
const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// Handle input changes
function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  if (props.type === 'number') {
    emit('update:modelValue', Number(target.value));
  } else {
    emit('update:modelValue', target.value);
  }
}
</script>

<template>
  <label class="input input-bordered flex items-center gap-2">
    {{ props.name }}
    <input v-if="type !== 'array'" :type="type" class="grow" :value="inputValue" @input="handleInput"
      :disabled="type === 'array'" />
    <div v-else class="grow">
      {{ (modelValue as any[]).length }} items
    </div>
    <button v-if="type === 'array'" class="btn btn-outline btn-primary btn-sm" @click="onEditClick">
      Edit
    </button>
  </label>
</template>

<style scoped>
label {
  margin-bottom: 0.5rem;
}
</style>