import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import VenueCard from '../components/VenueCard';
import { VenueCardSkeleton } from '../components/Skeleton';
import { getObjektiApi, mapObjekatZaKartu } from '../api/objekti';
import { getSportoviApi } from '../api/sportovi';
import { useToast } from '../hooks/useToast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass, faCalendarDays, faFutbol,
  faUsers, faLock, faBuilding, faBolt,
} from '@fortawesome/free-solid-svg-icons';

const sportGifs = {
  fudbal:  './img/fudbal.gif',
  kosarka: './img/kosarka.gif',
  tenis:   './img/tenis.gif',
};

const GRADOVI = [
  'Beograd', 'Novi Sad', 'Niš', 'Kragujevac', 'Subotica', 'Zrenjanin',
  'Pančevo', 'Čačak', 'Novi Pazar', 'Kraljevo', 'Smederevo', 'Leskovac',
  'Vranje', 'Valjevo', 'Šabac', 'Užice', 'Zaječar', 'Prokuplje', 'Pirot',
  'Kikinda', 'Sombor', 'Jagodina', 'Požarevac', 'Bor', 'Negotin',
  'Kruševac', 'Prijepolje', 'Sremska Mitrovica',
];

export default function Home({ onRezervisi }) {
  const navigate      = useNavigate();
  const { showToast } = useToast();

  const [grad,       setGrad]       = useState('');
  const [sportId,    setSportId]    = useState('');
  const [heroGif,    setHeroGif]    = useState('./img/fudbal.gif');
  const [gifOpacity, setGifOpacity] = useState(0.45);

  const [sportovi,        setSportovi]        = useState([]);
  const [popularniTereni, setPopularniTereni] = useState([]);
  const [loadingTereni,   setLoadingTereni]   = useState(true);

  useEffect(() => {
    getSportoviApi()
      .then(data => setSportovi(Array.isArray(data) ? data : data.data ?? data.items ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoadingTereni(true);
    getObjektiApi({ perPage: 3 })
      .then(data => {
        const lista = Array.isArray(data) ? data : data.data ?? data.items ?? [];
        setPopularniTereni(lista.map(mapObjekatZaKartu));
      })
      .catch(() => {})
      .finally(() => setLoadingTereni(false));
  }, []);

  const handleSportChange = (val) => {
    setSportId(val);
    const sport = sportovi.find(s => String(s.id) === val);
    const naziv = sport?.naziv?.toLowerCase();
    if (naziv && sportGifs[naziv]) {
      setGifOpacity(0);
      setTimeout(() => {
        setHeroGif(sportGifs[naziv]);
        setGifOpacity(0.45);
      }, 400);
    }
  };

  const handleSearch = () => {
    if (!grad && !sportId) {
      showToast('⚠️ Izaberi grad ili sport da bi pretraga radila!');
      return;
    }
    navigate(`/rezultati?grad=${grad}&sportId=${sportId}`);
  };

  const features = [
    { ikona: faBuilding, title: 'Provereni objekti',  text: 'Svi objekti su provereni i ocenjeni od strane korisnika.' },
    { ikona: faBolt,     title: 'Brza rezervacija',    text: 'Rezervišite termin za manje od 60 sekundi.' },
    { ikona: faUsers,    title: 'Timska igra',          text: 'Pozovite prijatelje i organizujte utakmicu.' },
    { ikona: faLock,     title: 'Sigurno plaćanje',     text: 'Vaši podaci su zaštićeni i bezbedni.' },
  ];

  const howSteps = [
    { num: 1, ikona: faMagnifyingGlass, title: 'Pronađite teren',  text: 'Pretražite po gradu, sportu i datumu. Stotine terena na jednom mestu.' },
    { num: 2, ikona: faCalendarDays,    title: 'Izaberite termin', text: 'Vidite slobodne termine u realnom vremenu i rezervišite jednim klikom.' },
    { num: 3, ikona: faFutbol,          title: 'Igrajte!',         text: 'Dobijete potvrdu rezervacije. Dođite na teren i uživajte u igri.' },
  ];

  return (
    <>
      <section className="hero">
        <img src={heroGif} alt="" className="hero-video"
          style={{ opacity: gifOpacity, transition: 'opacity 0.4s ease' }} />
        <div className="hero-overlay" />
        <div className="hero-grid" />

        <div className="hero-content">
          <h1>Pronađi <span className="accent">teren</span><br />i igraj danas</h1>
          <p className="hero-sub">Fudbal, tenis, košarka — slobodni termini u realnom vremenu.</p>

          <div className="search-box">
            <div className="sf">
              <div className="sf-label">Grad</div>
              <select
                value={grad}
                onChange={e => setGrad(e.target.value)}
                style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: grad ? 'white' : 'rgba(255,255,255,0.35)', cursor: 'pointer' }}
              >
                <option value="" disabled hidden>Izaberi grad</option>
                {GRADOVI.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="sf-divider" />
            <div className="sf">
              <div className="sf-label">Sport</div>
              <select value={sportId} onChange={e => handleSportChange(e.target.value)}
                style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 14 }}>
                <option value="" disabled hidden>Izaberi sport</option>
                {sportovi.map(s => <option key={s.id} value={s.id}>{s.naziv}</option>)}
              </select>
            </div>
            <button className="search-btn" onClick={handleSearch}>
              <span>Pretraži</span>
              <span className="btn-arrow">→</span>
            </button>
          </div>
        </div>
      </section>

      <section id="popularni" className="section" style={{ paddingTop: 0 }}>
        <div className="section-head">
          <h2 className="section-title">Popularni tereni</h2>
          <Link className="see-all" to="/rezultati">Vidi sve →</Link>
        </div>
        <div className="venues">
          {loadingTereni
            ? [1, 2, 3].map(i => <VenueCardSkeleton key={i} />)
            : popularniTereni.map(t => <VenueCard key={t.id} teren={t} onRezervisi={onRezervisi} />)
          }
        </div>
      </section>

      <section className="how" id="o_nama" style={{ padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 className="how-title">Kako funkcioniše?</h2>
            <p style={{ color: '#888', fontSize: 16, marginTop: 8, maxWidth: 500, margin: '8px auto 0' }}>
              Za tri jednostavna koraka do savršenog terena
            </p>
          </div>

          <div className="how-steps" style={{ marginBottom: '5rem' }}>
            {howSteps.map(s => (
              <div key={s.num} className="step" style={{ textAlign: 'center' }}>
                <div className="step-num">{s.num}</div>
                <div style={{ fontSize: 28, margin: '12px 0 8px', color: 'var(--green)' }}>
                  <FontAwesomeIcon icon={s.ikona} />
                </div>
                <h3>{s.title}</h3>
                <p style={{ color: '#888', fontSize: 14, lineHeight: 1.6 }}>{s.text}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', background: 'white', borderRadius: 20, border: '1.5px solid #e8e6e0', padding: '2.5rem', marginBottom: '3rem' }}>
            <div>
              <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 26, fontWeight: 800, marginBottom: 14 }}>O nama</h2>
              <p style={{ color: '#666', fontSize: 15, lineHeight: 1.8, marginBottom: 14 }}>
                TeamUP je platforma koja spaja sportiste sa sportskim objektima širom Srbije. Naša misija je da svakome omogućimo lak pristup kvalitetnim sportskim terenima.
              </p>
              <p style={{ color: '#666', fontSize: 15, lineHeight: 1.8 }}>
                Bilo da tražite fudbalski teren za vikend utakmicu, košarkaški teren za trening ili teniski teren za rekreaciju — TeamUP ima savršenu opciju za vas.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {features.map(f => (
                <div key={f.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 18, flexShrink: 0, color: 'var(--green)', width: 22, textAlign: 'center', marginTop: 2 }}>
                    <FontAwesomeIcon icon={f.ikona} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{f.title}</div>
                    <div style={{ fontSize: 13, color: '#888' }}>{f.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #1a3a2a, #1D9E75)',
            borderRadius: 20, padding: '2.5rem', textAlign: 'center',
            marginTop: '3rem'
          }}>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 12 }}>
              Spreman za igru?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, marginBottom: '1.5rem' }}>
              Pronađi slobodan teren u svom gradu i rezerviši ga za nekoliko sekundi.
            </p>
            <button
              onClick={() => navigate('/rezultati')}
              style={{ background: 'white', color: '#1D9E75', border: 'none', padding: '12px 32px', borderRadius: 50, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#E1F5EE'}
              onMouseLeave={e => e.currentTarget.style.background = 'white'}
            >
              Pronađi teren →
            </button>
          </div>
        </div>
      </section>
    </>
  );
}