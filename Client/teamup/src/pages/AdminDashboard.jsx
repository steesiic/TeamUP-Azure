import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUsersApi, deleteUserApi } from '../api/users';
import { getObjektiApi, deleteObjekatApi } from '../api/objekti';
import { useToast } from '../hooks/useToast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash, faUser, faBuilding, faLocationDot,
  faMagnifyingGlass, faHourglass, faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';

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

export default function AdminDashboard() {
  const { korisnik }  = useAuth();
  const navigate      = useNavigate();
  const { showToast } = useToast();

  const [aktivniTab,  setAktivniTab]  = useState('korisnici');
  const [korisnici,   setKorisnici]   = useState([]);
  const [objekti,     setObjekti]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [confirm,     setConfirm]     = useState(null);
  const [brisanje,    setBrisanje]    = useState(null);
  const [pretraga,    setPretraga]    = useState('');

  useEffect(() => {
    if (korisnik && korisnik.role !== 'Admin') navigate('/');
  }, [korisnik]);

  const ucitajPodatke = async () => {
    setLoading(true);
    try {
      const [kor, obj] = await Promise.all([
        getUsersApi({ perPage: 100 }),
        getObjektiApi({ perPage: 100 }),
      ]);
      setKorisnici(kor.data ?? kor.items ?? []);
      setObjekti(obj.data ?? obj.items ?? []);
    } catch {
      showToast('⚠️ Greška pri učitavanju podataka.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { ucitajPodatke(); }, []);

  const handleObrisiKorisnika = (k) => {
    setConfirm({
      naslov: 'Obriši korisnika',
      tekst: `Da li ste sigurni da želite da obrišete korisnika "${k.ime} ${k.prezime}"?`,
      onPotvrdi: async () => {
        setBrisanje(k.id);
        try {
          await deleteUserApi(k.id);
          setConfirm(null);
          showToast('✅ Korisnik obrisan.');
          ucitajPodatke();
        } catch (err) {
          showToast(`⚠️ ${err.message}`);
        } finally {
          setBrisanje(null);
        }
      },
    });
  };

  const handleObrisiObjekat = (o) => {
    setConfirm({
      naslov: 'Obriši objekat',
      tekst: `Da li ste sigurni da želite da obrišete objekat "${o.naziv}"? Svi termini i rezervacije će biti obrisani.`,
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

  const filtrirani = pretraga.trim() === '' ? korisnici :
    korisnici.filter(k =>
      `${k.ime} ${k.prezime} ${k.email}`.toLowerCase().includes(pretraga.toLowerCase())
    );

  const filtriraniObjekti = pretraga.trim() === '' ? objekti :
    objekti.filter(o =>
      `${o.naziv} ${o.adresa}`.toLowerCase().includes(pretraga.toLowerCase())
    );

  if (!korisnik || korisnik.role !== 'Admin') return null;

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

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="results-title">Admin panel</h1>
            <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>Upravljanje korisnicima i sadržajem</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="input-wrap" style={{ width: 260 }}>
              <FontAwesomeIcon icon={faMagnifyingGlass} className="input-icon" style={{ color: '#aaa', marginLeft: 10 }} />
              <input
                type="text"
                placeholder={aktivniTab === 'korisnici' ? 'Pretraži korisnike...' : 'Pretraži objekte...'}
                value={pretraga}
                onChange={e => setPretraga(e.target.value)}
                style={{ paddingLeft: 36 }}
              />
            </div>
          </div>
        </div>

        <div className="termini-tabs" style={{ marginBottom: '1.5rem' }}>
          <button
            className={`termini-tab${aktivniTab === 'korisnici' ? ' active' : ''}`}
            onClick={() => { setAktivniTab('korisnici'); setPretraga(''); }}>
            <FontAwesomeIcon icon={faUser} style={{ marginRight: 6 }} />
            Korisnici ({korisnici.length})
          </button>
          <button
            className={`termini-tab${aktivniTab === 'objekti' ? ' active' : ''}`}
            onClick={() => { setAktivniTab('objekti'); setPretraga(''); }}>
            <FontAwesomeIcon icon={faBuilding} style={{ marginRight: 6 }} />
            Objekti ({objekti.length})
          </button>
        </div>

        {aktivniTab === 'korisnici' && (
          filtrirani.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon" style={{ color: '#aaa', fontSize: 32 }}>
                <FontAwesomeIcon icon={faUser} />
              </div>
              <h3>Nema korisnika</h3>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtrirani.map(k => (
                <div key={k.id} style={{ background: 'white', border: '1.5px solid #e4e2dc', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--green)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, fontFamily: 'Poppins, sans-serif', flexShrink: 0 }}>
                      {k.ime?.[0]}{k.prezime?.[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{k.ime} {k.prezime}</div>
                      <div style={{ fontSize: 13, color: '#888' }}>{k.email}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, background: 'var(--green-light)', color: 'var(--green-dark)', padding: '3px 10px', borderRadius: 50, fontWeight: 600 }}>
                      {k.role}
                    </span>
                    {k.id !== korisnik.id && (
                      <button
                        className="qf--light"
                        style={{ color: '#E24B4A', borderColor: '#fde8e8', display: 'flex', alignItems: 'center', gap: 4 }}
                        onClick={() => handleObrisiKorisnika(k)}
                        disabled={brisanje === k.id}>
                        {brisanje === k.id ? '...' : <><FontAwesomeIcon icon={faTrash} />Obriši</>}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {aktivniTab === 'objekti' && (
          filtriraniObjekti.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon" style={{ color: '#aaa', fontSize: 32 }}>
                <FontAwesomeIcon icon={faBuilding} />
              </div>
              <h3>Nema objekata</h3>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtriraniObjekti.map(o => (
                <div key={o.id} style={{ background: 'white', border: '1.5px solid #e4e2dc', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg, #1a3a2a, #1D9E75)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, color: 'white' }}>
                      <FontAwesomeIcon icon={faBuilding} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{o.naziv}</div>
                      <div style={{ fontSize: 13, color: '#888' }}>
                        <FontAwesomeIcon icon={faLocationDot} style={{ marginRight: 4 }} />
                        {o.adresa}
                      </div>
                      <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>
                        Vlasnik: {o.vlasnikIme} {o.vlasnikPrezime} • {o.sportovi?.join(', ')}
                      </div>
                    </div>
                  </div>
                  <button
                    className="qf--light"
                    style={{ color: '#E24B4A', borderColor: '#fde8e8', display: 'flex', alignItems: 'center', gap: 4 }}
                    onClick={() => handleObrisiObjekat(o)}
                    disabled={brisanje === o.id}>
                    {brisanje === o.id ? '...' : <><FontAwesomeIcon icon={faTrash} />Obriši</>}
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </>
  );
}