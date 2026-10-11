import { useState, useEffect, useCallback } from 'react';

export function useModal() {
  const [activeModal,        setActiveModal]        = useState(null);
  const [rezervacijaTeren,   setRezervacijaTeren]   = useState(null);
  const [rezervacijaDetalji, setRezervacijaDetalji] = useState(null);
  const [aktivniTermin,      setAktivniTermin]      = useState(null);
  const [onTerminClose,      setOnTerminClose]      = useState(null);
  const [terminPromena,      setTerminPromena]      = useState(null);

  const openModal = useCallback((name) => {
    setActiveModal(name);
    document.body.style.overflow = 'hidden';
  }, []);

  const [onRezervacijaSuccess, setOnRezervacijaSuccess] = useState(null);

  const openRezervacija = useCallback((teren, onSuccess) => {
    setRezervacijaTeren(teren);
    setOnRezervacijaSuccess(() => onSuccess ?? null);
    setActiveModal('rezervacija');
    document.body.style.overflow = 'hidden';
  }, []);

  const openTermin = useCallback((termin, onClose, onPromena) => {
    setAktivniTermin(termin);
    setOnTerminClose(() => onClose ?? null);
    setTerminPromena(() => onPromena ?? null);
    setActiveModal('termin-detalji');
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = useCallback(() => {
    if (onTerminClose) onTerminClose();
    setOnTerminClose(null);
    setTerminPromena(null);
    setActiveModal(null);
    document.body.style.overflow = '';
  }, [onTerminClose]);

  const handleRezervacijaSuccess = useCallback((detalji) => {
    setRezervacijaDetalji(detalji);
    setActiveModal('rezervacija-success');
    if (onRezervacijaSuccess) onRezervacijaSuccess();
  }, [onRezervacijaSuccess]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [closeModal]);

  return {
    activeModal,
    openModal,
    openRezervacija,
    openTermin,
    closeModal,
    rezervacijaTeren,
    rezervacijaDetalji,
    aktivniTermin,
    terminPromena,
    onRezervacijaSuccess,
    handleRezervacijaSuccess,
  };
}