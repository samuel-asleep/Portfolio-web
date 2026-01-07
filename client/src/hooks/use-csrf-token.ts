import { useEffect, useState } from 'react';

/**
 * Hook to manage CSRF token for API requests
 * Fetches token on mount and provides it for requests
 */
export function useCsrfToken() {
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    // Fetch CSRF token on mount
    fetch('/api/csrf-token', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setToken(data.token))
      .catch(err => console.error('Failed to fetch CSRF token:', err));
  }, []);

  return token;
}
