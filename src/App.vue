<template>
  <div>
    <header class="app-header">
      <h1>Content Management Admin</h1>
      <nav>
        <router-link to="/login">Login</router-link> |
        <router-link to="/users">Users</router-link> |
        <router-link to="/contents">Contents</router-link> |
        <router-link to="/stats">Stats</router-link>
      </nav>
    </header>
    <main class="app-main">
      <router-view></router-view>
    </main>
  </div>
 </template>

<script>
export default {
  name: 'App'
}
</script>

<style>
.app-header { padding: 16px; background: #2c3e50; color: white; }
.app-header h1 { margin: 0 0 8px 0; font-size: 20px; }
.app-header nav a { color: #e8f0fe; margin: 0 6px; text-decoration: none; }
.app-main { padding: 16px; }
</style>
