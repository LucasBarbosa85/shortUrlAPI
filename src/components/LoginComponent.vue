<template>
  <div class="login">
    <div class="login-form p-4 bg-white rounded shadow">
      <h2 class="text-primary" style="text-align: center">Login</h2>
      <form @submit.prevent="login">
        <div class="form-group">
          <label for="username" class="text-dark"></label>
          <input v-model="username" type="text" class="form-control" id="username" placeholder="Username" style="text-align: center"/>
        </div>
        <div class="form-group">
          <label for="password" class="text-dark"></label>
          <input v-model="password" type="password" class="form-control" id="password" placeholder="Password" style="text-align: center"/>
        </div>
        <button type="submit" class="btn btn-primary">Login</button>
      </form>
      <p class="text-danger mt-2">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const API_URL = 'http://localhost:3000';

export default {
  data() {
    return {
      username: "",
      password: "",
      errorMessage: "",
    };
  },
  methods: {
    async login() {
      try {
        const response = await axios.post(`${API_URL}/api/login`, {
          username: this.username,
          password: this.password,
        });

        if (response.data.token && response.data.userId) {
          localStorage.setItem('token', response.data.token);
          this.$router.push({ name: 'manage', params: { userId: response.data.userId } });
        } else {
          this.errorMessage = "Token não recebido após o login.";
        }
      } catch (error) {
        console.error(error);
        this.errorMessage = "Ocorreu um erro durante o login.";
      }
    },
  },
};
</script>

<style scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  
  background-color: #f5f5f5;
}

.login-form {
  background: #ffffff;
  min-width: 500px;
}

h2 {
  color: #3498db;
}

form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

</style>