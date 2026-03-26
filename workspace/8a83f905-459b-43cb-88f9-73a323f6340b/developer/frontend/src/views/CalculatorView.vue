<template>
  <div class="calculator-page">
    <div class="calculator-container">
      <div class="calculator-header">
        <h1>计算器</h1>
        <button @click="handleLogout" class="btn btn-secondary">登出</button>
      </div>
      
      <div class="calculator-main">
        <div class="calculator-card">
          <Display :value="display" :error="error" />
          <Keypad 
            @input="handleInput" 
            @clear="handleClear" 
            @backspace="handleBackspace"
            @calculate="handleCalculate"
          />
        </div>
        
        <div class="history-card">
          <div class="history-header">
            <h2>计算历史</h2>
            <button v-if="history.length > 0" @click="handleClearHistory" class="btn btn-danger btn-sm">清空</button>
          </div>
          <div class="history-list">
            <div v-if="history.length === 0" class="history-empty">暂无历史记录</div>
            <div v-for="item in history" :key="item.id" class="history-item">
              <span class="history-expression">{{ item.expression }}</span>
              <span class="history-result">= {{ item.result }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useCalculatorStore } from '../stores/calculator';
import Display from '../components/calculator/Display.vue';
import Keypad from '../components/calculator/Keypad.vue';

const router = useRouter();
const authStore = useAuthStore();
const calculatorStore = useCalculatorStore();

const display = ref('0');
const history = ref([]);
const error = ref('');

onMounted(async () => {
  await authStore.checkAuth();
  await calculatorStore.fetchHistory();
  history.value = calculatorStore.history;
});

const handleInput = (value) => {
  calculatorStore.appendToDisplay(value);
  display.value = calculatorStore.display;
  error.value = '';
};

const handleClear = () => {
  calculatorStore.clearDisplay();
  display.value = calculatorStore.display;
  error.value = '';
};

const handleBackspace = () => {
  calculatorStore.backspace();
  display.value = calculatorStore.display;
};

const handleCalculate = async () => {
  error.value = '';
  await calculatorStore.calculate();
  display.value = calculatorStore.display;
  if (calculatorStore.error) {
    error.value = calculatorStore.error;
  }
  history.value = calculatorStore.history;
};

const handleClearHistory = async () => {
  await calculatorStore.clearHistory();
  history.value = [];
};

const handleLogout = async () => {
  try {
    await authStore.logout();
  } catch (e) {
    console.error('登出失败', e);
  }
  router.push('/login');
};
</script>

<style scoped>
.calculator-page {
  min-height: 100vh;
  padding: 20px;
}

.calculator-container {
  max-width: 900px;
  margin: 0 auto;
}

.calculator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.calculator-header h1 {
  color: white;
  font-size: 28px;
}

.calculator-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 768px) {
  .calculator-main {
    grid-template-columns: 1fr;
  }
}

.calculator-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.history-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.history-header h2 {
  font-size: 18px;
  color: #333;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 14px;
}

.history-list {
  max-height: 400px;
  overflow-y: auto;
}

.history-empty {
  text-align: center;
  color: #999;
  padding: 40px 0;
}

.history-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.history-expression {
  color: #666;
}

.history-result {
  color: #333;
  font-weight: 600;
}
</style>
