import LoginModal          from './modals/LoginModal';
import RegisterModal       from './modals/RegisterModal';
import SuccessModal        from './modals/SuccessModal';
import RezervacijaModal    from './modals/RezervacijaModal';
import RezervacijaSuccess  from './modals/RezervacijaSuccess';
import TerminDetaljiModal  from './modals/TerminDetaljiModal';

export default function ModalManager({
  activeModal, openModal, closeModal,
  rezervacijaTeren, rezervacijaDetalji, onRezervacijaSuccess,
  aktivniTermin, terminPromena,
}) {
  if (!activeModal) return null;

  const stopProp = (e) => e.stopPropagation();

  return (
    <>
      <div className="modal-overlay active" onClick={closeModal} />

      {activeModal === 'login' && (
        <div className="modal active" role="dialog" aria-modal="true" onClick={stopProp}>
          <LoginModal onClose={closeModal} onSwitchToRegister={() => openModal('register')} />
        </div>
      )}

      {activeModal === 'register' && (
        <div className="modal active" role="dialog" aria-modal="true" onClick={stopProp}>
          <RegisterModal onClose={closeModal} onSwitchToLogin={() => openModal('login')} onSuccess={() => openModal('success')} />
        </div>
      )}

      {activeModal === 'success' && (
        <div className="modal modal--success active" role="dialog" aria-modal="true" onClick={stopProp}>
          <SuccessModal onClose={closeModal} />
        </div>
      )}

      {activeModal === 'rezervacija' && rezervacijaTeren && (
        <div className="modal modal--rezervacija active" role="dialog" aria-modal="true" onClick={stopProp}>
          <RezervacijaModal teren={rezervacijaTeren} onClose={closeModal} onSuccess={onRezervacijaSuccess} />
        </div>
      )}

      {activeModal === 'rezervacija-success' && (
        <div className="modal modal--success active" role="dialog" aria-modal="true" onClick={stopProp}>
          <RezervacijaSuccess detalji={rezervacijaDetalji} onClose={closeModal} />
        </div>
      )}

      {activeModal === 'termin-detalji' && aktivniTermin && (
        <div className="modal modal--termin active" role="dialog" aria-modal="true" onClick={stopProp}>
          <TerminDetaljiModal termin={aktivniTermin} onClose={closeModal} onPromena={terminPromena} />
        </div>
      )}
    </>
  );
}