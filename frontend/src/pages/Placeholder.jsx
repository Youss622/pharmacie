import React from 'react';

export default function Placeholder({ title }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', animation: 'fadeIn 0.3s ease-out' }}>
      <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 3rem', maxWidth: '550px' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', opacity: 0.8 }}>🚧</h1>
        <h2 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1.4rem', fontWeight: 800 }}>Module "{title}"</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>
          Ce bouton fonctionnera très bientôt ! L'interface visuelle (Dashboard) a été conçue pour accueillir de nombreuses pages additionnelles. 
          Mais étant donné que nous n'avons programmé que les fonctionnalités essentielles validées par notre **Cahier des Charges Actuel**, ce module sera implémenté plus tard.
        </p>
      </div>
    </div>
  );
}
