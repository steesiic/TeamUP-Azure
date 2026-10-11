import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTerminiApi } from '../../api/termini';
import { createRezervacijaApi } from '../../api/rezervacije';
import { getSportoviApi } from '../../api/sportovi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLocationDot, faFutbol, faMedal, faCalendarDays,
  faClock, faStopwatch, faUsers, faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';

export default function RezervacijaModal({ teren, onClose, onSuccess }) {
  const { korisnik } = useAuth();

  const [termini,     setTermini]     = useState([]);
  const [sportovi,    setSportovi]    = useState([]);
  const [loadingT,    setLoadingT]    = useState(true);
  const [terminId,    setTerminId]    = useState(teren?._selectedTerminId ? String(teren._selectedTerminId) : '');
  const [sportId,     setSportId]     = useState('');
  const [filterDatum, setFilterDatum] = useState('');
  const [minIgraca,   setMinIgraca]   = useState(2);
  const [maxIgraca,   setMaxIgraca]   = useState(10);
  const [errors,      setErrors]      = useState({});
  const [loading,     setLoading]     = useState(false);

  useEffect(() => {
    if (!teren?.id) return;
    setLoadingT(true);
    Promise.all([
      getTerminiApi({ objekatId: teren.id, perPage: 500 }),
      getSportoviApi(),
    ])
      .then(([termData, sportData]) => {
        const lista = (termData.data ?? termData.items ?? [])
          .filter(t => t.status === 'Slobodan')
          .sort((a, b) => {
            const da = (a.datum?.split('T')[0] ?? '') + (a.vremeOd ?? '');
            const db = (b.datum?.split('T')[0] ?? '') + (b.vremeOd ?? '');
            return da.localeCompare(db);
          });
        setTermini(lista);

        if (teren?._selectedTerminId) {
          const predizabrani = lista.find(t => t.id === teren._selectedTerminId);
          if (predizabrani) {
            setFilterDatum(predizabrani.datum?.split('T')[0] ?? '');
          }
        }

        const sviSportovi = Array.isArray(sportData) ? sportData : sportData.data ?? sportData.items ?? [];
        const sportoviObjekta = sviSportovi.filter(s => teren.sportovi?.includes(s.naziv));
        setSportovi(sportoviObjekta);
      })
      .catch(() => setErrors({ server: 'Greška pri učitavanju podataka.' }))
      .finally(() => setLoadingT(false));
  }, [teren?.id]);

  const dostupniDatumi = [...new Set(termini.map(t => t.datum?.split('T')[0]))].sort();
  const filtriraniTermini = filterDatum
    ? termini.filter(t => t.datum?.split('T')[0] === filterDatum)
    : termini;
  const izabraniTermin = termini.find(t => t.id === Number(terminId));

  function trajanjeLabel(t) {
    if (!t) return '';
    const [h1, m1] = t.vremeOd.split(':').map(Number);
    const [h2, m2] = t.vremeDo.split(':').map(Number);
    const min = (h2 * 60 + m2) - (h1 * 60 + m1);
    const sati = Math.floor(min / 60);
    return sati === 1 ? '1 sat' : `${sati} sata`;
  }

  function formatDatum(datumStr) {
    if (!datumStr) return '';
    const d = new Date(datumStr);
    const meseci = ['jan','feb','mar','apr','maj','jun','jul','avg','sep','okt','nov','dec'];
    return `${d.getDate()}. ${meseci[d.getMonth()]} ${d.getFullYear()}.`;
  }

  const validate = () => {
    const e = {};
    if (!terminId)             e.termin    = 'Izaberite termin';
    if (!sportId)              e.sport     = 'Izaberite sport';
    if (minIgraca < 1)         e.minIgraca = 'Min mora biti ≥ 1';
    if (maxIgraca < minIgraca) e.maxIgraca = 'Max mora biti ≥ min';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    try {
      await createRezervacijaApi({
        terminId:      Number(terminId),
        glavniIgracId: korisnik.id,
        sportId:       Number(sportId),
        minIgraca,
        maxIgraca,
      });
      const t = izabraniTermin;
      onSuccess({
        teren,
        datum:    t.datum?.split('T')[0] ?? '',
        vreme:    t.vremeOd?.slice(0, 5) ?? '',
        trajanje: trajanjeLabel(t),
        ukupno:   t.cena,
      });
    } catch (err) {
      setErrors({ server: err.message });
    } finally {
      setLoading(false);
    }
  };

  const selectStyle = (hasError) => ({
    height: '44px', padding: '0 12px',
    border: `1.5px solid ${hasError ? '#E24B4A' : '#e4e2dc'}`,
    borderRadius: '10px', fontFamily: 'DM Sans, sans-serif',
    fontSize: '14px', background: '#fafaf8', outline: 'none',
    width: '100%', cursor: 'pointer',
  });

  return (
    <>
      <button className="modal-close" onClick={onClose}>✕</button>

      <div className="rez-teren-summary">
        <div className="rez-teren-info">
          <div className="rez-teren-naziv">{teren.naziv}</div>
          <div className="rez-teren-loc">
            <FontAwesomeIcon icon={faLocationDot} style={{ marginRight: 5 }} />
            {teren.adresa}
          </div>
          {teren.sportovi?.length > 0 && (
            <div className="rez-teren-loc">
              <FontAwesomeIcon icon={faFutbol} style={{ marginRight: 5 }} />
              {teren.sportovi.join(', ')}
            </div>
          )}
        </div>
      </div>

      <h2 className="modal-title" style={{ marginTop: '1.25rem' }}>Rezerviši teren</h2>
      <p className="modal-sub">Izaberite termin i podesite broj igrača</p>

      <form className="modal-form" onSubmit={handleSubmit} noValidate>
        {errors.server && (
          <div className="reg-opciono-info" style={{ background: '#fde8e8', borderColor: 'rgba(226,75,74,0.2)', color: '#c0392b', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FontAwesomeIcon icon={faTriangleExclamation} />
            {errors.server}
          </div>
        )}

        <div className="field-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FontAwesomeIcon icon={faMedal} style={{ color: '#888' }} /> Sport
          </label>
          {loadingT ? (
            <p style={{ fontSize: 13, color: '#888' }}>Učitavanje...</p>
          ) : (
            <select value={sportId}
              onChange={e => { setSportId(e.target.value); setErrors(er => ({ ...er, sport: '' })); }}
              style={selectStyle(errors.sport)}>
              <option value="" disabled>Izaberi sport</option>
              {sportovi.map(s => <option key={s.id} value={s.id}>{s.naziv}</option>)}
            </select>
          )}
          <span className="field-error">{errors.sport}</span>
        </div>

        <div className="field-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FontAwesomeIcon icon={faCalendarDays} style={{ color: '#888' }} /> Datum
          </label>
          {loadingT ? (
            <p style={{ fontSize: 13, color: '#888' }}>Učitavanje...</p>
          ) : (
            <select value={filterDatum}
              onChange={e => { setFilterDatum(e.target.value); setTerminId(''); }}
              style={selectStyle(false)}>
              <option value="">Svi datumi</option>
              {dostupniDatumi.map(d => (
                <option key={d} value={d}>{formatDatum(d)}</option>
              ))}
            </select>
          )}
        </div>

        <div className="field-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FontAwesomeIcon icon={faClock} style={{ color: '#888' }} /> Termin
          </label>
          {loadingT ? (
            <p style={{ fontSize: 13, color: '#888' }}>Učitavanje termina...</p>
          ) : filtriraniTermini.length === 0 ? (
            <p style={{ fontSize: 13, color: '#888' }}>Nema dostupnih termina.</p>
          ) : (
            <select value={terminId}
              onChange={e => { setTerminId(e.target.value); setErrors(er => ({ ...er, termin: '' })); }}
              style={selectStyle(errors.termin)}>
              <option value="" disabled>Izaberi termin</option>
              {filtriraniTermini.map(t => (
                <option key={t.id} value={t.id}>
                  {!filterDatum && `${t.datum?.split('T')[0]} | `}{t.vremeOd?.slice(0,5)}–{t.vremeDo?.slice(0,5)} | {Number(t.cena).toLocaleString()} RSD
                </option>
              ))}
            </select>
          )}
          <span className="field-error">{errors.termin}</span>
        </div>

        {izabraniTermin && (
          <div className="rez-cena-box">
            <div className="rez-cena-row">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FontAwesomeIcon icon={faStopwatch} style={{ color: '#888' }} /> Trajanje
              </span>
              <span>{trajanjeLabel(izabraniTermin)}</span>
            </div>
            <div className="rez-cena-row">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FontAwesomeIcon icon={faClock} style={{ color: '#888' }} /> Vreme
              </span>
              <span>{izabraniTermin.vremeOd?.slice(0,5)}–{izabraniTermin.vremeDo?.slice(0,5)}</span>
            </div>
            <div className="rez-cena-total">
              <span>Cena termina</span>
              <span>{Number(izabraniTermin.cena).toLocaleString()} RSD</span>
            </div>
          </div>
        )}

        <div className="field-row">
          <div className="field-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FontAwesomeIcon icon={faUsers} style={{ color: '#888' }} /> Min igrača
            </label>
            <div className="rez-sati-row">
              <button type="button" className="rez-sati-btn" onClick={() => setMinIgraca(v => Math.max(1, v - 1))}>−</button>
              <span className="rez-sati-val">{minIgraca}</span>
              <button type="button" className="rez-sati-btn" onClick={() => setMinIgraca(v => Math.min(maxIgraca, v + 1))}>+</button>
            </div>
            <span className="field-error">{errors.minIgraca}</span>
          </div>
          <div className="field-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FontAwesomeIcon icon={faUsers} style={{ color: '#888' }} /> Max igrača
            </label>
            <div className="rez-sati-row">
              <button type="button" className="rez-sati-btn" onClick={() => setMaxIgraca(v => Math.max(minIgraca, v - 1))}>−</button>
              <span className="rez-sati-val">{maxIgraca}</span>
              <button type="button" className="rez-sati-btn" onClick={() => setMaxIgraca(v => Math.min(50, v + 1))}>+</button>
            </div>
            <span className="field-error">{errors.maxIgraca}</span>
          </div>
        </div>

        <button type="submit" className="modal-btn" disabled={loading || loadingT || termini.length === 0}>
          <span className="btn-text">
            {loading ? 'Slanje rezervacije...' : 'Potvrdi rezervaciju'}
          </span>
        </button>
      </form>
    </>
  );
}