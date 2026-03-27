import { useEffect, useState } from 'react';

/**
 * Hook to manage CSRF token for API requests
 * Fetches token on mount and provides it for requests
 */
export function useCsrfToken() {
  const [token, setToken] = useState<string>('');
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    // Fetch CSRF token on mount
    fetch('/api/csrf-token', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setToken(data.token);
        setIsReady(true);
      })
      .catch(err => {
        console.error('Failed to fetch CSRF token:', err);
        setIsReady(true); // Mark ready even on error so the UI is not permanently blocked
      });
  }, []);

  return { token, isReady };
}
