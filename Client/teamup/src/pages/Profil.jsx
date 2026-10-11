import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserApi, updateUserApi, deleteUserApi } from '../api/users';
import { getOceneIgracaApi } from '../api/oceneIgraca';
import { getRezervacijeApi } from '../api/rezervacije';
import { useToast } from '../hooks/useToast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck, faCalendarDays, faBuilding, faTriangleExclamation,
  faTrash, faPen, faMobileScreen, faLock, faEye, faEyeSlash,
  faMars, faVenus, faGenderless,
} from '@fortawesome/free-solid-svg-icons';

function StarRating({ vrednost, readOnly = true, size = 18 }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{
          fontSize: size, lineHeight: 1,
          color: i <= vrednost ? '#F5A623' : '#ddd',
        }}>★</span>
      ))}
    </div>
  );
}

function StatistikaSekcija({ userId, role }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (role !== 'Igrac') return;
    Promise.all([
      getRezervacijeApi({ glavniIgracId: userId, perPage: 100 }),
      getRezervacijeApi({ igracId: userId, perPage: 100 }),
    ]).then(([glavne, igrac]) => {
      const sve = [
        ...(glavne.data ?? glavne.items ?? []),
        ...(igrac.data ?? igrac.items ?? []).filter(r => r.glavniIgracId !== userId),
      ];
      const zavrsene = sve.filter(r => r.status === 'Zavrsena').length;
      const aktivne  = sve.filter(r => r.status === 'Aktivna').length;
      setStats({ zavrsene, aktivne, ukupno: sve.length });
    }).catch(() => {});
  }, [userId, role]);

  if (!stats || role !== 'Igrac') return null;

  return (
    <div style={{ background: 'white', border: '1.5px solid #e8e6e0', borderRadius: 18, padding: '1.5rem 2rem', marginBottom: '1.5rem' }}>
      <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: '1rem' }}>Statistika</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { broj: stats.zavrsene, label: 'Odigranih termina', ikona: faCheck,        boja: '#1D9E75' },
          { broj: stats.aktivne,  label: 'Aktivnih termina',  ikona: faCalendarDays, boja: '#3b82f6' },
          { broj: stats.ukupno,   label: 'Ukupno termina',    ikona: faBuilding,     boja: '#888'    },
        ].map(s => (
          <div key={s.label} style={{ background: '#f8f7f4', border: '1.5px solid #e4e2dc', borderRadius: 12, padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: 20, marginBottom: 6, color: s.boja }}>
              <FontAwesomeIcon icon={s.ikona} />
            </div>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 22, fontWeight: 700, color: 'var(--green)' }}>{s.broj}</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OceneSekcija({ userId }) {
  const [ocene,   setOcene]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOceneIgracaApi(userId)
      .then(data => setOcene(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const prosek = ocene.length > 0
    ? (ocene.reduce((s, o) => s + o.vrednost, 0) / ocene.length).toFixed(1)
    : null;

  if (loading) return null;
  if (ocene.length === 0) return (
    <div style={{ background: 'white', border: '1.5px solid #e8e6e0', borderRadius: 18, padding: '1.5rem 2rem', marginBottom: '1.5rem' }}>
      <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Ocene igrača</h3>
      <p style={{ color: '#aaa', fontSize: 13 }}>Još nema ocena.</p>
    </div>
  );

  return (
    <div style={{ background: 'white', border: '1.5px solid #e8e6e0', borderRadius: 18, padding: '1.5rem 2rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 18, fontWeight: 700, margin: 0 }}>Ocene igrača</h3>
        {prosek && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <StarRating vrednost={Math.round(Number(prosek))} />
            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 20, fontWeight: 700, color: '#F5A623' }}>{prosek}</span>
            <span style={{ fontSize: 13, color: '#aaa' }}>({ocene.length} {ocene.length === 1 ? 'ocena' : 'ocena'})</span>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ocene.map(o => (
          <div key={o.id} style={{ background: '#f8f7f4', border: '1.5px solid #e4e2dc', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--green)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, fontFamily: 'Poppins, sans-serif' }}>
                  {o.ocenioIme?.[0]}{o.ocenioPrezime?.[0]}
                </div>
                <Link
                  to={`/profil/${o.ocenioId}`}
                  style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--green)'}
                  onMouseLeave={e => e.currentTarget.style.color = '#1a1a1a'}
                >
                  {o.ocenioIme} {o.ocenioPrezime}
                </Link>
              </div>
              <StarRating vrednost={o.vrednost} size={14} />
            </div>
            {o.komentar && <p style={{ fontSize: 13, color: '#666', margin: 0 }}>{o.komentar}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function ConfirmModal({ naslov, tekst, onPotvrdi, onOtkazi, loading }) {
  return (
    <>
      <div className="modal-overlay active" onClick={onOtkazi} style={{ zIndex: 800 }} />
      <div className="modal active" role="dialog" onClick={e => e.stopPropagation()}
        style={{ maxWidth: 400, textAlign: 'center', padding: '2.5rem 2rem', zIndex: 900 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fde8e8', color: '#E24B4A', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
          <FontAwesomeIcon icon={faTriangleExclamation} />
        </div>
        <h2 className="modal-title">{naslov}</h2>
        <p className="modal-sub" style={{ marginBottom: '1.75rem' }}>{tekst}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-outline" style={{ flex: 1 }} onClick={onOtkazi} disabled={loading}>Otkaži</button>
          <button style={{ flex: 1, height: 48, background: '#E24B4A', color: 'white', border: 'none', borderRadius: 12, fontFamily: 'DM Sans, sans-serif', fontSize: 15, fontWeight: 500, cursor: 'pointer', opacity: loading ? 0.7 : 1 }} onClick={onPotvrdi} disabled={loading}>
            {loading ? 'Brisanje...' : 'Da, obriši'}
          </button>
        </div>
      </div>
    </>
  );
}

function EditProfilModal({ korisnikId, podaci, onClose, onSave }) {
  const { azurirajProfil } = useAuth();
  const { showToast } = useToast();
  const [saving,   setSaving]   = useState(false);
  const [errors,   setErrors]   = useState({});
  const [pocetno]  = useState(podaci);
  const [aktivnaTabela, setAktivnaTabela] = useState('profil');

  const today = new Date().toISOString().split('T')[0];

  const [ime,           setIme]           = useState(podaci.ime ?? '');
  const [prezime,       setPrezime]       = useState(podaci.prezime ?? '');
  const [telefon,       setTelefon]       = useState(podaci.telefon ?? '');
  const [pol,           setPol]           = useState(podaci.pol ?? '');
  const [datumRodjenja, setDatumRodjenja] = useState(podaci.datumRodjenja ?? '');
  const [slikaUrl,      setSlikaUrl]      = useState(podaci.slikaUrl ?? '');

  const [staraLozinka,  setStaraLozinka]  = useState('');
  const [novaLozinka,   setNovaLozinka]   = useState('');
  const [potvrda,       setPotvrda]       = useState('');
  const [showStara,     setShowStara]     = useState(false);
  const [showNova,      setShowNova]      = useState(false);
  const [showPotvrda,   setShowPotvrda]   = useState(false);

  const izmenjeno = (
    ime !== pocetno.ime || prezime !== pocetno.prezime ||
    telefon !== pocetno.telefon || pol !== pocetno.pol ||
    datumRodjenja !== pocetno.datumRodjenja || slikaUrl !== pocetno.slikaUrl
  );

  const validateProfil = () => {
    const e = {};
    if (!ime.trim())     e.ime     = 'Ime je obavezno';
    if (!prezime.trim()) e.prezime = 'Prezime je obavezno';
    if (telefon && !/^[+\d][\d\s\-]{5,}$/.test(telefon))
      e.telefon = 'Unesite ispravan broj telefona';
    if (datumRodjenja && datumRodjenja > today)
      e.datumRodjenja = 'Datum rođenja ne može biti u budućnosti';
    return e;
  };

  const validateLozinka = () => {
    const e = {};
    if (!staraLozinka)           e.staraLozinka = 'Unesite staru lozinku';
    if (!novaLozinka)            e.novaLozinka  = 'Unesite novu lozinku';
    else if (novaLozinka.length < 8) e.novaLozinka = 'Minimum 8 karaktera';
    if (novaLozinka !== potvrda) e.potvrda      = 'Lozinke se ne podudaraju';
    return e;
  };

  const handleSubmitProfil = async (ev) => {
    ev.preventDefault();
    const e = validateProfil();
    if (Object.keys(e).length) { setErrors(e); return; }
    if (!izmenjeno) return;

    setSaving(true);
    try {
      await updateUserApi(korisnikId, {
        ime, prezime,
        telefon: telefon || null,
        pol: pol || null,
        datumRodjenja: datumRodjenja || null,
        slikaUrl: slikaUrl || null,
      });
      azurirajProfil({ ime, prezime, slika: slikaUrl || null });
      showToast('✅ Profil uspešno ažuriran!');
      onSave({ ime, prezime, email: podaci.email, telefon, pol, datumRodjenja, slikaUrl });
      onClose();
    } catch (err) {
      showToast(`⚠️ ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitLozinka = async (ev) => {
    ev.preventDefault();
    const e = validateLozinka();
    if (Object.keys(e).length) { setErrors(e); return; }

    setSaving(true);
    try {
      await updateUserApi(korisnikId, { staraLozinka, novaLozinka });
      showToast('✅ Lozinka uspešno promenjena!');
      onClose();
    } catch (err) {
      setErrors({ staraLozinka: err.message });
    } finally {
      setSaving(false);
    }
  };

  const polOpcije = [
    { value: 'M', label: 'Muški',  ikona: faMars    },
    { value: 'Z', label: 'Ženski', ikona: faVenus   },
  ];

  return (
    <>
      <div className="modal-overlay active" onClick={onClose} style={{ zIndex: 800 }} />
      <div className="modal active" role="dialog" onClick={e => e.stopPropagation()}
        style={{ maxWidth: 520, width: '95%', padding: '2rem', zIndex: 900, maxHeight: '90vh', overflowY: 'auto' }}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 className="modal-title">Uredi profil</h2>

        <div style={{ display: 'flex', gap: 4, marginBottom: '1.5rem', background: '#f8f7f4', borderRadius: 10, padding: 4 }}>
          {[{ id: 'profil', label: 'Lični podaci' }, { id: 'lozinka', label: 'Promena lozinke' }].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => { setAktivnaTabela(tab.id); setErrors({}); }}
              style={{
                flex: 1, height: 36, border: 'none', borderRadius: 8, cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600,
                background: aktivnaTabela === tab.id ? 'white' : 'transparent',
                color: aktivnaTabela === tab.id ? 'var(--green)' : '#888',
                boxShadow: aktivnaTabela === tab.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {aktivnaTabela === 'profil' && (
          <form onSubmit={handleSubmitProfil} noValidate>
            <div className="field-group" style={{ marginBottom: 14 }}>
              <label>Email adresa</label>
              <div style={{
                height: 44, padding: '0 14px', display: 'flex', alignItems: 'center',
                background: '#f0f0ee', border: '1.5px solid #e4e2dc', borderRadius: 10,
                fontSize: 14, color: '#888',
              }}>
                {podaci.email}
              </div>
              <span style={{ fontSize: 11, color: '#aaa', marginTop: 3 }}>Email adresa se ne može menjati.</span>
            </div>

            <div className="field-row" style={{ marginBottom: 14 }}>
              <div className="field-group">
                <label>Ime</label>
                <div className="input-wrap">
                  <input type="text" value={ime} onChange={e => { setIme(e.target.value); setErrors(er => ({...er, ime: ''})); }} className={errors.ime ? 'error' : ''} placeholder="Ime" />
                </div>
                <span className="field-error">{errors.ime}</span>
              </div>
              <div className="field-group">
                <label>Prezime</label>
                <div className="input-wrap">
                  <input type="text" value={prezime} onChange={e => { setPrezime(e.target.value); setErrors(er => ({...er, prezime: ''})); }} className={errors.prezime ? 'error' : ''} placeholder="Prezime" />
                </div>
                <span className="field-error">{errors.prezime}</span>
              </div>
            </div>

            <div className="field-group" style={{ marginBottom: 14 }}>
              <label>Broj telefona <span className="opciono-tag">opciono</span></label>
              <div className="input-wrap">
                <FontAwesomeIcon icon={faMobileScreen} style={{ color: '#aaa', marginLeft: 10 }} />
                <input type="tel" value={telefon}
                  onChange={e => { setTelefon(e.target.value); setErrors(er => ({...er, telefon: ''})); }}
                  className={errors.telefon ? 'error' : ''}
                  placeholder="+381 60 123 4567" />
              </div>
              <span className="field-error">{errors.telefon}</span>
            </div>

            <div className="field-group" style={{ marginBottom: 14 }}>
              <label>Pol</label>
              <div className="pol-opcije">
                {polOpcije.map(o => (
                  <button key={o.value} type="button" className={`pol-btn${pol === o.value ? ' active' : ''}`} onClick={() => setPol(o.value)}>
                    <FontAwesomeIcon icon={o.ikona} style={{ marginRight: 6 }} />{o.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="field-group" style={{ marginBottom: 14 }}>
              <label>Datum rođenja <span className="opciono-tag">opciono</span></label>
              <div className="input-wrap">
                <input type="date" value={datumRodjenja}
                  max={today}
                  onChange={e => { setDatumRodjenja(e.target.value); setErrors(er => ({...er, datumRodjenja: ''})); }}
                  className={errors.datumRodjenja ? 'error' : ''}
                  style={{ paddingLeft: '12px' }} />
              </div>
              <span className="field-error">{errors.datumRodjenja}</span>
            </div>

            <div className="field-group" style={{ marginBottom: '1.5rem' }}>
              <label>URL profilne slike <span className="opciono-tag">opciono</span></label>
              <div className="input-wrap">
                <input type="url" value={slikaUrl} onChange={e => setSlikaUrl(e.target.value)} placeholder="https://..." />
              </div>
            </div>

            <button type="submit" className="modal-btn" disabled={saving || !izmenjeno}>
              {saving ? 'Čuvanje...' : 'Sačuvaj izmene'}
            </button>
          </form>
        )}

        {aktivnaTabela === 'lozinka' && (
          <form onSubmit={handleSubmitLozinka} noValidate>
            <div className="field-group" style={{ marginBottom: 14 }}>
              <label>Stara lozinka</label>
              <div className="input-wrap">
                <FontAwesomeIcon icon={faLock} style={{ color: '#aaa', marginLeft: 10 }} />
                <input
                  type={showStara ? 'text' : 'password'}
                  value={staraLozinka}
                  onChange={e => { setStaraLozinka(e.target.value); setErrors(er => ({...er, staraLozinka: ''})); }}
                  className={errors.staraLozinka ? 'error' : ''}
                  placeholder="Unesite staru lozinku"
                />
                <button type="button" className="toggle-pass" onClick={() => setShowStara(s => !s)}>
                  <FontAwesomeIcon icon={showStara ? faEyeSlash : faEye} />
                </button>
              </div>
              <span className="field-error">{errors.staraLozinka}</span>
            </div>
            <div className="field-group" style={{ marginBottom: 14 }}>
              <label>Nova lozinka</label>
              <div className="input-wrap">
                <FontAwesomeIcon icon={faLock} style={{ color: '#aaa', marginLeft: 10 }} />
                <input
                  type={showNova ? 'text' : 'password'}
                  value={novaLozinka}
                  onChange={e => { setNovaLozinka(e.target.value); setErrors(er => ({...er, novaLozinka: ''})); }}
                  className={errors.novaLozinka ? 'error' : ''}
                  placeholder="Min. 8 karaktera"
                />
                <button type="button" className="toggle-pass" onClick={() => setShowNova(s => !s)}>
                  <FontAwesomeIcon icon={showNova ? faEyeSlash : faEye} />
                </button>
              </div>
              <span className="field-error">{errors.novaLozinka}</span>
            </div>
            <div className="field-group" style={{ marginBottom: '1.5rem' }}>
              <label>Potvrdi novu lozinku</label>
              <div className="input-wrap">
                <FontAwesomeIcon icon={faLock} style={{ color: '#aaa', marginLeft: 10 }} />
                <input
                  type={showPotvrda ? 'text' : 'password'}
                  value={potvrda}
                  onChange={e => { setPotvrda(e.target.value); setErrors(er => ({...er, potvrda: ''})); }}
                  className={errors.potvrda ? 'error' : ''}
                  placeholder="Ponovi novu lozinku"
                />
                <button type="button" className="toggle-pass" onClick={() => setShowPotvrda(s => !s)}>
                  <FontAwesomeIcon icon={showPotvrda ? faEyeSlash : faEye} />
                </button>
              </div>
              <span className="field-error">{errors.potvrda}</span>
            </div>
            <button type="submit" className="modal-btn" disabled={saving}>
              {saving ? 'Menjanje...' : 'Promeni lozinku'}
            </button>
          </form>
        )}
      </div>
    </>
  );
}

export default function Profil() {
  const { id: urlId }         = useParams();
  const { korisnik, odjavi }  = useAuth();
  const { showToast }         = useToast();
  const navigate              = useNavigate();

  const targetId    = urlId ? Number(urlId) : korisnik?.id;
  const jeSopstveni = !urlId || Number(urlId) === korisnik?.id;

  const [loading,     setLoading]     = useState(true);
  const [deleting,    setDeleting]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showEdit,    setShowEdit]    = useState(false);
  const [greska,      setGreska]      = useState('');
  const [profil,      setProfil]      = useState(null);

  useEffect(() => {
    if (!targetId) return;
    setLoading(true);
    getUserApi(targetId)
      .then(data => setProfil(data))
      .catch(() => setGreska('Greška pri učitavanju profila.'))
      .finally(() => setLoading(false));
  }, [targetId]);

  const handleObrisiProfil = async () => {
    setDeleting(true);
    try {
      await deleteUserApi(korisnik.id);
      odjavi();
      navigate('/');
      showToast('✅ Profil je obrisan.');
    } catch (err) {
      showToast(`⚠️ ${err.message}`);
      setShowConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  // Nije prijavljen i nema ID u URL-u
  if (!urlId && !korisnik) {
    return (
      <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="empty-state">
          <div className="empty-icon" style={{ color: '#aaa', fontSize: 32 }}>
            <FontAwesomeIcon icon={faLock} />
          </div>
          <h3>Niste prijavljeni</h3>
          <p>Prijavite se da biste videli svoj profil.</p>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
            <a href="/" className="modal-btn" style={{ width: 'auto', padding: '0 2rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              Idi na početnu →
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="results-page">
        <div className="empty-state">
          <div className="empty-icon" style={{ fontSize: 32, color: '#aaa' }}>⏳</div>
          <h3>Učitavanje profila...</h3>
        </div>
      </div>
    );
  }

  if (greska || !profil) {
    return (
      <div className="results-page">
        <div className="empty-state">
          <div className="empty-icon" style={{ fontSize: 32, color: '#E24B4A' }}>
            <FontAwesomeIcon icon={faTriangleExclamation} />
          </div>
          <h3>Greška</h3>
          <p>{greska || 'Profil nije pronađen.'}</p>
        </div>
      </div>
    );
  }

  const inicijali = `${profil.ime?.[0] ?? ''}${profil.prezime?.[0] ?? ''}`.toUpperCase();

  const polPrikaz = () => {
    if (profil.pol === 'M') return <><FontAwesomeIcon icon={faMars} style={{ marginRight: 4 }} />Muški</>;
    if (profil.pol === 'Z') return <><FontAwesomeIcon icon={faVenus} style={{ marginRight: 4 }} />Ženski</>;
    return null;
  };

  return (
    <>
      {showConfirm && (
        <ConfirmModal
          naslov="Obriši profil"
          tekst="Da li ste sigurni da želite da obrišete svoj profil? Ova akcija je nepovratna."
          onPotvrdi={handleObrisiProfil}
          onOtkazi={() => setShowConfirm(false)}
          loading={deleting}
        />
      )}

      {showEdit && jeSopstveni && (
        <EditProfilModal
          korisnikId={korisnik.id}
          podaci={{
            ime: profil.ime, prezime: profil.prezime, email: profil.email,
            telefon: profil.telefon ?? '', pol: profil.pol ?? '',
            datumRodjenja: profil.datumRodjenja ? profil.datumRodjenja.split('T')[0] : '',
            slikaUrl: profil.slikaUrl ?? '',
          }}
          onClose={() => setShowEdit(false)}
          onSave={(novo) => setProfil(prev => ({ ...prev, ...novo }))}
        />
      )}

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '2.5rem 2rem' }}>
        <div style={{ background: 'white', border: '1.5px solid #e8e6e0', borderRadius: 18, padding: '2rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: profil.slikaUrl ? 'transparent' : 'var(--green)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, fontWeight: 700, color: 'white',
              fontFamily: 'Poppins, sans-serif', flexShrink: 0,
              border: '3px solid var(--green-light)', overflow: 'hidden'
            }}>
              {profil.slikaUrl
                ? <img src={profil.slikaUrl} alt={inicijali} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : inicijali
              }
            </div>
            <div style={{ flex: 1 }}>
              <h1 className="results-title" style={{ marginBottom: 4 }}>{profil.ime} {profil.prezime}</h1>
              {jeSopstveni && <p style={{ color: '#888', fontSize: 14, margin: 0 }}>{profil.email}</p>}
              <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: 12, background: 'var(--green-light)', color: 'var(--green-dark)', padding: '3px 10px', borderRadius: 50, fontWeight: 600 }}>
                  {profil.role}
                </span>
                {profil.pol && (
                  <span style={{ fontSize: 12, color: '#888' }}>
                    {polPrikaz()}
                  </span>
                )}
                {profil.telefon && jeSopstveni && (
                  <span style={{ fontSize: 13, color: '#888' }}>
                    <FontAwesomeIcon icon={faMobileScreen} style={{ marginRight: 4 }} />
                    {profil.telefon}
                  </span>
                )}
              </div>
            </div>
            {jeSopstveni && (
              <button onClick={() => setShowEdit(true)} className="btn-outline" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FontAwesomeIcon icon={faPen} />
                Uredi profil
              </button>
            )}
          </div>
        </div>

        <StatistikaSekcija userId={targetId} role={profil.role} />

        {profil.role === 'Igrac' && (
          <OceneSekcija userId={targetId} />
        )}

        {jeSopstveni && (
          <div style={{ background: 'white', border: '1.5px solid #fde8e8', borderRadius: 18, padding: '1.5rem 2rem' }}>
            <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 16, fontWeight: 700, color: '#E24B4A', marginBottom: 8 }}>
              Brisanje naloga
            </h3>
            <p style={{ fontSize: 13, color: '#888', marginBottom: '1rem' }}>
              Nakon brisanja profila, svi vaši podaci će biti trajno obrisani i nećete moći da povratite nalog.
            </p>
            <button onClick={() => setShowConfirm(true)}
              style={{ height: 44, padding: '0 20px', background: 'white', color: '#E24B4A', border: '1.5px solid #E24B4A', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FontAwesomeIcon icon={faTrash} />
              Obriši profil
            </button>
          </div>
        )}
      </div>
    </>
  );
}