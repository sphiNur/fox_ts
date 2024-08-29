import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const userId = ref<number | null>(null)

  function setUserId(id: number | null) {
    userId.value = id
  }

  return { userId, setUserId }
})