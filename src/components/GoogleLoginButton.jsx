import { useEffect, useRef } from 'react';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Render tombol resmi Google Identity Services (bukan tombol custom) - style/copy/consent
// screen dijamin sesuai kebijakan Google, dan tokennya (credential = ID token JWT) langsung
// diverifikasi ulang di backend (lihat storefront.service.js#googleLogin), tidak dipercaya mentah.
export default function GoogleLoginButton({ onToken, onError }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!CLIENT_ID) return undefined;

    let cancelled = false;

    function render() {
      if (cancelled || !window.google?.accounts?.id || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (response) => {
          if (response?.credential) {
            onToken(response.credential);
          } else {
            onError?.('Gagal mendapatkan token dari Google');
          }
        },
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 360,
        text: 'continue_with',
        locale: 'id',
      });
    }

    if (window.google?.accounts?.id) {
      render();
    } else {
      // Script GIS dimuat async di index.html - poll singkat sampai siap.
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          render();
        }
      }, 200);
      return () => {
        cancelled = true;
        clearInterval(interval);
      };
    }
    return () => {
      cancelled = true;
    };
  }, [onToken, onError]);

  if (!CLIENT_ID) return null;

  return <div ref={buttonRef} style={{ display: 'flex', justifyContent: 'center', margin: '14px 0' }} />;
}
