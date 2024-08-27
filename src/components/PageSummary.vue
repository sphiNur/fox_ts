<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import ActionModal from "@/components/ActionModal.vue";

interface SummaryItem {
  id: string;
  insert_time: string;
  insert_date: string;
  bank: number;
  payment: number;
  salary: number;
  market: number;
  bank_cash: number;
  cash: number;
  is_confirmed: number;
  is_deleted: number;
}

const isLoading = ref(true);
const summaryData = ref<SummaryItem[]>([]);
const modalVisible = ref(false);
const modalTitle = ref('');
const modalContent = ref('');
const isModalLoading = ref(false);

const confirmed_data = computed(() =>
  summaryData.value.filter(item => item.is_confirmed === 1 && item.is_deleted === 0)
);

const unconfirmed_data = computed(() =>
  summaryData.value.filter(item => item.is_confirmed === 0 && item.is_deleted === 0)
);

function showModal(loading: boolean, title: string, content: string) {
  isModalLoading.value = loading;
  modalTitle.value = title;
  modalContent.value = content;
  modalVisible.value = true;
}

function closeModal() {
  modalVisible.value = false;
}

async function fetchSummaryData() {
  isLoading.value = true;
  try {
    const response = await fetch('https://grammybot.sphinxr.workers.dev/api/get/demo');
    if (!response.ok) {
      throw new Error(`HTTP 错误！状态: ${response.status}`);
    }
    const data = await response.json();
    summaryData.value = data;
  } catch (error) {
    console.error('获取数据失败:', error);
    showModal(false, '错误', `获取数据失败: ${error}`);
  } finally {
    isLoading.value = false;
  }
}

async function onConfirm(item: SummaryItem) {
  showModal(true, '处理中', '请稍候...');

  try {
    const response = await fetch(`https://grammybot.sphinxr.workers.dev/api/post/updateConfirm/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    const jsonData = await response.json();

    if (jsonData.message.success) {
      item.is_confirmed = 1;
      showModal(false, '成功', '成功更新记录。');
      await fetchSummaryData(); // 重新获取数据以更新视图
    } else {
      showModal(false, '失败', jsonData.message || '发生未知错误。');
    }
  } catch (error) {
    showModal(false, '错误', `确认项目时出错: ${error}`);
  }
}

async function onRemove(item: SummaryItem) {
  showModal(true, '处理中', '请稍候...');

  try {
    const response = await fetch(`https://grammybot.sphinxr.workers.dev/api/post/deleteById/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    const jsonData = await response.json();

    if (jsonData.message.success) {
      showModal(false, '成功', '成功删除记录。');
      await fetchSummaryData(); // 重新获取数据以更新视图
    } else {
      showModal(false, '失败', jsonData.message || '发生未知错误。');
    }
  } catch (error) {
    showModal(false, '错误', `删除项目时出错: ${error}`);
  }
}

onMounted(() => {
  fetchSummaryData();
});
</script>

<template>
  <div>
    <div v-if="isLoading" class="flex justify-center items-center">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
    <div v-else>
      <h3 class="text-xl font-semibold mb-2">已确认数据</h3>
      <div class="max-h-80 overflow-x-auto mb-8">
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
              <th>{{ item.insert_date }}</th>
              <td>{{ item.bank + item.payment + item.salary + item.market + item.bank_cash + item.cash }}</td>
              <td>{{ item.payment + item.salary + item.market + item.bank_cash + item.cash }}</td>
              <td>{{ item.bank }}</td>
              <td>{{ item.payment }}</td>
              <td>{{ item.salary }}</td>
              <td>{{ item.market }}</td>
              <td>{{ item.bank_cash }}</td>
              <td>{{ item.cash }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 class="text-xl font-semibold mb-2">未确认数据</h3>
      <div class="max-h-40 overflow-x-auto">
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
              <td>Confirm</td>
              <td>Remove</td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in unconfirmed_data" :key="item.id">
              <th>{{ item.insert_date }}</th>
              <td>{{ item.bank }}</td>
              <td>{{ item.payment }}</td>
              <td>{{ item.salary }}</td>
              <td>{{ item.market }}</td>
              <td>{{ item.bank_cash }}</td>
              <td>{{ item.cash }}</td>
              <td>
                <button class="btn btn-outline btn-warning btn-xs" @click="onConfirm(item)">
                  OK
                </button>
              </td>
              <td>
                <button class="btn btn-outline btn-error btn-xs" @click="onRemove(item)">
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
      <div v-else>{{ modalContent }}</div>
    </ActionModal>
  </div>
</template>