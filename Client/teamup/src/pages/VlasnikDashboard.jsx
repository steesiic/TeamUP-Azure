import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getObjektiApi, deleteObjekatApi, updateObjekatApi } from '../api/objekti';
import { createTerminApi, buildVremeOdDo, getTerminiApi } from '../api/termini';
import { getSportoviApi } from '../api/sportovi';
import { useToast } from '../hooks/useToast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding, faLocationDot, faImage, faMoneyBill,
  faTrash, faPen, faEye, faCheck, faTriangleExclamation,
  faPlus, faHourglass,
} from '@fortawesome/free-solid-svg-icons';

const today = new Date().toISOString().split('T')[0];

const GRADOVI = [
  'Beograd', 'Novi Sad', 'Niš', 'Kragujevac', 'Subotica', 'Zrenjanin',
  'Pančevo', 'Čačak', 'Novi Pazar', 'Kraljevo', 'Smederevo', 'Leskovac',
  'Vranje', 'Valjevo', 'Šabac', 'Užice', 'Zaječar', 'Prokuplje', 'Pirot',
  'Kikinda', 'Sombor', 'Jagodina', 'Požarevac', 'Bor', 'Negotin',
  'Kruševac', 'Prijepolje', 'Sremska Mitrovica',
];

// Parsira "Ulica bb, Grad" -> { ulica: "Ulica bb", grad: "Grad" }
function parseAdresa(adresa) {
  if (!adresa) return { ulica: '', grad: '' };
  const delovi = adresa.split(',').map(s => s.trim());
  if (delovi.length >= 2) {
    const grad = delovi[delovi.length - 1];
    const ulica = delovi.slice(0, delovi.length - 1).join(', ');
    return { ulica, grad: GRADOVI.includes(grad) ? grad : '' };
  }
  return { ulica: adresa, grad: '' };
}

function EditObjekatModal({ objekat, sportovi, onClose, onSave, showToast }) {
  const parsed = parseAdresa(objekat.adresa);

  const [naziv,    setNaziv]    = useState(objekat.naziv ?? '');
  const [ulica,    setUlica]    = useState(parsed.ulica);
  const [grad,     setGrad]     = useState(parsed.grad);
  const [opis,     setOpis]     = useState(objekat.opis ?? '');
  const [slikaUrl, setSlikaUrl] = useState(objekat.slikaUrl ?? '');
  const [izabrani, setIzabrani] = useState(
    sportovi.filter(s => objekat.sportovi?.includes(s.naziv)).map(s => s.id)
  );
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  const toggleSport = (id) => {
    setIzabrani(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const err = {};
    if (!naziv.trim())         err.naziv  = 'Unesite naziv';
    if (!grad)                 err.grad   = 'Izaberite grad';
    if (!ulica.trim())         err.ulica  = 'Unesite adresu';
    if (izabrani.length === 0) err.sport  = 'Izaberite bar jedan sport';
    if (Object.keys(err).length) { setErrors(err); return; }

    setLoading(true);
    try {
      await updateObjekatApi(objekat.id, {
        id:       objekat.id,
        naziv:    naziv.trim(),
        adresa:   `${ulica.trim()}, ${grad}`,
        opis:     opis.trim() || null,
        slikaUrl: slikaUrl.trim() || null,
        sportIds: izabrani,
      });
      showToast('✅ Objekat uspešno izmenjen!');
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
      <div className="modal-overlay active" onClick={onClose} style={{ zIndex: 600 }} />
      <div className="modal active" role="dialog" onClick={e => e.stopPropagation()}
        style={{ maxWidth: 500, width: '95%', padding: '2rem', zIndex: 700 }}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 className="modal-title">Uredi objekat</h2>
        <p className="modal-sub" style={{ color: '#888', fontSize: 13, marginBottom: '1.5rem' }}>
          {objekat.naziv}
        </p>
        <form onSubmit={handleSave} noValidate>
          <div className="field-group">
            <label>Naziv</label>
            <div className="input-wrap">
              <FontAwesomeIcon icon={faBuilding} style={{ color: '#aaa', marginLeft: 12, marginRight: 4, flexShrink: 0 }} />
              <input type="text" value={naziv}
                onChange={e => { setNaziv(e.target.value); setErrors(er => ({...er, naziv: ''})); }}
                className={errors.naziv ? 'error' : ''} placeholder="npr. Sportski centar Arena" />
            </div>
            <span className="field-error">{errors.naziv}</span>
          </div>

          <div className="field-row">
            <div className="field-group">
              <label>Grad</label>
              <select value={grad}
                onChange={e => { setGrad(e.target.value); setErrors(er => ({...er, grad: ''})); }}
                className={`dodaj-select${errors.grad ? ' error' : ''}`}>
                <option value="" disabled>Izaberi grad</option>
                {GRADOVI.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <span className="field-error">{errors.grad}</span>
            </div>
            <div className="field-group">
              <label>Adresa</label>
              <div className="input-wrap">
                <FontAwesomeIcon icon={faLocationDot} style={{ color: '#aaa', marginLeft: 12, marginRight: 4, flexShrink: 0 }} />
                <input type="text" value={ulica}
                  onChange={e => { setUlica(e.target.value); setErrors(er => ({...er, ulica: ''})); }}
                  className={errors.ulica ? 'error' : ''} placeholder="npr. Bulevar Nemanjića 14" />
              </div>
              <span className="field-error">{errors.ulica}</span>
            </div>
          </div>

          <div className="field-group">
            <label>Opis (opciono)</label>
            <textarea value={opis} onChange={e => setOpis(e.target.value)}
              placeholder="Kratki opis objekta..."
              style={{ border: '1.5px solid #e4e2dc', borderRadius: 10, padding: '10px 12px',
                       fontSize: 14, fontFamily: 'inherit', resize: 'vertical', minHeight: 72,
                       background: 'white', outline: 'none' }} />
          </div>

          <div className="field-group">
            <label>URL slike <span style={{ color: '#bbb', fontWeight: 400 }}>(opciono)</span></label>
            <div className="input-wrap">
              <FontAwesomeIcon icon={faImage} style={{ color: '#aaa', marginLeft: 12, marginRight: 4, flexShrink: 0 }} />
              <input type="url" placeholder="https://i.imgur.com/..." value={slikaUrl}
                onChange={e => setSlikaUrl(e.target.value)} />
            </div>
          </div>

          <div className="field-group">
            <label>Sportovi</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
              {sportovi.map(s => (
                <button key={s.id} type="button"
                  onClick={() => { toggleSport(s.id); setErrors(er => ({...er, sport: ''})); }}
                  style={{
                    padding: '7px 16px', borderRadius: 50, fontSize: 13, cursor: 'pointer',
                    fontFamily: 'inherit', transition: 'all 0.15s',
                    background:  izabrani.includes(s.id) ? '#E1F5EE' : 'white',
                    border:      `1.5px solid ${izabrani.includes(s.id) ? '#1D9E75' : '#e4e2dc'}`,
                    color:       izabrani.includes(s.id) ? '#0F6E56'  : '#666',
                    fontWeight:  izabrani.includes(s.id) ? 500        : 400,
                  }}>
                  {s.naziv}
                </button>
              ))}
            </div>
            <span className="field-error">{errors.sport}</span>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: '1.5rem' }}>
            <button type="button" className="btn-outline" style={{ flex: 1 }}
              onClick={onClose} disabled={loading}>
              Otkaži
            </button>
            <button type="submit" className="modal-btn" style={{ flex: 2 }} disabled={loading}>
              {loading ? 'Čuvanje...' : 'Sačuvaj izmene'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function AddTerminModal({ objekat, sportovi, onClose, onSave, showToast }) {
  const [formaDatum, setFormaDatum] = useState('');
  const [formaOd,    setFormaOd]    = useState('08:00');
  const [formaSati,  setFormaSati]  = useState(1);
  const [formaCena,  setFormaCena]  = useState('');
  const [loading,    setLoading]    = useState(false);
  const [errors,     setErrors]     = useState({});

  const sportoviObjekta = sportovi.filter(s => objekat.sportovi?.includes(s.naziv));
  const defaultSportId  = sportoviObjekta[0]?.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = {};
    if (!formaDatum) err.datum = 'Unesite datum';
    if (!formaCena || Number(formaCena) < 1) err.cena = 'Unesite cenu';
    if (Object.keys(err).length) { setErrors(err); return; }

    const { vremeOd, vremeDo } = buildVremeOdDo(formaOd, formaSati);
    const pocetakTermina = new Date(`${formaDatum}T${vremeOd}`);
    if (pocetakTermina < new Date()) {
      setErrors({ datum: 'Ne možete dodati termin u prošlosti' });
      return;
    }

    setLoading(true);
    try {
      const postojeci = await getTerminiApi({ objekatId: objekat.id, datum: formaDatum, perPage: 100 });
      const lista = postojeci.data ?? postojeci.items ?? [];
      const preklapanje = lista.some(t => t.vremeOd === vremeOd);
      if (preklapanje) {
        setErrors({ datum: 'Termin za ovaj datum i vreme već postoji' });
        setLoading(false);
        return;
      }

      await createTerminApi({
        objekatId: objekat.id,
        sportId:   defaultSportId,
        datum:     `${formaDatum}T00:00:00`,
        vremeOd,
        vremeDo,
        cena:      Number(formaCena),
      });
      showToast('✅ Termin uspešno dodat!');
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
        style={{ maxWidth: 420, width: '95%', padding: '2rem', zIndex: 900 }}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 className="modal-title">Dodaj termin</h2>
        <p className="modal-sub" style={{ color: '#888', fontSize: 13, marginBottom: '1.5rem' }}>
          {objekat.naziv}
        </p>
        <form onSubmit={handleSubmit} noValidate>
          <div className="field-row" style={{ marginBottom: 12 }}>
            <div className="field-group">
              <label>Datum</label>
              <input type="date" min={today} value={formaDatum}
                onChange={e => { setFormaDatum(e.target.value); setErrors(er => ({...er, datum: ''})); }}
                className={`dodaj-select${errors.datum ? ' error' : ''}`} />
              <span className="field-error">{errors.datum}</span>
            </div>
            <div className="field-group">
              <label>Cena (RSD)</label>
              <div className="input-wrap">
                <FontAwesomeIcon icon={faMoneyBill} style={{ color: '#aaa', marginLeft: 12, marginRight: 4, flexShrink: 0 }} />
                <input type="number" min="1" placeholder="npr. 2500" value={formaCena}
                  onChange={e => { setFormaCena(e.target.value); setErrors(er => ({...er, cena: ''})); }}
                  className={errors.cena ? 'error' : ''} />
              </div>
              <span className="field-error">{errors.cena}</span>
            </div>
          </div>
          <div className="field-row" style={{ marginBottom: 12 }}>
            <div className="field-group">
              <label>Početak</label>
              <select className="dodaj-select" value={formaOd} onChange={e => setFormaOd(e.target.value)}>
                {Array.from({ length: 16 }, (_, i) => {
                  const h = String(i + 7).padStart(2, '0');
                  return <option key={h} value={`${h}:00`}>{h}:00</option>;
                })}
              </select>
            </div>
            <div className="field-group">
              <label>Trajanje</label>
              <div className="rez-sati-row">
                <button type="button" className="rez-sati-btn" onClick={() => setFormaSati(s => Math.max(1, s - 1))}>−</button>
                <span className="rez-sati-val">{formaSati} {formaSati === 1 ? 'sat' : 'sata'}</span>
                <button type="button" className="rez-sati-btn" onClick={() => setFormaSati(s => Math.min(8, s + 1))}>+</button>
              </div>
            </div>
          </div>
          <button type="submit" className="modal-btn" disabled={loading}>
            {loading ? 'Dodavanje...' : 'Dodaj termin'}
          </button>
        </form>
      </div>
    </>
  );
}

function ConfirmModal({ naslov, tekst, onPotvrdi, onOtkazi, loading }) {
  return (
    <>
      <div className="modal-overlay active" onClick={onOtkazi} style={{ zIndex: 800 }} />
      <div className="modal active" role="dialog" onClick={e => e.stopPropagation()}
        style={{ maxWidth: 400, textAlign: 'center', padding: '2.5rem 2rem', zIndex: 900 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fde8e8', color: '#E24B4A', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
          <FontAwesomeIcon icon={faTrash} />
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

export default function VlasnikDashboard() {
  const { korisnik }  = useAuth();
  const navigate      = useNavigate();
  const { showToast } = useToast();

  const [objekti,          setObjekti]          = useState([]);
  const [sportovi,         setSportovi]         = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [editObjekat,      setEditObjekat]      = useState(null);
  const [addTerminObjekat, setAddTerminObjekat] = useState(null);
  const [confirm,          setConfirm]          = useState(null);
  const [brisanje,         setBrisanje]         = useState(null);

  useEffect(() => {
    if (korisnik && korisnik.role !== 'Vlasnik') navigate('/');
  }, [korisnik]);

  const ucitajPodatke = async () => {
    if (!korisnik?.id) return;
    setLoading(true);
    try {
      const [obj, sport] = await Promise.all([
        getObjektiApi({ vlasnikId: korisnik.id, perPage: 50 }),
        getSportoviApi(),
      ]);
      setObjekti(obj.data ?? obj.items ?? []);
      setSportovi(Array.isArray(sport) ? sport : sport.data ?? sport.items ?? []);
    } catch {
      showToast('⚠️ Greška pri učitavanju podataka.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { ucitajPodatke(); }, [korisnik?.id]);

  const handleObrisiObjekat = (o) => {
    setConfirm({
      naslov: 'Obriši objekat',
      tekst: `Da li ste sigurni da želite da obrišete "${o.naziv}"? Svi termini će biti obrisani.`,
      onPotvrdi: async () => {
        setBrisanje(o.id);
        try {
          await deleteObjekatApi(o.id);
          setConfirm(null);
          showToast('✅ Objekat obrisan.');
          ucitajPodatke();
        } catch (err) {
          showToast(`⚠️ ${err.message}`);
        } finally {
          setBrisanje(null);
        }
      },
    });
  };

  if (!korisnik || korisnik.role !== 'Vlasnik') return null;

  if (loading) {
    return (
      <div className="results-page">
        <div className="empty-state">
          <div className="empty-icon" style={{ color: '#aaa', fontSize: 32 }}>
            <FontAwesomeIcon icon={faHourglass} />
          </div>
          <h3>Učitavanje...</h3>
        </div>
      </div>
    );
  }

  return (
    <>
      {confirm && (
        <ConfirmModal
          naslov={confirm.naslov}
          tekst={confirm.tekst}
          onPotvrdi={confirm.onPotvrdi}
          onOtkazi={() => setConfirm(null)}
          loading={brisanje !== null}
        />
      )}

      {editObjekat && (
        <EditObjekatModal
          objekat={editObjekat}
          sportovi={sportovi}
          onClose={() => setEditObjekat(null)}
          onSave={ucitajPodatke}
          showToast={showToast}
        />
      )}

      {addTerminObjekat && (
        <AddTerminModal
          objekat={addTerminObjekat}
          sportovi={sportovi}
          onClose={() => setAddTerminObjekat(null)}
          onSave={ucitajPodatke}
          showToast={showToast}
        />
      )}

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="results-title">Moj dashboard</h1>
            <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>Upravljajte objektima i terminima</p>
          </div>
          <button className="btn-solid" onClick={() => navigate('/dodaj-salu')}>
            <FontAwesomeIcon icon={faPlus} style={{ marginRight: 6 }} />
            Dodaj novi objekat
          </button>
        </div>

        {objekti.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon" style={{ fontSize: 32, color: '#aaa' }}>
              <FontAwesomeIcon icon={faBuilding} />
            </div>
            <h3>Nemate objekata</h3>
            <p>Dodajte prvi objekat i počnite da zarađujete.</p>
            <button className="modal-btn" onClick={() => navigate('/dodaj-salu')} style={{ width: 'auto', padding: '0 2rem', marginTop: '1rem' }}>
              <FontAwesomeIcon icon={faPlus} style={{ marginRight: 6 }} />
              Dodaj objekat
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {objekti.map(o => (
              <div key={o.id}
                style={{ background: 'white', border: '1.5px solid #e4e2dc', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.25s' }}
              >
                <div style={{
                  height: 80, display: 'flex', alignItems: 'flex-end', padding: '10px 14px',
                  background: o.slikaUrl
                    ? `linear-gradient(to top, rgba(0,0,0,0.4), transparent), url(${o.slikaUrl})`
                    : 'linear-gradient(135deg, #1a3a2a, #1D9E75)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}>
                  <span style={{ background: 'rgba(0,0,0,0.4)', color: 'white', fontSize: 12, padding: '4px 10px', borderRadius: 50 }}>
                    {o.sportovi?.join(', ') || 'Sport'}
                  </span>
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{o.naziv}</div>
                  <div style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>
                    <FontAwesomeIcon icon={faLocationDot} style={{ marginRight: 4 }} />
                    {o.adresa}
                  </div>
                  {o.opis && <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>{o.opis}</div>}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="qf--light" style={{ flex: 1, textAlign: 'center' }}
                      onClick={() => navigate(`/objekti/${o.id}`)}>
                      <FontAwesomeIcon icon={faEye} style={{ marginRight: 4 }} />Pogledaj
                    </button>
                    <button className="qf--light" style={{ flex: 1, textAlign: 'center', color: '#1D9E75', borderColor: '#E1F5EE' }}
                      onClick={() => setEditObjekat(o)}>
                      <FontAwesomeIcon icon={faPen} style={{ marginRight: 4 }} />Uredi
                    </button>
                    <button className="qf--light" style={{ flex: 1, textAlign: 'center', color: '#3b82f6', borderColor: '#dbeafe' }}
                      onClick={() => setAddTerminObjekat(o)}>
                      <FontAwesomeIcon icon={faPlus} style={{ marginRight: 4 }} />Termin
                    </button>
                    <button className="qf--light" style={{ flex: 1, textAlign: 'center', color: '#E24B4A', borderColor: '#fde8e8' }}
                      onClick={() => handleObrisiObjekat(o)}>
                      <FontAwesomeIcon icon={faTrash} style={{ marginRight: 4 }} />Obriši
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}