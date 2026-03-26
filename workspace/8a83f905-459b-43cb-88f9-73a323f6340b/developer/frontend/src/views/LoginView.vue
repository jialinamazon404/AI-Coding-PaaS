<template>
  <div class="auth-page">
    <LoginForm />
  </div>
</template>

<script setup>
import LoginForm from '../components/auth/LoginForm.vue';
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
