import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getObjektiApi } from '../api/objekti';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass, faLocationDot, faBuilding, faUser, faCalendarDays,
  faChartBar, faShield, faRightFromBracket, faXmark,
} from '@fortawesome/free-solid-svg-icons';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function Navbar({ onLogin, onRegister, homeHref = '/' }) {
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [dropdownOpen,  setDropdownOpen]  = useState(false);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [sugestije,     setSugestije]     = useState([]);
  const [searchOpen,    setSearchOpen]    = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const navigate     = useNavigate();
  const location     = useLocation();
  const { korisnik, odjavi } = useAuth();
  const dropdownRef  = useRef(null);
  const searchRef    = useRef(null);

  const debouncedQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target))
        setSearchOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSugestije([]);
      return;
    }
    setSearchLoading(true);
    getObjektiApi({ naziv: debouncedQuery, perPage: 6 })
      .then(data => {
        const lista = data.data ?? data.items ?? [];
        setSugestije(lista);
        setSearchOpen(true);
      })
      .catch(() => setSugestije([]))
      .finally(() => setSearchLoading(false));
  }, [debouncedQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchOpen(false);
    navigate(`/rezultati?naziv=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
  };

  const handleSugestijaKlik = (objekat) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(`/objekti/${objekat.id}`);
  };

  const handleOdjava = () => {
    odjavi();
    setDropdownOpen(false);
    setMenuOpen(false);
    navigate('/');
  };

  const scrollTo = (id) => {
    navigate(homeHref);
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const inicijali = korisnik
    ? `${korisnik.ime?.[0] ?? ''}${korisnik.prezime?.[0] ?? ''}`.toUpperCase()
    : '';

  const jeVlasnik = korisnik?.role === 'Vlasnik';
  const jeIgrac   = korisnik?.role === 'Igrac';
  const jeAdmin   = korisnik?.role === 'Admin';
  const jeAktivan = (path) => location.pathname === path;

  const activeStyle = {
    background: 'var(--green-light)',
    borderColor: 'var(--green)',
    color: 'var(--green-dark)',
    border: '1.5px solid',
    borderRadius: 50,
    padding: '6px 15px',
  };

  const handleMojiTermini = () => {
    navigate('/moji-termini');
    setDropdownOpen(false);
    setMenuOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-logo" onClick={() => { navigate(homeHref); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ cursor: 'pointer' }}>
          Team<span>UP</span>
        </div>

        <ul className="nav-links">
          <li>
            <Link to={homeHref}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              style={ location.pathname === '/' ? activeStyle : {} }>
              Početna
            </Link>
          </li>
          <li>
            <a href="#popularni" onClick={e => { e.preventDefault(); scrollTo('popularni'); }}>
              Popularni tereni
            </a>
          </li>
          <li>
            <a href="#o_nama" onClick={e => { e.preventDefault(); scrollTo('o_nama'); }}>
              O nama
            </a>
          </li>
          {jeIgrac && (
            <li>
              <Link to="/moji-termini"
                style={ jeAktivan('/moji-termini') ? activeStyle : {} }>
                Moji termini
              </Link>
            </li>
          )}
          {jeVlasnik && (
            <li>
              <Link to="/vlasnik-dashboard"
                style={ jeAktivan('/vlasnik-dashboard') ? activeStyle : {} }>
                Moj dashboard
              </Link>
            </li>
          )}
        </ul>

        <div className="nav-cta">
          <div ref={searchRef} style={{ position: 'relative' }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#f8f7f4', border: '1.5px solid #e4e2dc',
                borderRadius: 50, padding: '6px 14px', height: 36,
                transition: 'all 0.2s',
                boxShadow: searchQuery ? '0 0 0 3px rgba(29,158,117,0.1)' : 'none',
                borderColor: searchQuery ? 'var(--green)' : '#e4e2dc',
              }}>
                <FontAwesomeIcon icon={faMagnifyingGlass} style={{ fontSize: 13, color: '#aaa' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); if (e.target.value.length >= 2) setSearchOpen(true); }}
                  onFocus={() => { if (sugestije.length > 0) setSearchOpen(true); }}
                  placeholder="Pretraži objekte..."
                  style={{
                    background: 'none', border: 'none', outline: 'none',
                    fontSize: 13, color: '#1a1a1a', width: 160,
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                />
                {searchQuery && (
                  <button type="button" onClick={() => { setSearchQuery(''); setSugestije([]); setSearchOpen(false); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 14, padding: 0, lineHeight: 1 }}>
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                )}
              </div>
            </form>

            {searchOpen && (searchLoading || sugestije.length > 0) && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0,
                background: 'white', border: '1px solid #e8e6e0',
                borderRadius: 14, minWidth: 260, boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                zIndex: 400, overflow: 'hidden',
              }}>
                {searchLoading && (
                  <div style={{ padding: '12px 16px', fontSize: 13, color: '#aaa', textAlign: 'center' }}>Pretraga...</div>
                )}
                {!searchLoading && sugestije.map(o => (
                  <div key={o.id} onClick={() => handleSugestijaKlik(o)}
                    style={{ padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid #f5f4f0', transition: 'background 0.15s', display: 'flex', alignItems: 'center', gap: 10 }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8f7f4'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #1a3a2a, #1D9E75)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FontAwesomeIcon icon={faBuilding} style={{ color: 'white', fontSize: 14 }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{o.naziv}</div>
                      <div style={{ fontSize: 11, color: '#aaa' }}>
                        <FontAwesomeIcon icon={faLocationDot} style={{ marginRight: 4 }} />
                        {o.adresa}
                      </div>
                    </div>
                  </div>
                ))}
                {!searchLoading && sugestije.length > 0 && (
                  <div onClick={handleSearchSubmit}
                    style={{ padding: '10px 16px', cursor: 'pointer', fontSize: 13, color: 'var(--green)', fontWeight: 600, textAlign: 'center', background: '#f8f7f4' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--green-light)'}
                    onMouseLeave={e => e.currentTarget.style.background = '#f8f7f4'}
                  >
                    Prikaži sve rezultate →
                  </div>
                )}
                {!searchLoading && sugestije.length === 0 && debouncedQuery.length >= 2 && (
                  <div style={{ padding: '12px 16px', fontSize: 13, color: '#aaa', textAlign: 'center' }}>
                    Nema rezultata za "{debouncedQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {jeVlasnik && (
            <button className="btn-iznajmi" onClick={() => navigate('/dodaj-salu')}>
              + Iznajmi salu
            </button>
          )}

          {korisnik ? (
            <div className="nav-avatar-wrap" ref={dropdownRef}>
              <button className="nav-avatar" onClick={() => setDropdownOpen(o => !o)}
                title={`${korisnik.ime} ${korisnik.prezime}`}>
                {korisnik.slika
                  ? <img src={korisnik.slika} alt={inicijali} />
                  : inicijali
                }
              </button>

              {dropdownOpen && (
                <div className="nav-dropdown">
                  <div className="nav-dropdown-header">
                    <div className="nav-dropdown-avatar">
                      {korisnik.slika
                        ? <img src={korisnik.slika} alt={inicijali} />
                        : inicijali
                      }
                    </div>
                    <div>
                      <div className="nav-dropdown-ime">{korisnik.ime} {korisnik.prezime}</div>
                      <div className="nav-dropdown-email">{korisnik.email}</div>
                    </div>
                  </div>

                  <div className="nav-dropdown-divider" />

                  <button className="nav-dropdown-item" onClick={() => { navigate('/profil'); setDropdownOpen(false); }}>
                    <FontAwesomeIcon icon={faUser} style={{ marginRight: 8, width: 14 }} />
                    Moj profil
                  </button>
                  {jeIgrac && (
                    <button className="nav-dropdown-item" onClick={handleMojiTermini}>
                      <FontAwesomeIcon icon={faCalendarDays} style={{ marginRight: 8, width: 14 }} />
                      Moji termini
                    </button>
                  )}
                  {jeVlasnik && (
                    <button className="nav-dropdown-item" onClick={() => { navigate('/vlasnik-dashboard'); setDropdownOpen(false); }}>
                      <FontAwesomeIcon icon={faChartBar} style={{ marginRight: 8, width: 14 }} />
                      Moj dashboard
                    </button>
                  )}
                  {jeAdmin && (
                    <button className="nav-dropdown-item" onClick={() => { navigate('/admin'); setDropdownOpen(false); }}>
                      <FontAwesomeIcon icon={faShield} style={{ marginRight: 8, width: 14 }} />
                      Admin panel
                    </button>
                  )}
                  {jeVlasnik && (
                    <button className="nav-dropdown-item" onClick={() => { navigate('/dodaj-salu'); setDropdownOpen(false); }}>
                      <FontAwesomeIcon icon={faBuilding} style={{ marginRight: 8, width: 14 }} />
                      Iznajmi salu
                    </button>
                  )}

                  <div className="nav-dropdown-divider" />

                  <button className="nav-dropdown-item nav-dropdown-item--odjava" onClick={handleOdjava}>
                    <FontAwesomeIcon icon={faRightFromBracket} style={{ marginRight: 8, width: 14 }} />
                    Odjavi se
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className="btn-outline" onClick={onLogin}>Prijavi se</button>
              <button className="btn-solid"   onClick={onRegister}>Registruj se</button>
            </>
          )}
        </div>

        <button className="hamburger" aria-label="Meni" onClick={() => setMenuOpen(o => !o)}>
          <span style={{ transform: menuOpen ? 'translateY(7px) rotate(45deg)' : '' }} />
          <span style={{ opacity: menuOpen ? '0' : '' }} />
          <span style={{ transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : '' }} />
        </button>
      </nav>

      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <Link to={homeHref} onClick={() => { setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Početna</Link>
        <a href="#popularni" onClick={e => { e.preventDefault(); setMenuOpen(false); scrollTo('popularni'); }}>Popularni tereni</a>
        {jeIgrac && (
          <Link to="/moji-termini" onClick={() => setMenuOpen(false)}>Moji termini</Link>
        )}
        <a href="#o_nama" onClick={e => { e.preventDefault(); setMenuOpen(false); scrollTo('o_nama'); }}>O nama</a>
        {jeVlasnik && (
          <a href="#" onClick={e => { e.preventDefault(); setMenuOpen(false); navigate('/dodaj-salu'); }}>+ Iznajmi salu</a>
        )}
        {korisnik && (
          <Link to="/profil" onClick={() => setMenuOpen(false)}>
            <FontAwesomeIcon icon={faUser} style={{ marginRight: 8 }} />
            Moj profil
          </Link>
        )}
        {jeVlasnik && (
          <Link to="/vlasnik-dashboard" onClick={() => setMenuOpen(false)}>
            <FontAwesomeIcon icon={faChartBar} style={{ marginRight: 8 }} />
            Moj dashboard
          </Link>
        )}
        {jeAdmin && (
          <Link to="/admin" onClick={() => setMenuOpen(false)}>
            <FontAwesomeIcon icon={faShield} style={{ marginRight: 8 }} />
            Admin panel
          </Link>
        )}
        {korisnik && (
          <a href="#" style={{ color: '#E24B4A' }} onClick={e => { e.preventDefault(); handleOdjava(); }}>
            <FontAwesomeIcon icon={faRightFromBracket} style={{ marginRight: 8 }} />
            Odjavi se
          </a>
        )}
        {!korisnik && (
          <>
            <a href="#" className="mobile-cta" onClick={e => { e.preventDefault(); setMenuOpen(false); onLogin(); }}>
              Prijavi se
            </a>
            <a href="#" className="mobile-cta" onClick={e => { e.preventDefault(); setMenuOpen(false); onRegister(); }}>
              Registruj se
            </a>
          </>
        )}
      </div>
    </>
  );
}