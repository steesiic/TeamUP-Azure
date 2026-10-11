import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import VenueCard from '../components/VenueCard';
import { VenueCardSkeleton } from '../components/Skeleton';
import { getObjektiApi, mapObjekatZaKartu } from '../api/objekti';
import { getSportoviApi } from '../api/sportovi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLocationDot, faMedal, faMagnifyingGlass, faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';

const PER_PAGE = 9;

const GRADOVI = [
  'Beograd', 'Novi Sad', 'Niš', 'Kragujevac', 'Subotica', 'Zrenjanin',
  'Pančevo', 'Čačak', 'Novi Pazar', 'Kraljevo', 'Smederevo', 'Leskovac',
  'Vranje', 'Valjevo', 'Šabac', 'Užice', 'Zaječar', 'Prokuplje', 'Pirot',
  'Kikinda', 'Sombor', 'Jagodina', 'Požarevac', 'Bor', 'Negotin',
  'Kruševac', 'Prijepolje', 'Sremska Mitrovica',
];

export default function Results({ onRezervisi }) {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();

  const [grad,     setGrad]     = useState(searchParams.get('grad')    || '');
  const [sportId,  setSportId]  = useState(searchParams.get('sportId') || '');
  const [naziv,    setNaziv]    = useState(searchParams.get('naziv')   || '');
  const [sort,     setSort]     = useState('default');
  const [stranica, setStranica] = useState(1);

  const [objekti,   setObjekti]   = useState([]);
  const [ukupno,    setUkupno]    = useState(0);
  const [ukupnoStr, setUkupnoStr] = useState(0);
  const [sportovi,  setSportovi]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [greska,    setGreska]    = useState('');

  useEffect(() => {
    getSportoviApi()
      .then(data => setSportovi(Array.isArray(data) ? data : data.data ?? data.items ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setGreska('');
    const search = { page: stranica, perPage: PER_PAGE };
    if (grad)    search.adresa  = grad;
    if (sportId) search.sportId = sportId;
    if (naziv)   search.naziv   = naziv;
    getObjektiApi(search)
      .then(data => {
        const lista = Array.isArray(data) ? data : data.data ?? data.items ?? [];
        setObjekti(lista.map(mapObjekatZaKartu));
        setUkupno(data.totalCount ?? lista.length);
        setUkupnoStr(data.totalPages ?? 1);
      })
      .catch(() => setGreska('Greška pri učitavanju terena.'))
      .finally(() => setLoading(false));
  }, [grad, sportId, stranica]);

  useEffect(() => { setStranica(1); }, [grad, sportId]);

  const sortirani = (() => {
    let list = [...objekti];
    if (sort === 'cena-asc')   list.sort((a, b) => (a.prosecnaCena ?? 0) - (b.prosecnaCena ?? 0));
    if (sort === 'cena-desc')  list.sort((a, b) => (b.prosecnaCena ?? 0) - (a.prosecnaCena ?? 0));
    if (sort === 'ocena-desc') list.sort((a, b) => (b.prosecnaOcena ?? 0) - (a.prosecnaOcena ?? 0));
    return list;
  })();

  const brojStranica = ukupnoStr || Math.ceil(ukupno / PER_PAGE) || 1;

  const stranice = () => {
    const pages = [];
    const start = Math.max(1, stranica - 2);
    const end   = Math.min(brojStranica, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <>
      <div className="results-filter-bar">
        <div className="results-filter-inner">
          <div className="sf--light">
            <div className="sf-label">
              <FontAwesomeIcon icon={faLocationDot} style={{ marginRight: 5 }} />
              Grad / Adresa
            </div>
            <select
              value={grad}
              onChange={e => setGrad(e.target.value)}
              style={{ height: '36px', padding: '0 10px', border: '1.5px solid #e4e2dc', borderRadius: '8px', fontSize: '14px', background: '#fafaf8', outline: 'none', cursor: 'pointer', color: '#1a1a1a' }}
            >
              <option value="">Svi gradovi</option>
              {GRADOVI.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="sf--light">
            <div className="sf-label">
              <FontAwesomeIcon icon={faMedal} style={{ marginRight: 5 }} />
              Sport
            </div>
            <select value={sportId} onChange={e => setSportId(e.target.value)}>
              <option value="">Svi sportovi</option>
              {sportovi.map(s => <option key={s.id} value={s.id}>{s.naziv}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="results-page">
        <div className="results-main" style={{ minHeight: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
          <div className="results-header">
            <div>
              <h1 className="results-title">
                {sportId
                  ? `${sportovi.find(s => String(s.id) === String(sportId))?.naziv ?? ''} tereni`
                  : 'Svi tereni'}
              </h1>
              <p className="results-sub">
                {loading
                  ? 'Učitavanje...'
                  : `${ukupno} ${ukupno === 1 ? 'teren pronađen' : 'terena pronađeno'}${grad ? ` — "${grad}"` : ''}`}
              </p>
            </div>
            <div className="results-sort">
              <select value={sort} onChange={e => setSort(e.target.value)}>
                <option value="default">Sortiraj: Preporučeno</option>
                <option value="cena-asc">Prosečna cena: niža → viša</option>
                <option value="cena-desc">Prosečna cena: viša → niža</option>
                <option value="ocena-desc">Prosečna ocena: viša → niža</option>
              </select>
            </div>
          </div>

          {loading && (
            <div className="venues results-grid">
              {[1, 2, 3, 4, 5, 6].map(i => <VenueCardSkeleton key={i} />)}
            </div>
          )}

          {!loading && greska && (
            <div className="empty-state" style={{ margin: 'auto' }}>
              <div className="empty-icon" style={{ color: '#E24B4A', fontSize: 32 }}>
                <FontAwesomeIcon icon={faTriangleExclamation} />
              </div>
              <h3>Greška</h3>
              <p>{greska}</p>
            </div>
          )}

          {!loading && !greska && sortirani.length === 0 && (
            <div className="empty-state" style={{ margin: 'auto' }}>
              <div className="empty-icon" style={{ color: '#aaa', fontSize: 32 }}>
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </div>
              <h3>Nema rezultata</h3>
              <p>Pokušajte sa drugom pretragom.</p>
              <button onClick={() => navigate('/')} className="modal-btn"
                style={{ width: 'auto', padding: '0 2rem', marginTop: '1rem' }}>
                Nova pretraga
              </button>
            </div>
          )}

          {!loading && !greska && sortirani.length > 0 && (
            <div className="venues results-grid">
              {sortirani.map(t => <VenueCard key={t.id} teren={t} />)}
            </div>
          )}

          {!loading && !greska && brojStranica > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: '2.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setStranica(s => Math.max(1, s - 1))}
                disabled={stranica === 1}
                style={{
                  height: 38, padding: '0 14px', border: '1.5px solid #e4e2dc',
                  borderRadius: 8, background: 'white', cursor: stranica === 1 ? 'not-allowed' : 'pointer',
                  fontSize: 14, color: stranica === 1 ? '#ccc' : '#555',
                  fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s'
                }}
              >
                ← Prethodna
              </button>
              {stranice().map(s => (
                <button
                  key={s}
                  onClick={() => setStranica(s)}
                  style={{
                    width: 38, height: 38, border: '1.5px solid',
                    borderColor: s === stranica ? 'var(--green)' : '#e4e2dc',
                    borderRadius: 8,
                    background: s === stranica ? 'var(--green)' : 'white',
                    color: s === stranica ? 'white' : '#555',
                    cursor: 'pointer', fontSize: 14, fontWeight: s === stranica ? 600 : 400,
                    fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s'
                  }}
                >
                  {s}
                </button>
              ))}
              <button
                onClick={() => setStranica(s => Math.min(brojStranica, s + 1))}
                disabled={stranica === brojStranica}
                style={{
                  height: 38, padding: '0 14px', border: '1.5px solid #e4e2dc',
                  borderRadius: 8, background: 'white', cursor: stranica === brojStranica ? 'not-allowed' : 'pointer',
                  fontSize: 14, color: stranica === brojStranica ? '#ccc' : '#555',
                  fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s'
                }}
              >
                Sledeća →
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}