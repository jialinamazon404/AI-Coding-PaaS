import { defineStore } from 'pinia';
import { calculatorApi } from '../api';

export const useCalculatorStore = defineStore('calculator', {
  state: () => ({
    display: '0',
    history: [],
    loading: false,
    error: null
  }),

  actions: {
    appendToDisplay(value) {
      if (this.display === '0') {
        this.display = value;
      } else {
        this.display += value;
      }
    },

    clearDisplay() {
      this.display = '0';
    },

    backspace() {
      if (this.display.length === 1 || this.display === '0') {
        this.display = '0';
      } else {
        this.display = this.display.slice(0, -1);
      }
    },

    async calculate() {
      if (!this.display || this.display === '0') return;
      
      this.loading = true;
      this.error = null;
      try {
        const { data } = await calculatorApi.calculate(this.display);
        if (data.success) {
          this.display = String(data.result);
          await this.fetchHistory();
        }
      } catch (error) {
        this.error = error.response?.data?.message || '计算错误';
        this.display = 'Error';
      } finally {
        this.loading = false;
      }
    },

    async fetchHistory() {
      try {
        const { data } = await calculatorApi.getHistory();
        if (data.success) {
          this.history = data.history;
        }
      } catch (error) {
        console.error('获取历史失败:', error);
      }
    },

    async clearHistory() {
      try {
        await calculatorApi.clearHistory();
        this.history = [];
      } catch (error) {
        console.error('清空历史失败:', error);
      }
    }
  }
});