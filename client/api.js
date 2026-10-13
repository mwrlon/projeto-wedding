// Utilitários compartilhados pelas páginas (carregar antes do script de cada página).

// URL base da API: único lugar para trocar ao publicar.
const API_BASE = 'http://localhost:3000/api';
const TOKEN_KEY = 'wedding_token';

const getToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch (error) {
    return null;
  }
};

const setToken = (token) => {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Não foi possível salvar a sessão.', error);
  }
};

const clearToken = () => {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    /* ignora */
  }
};

// Páginas internas: sem token, volta para o login.
const requireAuth = () => {
  if (!getToken()) window.location.replace('login.html');
};

// fetch que já envia o token e trata sessão expirada.
const authFetch = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (response.status === 401) {
    clearToken();
    window.location.replace('login.html');
  }

  return response;
};

const logout = () => {
  clearToken();
  window.location.href = 'login.html';
};

// Escapa texto vindo da API antes de usar em innerHTML (evita XSS).
const escapeHtml = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]
  );
