<script setup lang="ts">
import { ref, watch } from 'vue';
import type { SummaryItem } from '@/DataTypes';
import DailyItems from './DailyItems.vue';

// Define props for the component
const props = defineProps<{
    visible: boolean;
    item: SummaryItem | null;
}>();

// Define emits for the component
const emit = defineEmits(['close', 'submit']);

// Reactive reference for the item being edited
const editedItem = ref<SummaryItem | null>(null);

// Reactive references for new payment and salary inputs
const newPaymentName = ref('');
const newPaymentPrice = ref(0);
const newSalaryEmployee = ref('');
const newSalaryAmount = ref(0);

// Watch for changes in the item prop
watch(() => props.item, (newItem) => {
    if (newItem) {
        // Create a deep copy of the new item
        editedItem.value = JSON.parse(JSON.stringify(newItem));
    }
}, { deep: true });

/**
 * Handle form submission
 */
function handleSubmit() {
    if (editedItem.value) {
        // Validate payment data
        const isPaymentValid = editedItem.value.payment.every(p => p.name.trim() !== '' && p.price !== 0);

        // Validate salary data
        const isSalaryValid = editedItem.value.salary.every(s => s.employee.trim() !== '' && s.salary !== 0);

        if (!isPaymentValid || !isSalaryValid) {
            alert('Please ensure all payment and salary items have names and non-zero amounts');
            return;
        }

        emit('submit', editedItem.value);
    }
}

/**
 * Add a new payment item
 */
function addPayment() {
    if (editedItem.value && newPaymentName.value.trim() !== '' && newPaymentPrice.value !== 0) {
        editedItem.value.payment.push({
            name: newPaymentName.value.trim(),
            price: newPaymentPrice.value
        });
        // Reset input fields
        newPaymentName.value = '';
        newPaymentPrice.value = 0;
    }
}

/**
 * Add a new salary item
 */
function addSalary() {
    if (editedItem.value && newSalaryEmployee.value.trim() !== '' && newSalaryAmount.value !== 0) {
        editedItem.value.salary.push({
            employee: newSalaryEmployee.value.trim(),
            salary: newSalaryAmount.value
        });
        // Reset input fields
        newSalaryEmployee.value = '';
        newSalaryAmount.value = 0;
    }
}

/**
 * Remove a payment item
 * @param index - Index of the payment item to remove
 */
function removePayment(index: number) {
    if (editedItem.value) {
        editedItem.value.payment.splice(index, 1);
    }
}

/**
 * Remove a salary item
 * @param index - Index of the salary item to remove
 */
function removeSalary(index: number) {
    if (editedItem.value) {
        editedItem.value.salary.splice(index, 1);
    }
}
</script>

<template>
    <div v-if="visible" class="modal modal-open">
        <div class="modal-box p-4">
            <h3 class="font-bold text-lg mb-4">Edit Item</h3>
            <form @submit.prevent="handleSubmit" class="space-y-4">
                <div v-if="editedItem">
                    <DailyItems name="Date" v-model="editedItem.insert_date" type="date" />
                    <DailyItems name="Bank" v-model="editedItem.bank" type="number" />
                    <DailyItems name="Market" v-model="editedItem.market" type="number" />
                    <DailyItems name="Bank Cash" v-model="editedItem.bank_cash" type="number" />
                    <DailyItems name="Cash" v-model="editedItem.cash" type="number" />

                    <div class="collapse collapse-arrow bg-base-200 mb-2">
                        <input type="checkbox" />
                        <div class="collapse-title">Payment</div>
                        <div class="collapse-content">
                            <div class="join">
                                <input v-model="newPaymentName" class="input input-bordered join-item w-2/5"
                                    placeholder="Name" />
                                <input v-model.number="newPaymentPrice" type="number" inputmode="decimal"
                                    class="input input-bordered join-item w-2/5" placeholder="Amount"/>
                                <button class="btn btn-neutral join-item w-1/5 p-0" @click="addPayment"
                                    type="button">Add</button>
                            </div>
                            <div class="divider mb-1 mt-1"></div>
                            <div v-for="(payment, index) in editedItem.payment" :key="index" class="join mb-1">
                                <input v-model="payment.name" placeholder="Name"
                                    class="input input-bordered join-item  w-2/5" />
                                <input v-model.number="payment.price" type="number" inputmode="decimal"
                                    placeholder="Amount" class="input input-bordered join-item  w-2/5"/>
                                <button @click="removePayment(index)" type="button"
                                    class="btn btn-error join-item  w-1/5 p-0">Delete
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="collapse collapse-arrow bg-base-200">
                        <input type="checkbox" />
                        <div class="collapse-title">Salary</div>
                        <div class="collapse-content">
                            <div class="join">
                                <input v-model="newSalaryEmployee" class="input input-bordered join-item w-2/5"
                                    placeholder="Employee"/>
                                <input v-model.number="newSalaryAmount" type="number" inputmode="decimal"
                                    class="input input-bordered join-item w-2/5" placeholder="Salary"/>
                                <button class="btn btn-neutral join-item w-1/5 p-0" @click="addSalary"
                                    type="button">Add</button>
                            </div>
                            <div class="divider mb-1 mt-1"></div>
                            <div v-for="(salary, index) in editedItem.salary" :key="index" class="join mb-1">
                                <input v-model="salary.employee" placeholder="Employee"
                                    class="input input-bordered join-item  w-2/5"/>
                                <input v-model.number="salary.salary" type="number" inputmode="decimal"
                                    placeholder="Salary" class="input input-bordered join-item  w-2/5"/>
                                <button @click="removeSalary(index)" type="button"
                                    class="btn btn-error join-item  w-1/5 p-0">Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-action">
                    <button type="submit" class="btn btn-primary">Save</button>
                    <button type="button" @click="$emit('close')" class="btn">Cancel</button>
                </div>
            </form>
        </div>
    </div>
</template>