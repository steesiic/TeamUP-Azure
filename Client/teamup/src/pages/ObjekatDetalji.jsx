import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getObjekatApi } from '../api/objekti';
import { getTerminiApi, updateTerminApi, deleteTerminApi } from '../api/termini';
import { getRezervacijeApi, joinTerminApi } from '../api/rezervacije';
import { getOceneApi, createOcenaApi, updateOcenaApi } from '../api/ocene';
import { useToast } from '../hooks/useToast';
import { TerminObjekatSkeleton } from '../components/Skeleton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLocationDot, faMoneyBill, faPen, faTrash, faUsers,
  faCrown, faMagnifyingGlass, faCalendarDays, faClock,
  faXmark, faTriangleExclamation, faCheck, faHourglass,
  faCircleCheck, faCircle,
} from '@fortawesome/free-solid-svg-icons';

const today = new Date().toISOString().split('T')[0];
const SVI_SLOTOVI = Array.from({ length: 16 }, (_, i) => String(i + 8).padStart(2, '0'));

const SLOT_STIL = {
  Slobodan:   { bg: '#E8F8F1', border: '#A8E6CC', boja: '#1D9E75', tekst: 'Slobodan',     ikona: '🟢' },
  Rezervisan: { bg: '#FEF3E2', border: '#F5CC84', boja: '#D97706', tekst: 'Rezervisan',   ikona: '🟡' },
  Otkazan:    { bg: '#FEE8E8', border: '#F5A8A8', boja: '#E24B4A', tekst: 'Otkazan',      ikona: '🔴' },
  Zavrsen:    { bg: '#F1EFE8', border: '#D3D1C7', boja: '#888',    tekst: 'Završen',      ikona: '⏹' },
  Prazan:     { bg: '#F8F7F4', border: '#E4E2DC', boja: '#ccc',    tekst: 'Nema termina', ikona: '⚪' },
};

function formatDatum(datumStr) {
  if (!datumStr) return '';
  const d = new Date(datumStr);
  const meseci = ['jan','feb','mar','apr','maj','jun','jul','avg','sep','okt','nov','dec'];
  return `${d.getDate()}. ${meseci[d.getMonth()]} ${d.getFullYear()}.`;
}

function trajanjeLabel(vremeOd, vremeDo) {
  if (!vremeOd || !vremeDo) return '';
  const [h1] = vremeOd.split(':').map(Number);
  const [h2] = vremeDo.split(':').map(Number);
  const sati = h2 - h1;
  return sati === 1 ? '1 sat' : `${sati} sata`;
}

function jeTerminProsao(termin) {
  if (!termin?.datum || !termin?.vremeOd) return false;
  const datumDeo = termin.datum.split('T')[0];
  const pocetakTermina = new Date(`${datumDeo}T${termin.vremeOd}`);
  return pocetakTermina < new Date();
}

function StarRating({ vrednost, onChange, readOnly = false }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i}
          onClick={() => !readOnly && onChange && onChange(i)}
          onMouseEnter={() => !readOnly && setHover(i)}
          onMouseLeave={() => !readOnly && setHover(0)}
          style={{
            fontSize: readOnly ? 16 : 28,
            cursor: readOnly ? 'default' : 'pointer',
            color: i <= (hover || vrednost) ? '#F5A623' : '#ddd',
            transition: 'color 0.1s',
            lineHeight: 1,
          }}>★</span>
      ))}
    </div>
  );
}

function OceneSekcija({ objekatId, korisnik, jeVlasnik, ocene, loadingOcene, onPromenaOcena }) {
  const { showToast } = useToast();
  const [mojaOcena, setMojaOcena] = useState(null);
  const [editMode,  setEditMode]  = useState(false);
  const [vrednost,  setVrednost]  = useState(5);
  const [komentar,  setKomentar]  = useState('');
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    if (korisnik) {
      const moja = ocene.find(o => o.igracId === korisnik.id);
      setMojaOcena(moja ?? null);
      if (moja) { setVrednost(moja.vrednost); setKomentar(moja.komentar ?? ''); }
    }
  }, [ocene, korisnik]);

  const prosek = ocene.length > 0
    ? (ocene.reduce((s, o) => s + o.vrednost, 0) / ocene.length).toFixed(1)
    : null;

  const handleSacuvaj = async () => {
    setSaving(true);
    try {
      if (mojaOcena) {
        await updateOcenaApi(mojaOcena.id, { vrednost, komentar: komentar || null });
        showToast('✅ Ocena izmenjena!');
      } else {
        await createOcenaApi({ objekatId, igracId: korisnik.id, vrednost, komentar: komentar || null });
        showToast('✅ Ocena dodata!');
      }
      setEditMode(false);
      onPromenaOcena();
    } catch (err) {
      showToast(`⚠️ ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid #eee' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 18, fontWeight: 700, margin: 0 }}>Ocene</h3>
        {prosek && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <StarRating vrednost={Math.round(Number(prosek))} readOnly />
            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 20, fontWeight: 700, color: '#F5A623' }}>{prosek}</span>
            <span style={{ fontSize: 13, color: '#aaa' }}>({ocene.length} {ocene.length === 1 ? 'ocena' : 'ocena'})</span>
          </div>
        )}
        {!prosek && !loadingOcene && (
          <span style={{ fontSize: 13, color: '#aaa' }}>Još nema ocena</span>
        )}
      </div>

      {korisnik && !jeVlasnik && korisnik.role !== 'Vlasnik' && (
        <div style={{ background: '#f8f7f4', border: '1.5px solid #e4e2dc', borderRadius: 14, padding: '1.25rem', marginBottom: '1.5rem' }}>
          {!editMode && !mojaOcena ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <span style={{ fontSize: 14, color: '#666' }}>Ocenite ovaj objekat</span>
              <button onClick={() => setEditMode(true)}
                style={{ height: 36, padding: '0 16px', background: 'var(--green)', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                ★ Dodaj ocenu
              </button>
            </div>
          ) : !editMode && mojaOcena ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>Vaša ocena</div>
                <StarRating vrednost={mojaOcena.vrednost} readOnly />
                {mojaOcena.komentar && <div style={{ fontSize: 13, color: '#666', marginTop: 6 }}>{mojaOcena.komentar}</div>}
              </div>
              <button onClick={() => setEditMode(true)}
                style={{ height: 36, padding: '0 16px', background: 'white', color: '#1D9E75', border: '1.5px solid #A8E6CC', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FontAwesomeIcon icon={faPen} />Izmeni
              </button>
            </div>
          ) : (
            <div>
              <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                {mojaOcena ? 'Izmeni ocenu' : 'Nova ocena'}
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 6 }}>Ocena</label>
                <StarRating vrednost={vrednost} onChange={setVrednost} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, color: '#888', display: 'block', marginBottom: 6 }}>Komentar (opciono)</label>
                <textarea value={komentar} onChange={e => setKomentar(e.target.value)}
                  placeholder="Opišite vaše iskustvo..."
                  style={{ width: '100%', border: '1.5px solid #e4e2dc', borderRadius: 10, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', resize: 'vertical', minHeight: 72, background: 'white', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setEditMode(false)}
                  style={{ flex: 1, height: 40, background: 'white', border: '1.5px solid #e4e2dc', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', color: '#666' }}>
                  Otkaži
                </button>
                <button onClick={handleSacuvaj} disabled={saving}
                  style={{ flex: 2, height: 40, background: 'var(--green)', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Čuvanje...' : 'Sačuvaj ocenu'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {loadingOcene ? (
        <div style={{ color: '#aaa', fontSize: 13 }}>Učitavanje ocena...</div>
      ) : ocene.length === 0 ? (
        <div style={{ color: '#aaa', fontSize: 13 }}>Budite prvi koji će oceniti ovaj objekat.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {ocene.map(o => (
            <div key={o.id} style={{ background: 'white', border: '1.5px solid #e4e2dc', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--green)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
                    {o.igracIme?.[0]}{o.igracPrezime?.[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{o.igracIme} {o.igracPrezime}</div>
                    <div style={{ fontSize: 11, color: '#aaa' }}>{formatDatum(o.datumOcene)}</div>
                  </div>
                </div>
                <StarRating vrednost={o.vrednost} readOnly />
              </div>
              {o.komentar && <div style={{ fontSize: 13, color: '#666', marginTop: 6 }}>{o.komentar}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Breadcrumb({ naziv }) {
  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#aaa', marginBottom: 16 }}>
      <Link to="/" style={{ color: '#aaa', textDecoration: 'none' }}
        onMouseEnter={e => e.target.style.color = 'var(--green)'}
        onMouseLeave={e => e.target.style.color = '#aaa'}>Početna</Link>
      <span>›</span>
      <Link to="/rezultati" style={{ color: '#aaa', textDecoration: 'none' }}
        onMouseEnter={e => e.target.style.color = 'var(--green)'}
        onMouseLeave={e => e.target.style.color = '#aaa'}>Rezultati</Link>
      <span>›</span>
      <span style={{ color: '#1a1a1a', fontWeight: 500 }}>{naziv}</span>
    </nav>
  );
}

function EditTerminModal({ termin, onClose, onSave, showToast }) {
  const [cena,    setCena]    = useState(String(termin.cena ?? ''));
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  const handleSave = async (e) => {
    e.preventDefault();
    const err = {};
    if (!cena || Number(cena) < 1) err.cena = 'Unesite cenu';
    if (Object.keys(err).length) { setErrors(err); return; }

    setLoading(true);
    try {
      await updateTerminApi(termin.id, { id: termin.id, cena: Number(cena) });
      showToast('✅ Termin uspešno izmenjen!');
      onSave();
      onClose();
    } catch (err) {
      showToast(`⚠️ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal-overlay active" onClick={onClose} style={{ zIndex: 800 }} />
      <div className="modal active" role="dialog" onClick={e => e.stopPropagation()}
        style={{ maxWidth: 380, width: '95%', padding: '2rem', zIndex: 900 }}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 className="modal-title">Uredi termin</h2>
        <p className="modal-sub" style={{ color: '#888', fontSize: 13, marginBottom: '1.5rem' }}>
          {formatDatum(termin.datum)} · {termin.vremeOd?.slice(0,5)}–{termin.vremeDo?.slice(0,5)}
        </p>
        <form onSubmit={handleSave} noValidate>
          <div className="field-group">
            <label>Cena (RSD)</label>
            <div className="input-wrap">
              <FontAwesomeIcon icon={faMoneyBill} style={{ color: '#aaa', marginLeft: 10 }} />
              <input type="number" min="1" placeholder="npr. 2500" value={cena}
                onChange={e => { setCena(e.target.value); setErrors(er => ({...er, cena: ''})); }}
                className={errors.cena ? 'error' : ''} />
            </div>
            <span className="field-error">{errors.cena}</span>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: '1.5rem' }}>
            <button type="button" className="btn-outline" style={{ flex: 1 }}
              onClick={onClose} disabled={loading}>Otkaži</button>
            <button type="submit" className="modal-btn" style={{ flex: 2 }} disabled={loading}>
              {loading ? 'Čuvanje...' : 'Sačuvaj izmene'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function DeleteTerminConfirm({ termin, onClose, onSave, showToast }) {
  const [loading, setLoading] = useState(false);

  const handleObrisi = async () => {
    setLoading(true);
    try {
      await deleteTerminApi(termin.id);
      showToast('✅ Termin obrisan!');
      onSave();
      onClose();
    } catch (err) {
      showToast(`⚠️ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal-overlay active" onClick={onClose} style={{ zIndex: 800 }} />
      <div className="modal active" role="dialog" onClick={e => e.stopPropagation()}
        style={{ maxWidth: 380, textAlign: 'center', padding: '2.5rem 2rem', zIndex: 900 }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#fde8e8', color: '#E24B4A', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
          <FontAwesomeIcon icon={faTrash} />
        </div>
        <h2 className="modal-title">Obriši termin</h2>
        <p className="modal-sub">
          {formatDatum(termin.datum)} · {termin.vremeOd?.slice(0,5)}–{termin.vremeDo?.slice(0,5)}
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: '1.5rem' }}>
          <button className="btn-outline" style={{ flex: 1 }} onClick={onClose} disabled={loading}>Otkaži</button>
          <button style={{ flex: 1, height: 48, background: '#E24B4A', color: 'white', border: 'none', borderRadius: 12, fontFamily: 'DM Sans, sans-serif', fontSize: 15, fontWeight: 500, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
            onClick={handleObrisi} disabled={loading}>
            {loading ? 'Brisanje...' : 'Da, obriši'}
          </button>
        </div>
      </div>
    </>
  );
}

export default function ObjekatDetalji({ onOtvoriTermin, onRezervisi }) {
  const { id }         = useParams();
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const { korisnik }   = useAuth();
  const { showToast }  = useToast();

  const urlDatum = searchParams.get('datum') || today;

  const [objekat,       setObjekat]       = useState(null);
  const [termini,       setTermini]       = useState([]);
  const [rezervacije,   setRezervacije]   = useState([]);
  const [ocene,         setOcene]         = useState([]);
  const [loadingOcene,  setLoadingOcene]  = useState(true);
  const [loading,       setLoading]       = useState(true);
  const [greska,        setGreska]        = useState('');
  const [filterSat,     setFilterSat]     = useState('');
  const [filterDatum,   setFilterDatum]   = useState(urlDatum);
  const [tempDatum,     setTempDatum]     = useState(urlDatum);
  const [akcija,        setAkcija]        = useState(null);
  const [loadingAkcija, setLoadingAkcija] = useState(false);
  const [editTermin,    setEditTermin]    = useState(null);
  const [deleteTermin,  setDeleteTermin]  = useState(null);

  const [statusFilteri, setStatusFilteri] = useState({
    Slobodan: true, Rezervisan: true, Otkazan: true, Zavrsen: true, Prazan: true,
  });

  const ucitajTermine = async (datum = '') => {
    const search = { objekatId: id, perPage: 100 };
    if (datum) search.datum = datum;
    const [term, rez] = await Promise.all([
      getTerminiApi(search),
      getRezervacijeApi({ perPage: 100 }),
    ]);
    setTermini(term.data ?? term.items ?? []);
    setRezervacije(rez.data ?? rez.items ?? []);
  };

  const ucitajOcene = async () => {
    setLoadingOcene(true);
    try {
      const data = await getOceneApi(id);
      setOcene(data);
    } catch {
      // tiho ignorisemo
    } finally {
      setLoadingOcene(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    const terminSearch = { objekatId: id, perPage: 100 };
    if (urlDatum) terminSearch.datum = urlDatum;
    Promise.all([
      getObjekatApi(id),
      getTerminiApi(terminSearch),
      getRezervacijeApi({ perPage: 100 }),
      getOceneApi(id),
    ])
      .then(([obj, term, rez, oc]) => {
        setObjekat(obj);
        setTermini(term.data ?? term.items ?? []);
        setRezervacije(rez.data ?? rez.items ?? []);
        setOcene(oc);
      })
      .catch(() => setGreska('Greška pri učitavanju podataka.'))
      .finally(() => { setLoading(false); setLoadingOcene(false); });
  }, [id]);

  const handleDatumFilter = async (datum) => {
    setFilterDatum(datum);
    setTempDatum(datum);
    setFilterSat('');
    const params = new URLSearchParams(searchParams);
    if (datum) params.set('datum', datum);
    else params.delete('datum');
    navigate(`?${params.toString()}`, { replace: true });
    setLoading(true);
    try { await ucitajTermine(datum); }
    finally { setLoading(false); }
  };

  const getRezervacijaZaTermin = (terminId) =>
    rezervacije.find(r => r.termin?.id === terminId && r.status === 'Aktivna');

  const vecPridruzen = (rezervacija) => {
    if (!korisnik || !rezervacija) return false;
    return rezervacija.igraci?.some(i => i.igracId === korisnik.id) ||
           rezervacija.glavniIgracId === korisnik.id;
  };

  const jeVlasnik = objekat && korisnik && objekat.vlasnikId === korisnik.id;

  const handleRezervisi = (termin) => {
    if (!korisnik) { showToast('⚠️ Morate se prijaviti da biste rezervisali termin.'); return; }
    onRezervisi({ ...objekat, _selectedTerminId: termin.id }, () => ucitajTermine(filterDatum));
  };

  const handlePridruzi = async (rezervacija) => {
    if (!korisnik) { showToast('⚠️ Morate se prijaviti da biste se pridružili terminu.'); return; }
    setAkcija({ terminId: rezervacija.termin?.id, type: 'pridruzi' });
    setLoadingAkcija(true);
    try {
      await joinTerminApi(rezervacija.id, korisnik.id);
      await ucitajTermine(filterDatum);
      showToast('✅ Uspešno ste poslali zahtev! Čekate odobrenje.');
    } catch (err) { showToast(`⚠️ ${err.message}`); }
    finally { setLoadingAkcija(false); setAkcija(null); }
  };

  const filtriraniTermini = termini.filter(t =>
    (!filterSat || t.vremeOd?.slice(0, 2) === filterSat) &&
    (!filterDatum || t.datum?.startsWith(filterDatum))
  );

  const terminPoSlotu = {};
  filtriraniTermini.forEach(t => {
    const sat = t.vremeOd?.slice(0, 2);
    if (sat) terminPoSlotu[sat] = t;
  });

  const vidljiviSlotovi = SVI_SLOTOVI.filter(sat => {
    const termin = terminPoSlotu[sat];
    if (!termin) return statusFilteri.Prazan;
    const prosao = jeTerminProsao(termin);
    if (prosao && (termin.status === 'Slobodan' || termin.status === 'Rezervisan')) {
      return statusFilteri.Zavrsen;
    }
    return statusFilteri[termin.status ?? 'Slobodan'];
  });

  const prosekHeader = ocene.length > 0
    ? (ocene.reduce((s, o) => s + o.vrednost, 0) / ocene.length).toFixed(1)
    : null;

  if (loading) {
    return (
      <div className="results-page">
        <div style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '1.5rem 2rem' }}>
          <div style={{ height: 13, width: 200, background: '#f0ede8', borderRadius: 6, marginBottom: 16 }} />
          <div style={{ height: 28, width: 300, background: '#f0ede8', borderRadius: 8, marginBottom: 8 }} />
          <div style={{ height: 14, width: 180, background: '#f0ede8', borderRadius: 6 }} />
        </div>
        <div className="results-main" style={{ padding: '1.5rem 3rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {[1, 2, 3, 4].map(i => <TerminObjekatSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (greska || !objekat) {
    return (
      <div className="results-page">
        <div className="empty-state">
          <div className="empty-icon" style={{ color: '#E24B4A', fontSize: 32 }}>
            <FontAwesomeIcon icon={faTriangleExclamation} />
          </div>
          <h3>Greška</h3>
          <p>{greska || 'Objekat nije pronađen.'}</p>
          <button className="modal-btn" onClick={() => navigate('/rezultati')} style={{ width: 'auto', padding: '0 2rem', marginTop: '1rem' }}>← Nazad</button>
        </div>
      </div>
    );
  }

  return (
    <div className="results-page">
      <div style={{ background: '#fff', borderBottom: '1px solid #eee' }}>
        {objekat.slikaUrl && (
          <div style={{
            width: '100%', height: 280, overflow: 'hidden',
            backgroundImage: `url(${objekat.slikaUrl})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
          }} />
        )}
        <div style={{ padding: '1.5rem 2rem' }}>
          <Breadcrumb naziv={objekat.naziv} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 className="results-title" style={{ marginBottom: 4 }}>{objekat.naziv}</h1>
              <p style={{ color: '#888', fontSize: 14, margin: 0 }}>
                <FontAwesomeIcon icon={faLocationDot} style={{ marginRight: 4 }} />
                {objekat.adresa}
              </p>
              {objekat.opis && <p style={{ color: '#666', fontSize: 14, marginTop: 6 }}>{objekat.opis}</p>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                {objekat.sportovi?.map(s => <span key={s} className="amenity">{s}</span>)}
                {prosekHeader && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: '#F5A623' }}>
                    ★ {prosekHeader}
                    <span style={{ fontSize: 12, color: '#aaa', fontWeight: 400 }}>
                      ({ocene.length} {ocene.length === 1 ? 'ocena' : 'ocena'})
                    </span>
                  </span>
                )}
              </div>
            </div>
            <div style={{ fontSize: 13, color: '#aaa' }}>Vlasnik: {objekat.vlasnikIme} {objekat.vlasnikPrezime}</div>
          </div>
        </div>
      </div>

      <div className="results-main" style={{ padding: '1.5rem 2rem' }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="sf--light" style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: '0 14px', height: '40px', flex: 'none' }}>
            <FontAwesomeIcon icon={faCalendarDays} style={{ fontSize: 12, color: '#aaa' }} />
            <span style={{ fontSize: 12, color: '#aaa', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.8px', whiteSpace: 'nowrap' }}>Datum</span>
            <input type="date" value={tempDatum} min={today}
              onChange={e => setTempDatum(e.target.value)}
              style={{ background: 'none', border: 'none', outline: 'none', fontSize: '14px', color: tempDatum ? '#1a1a1a' : '#bbb', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
            />
            {tempDatum && (
              <button onClick={() => { setTempDatum(''); handleDatumFilter(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 14, lineHeight: 1, padding: '0 4px' }}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            )}
          </div>

          {tempDatum !== filterDatum && tempDatum && (
            <button onClick={() => handleDatumFilter(tempDatum)} className="search-btn--light"
              style={{ height: '40px', borderRadius: '10px', padding: '0 16px', fontSize: 13 }}>
              Primeni →
            </button>
          )}

          <div className="sf--light" style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: '0 14px', height: '40px', flex: 'none', minWidth: 150 }}>
            <FontAwesomeIcon icon={faClock} style={{ fontSize: 12, color: '#aaa' }} />
            <select value={filterSat} onChange={e => setFilterSat(e.target.value)}
              style={{ background: 'none', border: 'none', outline: 'none', fontSize: '14px', color: filterSat ? '#1a1a1a' : '#aaa', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', flex: 1 }}>
              <option value="">Sve satnice</option>
              {Array.from({ length: 16 }, (_, i) => {
                const h = String(i + 8).padStart(2, '0');
                return <option key={h} value={h}>{h}:00</option>;
              })}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>Prikaži:</span>
          {Object.entries(SLOT_STIL).map(([key, val]) => (
            <label key={key} style={{
              display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
              background: statusFilteri[key] ? val.bg : '#f8f7f4',
              border: `1.5px solid ${statusFilteri[key] ? val.border : '#e4e2dc'}`,
              borderRadius: 50, padding: '5px 12px', fontSize: 12, fontWeight: 500,
              color: statusFilteri[key] ? val.boja : '#aaa',
              transition: 'all 0.2s', userSelect: 'none',
            }}>
              <input type="checkbox" checked={statusFilteri[key]}
                onChange={() => setStatusFilteri(prev => ({ ...prev, [key]: !prev[key] }))}
                style={{ display: 'none' }} />
              {val.ikona} {val.tekst}
            </label>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }} className="termini-slot-grid">
          {vidljiviSlotovi.map(sat => {
            const termin   = terminPoSlotu[sat];
            const rez      = termin ? getRezervacijaZaTermin(termin.id) : null;
            const prosao   = termin && jeTerminProsao(termin);
            const prikazujKaoZavrsen = prosao && (termin.status === 'Slobodan' || termin.status === 'Rezervisan');
            const stil     = termin
              ? (prikazujKaoZavrsen ? SLOT_STIL.Zavrsen : (SLOT_STIL[termin.status] ?? SLOT_STIL.Prazan))
              : SLOT_STIL.Prazan;
            const jeVec    = vecPridruzen(rez);
            const loading_ = loadingAkcija && akcija?.terminId === termin?.id;
            const odobreni = rez?.igraci?.filter(i => i.status === 'Prihvacen') ?? [];

            return (
              <div key={sat} style={{
                background: stil.bg, border: `1.5px solid ${stil.border}`,
                borderRadius: 14, padding: '14px 16px', display: 'flex',
                flexDirection: 'column', gap: 10, opacity: !termin ? 0.45 : 1, transition: 'all 0.2s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 20, fontWeight: 700, color: stil.boja, lineHeight: 1 }}>
                    {sat}:00
                    {termin && (
                      <span style={{ fontSize: 11, fontWeight: 400, color: '#aaa', marginLeft: 6 }}>
                        {trajanjeLabel(termin.vremeOd, termin.vremeDo)}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: stil.boja, background: 'rgba(255,255,255,0.7)', padding: '3px 8px', borderRadius: 50, border: `1px solid ${stil.border}` }}>
                    {stil.ikona} {stil.tekst}
                  </span>
                </div>

                {termin ? (
                  <div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 2 }}>
                      {rez?.sportNaziv ? (
                        <span style={{ fontSize: 11, fontWeight: 600, background: '#f1efe8', color: '#555', padding: '2px 8px', borderRadius: 50 }}>
                          {rez.sportNaziv}
                        </span>
                      ) : (
                        objekat.sportovi?.map(s => (
                          <span key={s} style={{ fontSize: 11, fontWeight: 600, background: '#f1efe8', color: '#555', padding: '2px 8px', borderRadius: 50 }}>{s}</span>
                        ))
                      )}
                    </div>
                    {filterDatum && <div style={{ fontSize: 11, color: '#aaa' }}>
                      <FontAwesomeIcon icon={faCalendarDays} style={{ marginRight: 4 }} />
                      {formatDatum(filterDatum)}
                    </div>}
                    {rez && (
                      <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                        <FontAwesomeIcon icon={faCrown} style={{ marginRight: 4, color: '#B87514' }} />
                        {rez.glavniIgracIme} {rez.glavniIgracPrezime}
                        {' • '}
                        <span style={{ color: stil.boja }}>{odobreni.length}/{rez.maxIgraca} igrača</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: '#ccc' }}>Nema termina</div>
                )}

                {termin && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', flexWrap: 'wrap', gap: 6 }}>
                    <div>
                      <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>
                        {Number(termin.cena).toLocaleString()}
                      </span>
                      <span style={{ fontSize: 11, color: '#aaa', marginLeft: 3 }}>RSD</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {jeVlasnik && termin.status === 'Slobodan' && !prosao && (
                        <>
                          <button onClick={() => setEditTermin(termin)}
                            style={{ height: 30, padding: '0 10px', background: 'white', color: '#1D9E75', border: '1.5px solid #A8E6CC', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FontAwesomeIcon icon={faPen} />Uredi
                          </button>
                          <button onClick={() => setDeleteTermin(termin)}
                            style={{ height: 30, padding: '0 10px', background: 'white', color: '#E24B4A', border: '1.5px solid #F5A8A8', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FontAwesomeIcon icon={faTrash} />Obriši
                          </button>
                        </>
                      )}
                      {!jeVlasnik && termin.status === 'Slobodan' && !prosao && (
                        <button onClick={() => handleRezervisi(termin)}
                          style={{ height: 30, padding: '0 12px', background: 'var(--green)', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                          + Rezerviši
                        </button>
                      )}
                      {termin.status === 'Rezervisan' && rez && !jeVec && !jeVlasnik && !prosao && (
                        <button onClick={() => handlePridruzi(rez)} disabled={loading_}
                          style={{ height: 30, padding: '0 10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', opacity: loading_ ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                          {loading_ ? '...' : <><FontAwesomeIcon icon={faUsers} />Pridruži</>}
                        </button>
                      )}
                      {termin.status === 'Rezervisan' && rez && jeVec && (() => {
                        const mojStatus = rez.igraci?.find(i => i.igracId === korisnik?.id)?.status
                          ?? (rez.glavniIgracId === korisnik?.id ? 'Prihvacen' : null);
                        if (mojStatus === 'Prihvacen')
                          return <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FontAwesomeIcon icon={faCheck} />U terminu
                          </span>;
                        if (mojStatus === 'CekaPotvrdu')
                          return <span style={{ fontSize: 11, color: '#D97706', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FontAwesomeIcon icon={faHourglass} />Čeka odobrenje
                          </span>;
                        return null;
                      })()}
                      {rez && (
                        <button onClick={() => onOtvoriTermin(rez, null, () => ucitajTermine(filterDatum))}
                          style={{ height: 30, padding: '0 10px', background: 'rgba(255,255,255,0.8)', border: `1px solid ${stil.border}`, borderRadius: 6, fontSize: 11, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', color: '#666' }}>
                          Detalji →
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {vidljiviSlotovi.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon" style={{ color: '#aaa', fontSize: 32 }}>
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </div>
            <h3>Nema rezultata</h3>
            <p>Prilagodite filtere da vidite termine.</p>
          </div>
        )}
      </div>

      <OceneSekcija
        objekatId={Number(id)}
        korisnik={korisnik}
        jeVlasnik={jeVlasnik}
        ocene={ocene}
        loadingOcene={loadingOcene}
        onPromenaOcena={ucitajOcene}
      />

      {editTermin && (
        <EditTerminModal
          termin={editTermin}
          onClose={() => setEditTermin(null)}
          onSave={() => ucitajTermine(filterDatum)}
          showToast={showToast}
        />
      )}

      {deleteTermin && (
        <DeleteTerminConfirm
          termin={deleteTermin}
          onClose={() => setDeleteTermin(null)}
          onSave={() => ucitajTermine(filterDatum)}
          showToast={showToast}
        />
      )}

      <style>{`
        @media (max-width: 900px) { .termini-slot-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 580px) { .termini-slot-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}