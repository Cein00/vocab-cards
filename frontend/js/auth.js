import { apiRequest } from './api.js';

// Переключение видимости паролей (глазик)
document.addEventListener('DOMContentLoaded', () => {
  const toggleIcons = document.querySelectorAll('.toggle-password');
  toggleIcons.forEach(icon => {
    icon.addEventListener('click', () => {
      const input = document.getElementById(icon.dataset.target);
      if (!input) return;
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      icon.classList.toggle('fa-eye', isPassword);
      icon.classList.toggle('fa-eye-slash', !isPassword);
    });
  });
});

// Логика входа
if (document.getElementById('login-form')) {
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    try {
      const data = await apiRequest('/auth/login', 'POST', { username, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = 'index.html';
    } catch (err) {
      document.getElementById('error-message').textContent = err.message;
    }
  });
}

// Логика регистрации
if (document.getElementById('register-form')) {
  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const password2 = document.getElementById('reg-password2').value;
    if (password !== password2) {
      document.getElementById('error-message').textContent = 'Пароли не совпадают';
      return;
    }
    const nativeLanguage = document.getElementById('reg-native-language').value;
    try {
      const data = await apiRequest('/auth/register', 'POST', { username, password, nativeLanguage });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = 'index.html';
    } catch (err) {
      document.getElementById('error-message').textContent = err.message;
    }
  });
}