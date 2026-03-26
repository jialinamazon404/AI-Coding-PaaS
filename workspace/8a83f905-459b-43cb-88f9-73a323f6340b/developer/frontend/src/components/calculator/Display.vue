<template>
  <div class="display">
    <div class="display-value">{{ value }}</div>
    <div v-if="error" class="display-error">{{ error }}</div>
  </div>
</template>

<script setup>
defineProps({
  value: {
    type: String,
    default: '0'
  },
  error: {
    type: String,
    default: ''
  }
});
</script>

<style scoped>
.display {
  background: #f5f5f5;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  text-align: right;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.display-value {
  font-size: 36px;
  font-weight: 600;
  color: #333;
  word-break: break-all;
}

.display-error {
  font-size: 14px;
  color: #e74c3c;
  margin-top: 5px;
}
</style>
