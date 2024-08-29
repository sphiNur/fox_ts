<script setup lang="ts">
import { ref, computed } from "vue";
import { useDailyData } from "@/DataTypes";
import ActionModal from "@/components/ActionModal.vue";
import DailyItems from "@/components/DailyItems.vue";
import { useUserStore } from "@/PiniaStore";

// Get the user store
const userStore = useUserStore();

// Define emit for parent component communication
const emit = defineEmits(['switch-to-summary']);

// Initialize daily data and modal-related reactive variables
const dailyData = useDailyData(userStore.userId?.valueOf() ?? 0);
const modalVisible = ref(false);
const isLoading = ref(false);
const modalContent = ref('');
const modalTitle = ref('');
const editingField = ref('');

// Initialize new payment and salary objects
const newPayment = ref({ name: '', price: 0 });
const newSalary = ref({ employee: '', salary: 0 });
const errorMessage = ref('');

// Compute form validity
const isFormValid = computed(() => {
  return dailyData.date !== '' &&
    typeof dailyData.bank === 'number' &&
    typeof dailyData.market === 'number' &&
    typeof dailyData.bank_cash === 'number' &&
    typeof dailyData.cash === 'number';
});

// Function to edit a specific field
function editField(field: string) {
  editingField.value = field;
  modalTitle.value = `Edit ${field}`;
  modalVisible.value = true;
  errorMessage.value = '';
}

// Function to add a new item (payment or salary)
function addItem() {
  if (editingField.value === 'payment') {
    if (newPayment.value.name.trim() === '' || newPayment.value.price === 0) {
      errorMessage.value = 'Name cannot be empty, price cannot be 0';
      return;
    }
    dailyData.payment.push({ ...newPayment.value });
    newPayment.value = { name: '', price: 0 };
  } else if (editingField.value === 'salary') {
    if (newSalary.value.employee.trim() === '' || newSalary.value.salary === 0) {
      errorMessage.value = 'Employee name cannot be empty, salary cannot be 0';
      return;
    }
    dailyData.salary.push({ ...newSalary.value });
    newSalary.value = { employee: '', salary: 0 };
  }
  errorMessage.value = '';
}

// Function to remove an item from payment or salary array
function removeItem(index: number) {
  if (editingField.value === 'payment') {
    dailyData.payment.splice(index, 1);
  } else if (editingField.value === 'salary') {
    dailyData.salary.splice(index, 1);
  }
}

// Define an async function to send POST request
async function sendPostRequest() {
  try {
    const response = await fetch('https://grammybot.sphinxr.workers.dev/api/post/insert/daily', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Operator-ID': `${userStore.userId?.valueOf() ?? 0}`,
      },
      body: JSON.stringify(dailyData),
    });

    if (!response.ok) {
      new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Submission successful:', data);

    // Update modal content to show response
    modalTitle.value = 'Submission Successful';

    setTimeout(() => {
      // Close the modal
      modalVisible.value = false;

      // Switch to Summary page
      emit('switch-to-summary');
    }, 1000)
  } catch (error) {
    console.error('Submission failed:', error);

    // Update modal content to show error message
    modalContent.value = `Submission failed: ${error}`;
    modalTitle.value = 'Submission Error';
  } finally {
    isLoading.value = false;
  }
}

// Function to submit the form
function submitForm() {
  if (isFormValid.value) {
    modalContent.value = '';
    editingField.value = 'summary';
    modalTitle.value = 'Submitted Data';
    modalVisible.value = true;
    isLoading.value = true;

    // Call the async function
    sendPostRequest();
  } else {
    const missingFields = [];
    if (dailyData.date === '') missingFields.push('Date');

    modalContent.value = `Please fill in the following required fields: ${missingFields.join(', ')}`;
    modalTitle.value = 'Submission Failed';
    modalVisible.value = true;
  }
}

// Function to close the modal
function closeModal() {
  modalVisible.value = false;
  editingField.value = '';
  errorMessage.value = '';
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
  <div>
    <DailyItems name="Date" v-model="dailyData.date" type="date" />
    <DailyItems name="Bank" v-model="dailyData.bank" />
    <DailyItems name="Market" v-model="dailyData.market" />
    <DailyItems name="Bank Cash" v-model="dailyData.bank_cash" />
    <DailyItems name="Cash" v-model="dailyData.cash" />
    <DailyItems name="Payment" v-model="dailyData.payment" type="array" :onEditClick="() => editField('payment')" />
    <DailyItems name="Salary" v-model="dailyData.salary" type="array" :onEditClick="() => editField('salary')" />

    <button @click="submitForm" class="btn btn-primary mt-4 w-full">Submit</button>

    <ActionModal :visible="modalVisible" :title="modalTitle" @close="closeModal">
      <template v-if="editingField === 'summary'">
        <div v-if="isLoading" class="flex justify-center items-center">
          <span class="loading loading-spinner loading-lg"></span>
        </div>
        <pre class="whitespace-pre-wrap">{{ modalContent }}</pre>
      </template>
      <template v-else-if="editingField === 'payment'">
        <div class="join mb-4">
          <input v-model="newPayment.name" class="input input-bordered join-item w-2/5" placeholder="Name"
            :focus="handleFocus" :blur="handleBlur" />
          <input v-model.number="newPayment.price" type="number" inputmode="decimal"
            class="input input-bordered join-item w-2/5" placeholder="Price" :focus="handleFocus" :blur="handleBlur" />
          <button @click="addItem" class="btn btn-neutral join-item w-1/5">Add</button>
        </div>
        <p v-if="errorMessage" class="text-error mb-2">{{ errorMessage }}</p>
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in dailyData.payment" :key="index">
                <td>{{ item.name }}</td>
                <td>{{ item.price }}</td>
                <td><button @click="() => removeItem(index)" class="btn btn-error btn-sm">Delete</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
      <template v-else-if="editingField === 'salary'">
        <div class="join mb-4">
          <input v-model="newSalary.employee" class="input input-bordered join-item w-2/5" placeholder="Employee"
            :focus="handleFocus" :blur="handleBlur" />
          <input v-model.number="newSalary.salary" type="number" inputmode="decimal"
            class="input input-bordered join-item w-2/5" placeholder="Salary" :focus="handleFocus" :blur="handleBlur" />
          <button @click="addItem" class="btn btn-neutral join-item w-1/5">Add</button>
        </div>
        <p v-if="errorMessage" class="text-error mb-2">{{ errorMessage }}</p>
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Salary</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in dailyData.salary" :key="index">
                <td>{{ item.employee }}</td>
                <td>{{ item.salary }}</td>
                <td><button @click="() => removeItem(index)" class="btn btn-error btn-sm">Delete</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
      <template v-else>
        <p>{{ modalContent }}</p>
      </template>
    </ActionModal>
  </div>
</template>