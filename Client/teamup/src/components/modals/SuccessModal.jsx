export default function SuccessModal({ onClose }) {
  return (
    <>
      <div className="success-icon">✓</div>
      <h2 className="modal-title">Dobrodošli!</h2>
      <p className="modal-sub">Nalog je uspešno kreiran. Možete početi sa rezervacijom.</p>
      <button type="button" className="modal-btn" onClick={onClose}>
        Počnite sa pretragom →
      </button>
    </>
  );
}
