const API_BASE = '/api';

export async function apiRequest(url, method = 'GET', body = null, isFormData = false) {
  const options = {
    method,
    headers: {}
  };
  const token = localStorage.getItem('token');
  if (token) options.headers['Authorization'] = `Bearer ${token}`;
  if (body) {
    if (isFormData) {
      options.body = body;
    } else {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }
  }

  const res = await fetch(`${API_BASE}${url}`, options);

  if (res.status === 401) {
    localStorage.clear();
    window.location.href = 'login.html';
    return; // прерываем выполнение, ничего не возвращаем
  }

  // Парсим JSON в любом случае (даже если статус не ok)
  const data = await res.json().catch(() => ({ message: 'Ошибка ответа сервера' }));

  if (!res.ok) {
    // Специально для отладки можно залогировать
    console.error('Ошибка API:', res.status, data);
    throw new Error(data.message || 'Ошибка запроса');
  }

  return data;
}