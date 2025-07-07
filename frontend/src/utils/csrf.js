// src/utils/csrf.js
export async function getCSRFToken() {
  let token = localStorage.getItem('csrfToken');
  if (token) return token;

  const res = await fetch('http://localhost:8000/api/csrf/', {
    credentials: 'include',
  });
  const data = await res.json();
  token = data.csrfToken;
  localStorage.setItem('csrfToken', token);
  return token;
}
