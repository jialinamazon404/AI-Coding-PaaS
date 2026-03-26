<template>
  <div class="keypad">
    <div class="keypad-row">
      <button @click="input('(')" class="key key-operator">(</button>
      <button @click="input(')')" class="key key-operator">)</button>
      <button @click="backspace" class="key key-operator">⌫</button>
      <button @click="clear" class="key key-danger">C</button>
    </div>
    <div class="keypad-row">
      <button @click="input('7')" class="key">7</button>
      <button @click="input('8')" class="key">8</button>
      <button @click="input('9')" class="key">9</button>
      <button @click="input('/')" class="key key-operator">÷</button>
    </div>
    <div class="keypad-row">
      <button @click="input('4')" class="key">4</button>
      <button @click="input('5')" class="key">5</button>
      <button @click="input('6')" class="key">6</button>
      <button @click="input('*')" class="key key-operator">×</button>
    </div>
    <div class="keypad-row">
      <button @click="input('1')" class="key">1</button>
      <button @click="input('2')" class="key">2</button>
      <button @click="input('3')" class="key">3</button>
      <button @click="input('-')" class="key key-operator">−</button>
    </div>
    <div class="keypad-row">
      <button @click="input('0')" class="key">0</button>
      <button @click="input('.')" class="key">.</button>
      <button @click="calculate" class="key key-equal">=</button>
      <button @click="input('+')" class="key key-operator">+</button>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['input', 'clear', 'backspace', 'calculate']);

const input = (value) => emit('input', value);
const clear = () => emit('clear');
const backspace = () => emit('backspace');
const calculate = () => emit('calculate');
</script>

<style scoped>
.keypad {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.keypad-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.key {
  padding: 20px;
  font-size: 24px;
  border: none;
  border-radius: 12px;
  background: #f0f0f0;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
}

.key:hover {
  background: #e0e0e0;
}

.key:active {
  transform: scale(0.95);
}

.key-operator {
  background: #667eea;
  color: white;
}

.key-operator:hover {
  background: #5568d3;
}

.key-danger {
  background: #e74c3c;
  color: white;
}

.key-danger:hover {
  background: #c0392b;
}

.key-equal {
  background: #27ae60;
  color: white;
  font-size: 28px;
  font-weight: 700;
}

.key-equal:hover {
  background: #219a52;
}
</style>
