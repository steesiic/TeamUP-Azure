import { useState } from 'react';
import { registerApi, loginApi } from '../../api/auth';
import { getUserApi } from '../../api/users';
import { useAuth } from '../../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import { API_URL } from '../../api/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope, faLock, faUser, faMobileScreen, faImage,
  faEye, faEyeSlash, faCheck, faTriangleExclamation,
  faLightbulb, faBuilding, faFutbol, faMars, faVenus,
} from '@fortawesome/free-solid-svg-icons';

function getStrength(val) {
  if (!val) return null;
  let score = 0;
  if (val.length >= 8)          score++;
  if (/[A-Z]/.test(val))        score++;
  if (/[0-9]/.test(val))        score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const levels = [
    { cls: 'strength-weak',   label: 'Slaba' },
    { cls: 'strength-fair',   label: 'Srednja' },
    { cls: 'strength-fair',   label: 'Srednja' },
    { cls: 'strength-good',   label: 'Dobra' },
    { cls: 'strength-strong', label: 'Jaka' },
  ];
  return levels[score];
}

const koraciLabele = ['Nalog', 'Lični podaci', 'Opciono', 'Tip naloga'];

const ikonStyle = { color: '#aaa', marginLeft: 12, marginRight: 4, flexShrink: 0 };

export default function RegisterModal({ onClose, onSwitchToLogin, onSuccess }) {
  const { prijavi, azurirajProfil } = useAuth();
  const [korak, setKorak] = useState(1);

  const [email,       setEmail]       = useState('');
  const [pass,        setPass]        = useState('');
  const [confirm,     setConfirm]     = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [ime,     setIme]     = useState('');
  const [prezime, setPrezime] = useState('');
  const [pol,     setPol]     = useState('');

  const [telefon,       setTelefon]       = useState('');
  const [datumRodjenja, setDatumRodjenja] = useState('');
  const [slikaUrl,      setSlikaUrl]      = useState('');

  const [roleId, setRoleId] = useState(null);

  const [terms,   setTerms]   = useState(false);
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);

  const strength = getStrength(pass);
  const today = new Date().toISOString().split('T')[0];

  const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const validateKorak1 = () => {
    const e = {};
    if (!email.trim())        e.email   = 'Email je obavezan';
    else if (!isEmail(email)) e.email   = 'Unesite ispravnu email adresu';
    if (!pass)                e.pass    = 'Lozinka je obavezna';
    else if (pass.length < 8) e.pass    = 'Minimum 8 karaktera';
    if (pass !== confirm)     e.confirm = 'Lozinke se ne podudaraju';
    return e;
  };

  const validateKorak2 = () => {
    const e = {};
    if (!ime.trim())     e.ime     = 'Ime je obavezno';
    if (!prezime.trim()) e.prezime = 'Prezime je obavezno';
    if (!pol)            e.pol     = 'Izaberite pol';
    if (!terms)          e.terms   = 'Morate prihvatiti uslove';
    return e;
  };

  const validateKorak3 = () => {
    const e = {};
    if (telefon && !/^[+\d][\d\s\-]{5,}$/.test(telefon))
      e.telefon = 'Unesite ispravan broj telefona';
    if (datumRodjenja && datumRodjenja > today)
      e.datumRodjenja = 'Datum rođenja ne može biti u budućnosti';
    return e;
  };

  const validateKorak4 = () => {
    const e = {};
    if (!roleId) e.role = 'Izaberite tip naloga';
    return e;
  };

  const sledeciKorak = async () => {
    let e = {};
    if (korak === 1) e = validateKorak1();
    if (korak === 2) e = validateKorak2();
    if (korak === 3) e = validateKorak3();
    if (korak === 4) e = validateKorak4();
    if (Object.keys(e).length) { setErrors(e); return; }

    if (korak === 1) {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/users/check-email?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (data.exists) {
          setErrors({ email: 'Korisnik sa ovim emailom već postoji.' });
          setLoading(false);
          return;
        }
      } catch {
        // ignorisi gresku, nastavi dalje
      } finally {
        setLoading(false);
      }
    }

    setErrors({});
    if (korak === 4) { handleSubmit(); return; }
    setKorak(k => k + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await registerApi({
        ime, prezime, email,
        password:      pass,
        pol:           pol === 'muski' ? 'M' : pol === 'zenski' ? 'Z' : 'O',
        telefon:       telefon       || null,
        datumRodjenja: datumRodjenja || null,
        slikaUrl:      slikaUrl      || null,
        roleId,
      });
      const token = await loginApi(email, pass);
      prijavi(token);
      const decoded = jwtDecode(token);
      const user = await getUserApi(decoded.id);
      azurirajProfil({ ime: user.ime, prezime: user.prezime, slika: user.slikaUrl ?? null, role: user.role ?? null });
      onSuccess();
    } catch (err) {
      const poruka = err.message ?? 'Greška pri registraciji.';
      if (poruka.toLowerCase().includes('email') || poruka.toLowerCase().includes('postoji')) {
        setKorak(1);
        setErrors({ email: 'Korisnik sa ovim emailom već postoji.' });
      } else {
        setErrors(er => ({ ...er, server: poruka }));
      }
    } finally {
      setLoading(false);
    }
  };

  const nazadKorak = () => {
    setErrors({});
    setKorak(k => k - 1);
  };

  const polOpcije = [
    { value: 'muski',  label: 'Muški',  ikona: faMars       },
    { value: 'zenski', label: 'Ženski', ikona: faVenus      },
  ];

  return (
    <>
      <button className="modal-close" onClick={onClose}>✕</button>
      <div className="modal-logo">Team<span>UP</span></div>
      <h2 className="modal-title">Kreiraj nalog</h2>
      <p className="modal-sub">Rezervišite terene za nekoliko sekundi</p>

      <div className="reg-koraci">
        {koraciLabele.map((label, i) => (
          <div key={i} className={`reg-korak ${korak > i + 1 ? 'done' : ''} ${korak === i + 1 ? 'active' : ''}`}>
            <div className="reg-korak-broj">
              {korak > i + 1 ? <FontAwesomeIcon icon={faCheck} /> : i + 1}
            </div>
            <span>{label}</span>
          </div>
        ))}
        <div className="reg-koraci-linija">
          <div style={{ width: `${((korak - 1) / (koraciLabele.length - 1)) * 100}%` }} />
        </div>
      </div>

      <form className="modal-form" onSubmit={e => e.preventDefault()} noValidate>
        {errors.server && (
          <div className="reg-opciono-info" style={{ background: '#fde8e8', borderColor: 'rgba(226,75,74,0.2)', color: '#c0392b', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FontAwesomeIcon icon={faTriangleExclamation} />
            {errors.server}
          </div>
        )}

        {korak === 1 && (
          <>
            <div className="field-group">
              <label>Email adresa</label>
              <div className="input-wrap">
                <FontAwesomeIcon icon={faEnvelope} style={ikonStyle} />
                <input type="email" placeholder="ime@email.com" value={email}
                  onChange={e => { setEmail(e.target.value); setErrors(er => ({...er, email: ''})); }}
                  className={errors.email ? 'error' : ''} />
              </div>
              <span className="field-error">{errors.email}</span>
            </div>
            <div className="field-group">
              <label>Lozinka</label>
              <div className="input-wrap">
                <FontAwesomeIcon icon={faLock} style={ikonStyle} />
                <input type={showPass ? 'text' : 'password'} placeholder="Min. 8 karaktera" value={pass}
                  onChange={e => { setPass(e.target.value); setErrors(er => ({...er, pass: ''})); }}
                  className={errors.pass ? 'error' : ''} />
                <button type="button" className="toggle-pass" onClick={() => setShowPass(s => !s)}>
                  <FontAwesomeIcon icon={showPass ? faEyeSlash : faEye} />
                </button>
              </div>
              <span className="field-error">{errors.pass}</span>
              {pass && strength && (
                <div className={`password-strength ${strength.cls}`}>
                  <div className="strength-bar"><div className="strength-fill" /></div>
                  <span className="strength-label">{strength.label}</span>
                </div>
              )}
            </div>
            <div className="field-group">
              <label>Potvrdi lozinku</label>
              <div className="input-wrap">
                <FontAwesomeIcon icon={faLock} style={ikonStyle} />
                <input type={showConfirm ? 'text' : 'password'} placeholder="Ponovi lozinku" value={confirm}
                  onChange={e => { setConfirm(e.target.value); setErrors(er => ({...er, confirm: ''})); }}
                  className={errors.confirm ? 'error' : ''} />
                <button type="button" className="toggle-pass" onClick={() => setShowConfirm(s => !s)}>
                  <FontAwesomeIcon icon={showConfirm ? faEyeSlash : faEye} />
                </button>
              </div>
              <span className="field-error">{errors.confirm}</span>
            </div>
          </>
        )}

        {korak === 2 && (
          <>
            <div className="field-row">
              <div className="field-group">
                <label>Ime</label>
                <div className="input-wrap">
                  <FontAwesomeIcon icon={faUser} style={ikonStyle} />
                  <input type="text" placeholder="Ime" value={ime}
                    onChange={e => { setIme(e.target.value); setErrors(er => ({...er, ime: ''})); }}
                    className={errors.ime ? 'error' : ''} />
                </div>
                <span className="field-error">{errors.ime}</span>
              </div>
              <div className="field-group">
                <label>Prezime</label>
                <div className="input-wrap">
                  <input type="text" placeholder="Prezime" value={prezime}
                    onChange={e => { setPrezime(e.target.value); setErrors(er => ({...er, prezime: ''})); }}
                    className={errors.prezime ? 'error' : ''} />
                </div>
                <span className="field-error">{errors.prezime}</span>
              </div>
            </div>
            <div className="field-group">
              <label>Pol</label>
              <div className="pol-opcije">
                {polOpcije.map(o => (
                  <button key={o.value} type="button"
                    className={`pol-btn${pol === o.value ? ' active' : ''}${errors.pol ? ' error-border' : ''}`}
                    onClick={() => { setPol(o.value); setErrors(er => ({...er, pol: ''})); }}>
                    <FontAwesomeIcon icon={o.ikona} style={{ marginRight: 6 }} />{o.label}
                  </button>
                ))}
              </div>
              <span className="field-error">{errors.pol}</span>
            </div>
            <label className="checkbox-label">
              <input type="checkbox" checked={terms}
                onChange={e => { setTerms(e.target.checked); setErrors(er => ({...er, terms: ''})); }} />
              <span>Slažem se sa <a href="#" className="terms-link">uslovima korišćenja</a></span>
            </label>
            <span className="field-error">{errors.terms}</span>
          </>
        )}

        {korak === 3 && (
          <>
            <div className="reg-opciono-info" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FontAwesomeIcon icon={faLightbulb} style={{ color: '#D97706', flexShrink: 0 }} />
              Ovi podaci su opcioni — možete ih dodati i kasnije u podešavanjima profila.
            </div>
            <div className="field-group">
              <label>Broj telefona <span className="opciono-tag">opciono</span></label>
              <div className="input-wrap">
                <FontAwesomeIcon icon={faMobileScreen} style={ikonStyle} />
                <input type="tel" placeholder="+381 60 123 4567" value={telefon}
                  onChange={e => { setTelefon(e.target.value); setErrors(er => ({...er, telefon: ''})); }}
                  className={errors.telefon ? 'error' : ''} />
              </div>
              <span className="field-error">{errors.telefon}</span>
            </div>
            <div className="field-group">
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
            <div className="field-group">
              <label>URL profilne slike <span className="opciono-tag">opciono</span></label>
              <div className="input-wrap">
                <FontAwesomeIcon icon={faImage} style={ikonStyle} />
                <input type="url" placeholder="https://..." value={slikaUrl}
                  onChange={e => setSlikaUrl(e.target.value)} />
              </div>
            </div>
          </>
        )}

        {korak === 4 && (
          <>
            <p style={{ fontSize: 14, color: '#666', marginBottom: '1rem' }}>
              Izaberite kako ćete koristiti TeamUP:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div
                onClick={() => { setRoleId(2); setErrors(er => ({...er, role: ''})); }}
                style={{
                  border: `2px solid ${roleId === 2 ? '#1D9E75' : '#e4e2dc'}`,
                  background: roleId === 2 ? '#f0faf6' : '#fafaf8',
                  borderRadius: 12, padding: '16px', cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 28, color: '#1D9E75' }}>
                    <FontAwesomeIcon icon={faFutbol} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a' }}>Igrac</div>
                    <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>
                      Rezervišem terene i pridružujem se terminima
                    </div>
                  </div>
                  {roleId === 2 && (
                    <div style={{ marginLeft: 'auto', color: '#1D9E75', fontSize: 20 }}>
                      <FontAwesomeIcon icon={faCheck} />
                    </div>
                  )}
                </div>
              </div>
              <div
                onClick={() => { setRoleId(3); setErrors(er => ({...er, role: ''})); }}
                style={{
                  border: `2px solid ${roleId === 3 ? '#1D9E75' : '#e4e2dc'}`,
                  background: roleId === 3 ? '#f0faf6' : '#fafaf8',
                  borderRadius: 12, padding: '16px', cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 24, color: '#555' }}>
                    <FontAwesomeIcon icon={faBuilding} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a' }}>Vlasnik objekta</div>
                    <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>
                      Iznajmljujem sportske objekte i upravljam terminima
                    </div>
                  </div>
                  {roleId === 3 && (
                    <div style={{ marginLeft: 'auto', color: '#1D9E75', fontSize: 20 }}>
                      <FontAwesomeIcon icon={faCheck} />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <span className="field-error">{errors.role}</span>
          </>
        )}

        <div className="reg-nav">
          {korak > 1 && (
            <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={nazadKorak}>
              ← Nazad
            </button>
          )}
          {korak < 4 ? (
            <button type="button" className="modal-btn" style={{ flex: 2 }} onClick={sledeciKorak} disabled={loading}>
              {loading ? 'Provjera...' : 'Dalje →'}
            </button>
          ) : (
            <button type="button" className="modal-btn" style={{ flex: 2 }} onClick={sledeciKorak} disabled={loading}>
              {loading ? 'Kreiranje...' : 'Kreiraj nalog'}
            </button>
          )}
        </div>
      </form>

      <p className="modal-switch">
        Već imate nalog?{' '}
        <button type="button" className="switch-link" onClick={onSwitchToLogin}>Prijavite se</button>
      </p>
    </>
  );
}