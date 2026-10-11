import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding } from '@fortawesome/free-solid-svg-icons';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="results-page" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="empty-state" style={{ maxWidth: 480 }}>
        <div style={{ fontSize: 64, marginBottom: '1rem', lineHeight: 1, color: '#e4e2dc' }}>
          <FontAwesomeIcon icon={faBuilding} />
        </div>
        <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 80, fontWeight: 800, color: '#e4e2dc', lineHeight: 1, marginBottom: '0.5rem' }}>404</h1>
        <h2 className="how-title" style={{ marginBottom: '0.75rem' }}>Stranica nije pronađena</h2>
        <p style={{ color: '#aaa', fontSize: 15, marginBottom: '2rem' }}>
          Izgleda da ste zalutali. Ova stranica ne postoji ili je premeštena.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn-solid" onClick={() => navigate('/')}>← Idi na početnu</button>
          <button className="btn-outline" onClick={() => navigate(-1)}>Nazad</button>
        </div>
      </div>
    </div>
  );
}