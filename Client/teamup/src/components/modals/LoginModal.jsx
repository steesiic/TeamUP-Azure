import { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../context/AuthContext';
import { loginApi } from '../../api/auth';
import { getUserApi } from '../../api/users';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope, faLock, faEye, faEyeSlash, faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';

export default function LoginModal({ onClose, onSwitchToRegister }) {
  const [email,    setEmail]    = useState('');
  const [pass,     setPass]     = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);

  const { showToast }               = useToast();
  const { prijavi, azurirajProfil } = useAuth();

  const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const validate = () => {
    const e = {};
    if (!email.trim())        e.email = 'Email je obavezan';
    else if (!isEmail(email)) e.email = 'Unesite ispravnu email adresu';
    if (!pass)                e.pass  = 'Lozinka je obavezna';
    else if (pass.length < 6) e.pass  = 'Minimum 6 karaktera';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    try {
      const token   = await loginApi(email, pass);
      prijavi(token);
      const decoded = jwtDecode(token);
      const user    = await getUserApi(decoded.id);
      azurirajProfil({ ime: user.ime, prezime: user.prezime, slika: user.slikaUrl ?? null, role: user.role ?? null });
      onClose();
      showToast('✅ Uspešno ste se prijavili!');
    } catch (err) {
      setErrors({ server: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="modal-close" onClick={onClose}>✕</button>
      <div className="modal-logo">Team<span>UP</span></div>
      <h2 className="modal-title">Dobrodošli nazad</h2>
      <p className="modal-sub">Prijavite se na vaš nalog</p>

      <form className="modal-form" onSubmit={handleSubmit} noValidate>
        {errors.server && (
          <div className="reg-opciono-info" style={{ background: '#fde8e8', borderColor: 'rgba(226,75,74,0.2)', color: '#c0392b', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FontAwesomeIcon icon={faTriangleExclamation} />
            {errors.server}
          </div>
        )}

        <div className="field-group">
          <label>Email adresa</label>
          <div className="input-wrap">
            <FontAwesomeIcon icon={faEnvelope} style={{ color: '#aaa', marginLeft: 12, marginRight: 4, flexShrink: 0 }} />
            <input
              type="email"
              placeholder="ime@email.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(er => ({...er, email: '', server: ''})); }}
              className={errors.email ? 'error' : ''}
            />
          </div>
          <span className="field-error">{errors.email}</span>
        </div>

        <div className="field-group">
          <label>Lozinka</label>
          <div className="input-wrap">
            <FontAwesomeIcon icon={faLock} style={{ color: '#aaa', marginLeft: 12, marginRight: 4, flexShrink: 0 }} />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Unesite lozinku"
              value={pass}
              onChange={e => { setPass(e.target.value); setErrors(er => ({...er, pass: '', server: ''})); }}
              className={errors.pass ? 'error' : ''}
            />
            <button type="button" className="toggle-pass" onClick={() => setShowPass(s => !s)}>
              <FontAwesomeIcon icon={showPass ? faEyeSlash : faEye} />
            </button>
          </div>
          <span className="field-error">{errors.pass}</span>
        </div>

        <div className="form-row">
          <label className="checkbox-label">
            <input type="checkbox" /><span>Zapamti me</span>
          </label>
          <button type="button" className="forgot-link">Zaboravili ste lozinku?</button>
        </div>

        <button type="submit" className="modal-btn" disabled={loading}>
          <span className="btn-text">{loading ? 'Prijava u toku...' : 'Prijavi se'}</span>
        </button>
      </form>

      <p className="modal-switch">
        Nemate nalog?{' '}
        <button type="button" className="switch-link" onClick={onSwitchToRegister}>Registrujte se</button>
      </p>
    </>
  );
}