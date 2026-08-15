import React, { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    window.api.settings.get('theme').then((v) => {
      const t = v === 'dark' ? 'dark' : 'light';
      setThemeState(t);
      applyTheme(t);
    });
  }, []);

  const applyTheme = (t: 'light' | 'dark') => {
    document.documentElement.setAttribute('data-theme', t);
    if (t === 'dark') {
      document.documentElement.style.setProperty('--bg', '#1a1a1a');
      document.documentElement.style.setProperty('--surface', '#2d2d2d');
      document.documentElement.style.setProperty('--text', '#e0e0e0');
      document.documentElement.style.setProperty('--text-secondary', '#999');
      document.documentElement.style.setProperty('--border', '#333');
    } else {
      document.documentElement.style.setProperty('--bg', '#f5f5f5');
      document.documentElement.style.setProperty('--surface', '#ffffff');
      document.documentElement.style.setProperty('--text', '#1a1a1a');
      document.documentElement.style.setProperty('--text-secondary', '#555');
      document.documentElement.style.setProperty('--border', '#f0f0f0');
    }
  };

  const setTheme = async (t: 'light' | 'dark') => {
    setThemeState(t);
    applyTheme(t);
    await window.api.settings.set('theme', t);
  };

  return { theme, setTheme };
}