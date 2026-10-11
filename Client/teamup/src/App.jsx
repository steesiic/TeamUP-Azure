import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import Navbar            from './components/Navbar';
import Footer            from './components/Footer';
import ModalManager      from './components/ModalManager';
import Home              from './pages/Home';
import Results           from './pages/Results';
import MojiTermini       from './pages/MojiTermini';
import DodajSalu         from './pages/DodajSalu';
import ObjekatDetalji    from './pages/ObjekatDetalji';
import Profil            from './pages/Profil';
import VlasnikDashboard  from './pages/VlasnikDashboard';
import AdminDashboard    from './pages/AdminDashboard';
import { useModal }      from './hooks/useModal';
import { useAuth }       from './context/AuthContext';
import NotFound          from './pages/NotFound';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}


function ProtectedRoute({ children, role = null }) {
  const { korisnik } = useAuth();

  // Nije prijavljen
  if (!korisnik) {
    return (
      <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="empty-state">
          <div className="empty-icon" style={{ color: '#aaa', fontSize: 32 }}>
            <FontAwesomeIcon icon={faLock} />
          </div>
          <h3>Niste prijavljeni</h3>
          <p>Prijavite se da biste pristupili ovoj stranici.</p>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
            <a href="/" className="modal-btn" style={{ width: 'auto', padding: '0 2rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              Idi na početnu →
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Prijavljen ali pogresna rola
  if (role && korisnik.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  const {
    activeModal,
    openModal,
    openRezervacija,
    openTermin,
    closeModal,
    rezervacijaTeren,
    rezervacijaDetalji,
    aktivniTermin,
    terminPromena,
    handleRezervacijaSuccess,
  } = useModal();

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar
        onLogin={()    => openModal('login')}
        onRegister={()  => openModal('register')}
        homeHref="/"
      />

      <main style={{ minHeight: 'calc(100vh - 64px)' }}>
        <Routes>
          {/*Javne rute*/}
          <Route path="/"            element={<Home           onRezervisi={openRezervacija} />} />
          <Route path="/rezultati"   element={<Results        onRezervisi={openRezervacija} />} />
          <Route path="/objekti/:id" element={<ObjekatDetalji onOtvoriTermin={openTermin} onRezervisi={openRezervacija} />} />
          <Route path="/profil"      element={<Profil />} />
          <Route path="/profil/:id"  element={<Profil />} />

          {/* Samo prijavljeni */}
          <Route path="/moji-termini" element={
            <ProtectedRoute role="Igrac">
              <MojiTermini onOtvoriTermin={openTermin} />
            </ProtectedRoute>
          } />

          {/* Samo Vlasnik */}
          <Route path="/dodaj-salu" element={
            <ProtectedRoute role="Vlasnik">
              <DodajSalu />
            </ProtectedRoute>
          } />
          <Route path="/vlasnik-dashboard" element={
            <ProtectedRoute role="Vlasnik">
              <VlasnikDashboard />
            </ProtectedRoute>
          } />

          {/* Samo Admin */}
          <Route path="/admin" element={
            <ProtectedRoute role="Admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />

      <ModalManager
        activeModal={activeModal}
        openModal={openModal}
        closeModal={closeModal}
        rezervacijaTeren={rezervacijaTeren}
        rezervacijaDetalji={rezervacijaDetalji}
        onRezervacijaSuccess={handleRezervacijaSuccess}
        aktivniTermin={aktivniTermin}
        terminPromena={terminPromena}
      />
    </BrowserRouter>
  );
}