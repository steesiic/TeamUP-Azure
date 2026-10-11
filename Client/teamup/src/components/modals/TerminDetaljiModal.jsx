import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { updateIgracStatusApi, leaveTerminApi, getRezervacijaApi, otkaziRezervacijuApi } from '../../api/rezervacije';
import { getOceneIgracaApi, createOcenaIgracaApi, updateOcenaIgracaApi } from '../../api/oceneIgraca';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarDays, faClock, faCheck, faXmark, faCrown,
  faStar, faTriangleExclamation, faUsers,
} from '@fortawesome/free-solid-svg-icons';

const REZ_STATUS_LABELS = {
  Aktivna:  { tekst: 'Aktivna',  boja: '#1D9E75', bg: '#E1F5EE' },
  Otkazana: { tekst: 'Otkazana', boja: '#888',    bg: '#f1efe8' },
  Zavrsena: { tekst: 'Završena', boja: '#888',    bg: '#f1efe8' },
};

function formatDatum(datumStr) {
  if (!datumStr) return '';
  const d = new Date(datumStr);
  const meseci = ['januar','februar','mart','april','maj','jun',
                  'jul','avgust','septembar','oktobar','novembar','decembar'];
  return `${d.getDate()}. ${meseci[d.getMonth()]} ${d.getFullYear()}.`;
}

function formatVreme(timeOnly) {
  return timeOnly?.slice(0, 5) ?? '';
}

function ConfirmModal({ naslov, tekst, dugme, onPotvrdi, onOtkazi, loading }) {
  return createPortal(
    <>
      <div className="modal-overlay active" onClick={onOtkazi} style={{ zIndex: 2000 }} />
      <div className="modal active" onClick={e => e.stopPropagation()}
        style={{ maxWidth: 380, textAlign: 'center', padding: '2.5rem 2rem', zIndex: 2100 }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#fde8e8', color: '#E24B4A', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
          <FontAwesomeIcon icon={faTriangleExclamation} />
        </div>
        <h2 className="modal-title">{naslov}</h2>
        <p className="modal-sub">{tekst}</p>
        <div style={{ display: 'flex', gap: 10, marginTop: '1.5rem' }}>
          <button className="btn-outline" style={{ flex: 1 }} onClick={onOtkazi} disabled={loading}>Nazad</button>
          <button style={{ flex: 1, height: 48, background: '#E24B4A', color: 'white', border: 'none', borderRadius: 12, fontFamily: 'DM Sans, sans-serif', fontSize: 15, fontWeight: 500, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
            onClick={onPotvrdi} disabled={loading}>
            {loading ? 'Molimo sačekajte...' : dugme}
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}



function StarRating({ vrednost, onChange, readOnly = false, size = 22 }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i}
          onClick={() => !readOnly && onChange && onChange(i)}
          onMouseEnter={() => !readOnly && setHover(i)}
          onMouseLeave={() => !readOnly && setHover(0)}
          style={{
            fontSize: size,
            cursor: readOnly ? 'default' : 'pointer',
            color: i <= (hover || vrednost) ? '#F5A623' : '#ddd',
            lineHeight: 1,
          }}>★</span>
      ))}
    </div>
  );
}

function IgracOceneProsek({ igracId }) {
  const [prosek, setProsek] = useState(null);
  const [broj,   setBroj]   = useState(0);

  useEffect(() => {
    getOceneIgracaApi(igracId)
      .then(data => {
        if (data.length > 0) {
          setProsek((data.reduce((s, o) => s + o.vrednost, 0) / data.length).toFixed(1));
          setBroj(data.length);
        }
      })
      .catch(() => {});
  }, [igracId]);

  if (!prosek) return null;
  return (
    <span style={{ fontSize: 12, color: '#F5A623', fontWeight: 600, marginLeft: 4 }}>
      <FontAwesomeIcon icon={faStar} style={{ marginRight: 2 }} />
      {prosek} <span style={{ color: '#aaa', fontWeight: 400 }}>({broj})</span>
    </span>
  );
}

function OcenaIgracaForma({ igrac, korisnikId, onClose }) {
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [postojeca, setPostojeca] = useState(null);
  const [vrednost,  setVrednost]  = useState(5);
  const [komentar,  setKomentar]  = useState('');
  const [greska,    setGreska]    = useState('');

  useEffect(() => {
    getOceneIgracaApi(igrac.igracId)
      .then(data => {
        const moja = data.find(o => o.ocenioId === korisnikId);
        setPostojeca(moja ?? null);
        if (moja) { setVrednost(moja.vrednost); setKomentar(moja.komentar ?? ''); }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [igrac.igracId]);

  const handleSacuvaj = async () => {
    setSaving(true);
    setGreska('');
    try {
      if (postojeca) {
        await updateOcenaIgracaApi(postojeca.id, { vrednost, komentar: komentar || null });
      } else {
        await createOcenaIgracaApi({
          ocenjeniId: igrac.igracId,
          ocenioId:   korisnikId,
          vrednost,
          komentar:   komentar || null,
        });
      }
      onClose();
    } catch (err) {
      setGreska(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '10px 0', fontSize: 12, color: '#aaa' }}>Učitavanje...</div>;

  return (
    <div style={{ background: '#f8f7f4', border: '1.5px solid #e4e2dc', borderRadius: 10, padding: 12, marginTop: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
        {postojeca ? 'Izmeni ocenu' : 'Ocenite igrača'} — {igrac.igracIme} {igrac.igracPrezime}
      </div>
      <div style={{ marginBottom: 8 }}>
        <StarRating vrednost={vrednost} onChange={setVrednost} />
      </div>
      <textarea
        value={komentar}
        onChange={e => setKomentar(e.target.value)}
        placeholder="Komentar (opciono)"
        style={{ width: '100%', border: '1.5px solid #e4e2dc', borderRadius: 8, padding: '8px 10px',
                 fontSize: 13, fontFamily: 'inherit', resize: 'vertical', minHeight: 56,
                 background: 'white', outline: 'none', boxSizing: 'border-box', marginBottom: 8 }}
      />
      {greska && <div style={{ fontSize: 12, color: '#E24B4A', marginBottom: 8 }}>{greska}</div>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onClose}
          style={{ flex: 1, height: 34, background: 'white', border: '1.5px solid #e4e2dc', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', color: '#666' }}>
          Otkaži
        </button>
        <button onClick={handleSacuvaj} disabled={saving}
          style={{ flex: 2, height: 34, background: 'var(--green)', color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Čuvanje...' : 'Sačuvaj ocenu'}
        </button>
      </div>
    </div>
  );
}

export default function TerminDetaljiModal({ termin: initialTermin, onClose, onPromena }) {
  const { korisnik } = useAuth();
  const [termin,             setTermin]             = useState(initialTermin);
  const [loading,            setLoading]            = useState(null);
  const [ocenaZaIgraca,      setOcenaZaIgraca]      = useState(null);
  const [showOtkaziConfirm,  setShowOtkaziConfirm]  = useState(false);
  const [showNapustiConfirm, setShowNapustiConfirm] = useState(null);
  const [showIzbaciConfirm,  setShowIzbaciConfirm]  = useState(null);

  useEffect(() => {
    getRezervacijaApi(initialTermin.id)
      .then(data => setTermin(data))
      .catch(() => {});
  }, [initialTermin.id]);

  const t = termin.termin;
  const jeGlavniIgrac = korisnik?.id === termin.glavniIgracId;
  const jeZavrsena    = termin.status === 'Zavrsena';

  const odobreni      = termin.igraci?.filter(i => i.status === 'Prihvacen')   ?? [];
  const cekaju        = termin.igraci?.filter(i => i.status === 'CekaPotvrdu') ?? [];
  const slobodnoMesta = termin.maxIgraca - odobreni.length;
  const st            = REZ_STATUS_LABELS[termin.status]
                        ?? { tekst: termin.status, boja: '#888', bg: '#f1efe8' };

  const odobriIgraca = async (igracId) => {
    setLoading(igracId);
    try {
      await updateIgracStatusApi(termin.id, igracId, 'Prihvacen');
      setTermin(prev => ({
        ...prev,
        igraci: prev.igraci.map(i => i.igracId === igracId ? { ...i, status: 'Prihvacen' } : i),
      }));
      onPromena?.();
    } catch (err) { console.error(err.message); }
    finally { setLoading(null); }
  };

  const odbijIgraca = async (igracId) => {
    setLoading(igracId);
    try {
      await updateIgracStatusApi(termin.id, igracId, 'Otkazao');
      setTermin(prev => ({
        ...prev,
        igraci: prev.igraci.map(i => i.igracId === igracId ? { ...i, status: 'Otkazao' } : i),
      }));
      onPromena?.();
    } catch (err) { console.error(err.message); }
    finally { setLoading(null); }
  };

  const izbacIgraca = async (igracId) => {
    setLoading(igracId);
    try {
      await leaveTerminApi(termin.id, igracId);
      setTermin(prev => ({
        ...prev,
        igraci: prev.igraci.filter(i => i.igracId !== igracId),
      }));
      onPromena?.();
    } catch (err) { console.error(err.message); }
    finally { setLoading(null); setShowIzbaciConfirm(null); }
  };

  const napustiTermin = async (igracId) => {
    setLoading(igracId);
    try {
      await leaveTerminApi(termin.id, igracId);
      onPromena?.();
      onClose();
    } catch (err) { console.error(err.message); }
    finally { setLoading(null); setShowNapustiConfirm(null); }
  };

  const otkaziRezervaciju = async () => {
    setLoading('otkazi');
    try {
      await otkaziRezervacijuApi(termin.id);
      onPromena?.();
      onClose();
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(null);
      setShowOtkaziConfirm(false);
    }
  };

  return (
    <>
      {showOtkaziConfirm && (
        <ConfirmModal
          naslov="Otkaži rezervaciju"
          tekst={`Da li ste sigurni da želite da otkažete rezervaciju za "${t?.objekatNaziv ?? 'ovaj termin'}"? Termin će ponovo postati slobodan.`}
          dugme="Da, otkaži"
          onPotvrdi={otkaziRezervaciju}
          onOtkazi={() => setShowOtkaziConfirm(false)}
          loading={loading === 'otkazi'}
        />
      )}

      {showNapustiConfirm && (
        <ConfirmModal
          naslov="Napusti termin"
          tekst={
            jeGlavniIgrac
              ? `Da li ste sigurni da želite da napustite termin u "${t?.objekatNaziv ?? 'ovom objektu'}"? Uloga glavnog igrača će biti preneta na sledećeg prihvaćenog igrača.`
              : `Da li ste sigurni da želite da napustite termin u "${t?.objekatNaziv ?? 'ovom objektu'}"?`
          }
          dugme="Da, napusti"
          onPotvrdi={() => napustiTermin(showNapustiConfirm)}
          onOtkazi={() => setShowNapustiConfirm(null)}
          loading={loading === showNapustiConfirm}
        />
      )}

      {showIzbaciConfirm && (
        <ConfirmModal
          naslov="Izbaci igrača"
          tekst="Da li ste sigurni da želite da izbacite ovog igrača iz termina?"
          dugme="Da, izbaci"
          onPotvrdi={() => izbacIgraca(showIzbaciConfirm)}
          onOtkazi={() => setShowIzbaciConfirm(null)}
          loading={loading === showIzbaciConfirm}
        />
      )}

      <button className="modal-close" onClick={onClose}>✕</button>

      <div style={{ height: 64, borderRadius: 12, marginBottom: 16, background: '#e8f4ea', display: 'flex', alignItems: 'flex-end', padding: '10px 14px', justifyContent: 'space-between' }}>
        <span className="vcard-sport-badge">{termin.sportNaziv ?? t?.sportNaziv ?? 'Sport'}</span>
        <span className="termin-status-badge" style={{ background: st.bg, color: st.boja }}>
          {st.tekst}
        </span>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <h2 className="modal-title" style={{ margin: 0 }}>{t?.objekatNaziv ?? 'Termin'}</h2>
        <div style={{ fontSize: 13, color: '#888', display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 6 }}>
          {t?.datum   && <span><FontAwesomeIcon icon={faCalendarDays} style={{ marginRight: 4 }} />{formatDatum(t.datum)}</span>}
          {t?.vremeOd && <span><FontAwesomeIcon icon={faClock} style={{ marginRight: 4 }} />{formatVreme(t.vremeOd)}h</span>}
          {t?.vremeDo && <span>do {formatVreme(t.vremeDo)}h</span>}
        </div>
        <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
          Rezervisao: <strong>{termin.glavniIgracIme} {termin.glavniIgracPrezime}</strong>
          {' • '}{formatDatum(termin.datumRezervacije)}
        </div>
      </div>

      <div className="td-kapacitet-wrap">
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#888', marginBottom: 6 }}>
          <span>Popunjenost</span>
          <span>
            <strong style={{ color: '#1a1a1a' }}>{odobreni.length}</strong>/{termin.maxIgraca} igrača
            {' • '}
            {slobodnoMesta > 0 ? `${slobodnoMesta} slobodnih mesta` : 'Popunjeno'}
          </span>
        </div>
        <div className="td-kapacitet-bar">
          <div className="td-kapacitet-fill" style={{ width: `${(odobreni.length / termin.maxIgraca) * 100}%` }} />
        </div>
      </div>

      {jeGlavniIgrac && cekaju.length > 0 && (
        <div className="td-sekcija">
          <div className="td-sekcija-naslov">
            <FontAwesomeIcon icon={faUsers} style={{ marginRight: 6, color: '#D97706' }} />
            Čekaju odobrenje
            <span className="td-badge-broj">{cekaju.length}</span>
          </div>
          <div className="td-igraci-lista">
            {cekaju.map(ig => (
              <div key={ig.id} className="td-igrac-row">
                <div className="td-igrac-avatar">{ig.igracIme[0]}{ig.igracPrezime[0]}</div>
                <div className="td-igrac-ime" style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <Link
                      to={`/profil/${ig.igracId}`}
                      onClick={onClose}
                      style={{ color: '#1a1a1a', textDecoration: 'none', fontWeight: 600 }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--green)'}
                      onMouseLeave={e => e.currentTarget.style.color = '#1a1a1a'}
                    >
                      {ig.igracIme} {ig.igracPrezime}
                    </Link>
                    <IgracOceneProsek igracId={ig.igracId} />
                  </div>
                </div>
                <div className="td-igrac-akcije">
                  <button className="td-btn td-btn--odobri" onClick={() => odobriIgraca(ig.igracId)} disabled={loading === ig.igracId}>
                    <FontAwesomeIcon icon={faCheck} style={{ marginRight: 4 }} />Odobri
                  </button>
                  <button className="td-btn td-btn--odbij" onClick={() => odbijIgraca(ig.igracId)} disabled={loading === ig.igracId}>
                    <FontAwesomeIcon icon={faXmark} style={{ marginRight: 4 }} />Odbij
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="td-sekcija">
        <div className="td-sekcija-naslov">
          <FontAwesomeIcon icon={faUsers} style={{ marginRight: 6, color: '#1D9E75' }} />
          Igrači
          <span className="td-badge-broj">{odobreni.length}</span>
        </div>
        <div className="td-igraci-lista">
          {odobreni.map(ig => {
            const jeOnaj    = ig.igracId === korisnik?.id;
            const mozeOceni = jeZavrsena && korisnik && !jeOnaj;
            return (
              <div key={ig.id}>
                <div className="td-igrac-row">
                  <div className="td-igrac-avatar">{ig.igracIme[0]}{ig.igracPrezime[0]}</div>
                  <div className="td-igrac-ime" style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <Link
                        to={`/profil/${ig.igracId}`}
                        onClick={onClose}
                        style={{ color: '#1a1a1a', textDecoration: 'none', fontWeight: 600 }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--green)'}
                        onMouseLeave={e => e.currentTarget.style.color = '#1a1a1a'}
                      >
                        {ig.igracIme} {ig.igracPrezime}
                      </Link>
                      {ig.igracId === termin.glavniIgracId && (
                        <span className="td-role-badge">
                          <FontAwesomeIcon icon={faCrown} style={{ color: '#B87514' }} />
                        </span>
                      )}
                      <IgracOceneProsek igracId={ig.igracId} />
                    </div>
                  </div>
                  <div className="td-igrac-akcije" style={{ display: 'flex', gap: 6 }}>
                    {mozeOceni && (
                      <button
                        onClick={() => setOcenaZaIgraca(ocenaZaIgraca === ig.igracId ? null : ig.igracId)}
                        style={{ height: 28, padding: '0 10px', background: 'white', color: '#F5A623', border: '1.5px solid #FAC775', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                        <FontAwesomeIcon icon={faStar} style={{ marginRight: 4 }} />Oceni
                      </button>
                    )}
                    {jeGlavniIgrac && ig.igracId !== termin.glavniIgracId && !jeZavrsena && (
                      <button
                        className="td-btn td-btn--izbaci"
                        onClick={() => setShowIzbaciConfirm(ig.igracId)}
                        disabled={loading === ig.igracId}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = '#E24B4A';
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.style.borderColor = '#E24B4A';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = '';
                          e.currentTarget.style.color = '';
                          e.currentTarget.style.borderColor = '';
                        }}
                      >
                        {loading === ig.igracId ? '...' : 'Izbaci'}
                      </button>
                    )}
                    {!jeGlavniIgrac && jeOnaj && !jeZavrsena && (
                      <button
                        className="td-btn td-btn--izbaci"
                        onClick={() => setShowNapustiConfirm(ig.igracId)}
                        disabled={loading === ig.igracId}
                        style={{ background: '#FEE8E8', color: '#E24B4A', border: '1.5px solid #F5A8A8' }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = '#E24B4A';
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.style.borderColor = '#E24B4A';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = '#FEE8E8';
                          e.currentTarget.style.color = '#E24B4A';
                          e.currentTarget.style.borderColor = '#F5A8A8';
                        }}
                      >
                        {loading === ig.igracId ? '...' : 'Napusti'}
                      </button>
                    )}
                    {jeGlavniIgrac && jeOnaj && !jeZavrsena && odobreni.length > 1 && (
                      <button
                        className="td-btn td-btn--izbaci"
                        onClick={() => setShowNapustiConfirm(ig.igracId)}
                        disabled={loading === ig.igracId}
                        style={{ background: '#FEE8E8', color: '#E24B4A', border: '1.5px solid #F5A8A8' }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = '#E24B4A';
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.style.borderColor = '#E24B4A';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = '#FEE8E8';
                          e.currentTarget.style.color = '#E24B4A';
                          e.currentTarget.style.borderColor = '#F5A8A8';
                        }}
                      >
                        {loading === ig.igracId ? '...' : 'Napusti'}
                      </button>
                    )}
                  </div>
                </div>
                {ocenaZaIgraca === ig.igracId && (
                  <OcenaIgracaForma
                    igrac={ig}
                    korisnikId={korisnik.id}
                    onClose={() => setOcenaZaIgraca(null)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {t?.cena && (
        <div className="rez-cena-box" style={{ marginTop: '1rem' }}>
          <div className="rez-cena-total">
            <span>Cena termina</span>
            <span>{Number(t.cena).toLocaleString()} RSD</span>
          </div>
          <div className="rez-cena-row" style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #f0ede8' }}>
            <span style={{ fontSize: 13, color: '#888' }}>Po igraču (max {termin.maxIgraca})</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1D9E75' }}>
              {Math.ceil(Number(t.cena) / termin.maxIgraca).toLocaleString()} RSD
            </span>
          </div>
        </div>
      )}

      {jeGlavniIgrac && termin.status === 'Aktivna' && (
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f0ede8' }}>
          <button
            onClick={() => setShowOtkaziConfirm(true)}
            style={{
              width: '100%', height: 42, background: 'white', color: '#E24B4A',
              border: '1.5px solid #E24B4A', borderRadius: 10, fontSize: 14,
              fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <FontAwesomeIcon icon={faXmark} />
            Otkaži rezervaciju
          </button>
        </div>
      )}
    </>
  );
}