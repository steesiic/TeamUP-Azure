import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFutbol, faBasketball, faTableTennis,
  faLocationDot, faEnvelope, faPhone,
} from '@fortawesome/free-solid-svg-icons';

const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

export default function Footer() {
  const { korisnik } = useAuth();
  const jeVlasnik = korisnik?.role === 'Vlasnik';
  const jeIgrac   = korisnik?.role === 'Igrac';
  const jeAdmin   = korisnik?.role === 'Admin';

  const navLinks = [
    { label: 'Početna',         path: '/',                  show: true },
    { label: 'Pretraga terena', path: '/rezultati',         show: true },
    { label: 'Moji termini',    path: '/moji-termini',      show: jeIgrac },
    { label: 'Iznajmi salu',    path: '/dodaj-salu',        show: jeVlasnik },
    { label: 'Moj dashboard',   path: '/vlasnik-dashboard', show: jeVlasnik },
    { label: 'Admin panel',     path: '/admin',             show: jeAdmin },
  ].filter(l => l.show);

  const sportIkone = [faFutbol, faBasketball, faTableTennis];

  const kontakt = [
    { ikona: faLocationDot, text: 'Niš, Srbija' },
    { ikona: faEnvelope,    text: 'info@teamup.rs' },
    { ikona: faPhone,       text: '+381 18 420 6767' },
  ];

  return (
    <footer style={{ background: '#0f1f17', color: '#a0b8a8', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '4rem 2rem 2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem' }}>

        {/* Brand */}
        <div>
          <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 24, color: 'white', marginBottom: 12 }}>
            Team<span style={{ color: '#1D9E75' }}>UP</span>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: '#7a9a88', maxWidth: 220 }}>
            Platforma koja spaja sportiste sa savršenim terenima. Rezervišite, igrajte, pobedite.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            {sportIkone.map((ikona, i) => (
              <FontAwesomeIcon key={i} icon={ikona} style={{ fontSize: 18, color: '#1D9E75' }} />
            ))}
          </div>
        </div>

        {/* Navigacija */}
        <div>
          <div style={{ color: 'white', fontWeight: 600, fontSize: 14, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Navigacija
          </div>
          {navLinks.map(l => (
            <div key={l.label} style={{ marginBottom: 10 }}>
              <Link
                to={l.path}
                onClick={scrollTop}
                style={{ fontSize: 14, color: '#7a9a88', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#1D9E75'}
                onMouseLeave={e => e.target.style.color = '#7a9a88'}
              >
                {l.label}
              </Link>
            </div>
          ))}
        </div>

        {/* Kontakt */}
        <div>
          <div style={{ color: 'white', fontWeight: 600, fontSize: 14, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Kontakt
          </div>
          {kontakt.map(k => (
            <div key={k.text} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12, fontSize: 14, color: '#7a9a88' }}>
              <FontAwesomeIcon icon={k.ikona} style={{ marginTop: 2, color: '#1D9E75', flexShrink: 0 }} />
              <span>{k.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid #1e3028', maxWidth: 1200, margin: '0 auto' }} />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 2rem', textAlign: 'center' }}>
        <p style={{ fontSize: 15, color: '#6a8a78', margin: 0, fontWeight: 500 }}>
          © 2026 TeamUP — ST3CH. Sva prava zadržana.
        </p>
      </div>
    </footer>
  );
}