<script setup lang="ts">
import { computed } from "vue";

/**
 * Interface defining the props for the DailyItems component
 */
interface Props {
  name: string;                   // The label name for the input
  modelValue: number | string | any[]; // The value of the input
  type?: string;                  // The type of the input (default: 'number')
  onEditClick?: () => void;       // Optional callback for edit button click
}

// Set default props using withDefaults
const props = withDefaults(defineProps<Props>(), {
  type: 'number'
});

// Define emits for the component
const emit = defineEmits(['update:modelValue']);

/**
 * Computed property for two-way data binding
 * Gets the current value and emits updates to the parent
 */
const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

/**
 * Handles input changes and emits the updated value
 * @param event - The input event
 */
function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  if (props.type === 'number') {
    emit('update:modelValue', Number(target.value));
  } else {
    emit('update:modelValue', target.value);
  }
}

function handleFocus(event: FocusEvent) {
  const target = event.target as HTMLInputElement;
  setTimeout(() => {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 300);
}

function handleBlur() {
  window.scrollTo(0, 0);
}
</script>

<template>
  <label class="input input-bordered flex items-center gap-2">
    {{ props.name }}
    <input v-if="type !== 'array'" inputmode="decimal" :type="type" class="grow" :value="inputValue"
      @input="handleInput" :disabled="type === 'array'" :focus="handleFocus" :blur="handleBlur" />
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