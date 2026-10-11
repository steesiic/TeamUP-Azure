import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFutbol, faTableTennis, faBasketball,
  faBuilding, faCrown, faCalendarDays, faClock, faStopwatch,
  faXmark, faArrowLeft, faHourglass,
} from '@fortawesome/free-solid-svg-icons';

const STATUS_LABELS = {
  Aktivna:  { tekst: 'Aktivna',  boja: '#1D9E75', bg: '#E1F5EE' },
  Otkazana: { tekst: 'Otkazana', boja: '#888',    bg: '#f1efe8' },
  Zavrsena: { tekst: 'Završena', boja: '#888',    bg: '#f1efe8' },
};

const SPORT_IKONA = {
  Fudbal:  faFutbol,
  Tenis:   faTableTennis,
  Kosarka: faBasketball,
};

function formatDatum(datumStr) {
  if (!datumStr) return '';
  const d = new Date(datumStr);
  const meseci = ['jan','feb','mar','apr','maj','jun','jul','avg','sep','okt','nov','dec'];
  return `${d.getDate()}. ${meseci[d.getMonth()]} ${d.getFullYear()}.`;
}

export default function TerminCard({ termin, onClick, onOtkazi, onNapusti }) {
  const { korisnik } = useAuth();

  const t  = termin.termin;
  const st = STATUS_LABELS[termin.status] ?? { tekst: termin.status, boja: '#888', bg: '#f1efe8' };

  const jeGlavniIgrac = korisnik?.id === termin.glavniIgracId;
  const mojStatus     = termin.igraci?.find(i => i.igracId === korisnik?.id)?.status;
  const cekaPotvrdu   = !jeGlavniIgrac && mojStatus === 'CekaPotvrdu';

  const odobreni = termin.igraci?.filter(i => i.status === 'Prihvacen') ?? [];
  const cekaju   = termin.igraci?.filter(i => i.status === 'CekaPotvrdu') ?? [];

  const sportNaziv = termin.sportNaziv ?? t?.sportNaziv ?? '';
  const ikona = SPORT_IKONA[sportNaziv] ?? faBuilding;

  return (
    <div className="termin-card">
      <div className="termin-card-header" style={{ background: '#e8f4ea' }} onClick={onClick}>
        <span className="vcard-sport-badge">
          <FontAwesomeIcon icon={ikona} style={{ marginRight: 5 }} />
          {sportNaziv}
        </span>
        <span className="termin-status-badge" style={{ background: st.bg, color: st.boja }}>
          {st.tekst}
        </span>
      </div>

      <div className="termin-card-body" onClick={onClick}>
        <div className="termin-card-top">
          <div className="termin-card-naziv">{t?.objekatNaziv ?? '—'}</div>
          {jeGlavniIgrac && (
            <span className="termin-vodja-badge">
              <FontAwesomeIcon icon={faCrown} style={{ marginRight: 4, color: '#B87514' }} />
              Vođa
            </span>
          )}
          {cekaPotvrdu && (
            <span style={{
              fontSize: 11, fontWeight: 600, color: '#D97706',
              background: '#FEF3E2', border: '1px solid #F5CC84',
              borderRadius: 50, padding: '3px 10px',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <FontAwesomeIcon icon={faHourglass} />
              Čeka odobrenje
            </span>
          )}
        </div>

        <div className="termin-card-info">
          {t?.datum   && <span><FontAwesomeIcon icon={faCalendarDays} style={{ marginRight: 4 }} />{formatDatum(t.datum)}</span>}
          {t?.vremeOd && <span><FontAwesomeIcon icon={faClock} style={{ marginRight: 4 }} />{t.vremeOd?.slice(0,5)}h</span>}
          {t?.vremeDo && <span><FontAwesomeIcon icon={faStopwatch} style={{ marginRight: 4 }} />do {t.vremeDo?.slice(0,5)}h</span>}
        </div>

        <div className="termin-card-footer">
          <div className="termin-igraci-row">
            <div className="termin-igraci-avatari">
              {odobreni.slice(0, 5).map((ig, idx) => (
                <div key={ig.id} className="igrac-avatar" style={{ zIndex: 10 - idx }}
                  title={`${ig.igracIme} ${ig.igracPrezime}`}>
                  {ig.igracIme?.[0]}{ig.igracPrezime?.[0]}
                </div>
              ))}
              {odobreni.length > 5 && (
                <div className="igrac-avatar igrac-avatar--more">+{odobreni.length - 5}</div>
              )}
            </div>
            <span className="termin-kapacitet">{odobreni.length}/{termin.maxIgraca}</span>
          </div>

          <div className="termin-card-desno">
            {jeGlavniIgrac && cekaju.length > 0 && (
              <span className="termin-ceka-badge">{cekaju.length} čeka</span>
            )}
            {t?.cena && (
              <div className="termin-card-cena">
                {Number(t.cena).toLocaleString()} <span>RSD</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {onOtkazi && (
        <div style={{ padding: '0 16px 14px' }}>
          <button onClick={e => { e.stopPropagation(); onOtkazi(); }}
            style={{ width: '100%', height: 36, background: 'none', border: '1.5px solid #fde8e8', borderRadius: 8, color: '#E24B4A', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fde8e8'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}>
            <FontAwesomeIcon icon={faXmark} /> Otkaži rezervaciju
          </button>
        </div>
      )}

      {onNapusti && (
        <div style={{ padding: '0 16px 14px' }}>
          <button onClick={e => { e.stopPropagation(); onNapusti(); }}
            style={{ width: '100%', height: 36, background: 'none', border: '1.5px solid #e4e2dc', borderRadius: 8, color: '#888', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f1efe8'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}>
            <FontAwesomeIcon icon={faArrowLeft} /> Napusti termin
          </button>
        </div>
      )}
    </div>
  );
}