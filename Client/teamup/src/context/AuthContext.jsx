import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

function parseToken(token) {
  try {
    const decoded = jwtDecode(token);
    return {
      id:        Number(decoded.id),
      email:     decoded.email,
      useCases:  decoded.useCase
                   ? (Array.isArray(decoded.useCase)
                       ? decoded.useCase.map(Number)
                       : [Number(decoded.useCase)])
                   : [],
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [korisnik, setKorisnik] = useState(null);
  const [token,    setToken]    = useState(null);

  useEffect(() => {
    const savedToken    = localStorage.getItem('token');
    const savedProfil   = localStorage.getItem('profil');
    if (savedToken) {
      const podaci = parseToken(savedToken);
      if (podaci) {
        setToken(savedToken);
        const profil = savedProfil ? JSON.parse(savedProfil) : {};
        setKorisnik({ ...podaci, ...profil });
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('profil');
      }
    }
  }, []);

  const prijavi = (noviToken, extraPodaci = {}) => {
    localStorage.setItem('token', noviToken);
    const decoded = parseToken(noviToken);
    const profil = { ime: '', prezime: '', slika: null, role: null, ...extraPodaci };
    localStorage.setItem('profil', JSON.stringify(profil));
    setToken(noviToken);
    setKorisnik({ ...decoded, ...profil });
  };

  const odjavi = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('profil');
    setToken(null);
    setKorisnik(null);
  };

  const azurirajProfil = (podaci) => {
    setKorisnik(prev => {
      const novo = { ...prev, ...podaci };
      localStorage.setItem('profil', JSON.stringify({
        ime:     novo.ime,
        prezime: novo.prezime,
        slika:   novo.slika,
        role:    novo.role,
      }));
      return novo;
    });
  };

  return (
    <AuthContext.Provider value={{ korisnik, token, prijavi, odjavi, azurirajProfil }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}