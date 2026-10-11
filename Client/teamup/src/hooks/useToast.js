import { useCallback } from 'react';

export function useToast() {
  const showToast = useCallback((poruka, trajanje = 3000) => {
    const stari = document.querySelector('.toast');
    if (stari) stari.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = poruka;
    document.body.appendChild(toast);

    requestAnimationFrame(() =>
      requestAnimationFrame(() => toast.classList.add('show'))
    );
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, trajanje);
  }, []);

  return { showToast };
}
