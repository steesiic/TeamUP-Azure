// Pulsing animacija
const pulseStyle = {
  background: 'linear-gradient(90deg, #f0ede8 25%, #e8e5e0 50%, #f0ede8 75%)',
  backgroundSize: '200% 100%',
  animation: 'skeletonPulse 1.5s ease-in-out infinite',
  borderRadius: 8,
};

// Skeleton za VenueCard (objekat)
export function VenueCardSkeleton() {
  return (
    <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e8e6e0', overflow: 'hidden' }}>
      <div style={{ ...pulseStyle, height: 175, borderRadius: 0 }} />
      <div style={{ padding: 16 }}>
        <div style={{ ...pulseStyle, height: 18, width: '70%', marginBottom: 10 }} />
        <div style={{ ...pulseStyle, height: 13, width: '50%', marginBottom: 14 }} />
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          <div style={{ ...pulseStyle, height: 24, width: 60 }} />
          <div style={{ ...pulseStyle, height: 24, width: 70 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0ede8', paddingTop: 12 }}>
          <div style={{ ...pulseStyle, height: 22, width: 100 }} />
          <div style={{ ...pulseStyle, height: 34, width: 90, borderRadius: 8 }} />
        </div>
      </div>
    </div>
  );
}

// Skeleton za TerminCard (rezervacija)
export function TerminCardSkeleton() {
  return (
    <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e8e6e0', overflow: 'hidden' }}>
      <div style={{ ...pulseStyle, height: 80, borderRadius: 0 }} />
      <div style={{ padding: '14px 16px' }}>
        <div style={{ ...pulseStyle, height: 18, width: '60%', marginBottom: 8 }} />
        <div style={{ ...pulseStyle, height: 13, width: '80%', marginBottom: 14 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0ede8', paddingTop: 12 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1,2,3].map(i => <div key={i} style={{ ...pulseStyle, width: 28, height: 28, borderRadius: '50%', marginLeft: i > 1 ? -6 : 0 }} />)}
          </div>
          <div style={{ ...pulseStyle, height: 18, width: 80 }} />
        </div>
      </div>
    </div>
  );
}

// Skeleton za termin na stranici objekta
export function TerminObjekatSkeleton() {
  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1.5px solid #e4e2dc', overflow: 'hidden' }}>
      <div style={{ ...pulseStyle, height: 44, borderRadius: 0 }} />
      <div style={{ padding: 14 }}>
        <div style={{ ...pulseStyle, height: 20, width: '60%', marginBottom: 10 }} />
        <div style={{ ...pulseStyle, height: 13, width: '40%', marginBottom: 8 }} />
        <div style={{ ...pulseStyle, height: 18, width: '30%', marginBottom: 14 }} />
        <div style={{ ...pulseStyle, height: 38, borderRadius: 8 }} />
      </div>
    </div>
  );
}

// Skeleton za red u tabeli (vlasnik dashboard termini)
export function TerminRedSkeleton() {
  return (
    <div style={{ background: 'white', border: '1.5px solid #e4e2dc', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ ...pulseStyle, height: 24, width: 80, borderRadius: 50 }} />
        <div>
          <div style={{ ...pulseStyle, height: 16, width: 120, marginBottom: 6 }} />
          <div style={{ ...pulseStyle, height: 12, width: 180 }} />
        </div>
      </div>
      <div style={{ ...pulseStyle, height: 20, width: 80 }} />
    </div>
  );
}

// CSS animacija — ubaciti u style.css
export const skeletonCSS = `
@keyframes skeletonPulse {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
`;