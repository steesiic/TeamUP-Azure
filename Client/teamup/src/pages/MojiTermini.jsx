import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRezervacijeApi, otkaziRezervacijuApi, leaveTerminApi } from '../api/rezervacije';
import TerminCard from '../components/TerminCard';
import { TerminCardSkeleton } from '../components/Skeleton';
import { useToast } from '../hooks/useToast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleCheck, faCircleXmark, faList,
  faTriangleExclamation, faLock, faCalendarDays,
  faXmark, faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';

const tabs = [
  { id: 'aktivni',  label: 'Aktivni',     ikona: faCircleCheck  },
  { id: 'otkazani', label: 'Otkazani',    ikona: faCircleXmark  },
  { id: 'svi',      label: 'Svi termini', ikona: faList         },
];

function ConfirmModal({ naslov, tekst, dugme, boja, onPotvrdi, onOtkazi, loading }) {
  return (
    <>
      <div className="modal-overlay active" onClick={onOtkazi} />
      <div className="modal active" onClick={e => e.stopPropagation()}
        style={{ maxWidth: 380, textAlign: 'center', padding: '2.5rem 2rem' }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          background: boja === 'red' ? '#fde8e8' : '#f1efe8',
          color: boja === 'red' ? '#E24B4A' : '#888',
          fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem'
        }}>
          {boja === 'red'
            ? <FontAwesomeIcon icon={faXmark} />
            : <FontAwesomeIcon icon={faArrowLeft} />
          }
        </div>
        <h2 className="modal-title">{naslov}</h2>
        <p className="modal-sub">{tekst}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-outline" style={{ flex: 1 }} onClick={onOtkazi} disabled={loading}>Nazad</button>
          <button
            style={{ flex: 1, height: 48, background: boja === 'red' ? '#E24B4A' : '#888', color: 'white', border: 'none', borderRadius: 12, fontFamily: 'DM Sans, sans-serif', fontSize: 15, fontWeight: 500, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
            onClick={onPotvrdi} disabled={loading}>
            {loading ? 'Molimo sačekajte...' : dugme}
          </button>
        </div>
      </div>
    </>
  );
}

export default function MojiTermini({ onOtvoriTermin }) {
  const { korisnik }  = useAuth();
  const navigate      = useNavigate();
  const { showToast } = useToast();

  const [aktivan,  setAktivan]  = useState('aktivni');
  const [termini,  setTermini]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [greska,   setGreska]   = useState('');
  const [confirm,  setConfirm]  = useState(null);
  const [akcija,   setAkcija]   = useState(false);

  const ucitaj = () => {
    if (!korisnik?.id) return;
    setLoading(true);
    setGreska('');
    Promise.all([
      getRezervacijeApi({ glavniIgracId: korisnik.id, perPage: 100 }),
      getRezervacijeApi({ igracId: korisnik.id, perPage: 100 }),
    ])
      .then(([kaoGlavni, kaoIgrac]) => {
        const glavne = kaoGlavni.data ?? kaoGlavni.items ?? [];
        const igrac  = (kaoIgrac.data ?? kaoIgrac.items ?? [])
          .filter(r => r.glavniIgracId !== korisnik.id);
        setTermini([...glavne, ...igrac]);
      })
      .catch(() => setGreska('Greška pri učitavanju termina.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { ucitaj(); }, [korisnik?.id]);

  const handleOtkazi = (termin) => {
    setConfirm({
      naslov: 'Otkaži rezervaciju',
      tekst:  `Da li ste sigurni da želite da otkažete rezervaciju za "${termin.termin?.objekatNaziv ?? 'ovaj termin'}"? Termin će ponovo postati slobodan.`,
      dugme:  'Da, otkaži',
      boja:   'red',
      onPotvrdi: async () => {
        setAkcija(true);
        try {
          await otkaziRezervacijuApi(termin.id);
          setConfirm(null);
          showToast('✅ Rezervacija uspešno otkazana.');
          ucitaj();
        } catch (err) {
          showToast(`⚠️ ${err.message}`);
        } finally {
          setAkcija(false);
        }
      },
    });
  };

  const handleNapusti = (termin) => {
    setConfirm({
      naslov: 'Napusti termin',
      tekst:  `Da li ste sigurni da želite da napustite termin u "${termin.termin?.objekatNaziv ?? 'ovom objektu'}"?`,
      dugme:  'Da, napusti',
      boja:   'gray',
      onPotvrdi: async () => {
        setAkcija(true);
        try {
          await leaveTerminApi(termin.id, korisnik.id);
          setConfirm(null);
          showToast('✅ Uspešno ste napustili termin.');
          ucitaj();
        } catch (err) {
          showToast(`⚠️ ${err.message}`);
        } finally {
          setAkcija(false);
        }
      },
    });
  };

  if (!korisnik) {
    return (
      <div className="moji-termini-page" style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="empty-state">
          <div className="empty-icon" style={{ color: '#aaa', fontSize: 32 }}>
            <FontAwesomeIcon icon={faLock} />
          </div>
          <h3>Niste prijavljeni</h3>
          <p>Prijavite se da biste videli svoje termine.</p>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
            <button className="modal-btn" onClick={() => navigate('/')}
              style={{ width: 'auto', padding: '0 2rem' }}>
              Idi na početnu →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filtrirani = termini
    .filter(t => {
      if (aktivan === 'aktivni')  return t.status === 'Aktivna';
      if (aktivan === 'otkazani') return t.status === 'Otkazana';
      return true;
    })
    .sort((a, b) => new Date(a.termin?.datum ?? 0) - new Date(b.termin?.datum ?? 0));

  const jeGlavniIgrac    = (t) => t.glavniIgracId === korisnik?.id;
  const jePridruzenIgrac = (t) => !jeGlavniIgrac(t) &&
    t.igraci?.some(i => i.igracId === korisnik?.id && i.status === 'Prihvacen');

  return (
    <>
      {confirm && (
        <ConfirmModal
          naslov={confirm.naslov}
          tekst={confirm.tekst}
          dugme={confirm.dugme}
          boja={confirm.boja}
          onPotvrdi={confirm.onPotvrdi}
          onOtkazi={() => setConfirm(null)}
          loading={akcija}
        />
      )}

      <div className="moji-termini-page">
        <div className="moji-termini-header">
          <div>
            <h1 className="results-title">Moji termini</h1>
            <p className="results-sub">
              {loading ? 'Učitavanje...' : `${termini.length} ${termini.length === 1 ? 'termin' : 'termina'} ukupno`}
            </p>
          </div>
        </div>

        <div className="termini-tabs">
          {tabs.map(tab => (
            <button key={tab.id} className={`termini-tab${aktivan === tab.id ? ' active' : ''}`}
              onClick={() => setAktivan(tab.id)}>
              <FontAwesomeIcon icon={tab.ikona} style={{ marginRight: 6 }} />
              {tab.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="termini-grid">
            {[1, 2, 3].map(i => <TerminCardSkeleton key={i} />)}
          </div>
        )}

        {!loading && greska && (
          <div className="empty-state">
            <div className="empty-icon" style={{ color: '#E24B4A', fontSize: 32 }}>
              <FontAwesomeIcon icon={faTriangleExclamation} />
            </div>
            <h3>Greška</h3>
            <p>{greska}</p>
          </div>
        )}

        {!loading && !greska && filtrirani.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon" style={{ color: '#aaa', fontSize: 32 }}>
              <FontAwesomeIcon icon={faCalendarDays} />
            </div>
            <h3>Nema termina</h3>
            <p>Rezervišite teren ili se pridružite postojećem terminu.</p>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
              <button className="modal-btn" onClick={() => navigate('/rezultati')}
                style={{ width: 'auto', padding: '0 2rem' }}>
                Pronađi teren →
              </button>
            </div>
          </div>
        )}

        {!loading && !greska && filtrirani.length > 0 && (
          <div className="termini-grid">
            {filtrirani.map(t => (
              <TerminCard
                key={t.id}
                termin={t}
                onClick={() => onOtvoriTermin(t, ucitaj)}
                onOtkazi={t.status === 'Aktivna' && jeGlavniIgrac(t) ? () => handleOtkazi(t) : null}
                onNapusti={t.status === 'Aktivna' && jePridruzenIgrac(t) ? () => handleNapusti(t) : null}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}