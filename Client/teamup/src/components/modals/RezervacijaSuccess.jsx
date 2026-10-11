import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

export default function RezervacijaSuccess({ detalji, onClose }) {
  if (!detalji) return null;
  const { teren, datum, vreme, trajanje, ukupno } = detalji;

  return (
    <>
      <div className="success-icon">
        <FontAwesomeIcon icon={faCheck} />
      </div>
      <h2 className="modal-title">Rezervacija potvrđena!</h2>
      <p className="modal-sub">Vidimo se na terenu!</p>

      <div className="rez-success-box">
        <div className="rez-success-row">
          <span>Teren</span><strong>{teren.naziv}</strong>
        </div>
        <div className="rez-success-row">
          <span>Lokacija</span><strong>{teren.adresa}</strong>
        </div>
        <div className="rez-success-row">
          <span>Datum</span><strong>{datum}</strong>
        </div>
        <div className="rez-success-row">
          <span>Vreme</span><strong>{vreme}h{trajanje ? ` — ${trajanje}` : ''}</strong>
        </div>
        <div className="rez-success-row rez-success-total">
          <span>Ukupno</span><strong>{Number(ukupno).toLocaleString()} RSD</strong>
        </div>
      </div>

      <button type="button" className="modal-btn" onClick={onClose} style={{ marginTop: '1.5rem' }}>
        Zatvori →
      </button>
    </>
  );
}