import React, { useState, useEffect } from 'react';
import api from '../api';

export default function Bilan() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('analytics/accounting/').then(res => setData(res.data)).catch(console.error);
  }, []);

  if (!data) return <div style={{padding:'2rem'}}>Connexion sécurisée en cours. Récupération du Bilan financier et calcul des masses salariales...</div>;

  return (
    <div style={{animation: 'fadeIn 0.4s'}}>
      <h1 className="page-title" style={{marginBottom: '2rem'}}>Bilan Financier Administratif (ERP Live)</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        {/* Recettes */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderTop: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem' }}>Toutes Opér. Recettes</h3>
            <span className="badge badge-green" style={{ border: 'none' }}>Ce Mois</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '2rem' }}>{data.recettes.total} <span style={{ fontSize: '0.8rem' }}>GNF</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            <span>ORIGINE FLUX</span><span>MONTANT</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '1rem' }}>
            <span>Module Ventes de la Caisse</span><span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{data.recettes.ventes}</span>
          </div>
        </div>

        {/* Dépenses */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderTop: '4px solid var(--danger)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem' }}>Total des Dépenses</h3>
            <span className="badge badge-red" style={{ border: 'none' }}>Ce Mois</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--danger)', marginBottom: '2rem' }}>{data.depenses.total} <span style={{ fontSize: '0.8rem' }}>GNF</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            <span>COMPTE DÉBITÉ</span><span>MONTANT</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '1rem' }}>
            <span>Achats Fournisseurs Méd.</span><span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{data.depenses.achats}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '1rem' }}>
            <span>Loyer & Factures externes</span><span style={{ color: 'var(--text-muted)' }}>{data.depenses.loyer}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <span>Salaires versés & Divers</span><span style={{ color: 'var(--text-muted)' }}>{data.depenses.salaires_et_divers}</span>
          </div>
        </div>

        {/* Bilan */}
        <div className="glass-panel" style={{ padding: '1.5rem', background: '#f8fafc', gridColumn: 'span 2', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Bilan Consolidé de Déclaration FISCALE</h3>
            <span className="badge badge-green" style={{ border: '1px solid #10b981', color: '#10b981', background: '#ecfdf5' }}>Moteur Analytics Synthétique</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Somme brute Encaissée</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '1rem' }}>+ {data.recettes.total} GNF</div>
                  
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Somme decaissée validée</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--danger)', marginBottom: '2rem' }}>- {data.depenses.total} GNF</div>
              </div>
              
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '2px solid var(--border)', display:'flex', flexDirection:'column', justifyContent:'center'}}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Bénéfice Net Final du Gérant</div>
                  <div style={{ fontSize: '2rem', fontWeight: '900', color: data.bilan.benefice_net > 0 ? 'var(--primary)' : 'var(--danger)', marginBottom: '1rem' }}>{data.bilan.benefice_net} GNF</div>
                  
                  <div style={{ fontSize: '0.85rem', color: '#d97706', fontWeight: 'bold', background: '#fef3c7', padding: '0.8rem', borderRadius: '8px', textAlign: 'center' }}>
                    TVA Théorique (18%) collectée :<br/><span style={{fontSize:'1.1rem', marginTop:'5px', display:'inline-block'}}>{data.bilan.tva.toFixed(2)} GNF</span>
                  </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
