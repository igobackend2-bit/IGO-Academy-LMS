/**
 * useRecaptcha — Google reCAPTCHA v3 (invisible, score-based) for public
 * forms. Gracefully no-ops until VITE_RECAPTCHA_SITE_KEY is configured, so
 * the form keeps working normally before the Academy sets one up.
 * Doc §13: CAPTCHA / anti-spam.
 */
import { useCallback, useEffect, useRef } from 'react';

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

function loadScript(siteKey) {
  return new Promise((resolve) => {
    if (window.grecaptcha) { resolve(true); return; }
    const existing = document.getElementById('recaptcha-script');
    if (existing) { existing.addEventListener('load', () => resolve(true)); return; }
    const script = document.createElement('script');
    script.id = 'recaptcha-script';
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

export function useRecaptcha() {
  const ready = useRef(false);

  useEffect(() => {
    if (!SITE_KEY) return;
    loadScript(SITE_KEY).then((ok) => { ready.current = ok; });
  }, []);

  /** Returns a token string, or null if reCAPTCHA isn't configured/available. */
  const execute = useCallback(async (action = 'submit') => {
    if (!SITE_KEY || !window.grecaptcha) return null;
    try {
      return await window.grecaptcha.execute(SITE_KEY, { action });
    } catch {
      return null;
    }
  }, []);

  return { execute, enabled: !!SITE_KEY };
}
