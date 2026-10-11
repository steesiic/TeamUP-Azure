import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createObjekatApi } from '../api/objekti';
import { createTerminApi } from '../api/termini';
import { getSportoviApi } from '../api/sportovi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding, faLocationDot, faImage, faMoneyBill,
  faCheck, faTriangleExclamation, faCalendarDays, faClock,
  faCircleInfo,
} from '@fortawesome/free-solid-svg-icons';

const gradovi = [
  'Beograd', 'Novi Sad', 'Niš', 'Kragujevac', 'Subotica', 'Zrenjanin',
  'Pančevo', 'Čačak', 'Novi Pazar', 'Kraljevo', 'Smederevo', 'Leskovac',
  'Vranje', 'Valjevo', 'Šabac', 'Užice', 'Zaječar', 'Prokuplje', 'Pirot',
  'Kikinda', 'Sombor', 'Jagodina', 'Požarevac', 'Bor', 'Negotin',
  'Kruševac', 'Prijepolje', 'Sremska Mitrovica',
];

const DANI = [
  { id: 1, label: 'Pon' },
  { id: 2, label: 'Uto' },
  { id: 3, label: 'Sre' },
  { id: 4, label: 'Čet' },
  { id: 5, label: 'Pet' },
  { id: 6, label: 'Sub' },
  { id: 0, label: 'Ned' },
];

const today = new Date().toISOString().split('T')[0];

function getDatesInRange(od, do_, daniNedelje) {
  const dates = [];
  let current = new Date(od);
  const end = new Date(do_);
  while (current <= end) {
    if (daniNedelje.includes(current.getDay())) {
      dates.push(current.toISOString().split('T')[0]);
    }
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export default function DodajSalu() {
  const navigate     = useNavigate();
  const { korisnik } = useAuth();

  const [korak,   setKorak]   = useState(1);
  const [loading, setLoading] = useState(false);
  const [uspeh,   setUspeh]   = useState(false);
  const [errors,  setErrors]  = useState({});
  const [kreiranoTermina, setKreiranoTermina] = useState(0);
  const [ukupnoTermina,   setUkupnoTermina]   = useState(0);

  const [sportovi,         setSportovi]         = useState([]);
  const [selectedSportIds, setSelectedSportIds] = useState([]);

  const [naziv,     setNaziv]     = useState('');
  const [grad,      setGrad]      = useState('');
  const [adresa,    setAdresa]    = useState('');
  const [opis,      setOpis]      = useState('');
  const [slikaUrl,  setSlikaUrl]  = useState('');

  const [terminDatumOd,  setTerminDatumOd]  = useState('');
  const [terminDatumDo,  setTerminDatumDo]  = useState('');
  const [terminOd,       setTerminOd]       = useState('08');
  const [terminDo,       setTerminDo]       = useState('23');
  const [terminTrajanje, setTerminTrajanje] = useState(1);
  const [terminCena,     setTerminCena]     = useState('');
  const [dodajTermine,   setDodajTermine]   = useState(true);
  const [aktivniDani,    setAktivniDani]    = useState([0, 1, 2, 3, 4, 5, 6]);

  useEffect(() => {
    getSportoviApi()
      .then(data => setSportovi(Array.isArray(data) ? data : data.data ?? data.items ?? []))
      .catch(() => {});
  }, []);

  const toggleDan   = (id) => setAktivniDani(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleSport = (id) => setSelectedSportIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const getSlotsZaDan = () => {
    const slots = [];
    let sat = Number(terminOd);
    const kraj = Number(terminDo);
    while (sat + terminTrajanje <= kraj) {
      const od  = String(sat).padStart(2, '0') + ':00';
      const do_ = String(sat + terminTrajanje).padStart(2, '0') + ':00';
      slots.push({ vremeOd: od, vremeDo: do_ });
      sat += terminTrajanje;
    }
    return slots;
  };

  const previewInfo = () => {
    if (!dodajTermine || !terminDatumOd || !terminDatumDo || !terminCena || aktivniDani.length === 0) return null;
    const datumi = getDatesInRange(terminDatumOd, terminDatumDo, aktivniDani);
    const slotsPoeDanu = getSlotsZaDan();
    return { datumi, slotsPoeDanu, ukupno: datumi.length * slotsPoeDanu.length };
  };

  const validateKorak1 = () => {
    const e = {};
    if (!naziv.trim())                 e.naziv  = 'Naziv je obavezan';
    if (!grad)                         e.grad   = 'Izaberite grad';
    if (!adresa.trim())                e.adresa = 'Adresa je obavezna';
    if (selectedSportIds.length === 0) e.sport  = 'Izaberite bar jedan sport';
    return e;
  };

  const validateKorak3 = () => {
    if (!dodajTermine) return {};
    const e = {};
    if (!terminDatumOd)                        e.terminDatumOd = 'Unesite početni datum';
    if (!terminDatumDo)                        e.terminDatumDo = 'Unesite krajnji datum';
    if (terminDatumDo < terminDatumOd)         e.terminDatumDo = 'Krajnji datum mora biti posle početnog';
    if (!terminCena || Number(terminCena) < 1) e.terminCena    = 'Unesite cenu';
    if (aktivniDani.length === 0)              e.dani          = 'Izaberite bar jedan dan';
    const info = previewInfo();
    if (info && info.ukupno === 0)             e.terminOpseg   = 'Nije moguće kreirati termine sa ovim podešavanjima';
    return e;
  };

  const sledeciKorak = () => {
    if (korak === 1) {
      const e = validateKorak1();
      if (Object.keys(e).length) { setErrors(e); return; }
    }
    setErrors({});
    setKorak(k => k + 1);
  };

  const handleSubmit = async () => {
    if (dodajTermine) {
      const e = validateKorak3();
      if (Object.keys(e).length) { setErrors(e); return; }
    }

    setLoading(true);
    try {
      const obj = await createObjekatApi({
        naziv,
        adresa:    `${adresa}, ${grad}`,
        opis:      opis || '',
        slikaUrl:  slikaUrl || null,
        vlasnikId: korisnik.id,
        sportIds:  selectedSportIds,
      });

      if (dodajTermine && terminDatumOd && terminDatumDo && terminCena) {
        const info = previewInfo();
        if (info) {
          setUkupnoTermina(info.ukupno);
          let kreiran = 0;
          for (const datum of info.datumi) {
            for (const slot of info.slotsPoeDanu) {
              await createTerminApi({
                objekatId: obj?.id,
                sportId:   selectedSportIds[0],
                datum:     `${datum}T00:00:00`,
                vremeOd:   slot.vremeOd + ':00',
                vremeDo:   slot.vremeDo + ':00',
                cena:      Number(terminCena),
              }).catch(() => {});
              kreiran++;
              setKreiranoTermina(kreiran);
            }
          }
        }
      }

      setUspeh(true);
    } catch (err) {
      setErrors({ server: err.message });
    } finally {
      setLoading(false);
    }
  };

  const info = previewInfo();

  if (uspeh) {
    return (
      <div className="dodaj-salu-page">
        <div className="dodaj-uspeh">
          <div className="success-icon" style={{ margin: '0 auto 1.5rem' }}>
            <FontAwesomeIcon icon={faCheck} />
          </div>
          <h2 className="how-title" style={{ marginBottom: '0.75rem' }}>Sala je postavljena!</h2>
          <p style={{ color: '#888', fontSize: 15, marginBottom: '2rem' }}>Vaša sala je uspešno dodata.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn-solid" onClick={() => navigate('/')}>Idi na početnu</button>
            <button className="btn-outline" onClick={() => { setUspeh(false); setKorak(1); }}>Dodaj još jednu</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dodaj-salu-page">
      <div className="dodaj-header">
        <div>
          <h1 className="results-title">Iznajmi svoju salu</h1>
          <p className="results-sub">Popuni detalje i počni da zarađuješ</p>
        </div>
        <button className="btn-outline" onClick={() => navigate(-1)}>← Nazad</button>
      </div>

      <div className="dodaj-koraci">
        {['Osnovno', 'Pregled', 'Termini'].map((label, i) => (
          <div key={i} className={`dodaj-korak ${korak > i + 1 ? 'done' : ''} ${korak === i + 1 ? 'active' : ''}`}>
            <div className="dodaj-korak-broj">
              {korak > i + 1 ? <FontAwesomeIcon icon={faCheck} /> : i + 1}
            </div>
            <span>{label}</span>
          </div>
        ))}
        <div className="dodaj-koraci-linija">
          <div style={{ width: `${((korak - 1) / 2) * 100}%` }} />
        </div>
      </div>

      <div className="dodaj-forma-wrap">
        {errors.server && (
          <div className="reg-opciono-info" style={{ background: '#fde8e8', borderColor: 'rgba(226,75,74,0.2)', color: '#c0392b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FontAwesomeIcon icon={faTriangleExclamation} />
            {errors.server}
          </div>
        )}

        {korak === 1 && (
          <div className="dodaj-forma">
            <h3 className="dodaj-forma-naslov">Osnovne informacije</h3>
            <div className="field-group">
              <label>Naziv sale / objekta</label>
              <div className="input-wrap">
                <FontAwesomeIcon icon={faBuilding} style={{ color: '#aaa', marginLeft: 12, marginRight: 4, flexShrink: 0 }} />
                <input type="text" placeholder="npr. SC Olimp, Teniski klub Vračar..." value={naziv}
                  onChange={e => { setNaziv(e.target.value); setErrors(er => ({...er, naziv: ''})); }}
                  className={errors.naziv ? 'error' : ''} />
              </div>
              <span className="field-error">{errors.naziv}</span>
            </div>
            <div className="field-group">
              <label>Sport(ovi)</label>
              <div className="dodaj-amenities">
                {sportovi.map(s => (
                  <button key={s.id} type="button"
                    className={`dodaj-amenity-btn${selectedSportIds.includes(s.id) ? ' active' : ''}`}
                    onClick={() => { toggleSport(s.id); setErrors(er => ({...er, sport: ''})); }}>
                    {s.naziv}
                  </button>
                ))}
              </div>
              <span className="field-error">{errors.sport}</span>
            </div>
            <div className="field-row">
              <div className="field-group">
                <label>Grad</label>
                <select value={grad} onChange={e => { setGrad(e.target.value); setErrors(er => ({...er, grad: ''})); }}
                  className={`dodaj-select${errors.grad ? ' error' : ''}`}>
                  <option value="" disabled>Izaberi grad</option>
                  {gradovi.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <span className="field-error">{errors.grad}</span>
              </div>
              <div className="field-group">
                <label>Adresa</label>
                <div className="input-wrap">
                  <FontAwesomeIcon icon={faLocationDot} style={{ color: '#aaa', marginLeft: 12, marginRight: 4, flexShrink: 0 }} />
                  <input type="text" placeholder="npr. Ulica narodnih heroja 30" value={adresa}
                    onChange={e => { setAdresa(e.target.value); setErrors(er => ({...er, adresa: ''})); }}
                    className={errors.adresa ? 'error' : ''} />
                </div>
                <span className="field-error">{errors.adresa}</span>
              </div>
            </div>
            <div className="field-group">
              <label>Opis <span style={{ color: '#bbb', fontWeight: 400 }}>(opciono)</span></label>
              <textarea className="rez-textarea" placeholder="Opišite vašu salu..." value={opis}
                onChange={e => setOpis(e.target.value)} rows={3} />
            </div>
            <div className="field-group">
              <label>URL slike <span style={{ color: '#bbb', fontWeight: 400 }}>(opciono)</span></label>
              <div className="input-wrap">
                <FontAwesomeIcon icon={faImage} style={{ color: '#aaa', marginLeft: 12, marginRight: 4, flexShrink: 0 }} />
                <input type="url" placeholder="https://i.imgur.com/..." value={slikaUrl}
                  onChange={e => setSlikaUrl(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {korak === 2 && (
          <div className="dodaj-forma">
            <h3 className="dodaj-forma-naslov">Pregled</h3>
            <div className="dodaj-summary">
              <div className="dodaj-summary-naslov">Pregled</div>
              <div className="rez-cena-row"><span>Naziv</span><strong>{naziv}</strong></div>
              <div className="rez-cena-row">
                <span>Sportovi</span>
                <strong>{sportovi.filter(s => selectedSportIds.includes(s.id)).map(s => s.naziv).join(', ')}</strong>
              </div>
              <div className="rez-cena-row"><span>Grad</span><strong>{grad}</strong></div>
              <div className="rez-cena-row"><span>Adresa</span><strong>{adresa}</strong></div>
              {opis && <div className="rez-cena-row"><span>Opis</span><strong>{opis}</strong></div>}
            </div>
          </div>
        )}

        {korak === 3 && (
          <div className="dodaj-forma">
            <h3 className="dodaj-forma-naslov">Termini</h3>

            <label className="checkbox-label" style={{ marginBottom: 16 }}>
              <input type="checkbox" checked={dodajTermine} onChange={e => setDodajTermine(e.target.checked)} />
              Dodaj termine odmah
            </label>

            {dodajTermine && (
              <>
                <div className="field-row" style={{ marginBottom: 12 }}>
                  <div className="field-group">
                    <label>Od datuma</label>
                    <input type="date" min={today} value={terminDatumOd}
                      onChange={e => { setTerminDatumOd(e.target.value); setErrors(er => ({...er, terminDatumOd: ''})); }}
                      className={`dodaj-select${errors.terminDatumOd ? ' error' : ''}`} />
                    <span className="field-error">{errors.terminDatumOd}</span>
                  </div>
                  <div className="field-group">
                    <label>Do datuma</label>
                    <input type="date" min={terminDatumOd || today} value={terminDatumDo}
                      onChange={e => { setTerminDatumDo(e.target.value); setErrors(er => ({...er, terminDatumDo: ''})); }}
                      className={`dodaj-select${errors.terminDatumDo ? ' error' : ''}`} />
                    <span className="field-error">{errors.terminDatumDo}</span>
                  </div>
                </div>

                <div className="field-group" style={{ marginBottom: 12 }}>
                  <label>Dani u nedelji</label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {DANI.map(d => (
                      <button key={d.id} type="button"
                        onClick={() => { toggleDan(d.id); setErrors(er => ({...er, dani: ''})); }}
                        style={{
                          height: 36, padding: '0 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                          cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s',
                          background: aktivniDani.includes(d.id) ? 'var(--green)' : '#f8f7f4',
                          color: aktivniDani.includes(d.id) ? 'white' : '#888',
                          border: `1.5px solid ${aktivniDani.includes(d.id) ? 'var(--green)' : '#e4e2dc'}`,
                        }}>
                        {d.label}
                      </button>
                    ))}
                  </div>
                  <span className="field-error">{errors.dani}</span>
                </div>

                <div className="field-row" style={{ marginBottom: 12 }}>
                  <div className="field-group">
                    <label>Od sata</label>
                    <select className="dodaj-select" value={terminOd} onChange={e => setTerminOd(e.target.value)}>
                      {Array.from({ length: 16 }, (_, i) => {
                        const h = String(i + 8).padStart(2, '0');
                        return <option key={h} value={String(i + 8)}>{h}:00</option>;
                      })}
                    </select>
                  </div>
                  <div className="field-group">
                    <label>Do sata</label>
                    <select className="dodaj-select" value={terminDo} onChange={e => setTerminDo(e.target.value)}>
                      {Array.from({ length: 16 }, (_, i) => {
                        const h = String(i + 8).padStart(2, '0');
                        return <option key={h} value={String(i + 8)}>{h}:00</option>;
                      })}
                    </select>
                  </div>
                </div>

                <div className="field-row" style={{ marginBottom: 12 }}>
                  <div className="field-group">
                    <label>Trajanje po terminu</label>
                    <div className="rez-sati-row">
                      <button type="button" className="rez-sati-btn" onClick={() => setTerminTrajanje(s => Math.max(1, s - 1))}>−</button>
                      <span className="rez-sati-val">{terminTrajanje} {terminTrajanje === 1 ? 'sat' : 'sata'}</span>
                      <button type="button" className="rez-sati-btn" onClick={() => setTerminTrajanje(s => Math.min(4, s + 1))}>+</button>
                    </div>
                  </div>
                  <div className="field-group">
                    <label>Cena po terminu (RSD)</label>
                    <div className="input-wrap">
                      <FontAwesomeIcon icon={faMoneyBill} style={{ color: '#aaa', marginLeft: 12, marginRight: 4, flexShrink: 0 }} />
                      <input type="number" min="1" placeholder="npr. 2500" value={terminCena}
                        onChange={e => { setTerminCena(e.target.value); setErrors(er => ({...er, terminCena: ''})); }}
                        className={errors.terminCena ? 'error' : ''} />
                    </div>
                    <span className="field-error">{errors.terminCena}</span>
                  </div>
                </div>

                {info && info.ukupno > 0 && (
                  <div style={{ background: '#f8f7f4', border: '1.5px solid #e4e2dc', borderRadius: 12, padding: '1rem', marginTop: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
                      Pregled rasporeda
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ fontSize: 13, color: '#555', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <FontAwesomeIcon icon={faCalendarDays} style={{ color: '#888' }} />
                        <strong>{info.datumi.length}</strong> {info.datumi.length === 1 ? 'dan' : 'dana'}
                        {' • '}
                        <FontAwesomeIcon icon={faClock} style={{ color: '#888' }} />
                        <strong>{info.slotsPoeDanu.length}</strong> termina po danu
                        {' • '}
                        ukupno <strong style={{ color: 'var(--green)' }}>{info.ukupno}</strong> termina
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {info.slotsPoeDanu.map((t, i) => (
                          <span key={i} style={{ background: '#E1F5EE', color: '#1D9E75', fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 50 }}>
                            {t.vremeOd} – {t.vremeDo}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {errors.terminOpseg && <span className="field-error">{errors.terminOpseg}</span>}

                {loading && ukupnoTermina > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>
                      Kreiranje termina... {kreiranoTermina}/{ukupnoTermina}
                    </div>
                    <div style={{ height: 6, background: '#e4e2dc', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: 'var(--green)', borderRadius: 3, width: `${(kreiranoTermina / ukupnoTermina) * 100}%`, transition: 'width 0.2s' }} />
                    </div>
                  </div>
                )}
              </>
            )}

            {!dodajTermine && (
              <div className="reg-opciono-info" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FontAwesomeIcon icon={faCircleInfo} style={{ color: '#3b82f6', flexShrink: 0 }} />
                Termine možete dodati kasnije iz vašeg dashboard-a.
              </div>
            )}
          </div>
        )}

        <div className="dodaj-nav">
          {korak > 1 && (
            <button className="btn-outline" onClick={() => setKorak(k => k - 1)} disabled={loading}>← Nazad</button>
          )}
          {korak < 3 ? (
            <button className="btn-solid" onClick={sledeciKorak} style={{ marginLeft: 'auto' }}>Dalje →</button>
          ) : (
            <button className="btn-solid" onClick={handleSubmit} disabled={loading} style={{ marginLeft: 'auto' }}>
              {loading ? `Postavljanje... (${kreiranoTermina}/${ukupnoTermina})` : 'Postavi salu'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}