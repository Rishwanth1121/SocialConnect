'use client';

import { useEffect } from 'react';

export default function CSRFProvider() {
  useEffect(() => {
    fetch('http://localhost:8000/api/csrf/', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.csrfToken) {
          localStorage.setItem('csrfToken', data.csrfToken);
        }
      })
      .catch((err) => {
        console.error('CSRF fetch error:', err);
      });
  }, []);

  return null; // No visible output
}
