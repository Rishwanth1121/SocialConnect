const API_URL = 'http://localhost:8000/api';

export async function getCsrfToken() {
  const res = await fetch(`${API_URL}/csrf/`, {
    credentials: 'include',
  });
  return res.json();
}

export async function login(username, password) {
  const csrfRes = await getCsrfToken();
  const csrfToken = csrfRes.csrfToken;

  const res = await fetch(`${API_URL}/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken, // ✅ Required for session-based auth
    },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });

  return res.json();
}

export async function logout() {
  return fetch(`${API_URL}/logout/`, {
    method: 'POST',
    credentials: 'include',
  });
}

export async function getUser() {
  const res = await fetch(`${API_URL}/user/`, {
    credentials: 'include',
  });
  return res.json();
}

export async function register({ first_name, last_name, username, email, password }) {
  const csrfRes = await getCsrfToken();
  const csrfToken = csrfRes.csrfToken;

  const res = await fetch(`${API_URL}/register/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken,
    },
    credentials: 'include',
    body: JSON.stringify({
      first_name,
      last_name,
      username,
      email,
      password,
    }),
  });

  return res.json();
}

