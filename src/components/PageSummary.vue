<script setup lang="ts">
// Import necessary Vue and custom components
import { ref, onMounted, computed } from 'vue';
import ActionModal from "@/components/ActionModal.vue";
import { useUserStore } from "@/PiniaStore";
import type { SummaryItem } from '@/DataTypes';
import EditModal from '@/components/EditModal.vue';

const level = ref<number>(0);

/**
 * get user level
 */
async function fetchEmployeeLevel() {
  try {
    const response = await fetch('https://grammybot.sphinxr.workers.dev/api/get/select/employee', {
      headers: {
        'X-Operator-ID': `${userStore.userId?.valueOf() ?? 0}`
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const resJson = await response.json();
    level.value = resJson.level;
  } catch (error) {
    console.error('Failed to fetch employee level:', error);
    showModal(false, 'Error', `Failed to fetch employee level: ${error}`);
  }
}

// Reactive variables for loading state and data
const isLoading = ref(true);
const summaryData = ref<SummaryItem[]>([]);

// Modal related reactive variables
const modalVisible = ref(false);
const modalTitle = ref('');
const modalContent = ref('');
const isModalLoading = ref(false);

// Get user store from Pinia
const userStore = useUserStore();

// Computed properties for confirmed and unconfirmed data
const confirmed_data = computed(() =>
  summaryData.value.filter(item => item.is_confirmed === 1 && item.is_deleted === 0)
);

const unconfirmed_data = computed(() =>
  summaryData.value.filter(item => item.is_confirmed === 0 && item.is_deleted === 0)
);

/**
 * Show modal with given parameters
 * @param loading - Boolean indicating if modal is in loading state
 * @param title - Title of the modal
 * @param content - Content to be displayed in the modal
 */
function showModal(loading: boolean, title: string, content: string) {
  isModalLoading.value = loading;
  modalTitle.value = title;
  modalContent.value = content;
  modalVisible.value = true;
}

/**
 * Close the modal
 */
function closeModal() {
  modalVisible.value = false;
}

/**
 * Fetch summary data from the API
 */
async function fetchSummaryData() {
  isLoading.value = true;
  try {
    const response = await fetch('https://grammybot.sphinxr.workers.dev/api/get/select/daily', {
      headers: {
        'X-Operator-ID': `${userStore.userId?.valueOf() ?? 0}`
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const resJson = await response.json();
    console.log(resJson);
    summaryData.value = resJson.data;
  } catch (error) {
    console.error('Failed to fetch data:', error);
    showModal(false, 'Error', `Failed to fetch data: ${error}`);
  } finally {
    isLoading.value = false;
  }
}

/**
 * Confirm an item
 * @param item - The item to be confirmed
 */
async function onConfirm(item: SummaryItem) {
  showModal(true, 'Processing', 'Please wait...');

  try {
    const response = await fetch('https://grammybot.sphinxr.workers.dev/api/put/confirm/daily', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Operator-ID': `${userStore.userId?.valueOf() ?? 0}`
      },
      body: JSON.stringify({
        id: item.id,
        confirmed_operator: Number(userStore.userId),
        insert_date: item.insert_date
      })
    });
    const jsonData = await response.json();

    if (jsonData.status === 'success') {
      console.log(1)
      item.is_confirmed = 1;
      showModal(false, 'Success', 'Record updated successfully.');
      await fetchSummaryData(); // Refresh data to update view
    } else {
      console.log(2)
      console.log(jsonData);
      showModal(false, 'Failure', jsonData.message || 'An unknown error occurred.');
    }
  } catch (error) {
    console.log(3)
    showModal(false, 'Error', `Error confirming item: ${error}`);
  }
}

/**
 * Remove an item
 * @param item - The item to be removed
 */
async function onRemove(item: SummaryItem) {
  showModal(true, 'Processing', 'Please wait...');

  try {
    const response = await fetch('https://grammybot.sphinxr.workers.dev/api/delete/remove/daily', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Operator-ID': `${userStore.userId?.valueOf() ?? 0}`
      },
      body: JSON.stringify({
        id: item.id,
        deleted_operator: Number(userStore.userId),
        insert_date: item.insert_date
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const jsonData = await response.json();

    if (jsonData.status === 'success') {
      showModal(false, 'Success', 'Record deleted successfully.');
      await fetchSummaryData(); // Refresh data to update view
    } else {
      console.log(jsonData);
      showModal(false, 'Failure', jsonData.message || 'An unknown error occurred.');
    }
  } catch (error) {
    showModal(false, 'Error', `Error deleting item: ${error}`);
  }
}

// Computed properties for calculating totals
const totalPayment = computed(() =>
  (item: SummaryItem) => item.payment.reduce((sum, p) => sum + p.price, 0)
);

const totalSalary = computed(() =>
  (item: SummaryItem) => item.salary.reduce((sum, s) => sum + s.salary, 0)
);

/**
 * Format number with specified decimal places
 * @param num - Number to format
 * @param decimals - Number of decimal places (default: 3)
 * @returns Formatted number string
 */
const formatNumber = (num: number, decimals = 3): string => {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Show details of an item in the modal
 * @param item - The item to show details for
 */
function showItemDetails(item: SummaryItem) {
  modalTitle.value = `Details - ${item.insert_date}`;
  modalContent.value = JSON.stringify({
    date: item.insert_date,
    bank: item.bank,
    market: item.market,
    bank_cash: item.bank_cash,
    cash: item.cash,
    payment: item.payment.map(p => `${p.name}: ${p.price}`),
    salary: item.salary.map(s => `${s.employee}: ${s.salary}`)
  }, null, 2);
  modalVisible.value = true;
}

// Reactive variables for edit modal
const editModalVisible = ref(false);
const currentEditItem = ref<SummaryItem | null>(null);

/**
 * Open edit modal for an item
 * @param item - The item to be edited
 */
function onEdit(item: SummaryItem) {
  currentEditItem.value = { ...item }; // Create a copy to avoid modifying original data
  editModalVisible.value = true;
}

/**
 * Handle submission of edited item
 * @param editedItem - The edited item to be submitted
 */
async function handleEditSubmit(editedItem: SummaryItem) {
  try {
    // Send update request to backend
    const response = await fetch('https://grammybot.sphinxr.workers.dev/api/put/edit/daily', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Operator-ID': `${userStore.userId?.valueOf() ?? 0}`
      },
      body: JSON.stringify({
        date: editedItem.insert_date,
        bank: editedItem.bank,
        payment: editedItem.payment,
        salary: editedItem.salary,
        market: editedItem.market,
        bank_cash: editedItem.bank_cash,
        cash: editedItem.cash,
        id: editedItem.id
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const jsonData = await response.json();

    if (jsonData.status === 'success') {
      showModal(false, 'Success', 'Record updated successfully.');
      await fetchSummaryData(); // Refresh data to update view
    } else {
      showModal(false, 'Failure', jsonData.message || 'An unknown error occurred.');
    }
  } catch (error) {
    showModal(false, 'Error', `Error updating item: ${error}`);
  } finally {
    editModalVisible.value = false;
    currentEditItem.value = null;
  }
}

// Fetch data on component mount
onMounted(() => {
  fetchEmployeeLevel();
  fetchSummaryData();
});

const canViewConfirmedData = computed(() => level.value >= 9);
const canViewUnconfirmedData = computed(() => level.value >= 2);
const canEditData = computed(() => level.value >= 2);
const canConfirmData = computed(() => level.value >= 3);
const canDeleteData = computed(() => level.value >= 3);
</script>

<template>
  <div>
    <div v-if="isLoading" class="flex justify-center items-center">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
    <div v-else>
      <h3 class="text-xl font-semibold mb-2">Confirmed Data</h3>
      <div v-if="canViewConfirmedData" class="max-h-80 overflow-x-auto mb-8">
        <table class="table table-zebra table-xs table-pin-rows table-pin-cols">
          <thead>
            <tr>
              <th>Date</th>
              <th>Total</th>
              <th>Total Cash</th>
              <td>Bank</td>
              <td>Payment</td>
              <td>Salary</td>
              <td>Market</td>
              <td>Bank Cash</td>
              <td>Cash</td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in confirmed_data" :key="item.id">
              <th @click="showItemDetails(item)">
                {{ item.insert_date }}
              </th>
              <td>
                {{
                  formatNumber(item.bank + totalPayment(item) + totalSalary(item) + item.market + item.bank_cash +
                    item.cash)
                }}
              </td>
              <td>
                {{ formatNumber(totalPayment(item) + totalSalary(item) + item.market + item.bank_cash + item.cash) }}
              </td>
              <td>{{ formatNumber(item.bank) }}</td>
              <td>{{ formatNumber(totalPayment(item)) }}</td>
              <td>{{ formatNumber(totalSalary(item)) }}</td>
              <td>{{ formatNumber(item.market) }}</td>
              <td>{{ formatNumber(item.bank_cash) }}</td>
              <td>{{ formatNumber(item.cash) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 class="text-xl font-semibold mb-2">Unconfirmed Data</h3>
      <div v-if="canViewUnconfirmedData" class="max-h-40 overflow-x-auto">
        <table class="table table-zebra table-xs table-pin-rows table-pin-cols">
          <thead>
            <tr>
              <th>Date</th>
              <td>Bank</td>
              <td>Payment</td>
              <td>Salary</td>
              <td>Market</td>
              <td>Bank Cash</td>
              <td>Cash</td>
              <td>Action</td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in unconfirmed_data" :key="item.id">
              <th @click="showItemDetails(item)">
                {{ item.insert_date }}
              </th>
              <td>{{ item.bank }}</td>
              <td>{{ totalPayment(item) }}</td>
              <td>{{ totalSalary(item) }}</td>
              <td>{{ item.market }}</td>
              <td>{{ item.bank_cash }}</td>
              <td>{{ item.cash }}</td>
              <td class="flex space-x-4">
                <button v-if="canConfirmData" class="btn btn-outline btn-success btn-xs" @click="onConfirm(item)">
                  OK
                </button>
                <button v-if="canEditData" class="btn btn-outline btn-warning btn-xs" @click="onEdit(item)">
                  Edit
                </button>
                <button v-if="canDeleteData" class="btn btn-outline btn-error btn-xs" @click="onRemove(item)">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ActionModal :visible="modalVisible" :title="modalTitle" @close="closeModal">
      <div v-if="isModalLoading" class="flex justify-center items-center">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
      <div v-else class="item-details">{{ modalContent }}</div>
    </ActionModal>

    <EditModal :visible="editModalVisible" :item="currentEditItem" @close="editModalVisible = false"
      @submit="handleEditSubmit" />
  </div>
</template>

<style scoped>
.item-details {
  white-space: pre-wrap;
  word-break: break-word;
  font-family: monospace;
  font-size: 0.9em;
  line-height: 1.5;
  max-height: 80vh;
}
</style>