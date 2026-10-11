import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getOceneApi } from '../api/ocene';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLocationDot, faStar, faFutbol, faTableTennis,
  faBasketball, faBuilding,
} from '@fortawesome/free-solid-svg-icons';

const SPORT_BOJA = {
  Fudbal:  'vcard-img--green',
  Tenis:   'vcard-img--blue',
  Košarka: 'vcard-img--amber',
};

const SPORT_IKONA = {
  Fudbal:  faFutbol,
  Tenis:   faTableTennis,
  Košarka: faBasketball,
};

export default function VenueCard({ teren, datum }) {
  const navigate = useNavigate();
  const [prosek,    setProsek]    = useState(null);
  const [brojOcena, setBrojOcena] = useState(0);

  const prvSport = teren.sportovi?.[0] ?? '';
  const boja     = teren.boja !== 'color-default' ? teren.boja : (SPORT_BOJA[prvSport] ?? 'vcard-img--green');
  const ikona    = SPORT_IKONA[prvSport] ?? faBuilding;

  useEffect(() => {
    getOceneApi(teren.id)
      .then(ocene => {
        if (ocene.length > 0) {
          const avg = ocene.reduce((s, o) => s + o.vrednost, 0) / ocene.length;
          setProsek(avg.toFixed(1));
          setBrojOcena(ocene.length);
        }
      })
      .catch(() => {});
  }, [teren.id]);

  const handleKlik = () => {
    const url = datum
      ? `/objekti/${teren.id}?datum=${datum}`
      : `/objekti/${teren.id}`;
    navigate(url);
  };

  const imaCenu = teren.prosecnaCena != null;

  return (
    <div className="vcard" onClick={handleKlik} style={{ cursor: 'pointer' }}>
      <div className={`vcard-img ${boja}`} style={
        teren.slikaUrl ? {
          backgroundImage: `url(${teren.slikaUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : {}
      }>
        {prosek && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            background: 'rgba(255,255,255,0.95)', borderRadius: 50,
            padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 13, fontWeight: 600, color: '#412402', zIndex: 1,
          }}>
            <FontAwesomeIcon icon={faStar} style={{ color: '#F5A623', fontSize: 11 }} />
            {prosek}
          </div>
        )}

    </div>

      <div className="vcard-body">
        <div className="vcard-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className="vcard-name">{teren.naziv}</div>
          {imaCenu && (
            <div style={{ fontSize: 12, color: '#1D9E75', fontWeight: 600, whiteSpace: 'nowrap', marginLeft: 8, marginTop: 2 }}>
              ~{Math.round(teren.prosecnaCena).toLocaleString()} RSD
            </div>
          )}
        </div>

        <div className="vcard-loc">
          <FontAwesomeIcon icon={faLocationDot} style={{ marginRight: 4 }} />
          {teren.lokacija ?? teren.adresa}
        </div>

        <div className="vcard-amenities">
          {(teren.amenities ?? teren.sportovi ?? []).map(a => (
            <span key={a} className="amenity">{a}</span>
          ))}
        </div>

        <div className="vcard-footer">
          {prosek ? (
            <span style={{ fontSize: 12, color: '#aaa', display: 'flex', alignItems: 'center', gap: 4 }}>
              <FontAwesomeIcon icon={faStar} style={{ color: '#F5A623', fontSize: 10 }} />
              {prosek} ({brojOcena} {brojOcena === 1 ? 'ocena' : 'ocena'})
            </span>
          ) : (
            <span style={{ fontSize: 12, color: '#ccc' }}>Bez ocena</span>
          )}
          {imaCenu ? (
            <div className="vcard-price" style={{ color: '#aaa' }}>
              Pogledaj termine →
            </div>
          ) : (
            <div style={{ fontSize: 12, color: '#ccc', fontStyle: 'italic' }}>
              Nema termina
            </div>
          )}
        </div>
      </div>
    </div>
  );
}