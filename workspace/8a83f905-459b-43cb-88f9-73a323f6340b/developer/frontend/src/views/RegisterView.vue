<template>
  <div class="auth-page">
    <RegisterForm />
  </div>
</template>

<script setup>
import RegisterForm from '../components/auth/RegisterForm.vue';
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
